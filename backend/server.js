const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const { connectDatabase } = require("./config/database");
const { initDatabase, checkAndCreateTables } = require("./config/init-database");

// Import routes
const bookRoutes = require('./routes/books');
const categoryRoutes = require('./routes/categories');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// PHỤC VỤ STATIC FILES TỪ FRONTEND
app.use(express.static(path.join(__dirname, '../frontend')));

// Khởi tạo database khi server start
const initializeApp = async () => {
  try {
    console.log('🔌 Connecting to SQL Server...');
    
    // Kết nối database
    await connectDatabase();
    
    // Khởi tạo database và tables
    await initDatabase();
    await checkAndCreateTables();

    // Routes chính
    app.get("/", (req, res) => {
      res.sendFile(path.join(__dirname, '../frontend/index.html'));
    });

    app.get("/health", (req, res) => {
      res.json({
        server: "running",
        database: "SQL Server - connected",
        timestamp: new Date().toISOString(),
      });
    });

    // API Routes
    app.use('/api/books', bookRoutes);
    app.use('/api/categories', categoryRoutes);

    // ROUTES CHO CÁC TRANG PAGES - THÊM ĐOẠN NÀY
    app.get('/pages/:page', (req, res) => {
      const page = req.params.page;
      const pagePath = path.join(__dirname, '../frontend/pages', `${page}.html`);
      
      console.log(`📄 Serving page: ${pagePath}`);
      res.sendFile(pagePath);
    });

    // 404 Handler
    app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        message: 'Endpoint not found'
      });
    });

    // Khởi động server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Database: SQL Server`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`📚 Frontend: http://localhost:${PORT}`);
      console.log(`🛒 Cart: http://localhost:${PORT}/pages/cart.html`);
      console.log(`📖 Products: http://localhost:${PORT}/pages/products.html`);
      console.log(`🔐 Login: http://localhost:${PORT}/pages/login.html`);
    });

  } catch (error) {
    console.error("❌ Failed to initialize application:", error.message);
    process.exit(1);
  }
};

// Start application
initializeApp();