const { dbHelpers } = require("../config/database");

class Book {
  constructor(bookData) {
    this.id = bookData.id;
    this.title = bookData.title;
    this.author = bookData.author;
    this.price = bookData.price;
    this.original_price = bookData.original_price;
    this.category_id = bookData.category_id;
    this.description = bookData.description;
    this.image_url = bookData.image_url;
    this.stock_quantity = bookData.stock_quantity;
    this.isbn = bookData.isbn;
    this.publisher = bookData.publisher;
    this.published_date = bookData.published_date;
    this.pages = bookData.pages;
    this.language = bookData.language;
    this.weight_kg = bookData.weight_kg;
    this.dimensions = bookData.dimensions;
    this.is_featured = bookData.is_featured;
    this.is_bestseller = bookData.is_bestseller;
    this.rating_avg = bookData.rating_avg;
    this.rating_count = bookData.rating_count;
    this.created_at = bookData.created_at;
    this.updated_at = bookData.updated_at;
    this.category_name = bookData.category_name;
  }

  // Tạo book mới
  static async create(bookData) {
    try {
      const sql = `
                INSERT INTO books (
                    title, author, price, original_price, category_id, description, 
                    image_url, stock_quantity, isbn, publisher, published_date, 
                    pages, language, weight_kg, dimensions, is_featured, is_bestseller
                )
                OUTPUT INSERTED.*
                VALUES (
                    @title, @author, @price, @original_price, @category_id, @description,
                    @image_url, @stock_quantity, @isbn, @publisher, @published_date,
                    @pages, @language, @weight_kg, @dimensions, @is_featured, @is_bestseller
                )
            `;

      const result = await dbHelpers.query(sql, bookData);
      return new Book(result[0]);
    } catch (error) {
      throw error;
    }
  }

  // Tìm book bằng ID
  static async findById(id) {
    try {
      const sql = `
                SELECT b.*, c.name as category_name 
                FROM books b 
                LEFT JOIN categories c ON b.category_id = c.id 
                WHERE b.id = @id
            `;
      const result = await dbHelpers.getOne(sql, { id });
      return result ? new Book(result) : null;
    } catch (error) {
      throw error;
    }
  }

  // Lấy tất cả books với phân trang và filter
  static async findAll({
    category_id,
    search,
    min_price,
    max_price,
    is_featured,
    is_bestseller,
    limit = 12,
    offset = 0,
    sortBy = "created_at",
    sortOrder = "DESC",
  } = {}) {
    try {
      let whereClause = "";
      const params = { limit, offset };

      if (category_id) {
        whereClause += " AND b.category_id = @category_id";
        params.category_id = category_id;
      }

      if (search) {
        whereClause +=
          " AND (b.title LIKE @search OR b.author LIKE @search OR b.description LIKE @search)";
        params.search = `%${search}%`;
      }

      if (min_price) {
        whereClause += " AND b.price >= @min_price";
        params.min_price = parseFloat(min_price);
      }

      if (max_price) {
        whereClause += " AND b.price <= @max_price";
        params.max_price = parseFloat(max_price);
      }

      if (is_featured !== undefined) {
        whereClause += " AND b.is_featured = @is_featured";
        params.is_featured = is_featured;
      }

      if (is_bestseller !== undefined) {
        whereClause += " AND b.is_bestseller = @is_bestseller";
        params.is_bestseller = is_bestseller;
      }

      // Validate sort column to prevent SQL injection
      const validSortColumns = [
        "created_at",
        "price",
        "title",
        "rating_avg",
        "updated_at",
      ];
      const sortColumn = validSortColumns.includes(sortBy)
        ? sortBy
        : "created_at";
      const order = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";

      const sql = `
                SELECT b.*, c.name as category_name 
                FROM books b 
                LEFT JOIN categories c ON b.category_id = c.id 
                WHERE 1=1 ${whereClause}
                ORDER BY b.${sortColumn} ${order}
                OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
            `;

      const countSql = `
                SELECT COUNT(*) as total 
                FROM books b 
                WHERE 1=1 ${whereClause}
            `;

      const [books, countResult] = await Promise.all([
        dbHelpers.query(sql, params),
        dbHelpers.getOne(countSql, params),
      ]);

      return {
        books: books.map((book) => new Book(book)),
        total: countResult.total,
        limit,
        offset,
      };
    } catch (error) {
      throw error;
    }
  }

  // Lấy sách nổi bật
  static async getFeaturedBooks(limit = 8) {
    try {
      const sql = `
                SELECT b.*, c.name as category_name 
                FROM books b 
                LEFT JOIN categories c ON b.category_id = c.id 
                WHERE b.is_featured = 1 AND b.stock_quantity > 0
                ORDER BY b.rating_avg DESC, b.created_at DESC
                OFFSET 0 ROWS FETCH NEXT @limit ROWS ONLY
            `;
      const result = await dbHelpers.query(sql, { limit });
      return result.map((book) => new Book(book));
    } catch (error) {
      throw error;
    }
  }

  // Lấy sách bán chạy
  static async getBestsellers(limit = 8) {
    try {
      const sql = `
                SELECT b.*, c.name as category_name 
                FROM books b 
                LEFT JOIN categories c ON b.category_id = c.id 
                WHERE b.is_bestseller = 1 AND b.stock_quantity > 0
                ORDER BY b.rating_avg DESC, b.created_at DESC
                OFFSET 0 ROWS FETCH NEXT @limit ROWS ONLY
            `;
      const result = await dbHelpers.query(sql, { limit });
      return result.map((book) => new Book(book));
    } catch (error) {
      throw error;
    }
  }

  // Tìm kiếm sách nâng cao
  static async searchAdvanced({
    query,
    category_id,
    min_price,
    max_price,
    min_rating,
    limit = 12,
    offset = 0,
  }) {
    try {
      let whereClause = "";
      const params = { limit, offset };

      if (query) {
        whereClause +=
          " AND (b.title LIKE @query OR b.author LIKE @query OR b.description LIKE @query OR b.publisher LIKE @query)";
        params.query = `%${query}%`;
      }

      if (category_id) {
        whereClause += " AND b.category_id = @category_id";
        params.category_id = category_id;
      }

      if (min_price) {
        whereClause += " AND b.price >= @min_price";
        params.min_price = parseFloat(min_price);
      }

      if (max_price) {
        whereClause += " AND b.price <= @max_price";
        params.max_price = parseFloat(max_price);
      }

      if (min_rating) {
        whereClause += " AND b.rating_avg >= @min_rating";
        params.min_rating = parseFloat(min_rating);
      }

      const sql = `
                SELECT b.*, c.name as category_name 
                FROM books b 
                LEFT JOIN categories c ON b.category_id = c.id 
                WHERE 1=1 ${whereClause}
                ORDER BY 
                    CASE WHEN b.is_featured = 1 THEN 0 ELSE 1 END,
                    b.rating_avg DESC,
                    b.created_at DESC
                OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
            `;

      const countSql = `
                SELECT COUNT(*) as total 
                FROM books b 
                WHERE 1=1 ${whereClause}
            `;

      const [books, countResult] = await Promise.all([
        dbHelpers.query(sql, params),
        dbHelpers.getOne(countSql, params),
      ]);

      return {
        books: books.map((book) => new Book(book)),
        total: countResult.total,
        limit,
        offset,
      };
    } catch (error) {
      throw error;
    }
  }

  // Cập nhật book
  async update(updateData) {
    try {
      const sql = `
                UPDATE books 
                SET title = @title, author = @author, price = @price, original_price = @original_price,
                    category_id = @category_id, description = @description, image_url = @image_url,
                    stock_quantity = @stock_quantity, isbn = @isbn, publisher = @publisher,
                    published_date = @published_date, pages = @pages, language = @language,
                    weight_kg = @weight_kg, dimensions = @dimensions, is_featured = @is_featured,
                    is_bestseller = @is_bestseller, updated_at = GETDATE()
                WHERE id = @id
            `;

      const params = {
        id: this.id,
        title: updateData.title || this.title,
        author: updateData.author || this.author,
        price: updateData.price || this.price,
        original_price: updateData.original_price || this.original_price,
        category_id: updateData.category_id || this.category_id,
        description: updateData.description || this.description,
        image_url: updateData.image_url || this.image_url,
        stock_quantity: updateData.stock_quantity || this.stock_quantity,
        isbn: updateData.isbn || this.isbn,
        publisher: updateData.publisher || this.publisher,
        published_date: updateData.published_date || this.published_date,
        pages: updateData.pages || this.pages,
        language: updateData.language || this.language,
        weight_kg: updateData.weight_kg || this.weight_kg,
        dimensions: updateData.dimensions || this.dimensions,
        is_featured:
          updateData.is_featured !== undefined
            ? updateData.is_featured
            : this.is_featured,
        is_bestseller:
          updateData.is_bestseller !== undefined
            ? updateData.is_bestseller
            : this.is_bestseller,
      };

      await dbHelpers.query(sql, params);

      // Cập nhật object
      Object.assign(this, updateData);
      return this;
    } catch (error) {
      throw error;
    }
  }

  // Cập nhật stock
  static async updateStock(id, quantity) {
    try {
      const sql =
        "UPDATE books SET stock_quantity = @quantity, updated_at = GETDATE() WHERE id = @id";
      await dbHelpers.query(sql, { id, quantity });
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Lấy reviews của sách
  async getReviews(limit = 10, offset = 0) {
    try {
      const sql = `
                SELECT r.*, u.name as user_name, u.avatar_url as user_avatar
                FROM reviews r 
                JOIN users u ON r.user_id = u.id 
                WHERE r.book_id = @book_id AND r.is_approved = 1
                ORDER BY r.created_at DESC 
                OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
            `;
      const result = await dbHelpers.query(sql, {
        book_id: this.id,
        limit,
        offset,
      });
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Tính rating trung bình
  async updateRating() {
    try {
      const sql = `
                UPDATE books 
                SET rating_avg = (
                    SELECT AVG(CAST(rating AS DECIMAL(3,2))) 
                    FROM reviews 
                    WHERE book_id = @book_id AND is_approved = 1
                ),
                rating_count = (
                    SELECT COUNT(*) 
                    FROM reviews 
                    WHERE book_id = @book_id AND is_approved = 1
                ),
                updated_at = GETDATE()
                WHERE id = @book_id
            `;
      await dbHelpers.query(sql, { book_id: this.id });
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Xóa book
  static async delete(id) {
    try {
      const sql = "DELETE FROM books WHERE id = @id";
      await dbHelpers.query(sql, { id });
      return true;
    } catch (error) {
      throw error;
    }
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      author: this.author,
      price: this.price,
      original_price: this.original_price,
      category_id: this.category_id,
      category_name: this.category_name,
      description: this.description,
      image_url: this.image_url,
      stock_quantity: this.stock_quantity,
      isbn: this.isbn,
      publisher: this.publisher,
      published_date: this.published_date,
      pages: this.pages,
      language: this.language,
      weight_kg: this.weight_kg,
      dimensions: this.dimensions,
      is_featured: this.is_featured,
      is_bestseller: this.is_bestseller,
      rating_avg: this.rating_avg,
      rating_count: this.rating_count,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  }
}

module.exports = Book;
