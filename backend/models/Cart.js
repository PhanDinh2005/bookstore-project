const { dbHelpers } = require("../config/database");

class Cart {
  constructor(cartData) {
    this.id = cartData.id;
    this.user_id = cartData.user_id;
    this.book_id = cartData.book_id;
    this.quantity = cartData.quantity;
    this.created_at = cartData.created_at;
    this.updated_at = cartData.updated_at;
    this.title = cartData.title;
    this.author = cartData.author;
    this.price = cartData.price;
    this.image_url = cartData.image_url;
    this.stock_quantity = cartData.stock_quantity;
  }

  // Lấy giỏ hàng của user
  static async getByUserId(userId) {
    try {
      const sql = `
                SELECT c.*, b.title, b.author, b.price, b.image_url, b.stock_quantity 
                FROM carts c 
                JOIN books b ON c.book_id = b.id 
                WHERE c.user_id = @user_id
                ORDER BY c.updated_at DESC
            `;
      const result = await dbHelpers.query(sql, { user_id: userId });
      return result.map((item) => new Cart(item));
    } catch (error) {
      throw error;
    }
  }

  // Thêm vào giỏ hàng
  static async addItem(userId, bookId, quantity = 1) {
    try {
      // Kiểm tra đã có trong giỏ hàng chưa
      const existingItem = await dbHelpers.getOne(
        "SELECT * FROM carts WHERE user_id = @user_id AND book_id = @book_id",
        { user_id: userId, book_id: bookId }
      );

      if (existingItem) {
        // Cập nhật số lượng nếu đã có
        const newQuantity = existingItem.quantity + quantity;
        const sql = `
                    UPDATE carts 
                    SET quantity = @quantity, updated_at = GETDATE()
                    WHERE user_id = @user_id AND book_id = @book_id
                `;
        await dbHelpers.execute(sql, {
          user_id: userId,
          book_id: bookId,
          quantity: newQuantity,
        });

        return await dbHelpers.getOne(
          "SELECT c.*, b.title, b.author, b.price, b.image_url FROM carts c JOIN books b ON c.book_id = b.id WHERE c.user_id = @user_id AND c.book_id = @book_id",
          { user_id: userId, book_id: bookId }
        );
      } else {
        // Thêm mới
        const sql = `
                    INSERT INTO carts (user_id, book_id, quantity) 
                    OUTPUT INSERTED.*
                    VALUES (@user_id, @book_id, @quantity)
                `;
        const result = await dbHelpers.insert(sql, {
          user_id: userId,
          book_id: bookId,
          quantity: quantity,
        });

        // Lấy thông tin đầy đủ
        const fullItem = await dbHelpers.getOne(
          "SELECT c.*, b.title, b.author, b.price, b.image_url FROM carts c JOIN books b ON c.book_id = b.id WHERE c.id = @id",
          { id: result.id }
        );

        return new Cart(fullItem);
      }
    } catch (error) {
      throw error;
    }
  }

  // Cập nhật số lượng
  static async updateItem(userId, bookId, quantity) {
    try {
      const sql = `
                UPDATE carts 
                SET quantity = @quantity, updated_at = GETDATE()
                WHERE user_id = @user_id AND book_id = @book_id
            `;
      await dbHelpers.execute(sql, {
        user_id: userId,
        book_id: bookId,
        quantity: quantity,
      });

      const updatedItem = await dbHelpers.getOne(
        "SELECT c.*, b.title, b.author, b.price, b.image_url FROM carts c JOIN books b ON c.book_id = b.id WHERE c.user_id = @user_id AND c.book_id = @book_id",
        { user_id: userId, book_id: bookId }
      );

      return new Cart(updatedItem);
    } catch (error) {
      throw error;
    }
  }

  // Xóa khỏi giỏ hàng
  static async removeItem(userId, bookId) {
    try {
      const sql =
        "DELETE FROM carts WHERE user_id = @user_id AND book_id = @book_id";
      await dbHelpers.execute(sql, { user_id: userId, book_id: bookId });
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Xóa toàn bộ giỏ hàng
  static async clearUserCart(userId) {
    try {
      const sql = "DELETE FROM carts WHERE user_id = @user_id";
      await dbHelpers.execute(sql, { user_id: userId });
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Lấy tổng số lượng trong giỏ hàng
  static async getCartCount(userId) {
    try {
      const result = await dbHelpers.getOne(
        "SELECT SUM(quantity) as total FROM carts WHERE user_id = @user_id",
        { user_id: userId }
      );
      return result.total || 0;
    } catch (error) {
      throw error;
    }
  }

  toJSON() {
    return {
      id: this.id,
      user_id: this.user_id,
      book_id: this.book_id,
      quantity: this.quantity,
      title: this.title,
      author: this.author,
      price: this.price,
      image_url: this.image_url,
      stock_quantity: this.stock_quantity,
      subtotal: this.price * this.quantity,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  }
}

module.exports = Cart;
