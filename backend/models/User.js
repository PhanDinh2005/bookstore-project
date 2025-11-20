const { dbHelpers } = require("../config/database");
const bcrypt = require("bcryptjs");

class User {
  constructor(userData) {
    this.id = userData.id;
    this.name = userData.name;
    this.email = userData.email;
    this.password = userData.password;
    this.role = userData.role || "customer";
    this.address = userData.address;
    this.phone = userData.phone;
    this.created_at = userData.created_at;
    this.updated_at = userData.updated_at;
  }

  // Tạo user mới
  static async create(userData) {
    try {
      // Mã hóa password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      const sql = `
        INSERT INTO users (name, email, password, role, address, phone) 
        OUTPUT INSERTED.* 
        VALUES (@name, @email, @password, @role, @address, @phone)
      `;

      const params = {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: userData.role || "customer",
        address: userData.address || null,
        phone: userData.phone || null,
      };

      const result = await dbHelpers.query(sql, params);
      return new User(result[0]);
    } catch (error) {
      throw error;
    }
  }

  // Tìm user bằng ID
  static async findById(id) {
    try {
      const sql = "SELECT * FROM users WHERE id = @id";
      const result = await dbHelpers.getOne(sql, { id });
      return result ? new User(result) : null;
    } catch (error) {
      throw error;
    }
  }

  // Tìm user bằng email
  static async findByEmail(email) {
    try {
      const sql = "SELECT * FROM users WHERE email = @email";
      const result = await dbHelpers.getOne(sql, { email });
      return result ? new User(result) : null;
    } catch (error) {
      throw error;
    }
  }

  // Kiểm tra password
  async checkPassword(password) {
    return await bcrypt.compare(password, this.password);
  }

  // Cập nhật user
  async update(updateData) {
    try {
      const sql = `
        UPDATE users 
        SET name = @name, email = @email, address = @address, phone = @phone, updated_at = GETDATE()
        WHERE id = @id
      `;

      const params = {
        id: this.id,
        name: updateData.name || this.name,
        email: updateData.email || this.email,
        address: updateData.address || this.address,
        phone: updateData.phone || this.phone,
      };

      await dbHelpers.query(sql, params);

      // Cập nhật object
      Object.assign(this, updateData);
      return this;
    } catch (error) {
      throw error;
    }
  }

  // Xóa user
  static async delete(id) {
    try {
      const sql = "DELETE FROM users WHERE id = @id";
      await dbHelpers.query(sql, { id });
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Lấy tất cả users (admin only)
  static async findAll(limit = 10, offset = 0) {
    try {
      const sql = `
        SELECT id, name, email, role, created_at 
        FROM users 
        ORDER BY created_at DESC 
        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
      `;

      const result = await dbHelpers.query(sql, { limit, offset });
      return result.map((user) => new User(user));
    } catch (error) {
      throw error;
    }
  }

  // Chuyển đổi thành object (loại bỏ password)
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      role: this.role,
      address: this.address,
      phone: this.phone,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  }
}

module.exports = User;
