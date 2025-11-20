const { dbHelpers } = require("../config/database");

class Order {
  constructor(orderData) {
    this.id = orderData.id;
    this.user_id = orderData.user_id;
    this.total_amount = orderData.total_amount;
    this.status = orderData.status || "pending";
    this.shipping_address = orderData.shipping_address;
    this.payment_method = orderData.payment_method || "cod";
    this.payment_status = orderData.payment_status || "pending";
    this.created_at = orderData.created_at;
    this.updated_at = orderData.updated_at;
    this.user_name = orderData.user_name; // Joined from users
    this.items = orderData.items || []; // Order items
  }

  // Tạo order mới
  static async create(orderData) {
    try {
      const sql = `
        INSERT INTO orders (user_id, total_amount, shipping_address, payment_method) 
        OUTPUT INSERTED.* 
        VALUES (@user_id, @total_amount, @shipping_address, @payment_method)
      `;

      const result = await dbHelpers.query(sql, orderData);
      return new Order(result[0]);
    } catch (error) {
      throw error;
    }
  }

  // Tìm order bằng ID
  static async findById(id) {
    try {
      const sql = `
        SELECT o.*, u.name as user_name 
        FROM orders o 
        JOIN users u ON o.user_id = u.id 
        WHERE o.id = @id
      `;
      const result = await dbHelpers.getOne(sql, { id });

      if (!result) return null;

      const order = new Order(result);

      // Lấy order items
      const itemsSql = `
        SELECT oi.*, b.title as book_title, b.author as book_author, b.image_url as book_image
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

  // Lấy orders của user
  static async findByUserId(userId, limit = 10, offset = 0) {
    try {
      const sql = `
        SELECT o.*, u.name as user_name 
        FROM orders o 
        JOIN users u ON o.user_id = u.id 
        WHERE o.user_id = @user_id
        ORDER BY o.created_at DESC 
        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
      `;

      const result = await dbHelpers.query(sql, {
        user_id: userId,
        limit,
        offset,
      });
      return result.map((order) => new Order(order));
    } catch (error) {
      throw error;
    }
  }

  // Lấy tất cả orders (admin)
  static async findAll({ status, limit = 10, offset = 0 } = {}) {
    try {
      let whereClause = "";
      const params = { limit, offset };

      if (status) {
        whereClause += " AND o.status = @status";
        params.status = status;
      }

      const sql = `
        SELECT o.*, u.name as user_name 
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
        dbHelpers.getOne(countSql, params),
      ]);

      return {
        orders: orders.map((order) => new Order(order)),
        total: countResult.total,
        limit,
        offset,
      };
    } catch (error) {
      throw error;
    }
  }

  // Cập nhật order status
  async updateStatus(status) {
    try {
      const sql =
        "UPDATE orders SET status = @status, updated_at = GETDATE() WHERE id = @id";
      await dbHelpers.query(sql, { id: this.id, status });
      this.status = status;
      return this;
    } catch (error) {
      throw error;
    }
  }

  // Cập nhật payment status
  async updatePaymentStatus(payment_status) {
    try {
      const sql =
        "UPDATE orders SET payment_status = @payment_status, updated_at = GETDATE() WHERE id = @id";
      await dbHelpers.query(sql, { id: this.id, payment_status });
      this.payment_status = payment_status;
      return this;
    } catch (error) {
      throw error;
    }
  }

  toJSON() {
    return {
      id: this.id,
      user_id: this.user_id,
      user_name: this.user_name,
      total_amount: this.total_amount,
      status: this.status,
      shipping_address: this.shipping_address,
      payment_method: this.payment_method,
      payment_status: this.payment_status,
      created_at: this.created_at,
      updated_at: this.updated_at,
      items: this.items,
    };
  }
}

module.exports = Order;
