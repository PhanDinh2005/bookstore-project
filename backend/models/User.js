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
    this.avatar_url = userData.avatar_url;
    this.is_active =
      userData.is_active !== undefined ? userData.is_active : true;
    this.created_at = userData.created_at;
    this.updated_at = userData.updated_at;
  }

  // Tạo user mới
  static async create(userData) {
    try {
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      const sql = `
                INSERT INTO users (name, email, password, role, address, phone, avatar_url) 
                OUTPUT INSERTED.* 
                VALUES (@name, @email, @password, @role, @address, @phone, @avatar_url)
            `;

      const params = {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: userData.role || "customer",
        address: userData.address || null,
        phone: userData.phone || null,
        avatar_url: userData.avatar_url || null,
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
                SET name = @name, email = @email, address = @address, phone = @phone, 
                    avatar_url = @avatar_url, updated_at = GETDATE()
                WHERE id = @id
            `;

      const params = {
        id: this.id,
        name: updateData.name || this.name,
        email: updateData.email || this.email,
        address: updateData.address || this.address,
        phone: updateData.phone || this.phone,
        avatar_url: updateData.avatar_url || this.avatar_url,
      };

      await dbHelpers.query(sql, params);

      // Cập nhật object
      Object.assign(this, updateData);
      return this;
    } catch (error) {
      throw error;
    }
  }

  // Đổi mật khẩu
  async changePassword(newPassword) {
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      const sql =
        "UPDATE users SET password = @password, updated_at = GETDATE() WHERE id = @id";
      await dbHelpers.query(sql, { id: this.id, password: hashedPassword });
      this.password = hashedPassword;
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Xóa user (soft delete)
  async deactivate() {
    try {
      const sql =
        "UPDATE users SET is_active = 0, updated_at = GETDATE() WHERE id = @id";
      await dbHelpers.query(sql, { id: this.id });
      this.is_active = false;
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Lấy tất cả users (admin only)
  static async findAll(limit = 10, offset = 0, isActive = null) {
    try {
      let whereClause = "";
      const params = { limit, offset };

      if (isActive !== null) {
        whereClause = "WHERE is_active = @isActive";
        params.isActive = isActive;
      }

      const sql = `
                SELECT id, name, email, role, avatar_url, is_active, created_at 
                FROM users 
                ${whereClause}
                ORDER BY created_at DESC 
                OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
            `;

      const result = await dbHelpers.query(sql, params);
      return result.map((user) => new User(user));
    } catch (error) {
      throw error;
    }
  }

  // Lấy wishlist của user
  async getWishlist() {
    try {
      const sql = `
                SELECT b.* 
                FROM wishlists w 
                JOIN books b ON w.book_id = b.id 
                WHERE w.user_id = @user_id
                ORDER BY w.created_at DESC
            `;
      const result = await dbHelpers.query(sql, { user_id: this.id });
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Lấy cart của user
  async getCart() {
    try {
      const sql = `
                SELECT c.*, b.title, b.author, b.price, b.image_url, b.stock_quantity 
                FROM carts c 
                JOIN books b ON c.book_id = b.id 
                WHERE c.user_id = @user_id
                ORDER BY c.updated_at DESC
            `;
      const result = await dbHelpers.query(sql, { user_id: this.id });
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Lấy orders của user
  async getOrders(limit = 10, offset = 0) {
    try {
      const sql = `
                SELECT * FROM orders 
                WHERE user_id = @user_id 
                ORDER BY created_at DESC 
                OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
            `;
      const result = await dbHelpers.query(sql, {
        user_id: this.id,
        limit,
        offset,
      });
      return result;
    } catch (error) {
      throw error;
    }
  }

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
      updated_at: this.updated_at,
    };
  }
}

module.exports = User;
