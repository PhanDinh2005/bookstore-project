const { dbHelpers } = require("../config/database");

class Category {
  constructor(categoryData) {
    this.id = categoryData.id;
    this.name = categoryData.name;
    this.description = categoryData.description;
    this.image_url = categoryData.image_url;
    this.created_at = categoryData.created_at;
    this.updated_at = categoryData.updated_at;
    this.book_count = categoryData.book_count;
  }

  // Tạo category mới
  static async create(categoryData) {
    try {
      const sql = `
                INSERT INTO categories (name, description, image_url) 
                OUTPUT INSERTED.* 
                VALUES (@name, @description, @image_url)
            `;

      const result = await dbHelpers.query(sql, categoryData);
      return new Category(result[0]);
    } catch (error) {
      throw error;
    }
  }

  // Tìm category bằng ID
  static async findById(id) {
    try {
      const sql = `
                SELECT c.*, 
                (SELECT COUNT(*) FROM books WHERE category_id = c.id) as book_count
                FROM categories c 
                WHERE c.id = @id
            `;
      const result = await dbHelpers.getOne(sql, { id });
      return result ? new Category(result) : null;
    } catch (error) {
      throw error;
    }
  }

  // Lấy tất cả categories với số lượng sách
  static async findAll() {
    try {
      const sql = `
                SELECT c.*, 
                (SELECT COUNT(*) FROM books WHERE category_id = c.id) as book_count
                FROM categories c 
                ORDER BY c.name
            `;
      const result = await dbHelpers.query(sql);
      return result.map((category) => new Category(category));
    } catch (error) {
      throw error;
    }
  }

  // Lấy categories phổ biến (có nhiều sách)
  static async findPopular(limit = 6) {
    try {
      const sql = `
                SELECT c.*, 
                (SELECT COUNT(*) FROM books WHERE category_id = c.id) as book_count
                FROM categories c 
                WHERE (SELECT COUNT(*) FROM books WHERE category_id = c.id) > 0
                ORDER BY book_count DESC
                OFFSET 0 ROWS FETCH NEXT @limit ROWS ONLY
            `;
      const result = await dbHelpers.query(sql, { limit });
      return result.map((category) => new Category(category));
    } catch (error) {
      throw error;
    }
  }

  // Cập nhật category
  async update(updateData) {
    try {
      const sql = `
                UPDATE categories 
                SET name = @name, description = @description, image_url = @image_url, updated_at = GETDATE()
                WHERE id = @id
            `;

      const params = {
        id: this.id,
        name: updateData.name || this.name,
        description: updateData.description || this.description,
        image_url: updateData.image_url || this.image_url,
      };

      await dbHelpers.query(sql, params);

      // Cập nhật object
      Object.assign(this, updateData);
      return this;
    } catch (error) {
      throw error;
    }
  }

  // Xóa category
  static async delete(id) {
    try {
      // Kiểm tra xem category có sách không
      const checkSql =
        "SELECT COUNT(*) as count FROM books WHERE category_id = @id";
      const result = await dbHelpers.getOne(checkSql, { id });

      if (result.count > 0) {
        throw new Error(
          "Không thể xóa danh mục đang có sách. Hãy chuyển các sách sang danh mục khác trước."
        );
      }

      const sql = "DELETE FROM categories WHERE id = @id";
      await dbHelpers.query(sql, { id });
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Lấy sách theo category
  async getBooks(limit = 12, offset = 0) {
    try {
      const sql = `
                SELECT b.*, c.name as category_name 
                FROM books b 
                LEFT JOIN categories c ON b.category_id = c.id 
                WHERE b.category_id = @category_id
                ORDER BY b.created_at DESC 
                OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
            `;

      const countSql = `
                SELECT COUNT(*) as total 
                FROM books 
                WHERE category_id = @category_id
            `;

      const [books, countResult] = await Promise.all([
        dbHelpers.query(sql, { category_id: this.id, limit, offset }),
        dbHelpers.getOne(countSql, { category_id: this.id }),
      ]);

      return {
        books: books,
        total: countResult.total,
        limit,
        offset,
      };
    } catch (error) {
      throw error;
    }
  }

  // Lấy số lượng sách trong category
  async getBookCount() {
    try {
      const sql = "SELECT COUNT(*) as count FROM books WHERE category_id = @id";
      const result = await dbHelpers.getOne(sql, { id: this.id });
      return result.count;
    } catch (error) {
      throw error;
    }
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      image_url: this.image_url,
      book_count: this.book_count,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  }
}

module.exports = Category;
