const { dbHelpers } = require("../config/database");

class Review {
  constructor(reviewData) {
    this.id = reviewData.id;
    this.user_id = reviewData.user_id;
    this.book_id = reviewData.book_id;
    this.rating = reviewData.rating;
    this.title = reviewData.title;
    this.comment = reviewData.comment;
    this.is_approved =
      reviewData.is_approved !== undefined ? reviewData.is_approved : true;
    this.created_at = reviewData.created_at;
    this.updated_at = reviewData.updated_at;
    this.user_name = reviewData.user_name;
    this.user_avatar = reviewData.user_avatar;
    this.book_title = reviewData.book_title;
  }

  // Tạo review mới
  static async create(reviewData) {
    try {
      const sql = `
                INSERT INTO reviews (user_id, book_id, rating, title, comment) 
                OUTPUT INSERTED.* 
                VALUES (@user_id, @book_id, @rating, @title, @comment)
            `;

      const result = await dbHelpers.query(sql, reviewData);
      return new Review(result[0]);
    } catch (error) {
      throw error;
    }
  }

  // Cập nhật review
  async update(updateData) {
    try {
      const sql = `
                UPDATE reviews 
                SET rating = @rating, title = @title, comment = @comment, updated_at = GETDATE()
                WHERE id = @id
            `;

      const params = {
        id: this.id,
        rating: updateData.rating || this.rating,
        title: updateData.title || this.title,
        comment: updateData.comment || this.comment,
      };

      await dbHelpers.query(sql, params);

      // Cập nhật object
      Object.assign(this, updateData);
      return this;
    } catch (error) {
      throw error;
    }
  }

  // Duyệt review (admin)
  async approve() {
    try {
      const sql =
        "UPDATE reviews SET is_approved = 1, updated_at = GETDATE() WHERE id = @id";
      await dbHelpers.query(sql, { id: this.id });
      this.is_approved = true;
      return this;
    } catch (error) {
      throw error;
    }
  }

  // Ẩn review (admin)
  async unapprove() {
    try {
      const sql =
        "UPDATE reviews SET is_approved = 0, updated_at = GETDATE() WHERE id = @id";
      await dbHelpers.query(sql, { id: this.id });
      this.is_approved = false;
      return this;
    } catch (error) {
      throw error;
    }
  }

  toJSON() {
    return {
      id: this.id,
      user_id: this.user_id,
      book_id: this.book_id,
      rating: this.rating,
      title: this.title,
      comment: this.comment,
      is_approved: this.is_approved,
      created_at: this.created_at,
      updated_at: this.updated_at,
      user_name: this.user_name,
      user_avatar: this.user_avatar,
      book_title: this.book_title,
    };
  }
}

module.exports = Review;
