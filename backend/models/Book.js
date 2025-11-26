const sql = require("mssql");
const { dbHelpers } = require("../config/database"); // Nếu bạn dùng dbHelpers, hoặc dùng trực tiếp sql

class Book {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.author = data.author;
    this.price = data.price;
    this.original_price = data.original_price;
    this.description = data.description;
    this.image_url = data.image_url;
    this.category_id = data.category_id;
    this.stock_quantity = data.stock_quantity;
    this.is_featured = data.is_featured;
    this.is_bestseller = data.is_bestseller;
    this.average_rating = data.average_rating;
    this.review_count = data.review_count;
    // Các trường phụ
    this.isbn = data.isbn;
    this.publisher = data.publisher;
  }

  // 1. Lọc và Phân trang (findAll)
  static async findAll({
    page,
    limit,
    offset,
    category_id,
    search,
    min_price,
    max_price,
    is_featured,
    is_bestseller,
    sortBy,
    sortOrder,
  }) {
    const request = new sql.Request();
    let query = "SELECT * FROM Books WHERE 1=1";
    let countQuery = "SELECT COUNT(*) as total FROM Books WHERE 1=1";

    // Xây dựng điều kiện WHERE động
    if (category_id) {
      query += " AND category_id = @category_id";
      countQuery += " AND category_id = @category_id";
      request.input("category_id", sql.Int, category_id);
    }
    if (search) {
      query += " AND (title LIKE @search OR author LIKE @search)";
      countQuery += " AND (title LIKE @search OR author LIKE @search)";
      request.input("search", sql.NVarChar, `%${search}%`);
    }
    if (min_price) {
      query += " AND price >= @min_price";
      countQuery += " AND price >= @min_price";
      request.input("min_price", sql.Decimal, min_price);
    }
    if (max_price) {
      query += " AND price <= @max_price";
      countQuery += " AND price <= @max_price";
      request.input("max_price", sql.Decimal, max_price);
    }
    if (is_featured !== undefined) {
      query += " AND is_featured = @is_featured";
      countQuery += " AND is_featured = @is_featured";
      request.input("is_featured", sql.Bit, is_featured);
    }
    if (is_bestseller !== undefined) {
      query += " AND is_bestseller = @is_bestseller";
      countQuery += " AND is_bestseller = @is_bestseller";
      request.input("is_bestseller", sql.Bit, is_bestseller);
    }

    // Sắp xếp
    const validSortCols = ["price", "created_at", "title", "id"];
    const safeSortBy = validSortCols.includes(sortBy) ? sortBy : "created_at";
    const safeSortOrder = sortOrder === "ASC" ? "ASC" : "DESC";

    query += ` ORDER BY ${safeSortBy} ${safeSortOrder} OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY`;

    // Thực thi
    request.input("offset", sql.Int, offset);
    request.input("limit", sql.Int, limit);

    const result = await request.query(query);
    const countResult = await request.query(countQuery);

    return {
      books: result.recordset.map((b) => new Book(b)),
      total: countResult.recordset[0].total,
    };
  }

  // 2. Tìm kiếm nâng cao (searchAdvanced)
  static async searchAdvanced({
    query,
    category_id,
    min_price,
    max_price,
    min_rating,
    limit,
    offset,
  }) {
    // Tận dụng lại logic của findAll hoặc viết riêng nếu logic quá khác biệt
    return await this.findAll({
      search: query,
      category_id,
      min_price,
      max_price,
      limit,
      offset,
      // Thêm logic min_rating nếu cần
    });
  }

  // 3. Tìm theo ID
  static async findById(id) {
    const request = new sql.Request();
    const result = await request
      .input("id", sql.Int, id)
      .query("SELECT * FROM Books WHERE id = @id");
    return result.recordset[0] ? new Book(result.recordset[0]) : null;
  }

  // 4. Tạo sách mới
  static async create(data) {
    const request = new sql.Request();
    const result = await request
      .input("title", sql.NVarChar, data.title)
      .input("author", sql.NVarChar, data.author)
      .input("price", sql.Decimal, data.price)
      .input("catId", sql.Int, data.category_id)
      .input("desc", sql.NVarChar, data.description)
      .input("img", sql.NVarChar, data.image_url)
      .input("stock", sql.Int, data.stock_quantity)
      .input("isbn", sql.NVarChar, data.isbn)
      .input("featured", sql.Bit, data.is_featured).query(`
                INSERT INTO Books (title, author, price, category_id, description, image_url, stock_quantity, isbn, is_featured, created_at)
                OUTPUT INSERTED.*
                VALUES (@title, @author, @price, @catId, @desc, @img, @stock, @isbn, @featured, GETDATE())
            `);
    return new Book(result.recordset[0]);
  }

  // 5. Cập nhật sách
  async update(data) {
    const request = new sql.Request();
    // (Bạn có thể thêm các trường khác tương tự create)
    await request
      .input("id", sql.Int, this.id)
      .input("title", sql.NVarChar, data.title || this.title)
      .input("price", sql.Decimal, data.price || this.price)
      .input("stock", sql.Int, data.stock_quantity || this.stock_quantity)
      .query(
        `UPDATE Books SET title=@title, price=@price, stock_quantity=@stock WHERE id=@id`
      );

    return { ...this, ...data };
  }

  // 6. Cập nhật kho
  static async updateStock(id, quantity) {
    const request = new sql.Request();
    await request
      .input("id", sql.Int, id)
      .input("qty", sql.Int, quantity)
      .query("UPDATE Books SET stock_quantity = @qty WHERE id = @id");
  }

  // 7. Xóa sách
  static async delete(id) {
    const request = new sql.Request();
    await request
      .input("id", sql.Int, id)
      .query("DELETE FROM Books WHERE id = @id");
  }

  // 8. Lấy Reviews của sách này
  async getReviews(limit, offset) {
    const request = new sql.Request();
    const result = await request
      .input("bookId", sql.Int, this.id)
      .input("limit", sql.Int, limit)
      .input("offset", sql.Int, offset).query(`
                SELECT r.*, u.name as user_name, u.avatar_url 
                FROM Reviews r 
                JOIN Users u ON r.user_id = u.id 
                WHERE r.book_id = @bookId 
                ORDER BY r.created_at DESC 
                OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
            `);
    return result.recordset;
  }

  // 9. Tính toán lại Rating sau khi có review mới
  async updateRating() {
    const request = new sql.Request();
    await request.input("id", sql.Int, this.id).query(`
            UPDATE Books 
            SET average_rating = (SELECT AVG(CAST(rating AS FLOAT)) FROM Reviews WHERE book_id = @id),
                review_count = (SELECT COUNT(*) FROM Reviews WHERE book_id = @id)
            WHERE id = @id
        `);
  }

  // 10. Lấy sách nổi bật
  static async getFeaturedBooks(limit) {
    const request = new sql.Request();
    const result = await request
      .input("limit", sql.Int, limit)
      .query(
        "SELECT TOP (@limit) * FROM Books WHERE is_featured = 1 ORDER BY NEWID()"
      );
    return result.recordset;
  }

  // 11. Lấy sách bán chạy
  static async getBestsellers(limit) {
    const request = new sql.Request();
    const result = await request
      .input("limit", sql.Int, limit)
      .query(
        "SELECT TOP (@limit) * FROM Books WHERE is_bestseller = 1 ORDER BY price DESC"
      );
    return result.recordset;
  }
}

module.exports = Book;
