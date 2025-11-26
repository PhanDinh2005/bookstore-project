// 👇 SỬA ĐỔI 1: Dùng trực tiếp mssql để tránh lỗi kết nối
const sql = require("mssql");
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
    this.avatar_url = userData.avatar_url;
    this.is_active =
      userData.is_active !== undefined ? userData.is_active : true;
    this.created_at = userData.created_at;
    this.updated_at = userData.updated_at;
  }

  // 1. Tạo user mới
  static async create(userData) {
    try {
      // 👇 SỬA ĐỔI 2: KHÔNG mã hóa ở đây nữa (vì Controller đã làm rồi)
      // Chúng ta lưu thẳng userData.password (đã là chuỗi mã hóa) vào DB

      const request = new sql.Request();
      const result = await request
        .input("name", sql.NVarChar, userData.name)
        .input("email", sql.NVarChar, userData.email)
        .input("password", sql.NVarChar, userData.password) // Pass này đã hash từ Controller
        .input("role", sql.NVarChar, userData.role || "customer")
        .input("address", sql.NVarChar, userData.address)
        .input("phone", sql.NVarChar, userData.phone)
        .input("avatar_url", sql.NVarChar, userData.avatar_url).query(`
            INSERT INTO users (name, email, password, role, address, phone, avatar_url, is_active, created_at) 
            OUTPUT INSERTED.* VALUES (@name, @email, @password, @role, @address, @phone, @avatar_url, 1, GETDATE())
        `);

      return new User(result.recordset[0]);
    } catch (error) {
      throw error;
    }
  }

  // 2. Tìm user bằng ID
  static async findById(id) {
    try {
      const request = new sql.Request();
      const result = await request
        .input("id", sql.Int, id)
        .query("SELECT * FROM users WHERE id = @id");

      return result.recordset[0] ? new User(result.recordset[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // 3. Tìm user bằng email
  static async findByEmail(email) {
    try {
      const request = new sql.Request();
      const result = await request
        .input("email", sql.NVarChar, email)
        .query("SELECT * FROM users WHERE email = @email");

      return result.recordset[0] ? new User(result.recordset[0]) : null;
    } catch (error) {
      throw error;
    }
  }

  // 4. Kiểm tra password (GIỮ NGUYÊN)
  async checkPassword(inputPassword) {
    // inputPassword: 123
    // this.password: $2b$10$.... (Lấy từ DB)
    return await bcrypt.compare(inputPassword, this.password);
  }

  // 5. Cập nhật user
  async update(updateData) {
    try {
      const request = new sql.Request();
      await request
        .input("id", sql.Int, this.id)
        .input("name", sql.NVarChar, updateData.name || this.name)
        .input("email", sql.NVarChar, updateData.email || this.email)
        .input("address", sql.NVarChar, updateData.address || this.address)
        .input("phone", sql.NVarChar, updateData.phone || this.phone)
        .input(
          "avatar_url",
          sql.NVarChar,
          updateData.avatar_url || this.avatar_url
        ).query(`
            UPDATE users 
            SET name = @name, email = @email, address = @address, phone = @phone, 
                avatar_url = @avatar_url, updated_at = GETDATE()
            WHERE id = @id
        `);

      Object.assign(this, updateData);
      return this;
    } catch (error) {
      throw error;
    }
  }

  // 6. Đổi mật khẩu
  async changePassword(newPassword) {
    try {
      // Hàm này thường được gọi riêng lẻ, nên cần hash tại đây nếu controller chưa hash
      // TUY NHIÊN: Để an toàn, tốt nhất nên hash ở Controller changePassword
      // Ở đây mình giả định Controller changePassword CŨNG ĐÃ HASH rồi nhé.
      // Nếu Controller chưa hash thì bạn phải bật dòng dưới lên:
      // const hashedPassword = await bcrypt.hash(newPassword, 10);

      const request = new sql.Request();
      await request
        .input("id", sql.Int, this.id)
        .input("password", sql.NVarChar, newPassword) // newPassword đã hash
        .query(
          "UPDATE users SET password = @password, updated_at = GETDATE() WHERE id = @id"
        );

      this.password = newPassword;
      return true;
    } catch (error) {
      throw error;
    }
  }

  // 7. Lấy tất cả users (admin only)
  static async findAll(limit = 10, offset = 0, isActive = null) {
    try {
      const request = new sql.Request();
      let sqlQuery = `
        SELECT id, name, email, role, avatar_url, is_active, created_at 
        FROM users 
      `;

      if (isActive !== null) {
        sqlQuery += " WHERE is_active = @isActive";
        request.input("isActive", sql.Bit, isActive);
      }

      sqlQuery +=
        " ORDER BY created_at DESC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY";

      const result = await request
        .input("limit", sql.Int, limit)
        .input("offset", sql.Int, offset)
        .query(sqlQuery);

      return result.recordset.map((user) => new User(user));
    } catch (error) {
      throw error;
    }
  }

  // Helper: Chuyển sang JSON (ẩn password)
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      role: this.role,
      address: this.address,
      phone: this.phone,
      avatar_url: this.avatar_url,
      is_active: this.is_active,
      created_at: this.created_at,
    };
  }
}

module.exports = User;
