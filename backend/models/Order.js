const { dbHelpers } = require('../config/database');

class Order {
    constructor(orderData) {
        this.id = orderData.id;
        this.user_id = orderData.user_id;
        this.order_number = orderData.order_number;
        this.total_amount = orderData.total_amount;
        this.status = orderData.status || 'pending';
        this.shipping_address = orderData.shipping_address;
        this.shipping_fee = orderData.shipping_fee || 0;
        this.payment_method = orderData.payment_method || 'cod';
        this.payment_status = orderData.payment_status || 'pending';
        this.customer_note = orderData.customer_note;
        this.admin_note = orderData.admin_note;
        this.estimated_delivery = orderData.estimated_delivery;
        this.delivered_at = orderData.delivered_at;
        this.created_at = orderData.created_at;
        this.updated_at = orderData.updated_at;
        this.user_name = orderData.user_name;
        this.user_email = orderData.user_email;
        this.items = orderData.items || [];
    }

    // Tạo order mới
    static async create(orderData) {
        try {
            // Tạo order number
            const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            
            const sql = `
                INSERT INTO orders (user_id, order_number, total_amount, shipping_address, shipping_fee, payment_method, customer_note) 
                OUTPUT INSERTED.* 
                VALUES (@user_id, @order_number, @total_amount, @shipping_address, @shipping_fee, @payment_method, @customer_note)
            `;
            
            const params = {
                user_id: orderData.user_id,
                order_number: orderNumber,
                total_amount: orderData.total_amount,
                shipping_address: orderData.shipping_address,
                shipping_fee: orderData.shipping_fee || 0,
                payment_method: orderData.payment_method || 'cod',
                customer_note: orderData.customer_note || null
            };
            
            const result = await dbHelpers.query(sql, params);
            return new Order(result[0]);
        } catch (error) {
            throw error;
        }
    }

    // Tìm order bằng ID
    static async findById(id) {
        try {
            const sql = `
                SELECT o.*, u.name as user_name, u.email as user_email
                FROM orders o 
                JOIN users u ON o.user_id = u.id 
                WHERE o.id = @id
            `;
            const result = await dbHelpers.getOne(sql, { id });
            
            if (!result) return null;
            
            const order = new Order(result);
            
            // Lấy order items
            const itemsSql = `
                SELECT oi.*, b.title, b.author, b.image_url, b.isbn
                FROM order_items oi
                JOIN books b ON oi.book_id = b.id
                WHERE oi.order_id = @order_id
            `;
            order.items = await dbHelpers.query(itemsSql, { order_id: id });
            
            return order;
        } catch (error) {
            throw error;
        }
    }

    // Tìm order bằng order number
    static async findByOrderNumber(orderNumber) {
        try {
            const sql = `
                SELECT o.*, u.name as user_name, u.email as user_email
                FROM orders o 
                JOIN users u ON o.user_id = u.id 
                WHERE o.order_number = @order_number
            `;
            const result = await dbHelpers.getOne(sql, { order_number: orderNumber });
            return result ? new Order(result) : null;
        } catch (error) {
            throw error;
        }
    }

    // Lấy orders của user
    static async findByUserId(userId, limit = 10, offset = 0) {
        try {
            const sql = `
                SELECT o.*, u.name as user_name, u.email as user_email
                FROM orders o 
                JOIN users u ON o.user_id = u.id 
                WHERE o.user_id = @user_id
                ORDER BY o.created_at DESC 
                OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
            `;
            
            const result = await dbHelpers.query(sql, { user_id: userId, limit, offset });
            return result.map(order => new Order(order));
        } catch (error) {
            throw error;
        }
    }

    // Lấy tất cả orders (admin)
    static async findAll({ 
        status, 
        payment_status, 
        start_date, 
        end_date,
        limit = 10, 
        offset = 0 
    } = {}) {
        try {
            let whereClause = '';
            const params = { limit, offset };

            if (status) {
                whereClause += ' AND o.status = @status';
                params.status = status;
            }

            if (payment_status) {
                whereClause += ' AND o.payment_status = @payment_status';
                params.payment_status = payment_status;
            }

            if (start_date) {
                whereClause += ' AND o.created_at >= @start_date';
                params.start_date = start_date;
            }

            if (end_date) {
                whereClause += ' AND o.created_at <= @end_date';
                params.end_date = end_date;
            }

            const sql = `
                SELECT o.*, u.name as user_name, u.email as user_email
                FROM orders o 
                JOIN users u ON o.user_id = u.id 
                WHERE 1=1 ${whereClause}
                ORDER BY o.created_at DESC 
                OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
            `;

            const countSql = `
                SELECT COUNT(*) as total 
                FROM orders o 
                WHERE 1=1 ${whereClause}
            `;

            const [orders, countResult] = await Promise.all([
                dbHelpers.query(sql, params),
                dbHelpers.getOne(countSql, params)
            ]);

            return {
                orders: orders.map(order => new Order(order)),
                total: countResult.total,
                limit,
                offset
            };
        } catch (error) {
            throw error;
        }
    }

    // Cập nhật order status
    async updateStatus(status, adminNote = null) {
        try {
            const sql = `
                UPDATE orders 
                SET status = @status, 
                    admin_note = COALESCE(@admin_note, admin_note),
                    updated_at = GETDATE()
                WHERE id = @id
            `;
            await dbHelpers.query(sql, { id: this.id, status, admin_note: adminNote });
            this.status = status;
            if (adminNote) this.admin_note = adminNote;
            return this;
        } catch (error) {
            throw error;
        }
    }

    // Cập nhật payment status
    async updatePaymentStatus(payment_status) {
        try {
            const sql = 'UPDATE orders SET payment_status = @payment_status, updated_at = GETDATE() WHERE id = @id';
            await dbHelpers.query(sql, { id: this.id, payment_status });
            this.payment_status = payment_status;
            return this;
        } catch (error) {
            throw error;
        }
    }

    // Đánh dấu đã giao hàng
    async markAsDelivered() {
        try {
            const sql = 'UPDATE orders SET status = "delivered", delivered_at = GETDATE(), updated_at = GETDATE() WHERE id = @id';
            await dbHelpers.query(sql, { id: this.id });
            this.status = 'delivered';
            this.delivered_at = new Date();
            return this;
        } catch (error) {
            throw error;
        }
    }

    // Thêm order items
    async addItems(items) {
        try {
            const values = items.map(item => 
                `(${this.id}, ${item.book_id}, ${item.quantity}, ${item.price}, ${item.subtotal})`
            ).join(', ');

            const sql = `
                INSERT INTO order_items (order_id, book_id, quantity, price, subtotal) 
                VALUES ${values}
            `;
            
            await dbHelpers.query(sql);
            this.items = items;
            return this;
        } catch (error) {
            throw error;
        }
    }

    // Tính tổng doanh thu
    static async getTotalRevenue(startDate = null, endDate = null) {
        try {
            let whereClause = 'WHERE o.payment_status = "paid"';
            const params = {};

            if (startDate) {
                whereClause += ' AND o.created_at >= @start_date';
                params.start_date = startDate;
            }

            if (endDate) {
                whereClause += ' AND o.created_at <= @end_date';
                params.end_date = endDate;
            }

            const sql = `
                SELECT SUM(o.total_amount) as total_revenue, COUNT(*) as total_orders
                FROM orders o 
                ${whereClause}
            `;

            const result = await dbHelpers.getOne(sql, params);
            return result;
        } catch (error) {
            throw error;
        }
    }

    toJSON() {
        return {
            id: this.id,
            user_id: this.user_id,
            order_number: this.order_number,
            total_amount: this.total_amount,
            status: this.status,
            shipping_address: this.shipping_address,
            shipping_fee: this.shipping_fee,
            payment_method: this.payment_method,
            payment_status: this.payment_status,
            customer_note: this.customer_note,
            admin_note: this.admin_note,
            estimated_delivery: this.estimated_delivery,
            delivered_at: this.delivered_at,
            created_at: this.created_at,
            updated_at: this.updated_at,
            user_name: this.user_name,
            user_email: this.user_email,
            items: this.items
        };
    }
}

module.exports = Order;