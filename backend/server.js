const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { connectDatabase } = require("./config/database");
const {
  initDatabase,
  checkAndCreateTables,
} = require("./config/init-database");

// Import routes
const authRoutes = require("./routes/auth");
const bookRoutes = require("./routes/books");
const categoryRoutes = require("./routes/categories");
const orderRoutes = require("./routes/orders");
const cartRoutes = require("./routes/cart");
const wishlistRoutes = require("./routes/wishlist");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Khởi tạo database khi server start
const initializeApp = async () => {
  try {
    console.log("🔌 Connecting to SQL Server...");

    // Kết nối database
    await connectDatabase();

    // Khởi tạo database và tables (chỉ cho development)
    if (process.env.NODE_ENV === "development") {
      await initDatabase();
      await checkAndCreateTables();
    }

    // Basic Routes
    app.get("/", (req, res) => {
      res.json({
        success: true,
        message: "📚 BookStore API is running!",
        version: "1.0.0",
        database: "SQL Server",
        timestamp: new Date().toISOString(),
        endpoints: {
          auth: "/api/auth",
          books: "/api/books",
          categories: "/api/categories",
          orders: "/api/orders",
          cart: "/api/cart",
          wishlist: "/api/wishlist",
        },
      });
    });

    // Health check endpoint
    app.get("/health", async (req, res) => {
      try {
        // Test database connection
        const db = require("./config/database");
        const dbHealth = await db.dbHelpers.healthCheck();

        res.json({
          success: true,
          status: "healthy",
          timestamp: new Date().toISOString(),
          database: dbHealth,
          uptime: process.uptime(),
          memory: process.memoryUsage(),
        });
      } catch (error) {
        res.status(503).json({
          success: false,
          status: "unhealthy",
          timestamp: new Date().toISOString(),
          error: error.message,
        });
      }
    });

    // API Routes
    app.use("/api/auth", authRoutes);
    app.use("/api/books", bookRoutes);
    app.use("/api/categories", categoryRoutes);
    app.use("/api/orders", orderRoutes);
    app.use("/api/cart", cartRoutes);
    app.use("/api/wishlist", wishlistRoutes);

    // 404 Handler - cho routes không tồn tại
    app.use("*", (req, res) => {
      res.status(404).json({
        success: false,
        message: "🔍 API endpoint not found",
        requestedUrl: req.originalUrl,
        availableEndpoints: {
          auth: {
            "POST /api/auth/register": "Đăng ký user",
            "POST /api/auth/login": "Đăng nhập",
            "GET /api/auth/profile": "Lấy thông tin user (cần auth)",
            "PUT /api/auth/profile": "Cập nhật profile (cần auth)",
          },
          books: {
            "GET /api/books": "Danh sách sách",
            "GET /api/books/search": "Tìm kiếm sách",
            "GET /api/books/featured": "Sách nổi bật",
            "GET /api/books/bestsellers": "Sách bán chạy",
            "GET /api/books/:id": "Chi tiết sách",
            "GET /api/books/:id/reviews": "Reviews sách",
          },
          categories: {
            "GET /api/categories": "Danh sách danh mục",
            "GET /api/categories/popular": "Danh mục phổ biến",
            "GET /api/categories/:id": "Chi tiết danh mục",
            "GET /api/categories/:id/books": "Sách theo danh mục",
          },
        },
      });
    });

    // Global error handling middleware
    app.use((error, req, res, next) => {
      console.error("💥 Unhandled Error:", error);

      // Database connection error
      if (error.code === "ELOGIN" || error.code === "ETIMEOUT") {
        return res.status(503).json({
          success: false,
          message: "Database connection failed",
          error:
            process.env.NODE_ENV === "development"
              ? error.message
              : "Service temporarily unavailable",
        });
      }

      // JWT error
      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({
          success: false,
          message: "Invalid token",
        });
      }

      // Default error
      res.status(error.status || 500).json({
        success: false,
        message: "Internal server error",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Something went wrong",
      });
    });

    // Khởi động server
    const server = app.listen(PORT, () => {
      console.log(`\n🚀 ==========================================`);
      console.log(`   📚 BookStore Server Started Successfully!`);
      console.log(`   ==========================================`);
      console.log(`   🌐 Server: http://localhost:${PORT}`);
      console.log(`   📊 Database: SQL Server`);
      console.log(
        `   🔧 Environment: ${process.env.NODE_ENV || "development"}`
      );
      console.log(`   ⏰ Started: ${new Date().toISOString()}`);
      console.log(`   ==========================================\n`);

      console.log(`📋 Available API Endpoints:`);
      console.log(`   🔐 AUTHENTICATION`);
      console.log(`      POST /api/auth/register     - Đăng ký user mới`);
      console.log(`      POST /api/auth/login        - Đăng nhập`);
      console.log(
        `      GET  /api/auth/profile      - Lấy thông tin user (cần auth)`
      );
      console.log(
        `      PUT  /api/auth/profile      - Cập nhật profile (cần auth)`
      );
      console.log(
        `      PUT  /api/auth/change-password - Đổi mật khẩu (cần auth)`
      );

      console.log(`\n   📚 BOOKS`);
      console.log(
        `      GET  /api/books             - Danh sách sách (có phân trang)`
      );
      console.log(`      GET  /api/books/search      - Tìm kiếm sách nâng cao`);
      console.log(`      GET  /api/books/featured    - Sách nổi bật`);
      console.log(`      GET  /api/books/bestsellers - Sách bán chạy`);
      console.log(`      GET  /api/books/:id         - Chi tiết sách`);
      console.log(`      GET  /api/books/:id/reviews - Reviews của sách`);
      console.log(`      POST /api/books/:id/reviews - Tạo review (cần auth)`);

      console.log(`\n   📂 CATEGORIES`);
      console.log(`      GET  /api/categories        - Danh sách danh mục`);
      console.log(`      GET  /api/categories/popular- Danh mục phổ biến`);
      console.log(`      GET  /api/categories/:id    - Chi tiết danh mục`);
      console.log(`      GET  /api/categories/:id/books - Sách theo danh mục`);

      console.log(`\n   🛒 CART & WISHLIST`);
      console.log(
        `      GET  /api/cart              - Lấy giỏ hàng (cần auth)`
      );
      console.log(
        `      POST /api/cart/add          - Thêm vào giỏ hàng (cần auth)`
      );
      console.log(
        `      PUT  /api/cart/update/:id   - Cập nhật giỏ hàng (cần auth)`
      );
      console.log(
        `      DELETE /api/cart/remove/:id - Xóa khỏi giỏ hàng (cần auth)`
      );
      console.log(
        `      GET  /api/wishlist          - Lấy wishlist (cần auth)`
      );
      console.log(
        `      POST /api/wishlist/add/:id  - Thêm vào wishlist (cần auth)`
      );

      console.log(`\n   📦 ORDERS`);
      console.log(
        `      GET  /api/orders/my-orders  - Đơn hàng của tôi (cần auth)`
      );
      console.log(
        `      POST /api/orders            - Tạo đơn hàng (cần auth)`
      );
      console.log(
        `      GET  /api/orders/my-orders/:id - Chi tiết đơn hàng (cần auth)`
      );

      console.log(`\n   🩺 HEALTH CHECK`);
      console.log(
        `      GET  /health                - Kiểm tra tình trạng server`
      );
      console.log(`      GET  /                      - Thông tin server\n`);

      console.log(`💡 Tip: Test API với Postman hoặc curl`);
      console.log(`   curl http://localhost:${PORT}/api/books`);
      console.log(`   curl http://localhost:${PORT}/api/categories\n`);
    });

    // Graceful shutdown
    process.on("SIGTERM", () => {
      console.log("🛑 SIGTERM received, shutting down gracefully");
      server.close(() => {
        console.log("✅ Process terminated");
        process.exit(0);
      });
    });

    process.on("SIGINT", () => {
      console.log("🛑 SIGINT received, shutting down gracefully");
      server.close(() => {
        console.log("✅ Process terminated");
        process.exit(0);
      });
    });
  } catch (error) {
    console.error("❌ Failed to initialize application:", error.message);

    // Exit với error code
    process.exit(1);
  }
};

// Start application
initializeApp();

module.exports = app;
