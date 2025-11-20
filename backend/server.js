const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { connectDatabase } = require("./config/database");
const {
  initDatabase,
  checkAndCreateTables,
} = require("./config/init-database");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Khởi tạo database khi server start
const initializeApp = async () => {
  try {
    // Kết nối database
    await connectDatabase();

    // Khởi tạo database và tables (chỉ cho development)
    if (process.env.NODE_ENV === "development") {
      await initDatabase();
      await checkAndCreateTables();
    }

    // Routes
    app.get("/", (req, res) => {
      res.json({
        message: "BookStore API is running!",
        database: "SQL Server",
      });
    });

    // Health check endpoint
    app.get("/health", async (req, res) => {
      // Lấy health check từ database
      const dbHealth =
        await require("./config/database").dbHelpers.healthCheck();
      res.json({
        server: "running",
        database: dbHealth,
        timestamp: new Date().toISOString(),
      });
    });

    // Khởi động server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Database: SQL Server`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("❌ Failed to initialize application:", error);
    process.exit(1);
  }
};

// Start application
initializeApp();
// Thêm sau các route khác
const bookRoutes = require('./routes/books');
app.use('/api/books', bookRoutes);