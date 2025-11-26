const sql = require("mssql");

class Review {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.book_id = data.book_id;
    this.rating = data.rating;
    this.comment = data.comment;
    this.created_at = data.created_at;
  }

  static async create(data) {
    const request = new sql.Request();
    const result = await request
      .input("userId", sql.Int, data.user_id)
      .input("bookId", sql.Int, data.book_id)
      .input("rating", sql.Int, data.rating)
      .input("title", sql.NVarChar, data.title)
      .input("comment", sql.NVarChar, data.comment).query(`
                INSERT INTO Reviews (user_id, book_id, rating, title, comment)
                OUTPUT INSERTED.*
                VALUES (@userId, @bookId, @rating, @title, @comment)
            `);
    return new Review(result.recordset[0]);
  }
}

module.exports = Review;
