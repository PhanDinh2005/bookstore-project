const { dbHelpers } = require("../config/database");

class OrderItem {
  constructor(orderItemData) {
    this.id = orderItemData.id;
    this.order_id = orderItemData.order_id;
    this.book_id = orderItemData.book_id;
    this.quantity = orderItemData.quantity;
    this.price = orderItemData.price;
    this.subtotal = orderItemData.subtotal;
    this.book_title = orderItemData.book_title; // Joined from books
    this.book_author = orderItemData.book_author; // Joined from books
    this.book_image = orderItemData.book_image; // Joined from books
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
      const values = items
        .map(
          (item) =>
            `(${item.order_id}, ${item.book_id}, ${item.quantity}, ${item.price}, ${item.subtotal})`
        )
        .join(", ");

      const sql = `
        INSERT INTO order_items (order_id, book_id, quantity, price, subtotal) 
        OUTPUT INSERTED.* 
        VALUES ${values}
      `;

      const result = await dbHelpers.query(sql);
      return result.map((item) => new OrderItem(item));
    } catch (error) {
      throw error;
    }
  }

  // Lấy order items theo order_id
  static async findByOrderId(orderId) {
    try {
      const sql = `
        SELECT oi.*, b.title as book_title, b.author as book_author, b.image_url as book_image
        FROM order_items oi
        JOIN books b ON oi.book_id = b.id
        WHERE oi.order_id = @order_id
      `;

      const result = await dbHelpers.query(sql, { order_id: orderId });
      return result.map((item) => new OrderItem(item));
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
      book_title: this.book_title,
      book_author: this.book_author,
      book_image: this.book_image,
    };
  }
}

module.exports = OrderItem;
