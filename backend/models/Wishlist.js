const { dbHelpers } = require("../config/database");

class Wishlist {
  constructor(wishlistData) {
    this.id = wishlistData.id;
    this.user_id = wishlistData.user_id;
    this.book_id = wishlistData.book_id;
    this.created_at = wishlistData.created_at;
    this.title = wishlistData.title;
    this.author = wishlistData.author;
    this.price = wishlistData.price;
    this.image_url = wishlistData.image_url;
    this.rating_avg = wishlistData.rating_avg;
  }

  // Lấy wishlist của user
  static async getByUserId(userId, limit = 12, offset = 0) {
    try {
      const sql = `
                SELECT w.*, b.title, b.author, b.price, b.image_url, b.rating_avg 
                FROM wishlists w 
                JOIN books b ON w.book_id = b.id 
                WHERE w.user_id = @user_id
                ORDER BY w.created_at DESC
                OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
            `;

      const countSql = `
                SELECT COUNT(*) as total 
                FROM wishlists 
                WHERE user_id = @user_id
            `;

      const [items, countResult] = await Promise.all([
        dbHelpers.query(sql, { user_id: userId, limit, offset }),
        dbHelpers.getOne(countSql, { user_id: userId }),
      ]);

      return {
        items: items.map((item) => new Wishlist(item)),
        total: countResult.total,
      };
    } catch (error) {
      throw error;
    }
  }

  // Thêm vào wishlist
  static async addItem(userId, bookId) {
    try {
      const sql = `
                INSERT INTO wishlists (user_id, book_id) 
                OUTPUT INSERTED.*
                VALUES (@user_id, @book_id)
            `;
      const result = await dbHelpers.insert(sql, {
        user_id: userId,
        book_id: bookId,
      });

      // Lấy thông tin đầy đủ
      const fullItem = await dbHelpers.getOne(
        "SELECT w.*, b.title, b.author, b.price, b.image_url, b.rating_avg FROM wishlists w JOIN books b ON w.book_id = b.id WHERE w.id = @id",
        { id: result.id }
      );

      return new Wishlist(fullItem);
    } catch (error) {
      throw error;
    }
  }

  // Xóa khỏi wishlist
  static async removeItem(userId, bookId) {
    try {
      const sql =
        "DELETE FROM wishlists WHERE user_id = @user_id AND book_id = @book_id";
      await dbHelpers.execute(sql, { user_id: userId, book_id: bookId });
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Kiểm tra có trong wishlist không
  static async checkItem(userId, bookId) {
    try {
      const result = await dbHelpers.getOne(
        "SELECT * FROM wishlists WHERE user_id = @user_id AND book_id = @book_id",
        { user_id: userId, book_id: bookId }
      );
      return !!result;
    } catch (error) {
      throw error;
    }
  }

  toJSON() {
    return {
      id: this.id,
      user_id: this.user_id,
      book_id: this.book_id,
      title: this.title,
      author: this.author,
      price: this.price,
      image_url: this.image_url,
      rating_avg: this.rating_avg,
      created_at: this.created_at,
    };
  }
}

module.exports = Wishlist;
