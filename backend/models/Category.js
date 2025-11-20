const { dbHelpers } = require("../config/database");

class Category {
  constructor(categoryData) {
    this.id = categoryData.id;
    this.name = categoryData.name;
    this.description = categoryData.description;
    this.created_at = categoryData.created_at;
  }

  // Tạo category mới
  static async create(categoryData) {
    try {
      const sql = `
        INSERT INTO categories (name, description) 
        OUTPUT INSERTED.* 
        VALUES (@name, @description)
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
      const sql = "SELECT * FROM categories WHERE id = @id";
      const result = await dbHelpers.getOne(sql, { id });
      return result ? new Category(result) : null;
    } catch (error) {
      throw error;
    }
  }

  // Lấy tất cả categories
  static async findAll() {
    try {
      const sql = "SELECT * FROM categories ORDER BY name";
      const result = await dbHelpers.query(sql);
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
        SET name = @name, description = @description 
        WHERE id = @id
      `;

      const params = {
        id: this.id,
        name: updateData.name || this.name,
        description: updateData.description || this.description,
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
      const sql = "DELETE FROM categories WHERE id = @id";
      await dbHelpers.query(sql, { id });
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Lấy số lượng books trong category
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
      created_at: this.created_at,
    };
  }
}

module.exports = Category;
