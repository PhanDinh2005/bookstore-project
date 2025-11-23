const { dbHelpers } = require("../config/database");

class OrderItem {
  constructor(orderItemData) {
    this.id = orderItemData.id;
    this.order_id = orderItemData.order_id;
    this.book_id = orderItemData.book_id;
    this.quantity = orderItemData.quantity;
    this.price = orderItemData.price;
    this.subtotal = orderItemData.subtotal;
    this.created_at = orderItemData.created_at;
    this.title = orderItemData.title;
    this.author = orderItemData.author;
    this.image_url = orderItemData.image_url;
    this.isbn = orderItemData.isbn;
  }

  // Tạo order item mới
  static async create(orderItemData) {
    try {
      const sql = `
                INSERT INTO order_items (order_id, book_id, quantity, price, subtotal) 
                OUTPUT INSERTED.* 
                VALUES (@order_id, @book_id, @quantity, @price, @subtotal)
            `;

      const result = await dbHelpers.query(sql, orderItemData);
      return new OrderItem(result[0]);
    } catch (error) {
      throw error;
    }
  }

  // Tạo nhiều order items
  static async createMultiple(items) {
    try {
      if (items.length === 0) return [];

      const values = items
        .map(
          (item) =>
            `(@order_id_${item.index}, @book_id_${item.index}, @quantity_${item.index}, @price_${item.index}, @subtotal_${item.index})`
        )
        .join(", ");

      let sql = `
                INSERT INTO order_items (order_id, book_id, quantity, price, subtotal) 
                OUTPUT INSERTED.* 
                VALUES ${values}
            `;

      // Build parameters object
      const params = {};
      items.forEach((item, index) => {
        params[`order_id_${index}`] = item.order_id;
        params[`book_id_${index}`] = item.book_id;
        params[`quantity_${index}`] = item.quantity;
        params[`price_${index}`] = item.price;
        params[`subtotal_${index}`] = item.subtotal;
      });

      const result = await dbHelpers.query(sql, params);
      return result.map((item) => new OrderItem(item));
    } catch (error) {
      throw error;
    }
  }

  // Lấy order items theo order_id
  static async findByOrderId(orderId) {
    try {
      const sql = `
                SELECT oi.*, b.title, b.author, b.image_url, b.isbn
                FROM order_items oi
                JOIN books b ON oi.book_id = b.id
                WHERE oi.order_id = @order_id
                ORDER BY oi.created_at DESC
            `;

      const result = await dbHelpers.query(sql, { order_id: orderId });
      return result.map((item) => new OrderItem(item));
    } catch (error) {
      throw error;
    }
  }

  // Lấy order items theo book_id (để thống kê)
  static async findByBookId(bookId, limit = 10, offset = 0) {
    try {
      const sql = `
                SELECT oi.*, o.order_number, o.created_at as order_date, u.name as customer_name
                FROM order_items oi
                JOIN orders o ON oi.order_id = o.id
                JOIN users u ON o.user_id = u.id
                WHERE oi.book_id = @book_id AND o.status = 'delivered'
                ORDER BY o.created_at DESC
                OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
            `;

      const result = await dbHelpers.query(sql, {
        book_id: bookId,
        limit,
        offset,
      });
      return result.map((item) => new OrderItem(item));
    } catch (error) {
      throw error;
    }
  }

  // Cập nhật order item
  async update(updateData) {
    try {
      const sql = `
                UPDATE order_items 
                SET quantity = @quantity, price = @price, subtotal = @subtotal
                WHERE id = @id
            `;

      const params = {
        id: this.id,
        quantity: updateData.quantity || this.quantity,
        price: updateData.price || this.price,
        subtotal: updateData.subtotal || this.subtotal,
      };

      await dbHelpers.query(sql, params);

      // Cập nhật object
      Object.assign(this, updateData);
      return this;
    } catch (error) {
      throw error;
    }
  }

  // Xóa order item
  static async delete(id) {
    try {
      const sql = "DELETE FROM order_items WHERE id = @id";
      await dbHelpers.query(sql, { id });
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Tính tổng số lượng bán của một sách
  static async getTotalSoldQuantity(bookId) {
    try {
      const sql = `
                SELECT SUM(quantity) as total_sold
                FROM order_items oi
                JOIN orders o ON oi.order_id = o.id
                WHERE oi.book_id = @book_id AND o.status = 'delivered'
            `;

      const result = await dbHelpers.getOne(sql, { book_id: bookId });
      return result.total_sold || 0;
    } catch (error) {
      throw error;
    }
  }

  toJSON() {
    return {
      id: this.id,
      order_id: this.order_id,
      book_id: this.book_id,
      quantity: this.quantity,
      price: this.price,
      subtotal: this.subtotal,
      created_at: this.created_at,
      title: this.title,
      author: this.author,
      image_url: this.image_url,
      isbn: this.isbn,
    };
  }
}

module.exports = OrderItem;
