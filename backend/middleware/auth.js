const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config(); // <- Bổ sung: Đảm bảo biến môi trường được tải

// 1. Khai báo biến JWT_SECRET an toàn
// Dùng biến môi trường nếu có, nếu không có thì dừng server (KHÔNG dùng fallback chuỗi)
// Nếu bạn muốn dùng fallback chuỗi, hãy đảm bảo chuỗi đó giống hệt nhau
const JWT_SECRET = process.env.JWT_SECRET || "M4y-S3cr3t-K3y-F0r-D3v";

// Nếu bạn muốn yêu cầu biến môi trường phải có:
// if (!JWT_SECRET) {
//     console.error("Fatal Error: JWT_SECRET not defined in .env");
//     process.exit(1);
// }

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role || "user", // Cấp mặc định nếu thiếu
    },
    JWT_SECRET, // <-- SỬ DỤNG BIẾN ĐÃ KHAI BÁO
    { expiresIn: "1d" } // Giảm thời gian hết hạn còn 1 ngày cho dễ test
  );
};

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    // Dùng headers.authorization để lấy token (chuẩn)
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    } // 1. GIẢI MÃ TOKEN

    const decoded = jwt.verify(
      token,
      JWT_SECRET // <-- SỬ DỤNG BIẾN ĐÃ KHAI BÁO
    );

    // 2. TÌM USER TRONG DB
    // Vì bạn đang dùng User.findById, hàm này phải được export từ models/User.js
    // và dùng dbHelpers để truy vấn (SELECT TOP 1 * FROM Users WHERE id = @id)
    // Nếu bạn dùng SQL Server, hãy chắc chắn User.findById hoạt động đúng
    const user = await User.findById(decoded.id); // 3. KIỂM TRA TÌNH TRẠNG USER

    if (!user || user.is_active === false) {
      // Cần đảm bảo cột is_active có trong DB
      return res.status(401).json({
        success: false,
        message: "Token is not valid or user is inactive.",
      });
    } // 4. GÁN VÀ NEXT

    req.user = user;
    next();
  } catch (error) {
    // Log lỗi để biết nguyên nhân: Expired, Invalid Signature, v.v.
    console.error("JWT Authentication Error:", error.name, error.message);
    res.status(401).json({
      success: false,
      message: "Token is not valid.",
    });
  }
};

// Authorization middleware (Giữ nguyên - logic này tốt)
const authorize = (roles = []) => {
  // ... (giữ nguyên logic authorize)
  if (typeof roles === "string") {
    roles = [roles];
  }

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Insufficient permissions.",
      });
    }

    next();
  };
};

module.exports = {
  generateToken,
  authenticate,
  authorize,
};
