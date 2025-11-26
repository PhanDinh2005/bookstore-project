const { dbHelpers } = require("../config/database");

const Cart = {
  // 1. Lấy giỏ hàng
  async getByUserId(userId) {
    const sql = `
      SELECT 
        c.user_id, 
        c.book_id, 
        c.quantity, 
        b.title, 
        b.price, 
        b.image_url, 
        b.author, 
        b.stock_quantity
      FROM Cart c
      JOIN Books b ON c.book_id = b.id
      WHERE c.user_id = @userId
    `;
    return await dbHelpers.query(sql, { userId });
  },

  // 2. Thêm sản phẩm
  async addItem(userId, bookId, quantity) {
    // Kiểm tra tồn tại
    const checkSql =
      "SELECT * FROM Cart WHERE user_id = @userId AND book_id = @bookId";
    const existing = await dbHelpers.getOne(checkSql, { userId, bookId });

    if (existing) {
      // Update cộng dồn
      const updateSql = `
        UPDATE Cart 
        SET quantity = quantity + @quantity, updated_at = GETDATE()
        WHERE user_id = @userId AND book_id = @bookId
      `;
      await dbHelpers.execute(updateSql, { userId, bookId, quantity });
    } else {
      // Insert mới
      const insertSql = `
        INSERT INTO Cart (user_id, book_id, quantity, created_at, updated_at)
        VALUES (@userId, @bookId, @quantity, GETDATE(), GETDATE())
      `;
      await dbHelpers.execute(insertSql, { userId, bookId, quantity });
    }

    return { userId, bookId, quantity };
  },

  // 3. Cập nhật số lượng (QUAN TRỌNG)
  async updateItem(userId, bookId, quantity) {
    const sql = `
      UPDATE Cart 
      SET quantity = @quantity, updated_at = GETDATE()
      WHERE user_id = @userId AND book_id = @bookId
    `;

    // Dùng execute cho lệnh UPDATE
    await dbHelpers.execute(sql, { userId, bookId, quantity });

    return { userId, bookId, quantity };
  },

  // 4. Xóa sản phẩm
  async removeItem(userId, bookId) {
    const sql =
      "DELETE FROM Cart WHERE user_id = @userId AND book_id = @bookId";
    await dbHelpers.execute(sql, { userId, bookId });
    return true;
  },

  // 5. Xóa hết
  async clearUserCart(userId) {
    const sql = "DELETE FROM Cart WHERE user_id = @userId";
    await dbHelpers.execute(sql, { userId });
    return true;
  },

  // 6. Đếm số lượng
  async getCartCount(userId) {
    const sql =
      "SELECT SUM(quantity) as count FROM Cart WHERE user_id = @userId";
    const result = await dbHelpers.getOne(sql, { userId });
    return result ? result.count : 0;
  },
};

module.exports = Cart;
