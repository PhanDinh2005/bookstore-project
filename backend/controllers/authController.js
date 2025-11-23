const User = require("../models/User");
const { generateToken } = require("../middleware/auth");

const authController = {
  // Đăng ký user mới
  async register(req, res) {
    try {
      const { name, email, password, address, phone } = req.body;

      // Validation
      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: "Tên, email và mật khẩu là bắt buộc",
        });
      }

      // Kiểm tra email đã tồn tại
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email đã được sử dụng",
        });
      }

      // Tạo user mới
      const userData = {
        name,
        email,
        password,
        address: address || null,
        phone: phone || null,
      };

      const user = await User.create(userData);
      const token = generateToken(user);

      res.status(201).json({
        success: true,
        message: "Đăng ký thành công",
        data: {
          user: user.toJSON(),
          token,
        },
      });
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server khi đăng ký",
        error: error.message,
      });
    }
  },

  // Đăng nhập
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Email và mật khẩu là bắt buộc",
        });
      }

      // Tìm user
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Email hoặc mật khẩu không đúng",
        });
      }

      // Kiểm tra mật khẩu
      const isPasswordValid = await user.checkPassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Email hoặc mật khẩu không đúng",
        });
      }

      // Kiểm tra tài khoản có active không
      if (!user.is_active) {
        return res.status(401).json({
          success: false,
          message: "Tài khoản đã bị khóa",
        });
      }

      const token = generateToken(user);

      res.json({
        success: true,
        message: "Đăng nhập thành công",
        data: {
          user: user.toJSON(),
          token,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server khi đăng nhập",
        error: error.message,
      });
    }
  },

  // Lấy thông tin profile
  async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy user",
        });
      }

      res.json({
        success: true,
        data: user.toJSON(),
      });
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server khi lấy thông tin profile",
        error: error.message,
      });
    }
  },

  // Cập nhật profile
  async updateProfile(req, res) {
    try {
      const { name, address, phone, avatar_url } = req.body;
      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy user",
        });
      }

      const updateData = {};
      if (name) updateData.name = name;
      if (address !== undefined) updateData.address = address;
      if (phone !== undefined) updateData.phone = phone;
      if (avatar_url !== undefined) updateData.avatar_url = avatar_url;

      const updatedUser = await user.update(updateData);

      res.json({
        success: true,
        message: "Cập nhật profile thành công",
        data: updatedUser.toJSON(),
      });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server khi cập nhật profile",
        error: error.message,
      });
    }
  },

  // Đổi mật khẩu
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy user",
        });
      }

      // Kiểm tra mật khẩu hiện tại
      const isCurrentPasswordValid = await user.checkPassword(currentPassword);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: "Mật khẩu hiện tại không đúng",
        });
      }

      // Đổi mật khẩu
      await user.changePassword(newPassword);

      res.json({
        success: true,
        message: "Đổi mật khẩu thành công",
      });
    } catch (error) {
      console.error("Change password error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server khi đổi mật khẩu",
        error: error.message,
      });
    }
  },

  // Lấy tất cả users (admin only)
  async getAllUsers(req, res) {
    try {
      const { page = 1, limit = 10, is_active } = req.query;
      const offset = (page - 1) * limit;

      const result = await User.findAll(
        parseInt(limit),
        parseInt(offset),
        is_active !== undefined ? Boolean(is_active) : null
      );

      res.json({
        success: true,
        data: result,
        pagination: {
          current: parseInt(page),
          itemsPerPage: parseInt(limit),
        },
      });
    } catch (error) {
      console.error("Get all users error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server khi lấy danh sách users",
        error: error.message,
      });
    }
  },
};

module.exports = authController;
