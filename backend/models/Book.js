const { dbHelpers } = require("../config/database");

class Book {
  constructor(bookData) {
    this.id = bookData.id;
    this.title = bookData.title;
    this.author = bookData.author;
    this.price = bookData.price;
    this.category_id = bookData.category_id;
    this.description = bookData.description;
    this.image_url = bookData.image_url;
    this.stock_quantity = bookData.stock_quantity;
    this.isbn = bookData.isbn;
    this.publisher = bookData.publisher;
    this.published_date = bookData.published_date;
    this.created_at = bookData.created_at;
    this.updated_at = bookData.updated_at;
    this.category_name = bookData.category_name; // Joined from categories
  }

  // Tạo book mới
  static async create(bookData) {
    try {
      const sql = `
        INSERT INTO books (title, author, price, category_id, description, image_url, stock_quantity, isbn, publisher, published_date)
        OUTPUT INSERTED.*
        VALUES (@title, @author, @price, @category_id, @description, @image_url, @stock_quantity, @isbn, @publisher, @published_date)
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
  static async findAll({ category_id, search, limit = 10, offset = 0 } = {}) {
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

      const sql = `
        SELECT b.*, c.name as category_name 
        FROM books b 
        LEFT JOIN categories c ON b.category_id = c.id 
        WHERE 1=1 ${whereClause}
        ORDER BY b.created_at DESC 
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
        SET title = @title, author = @author, price = @price, category_id = @category_id, 
            description = @description, image_url = @image_url, stock_quantity = @stock_quantity,
            isbn = @isbn, publisher = @publisher, published_date = @published_date, updated_at = GETDATE()
        WHERE id = @id
      `;

      const params = {
        id: this.id,
        title: updateData.title || this.title,
        author: updateData.author || this.author,
        price: updateData.price || this.price,
        category_id: updateData.category_id || this.category_id,
        description: updateData.description || this.description,
        image_url: updateData.image_url || this.image_url,
        stock_quantity: updateData.stock_quantity || this.stock_quantity,
        isbn: updateData.isbn || this.isbn,
        publisher: updateData.publisher || this.publisher,
        published_date: updateData.published_date || this.published_date,
      };

      await dbHelpers.query(sql, params);

      // Cập nhật object
      Object.assign(this, updateData);
      return this;
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

  // Cập nhật stock
  static async updateStock(id, quantity) {
    try {
      const sql = "UPDATE books SET stock_quantity = @quantity WHERE id = @id";
      await dbHelpers.query(sql, { id, quantity });
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
      category_id: this.category_id,
      category_name: this.category_name,
      description: this.description,
      image_url: this.image_url,
      stock_quantity: this.stock_quantity,
      isbn: this.isbn,
      publisher: this.publisher,
      published_date: this.published_date,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  }
}

module.exports = Book;
