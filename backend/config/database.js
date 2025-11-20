const sql = require("mssql");
require("dotenv").config();

// Config kết nối SQL Server
const dbConfig = {
  server: "localhost",
  authentication: {
    type: "default",
    options: {
      userName: "sa",
      password: "123"
    }
  },
  options: {
    trustServerCertificate: true,
  }
};


// Kết nối SQL Server
const connectSQLServer = async () => {
  try {
    console.log("🔌 Attempting to connect to SQL Server...");
    console.log(`📊 Server: ${dbConfig.server}`);
    console.log(`📊 Database: ${dbConfig.database}`);

    const pool = await sql.connect(dbConfig);
    console.log("✅ SQL Server connected successfully!");

    // Test connection
    const result = await pool.request().query("SELECT @@VERSION AS version");
    console.log("📦 SQL Server version check passed");

    return pool;
  } catch (error) {
    console.error("❌ SQL Server connection failed:", error.message);
    console.log("💡 Troubleshooting tips:");
    console.log("1. Check if SQL Server is running");
    console.log("2. Verify username/password in .env file");
    console.log(
      "3. Try Windows Authentication (set DB_TRUSTED_CONNECTION=true)"
    );
    console.log("4. Check if TCP/IP is enabled in SQL Server Configuration");
    process.exit(1);
  }
};

// ... phần còn lại giữ nguyên

// Helper functions for SQL Server
const dbHelpers = {
  // Execute query với parameters
  query: async (sqlQuery, params = {}) => {
    try {
      const pool = await sql.connect(dbConfig);
      const request = pool.request();

      // Thêm parameters nếu có
      Object.keys(params).forEach((key) => {
        request.input(key, params[key]);
      });

      const result = await request.query(sqlQuery);
      return result.recordset;
    } catch (error) {
      console.error("Database query error:", error);
      throw error;
    }
  },

  // Lấy một bản ghi
  getOne: async (sqlQuery, params = {}) => {
    const result = await dbHelpers.query(sqlQuery, params);
    return result[0] || null;
  },

  // Insert và trả về ID
  insert: async (sqlQuery, params = {}) => {
    const pool = await sql.connect(dbConfig);
    const request = pool.request();

    Object.keys(params).forEach((key) => {
      request.input(key, params[key]);
    });
    

    const result = await request.query(sqlQuery);
    // Trả về ID của bản ghi vừa insert (giả sử câu query trả về ID)
    return result.recordset[0] ? result.recordset[0].id : null;
  },

  // Update
  update: async (sqlQuery, params = {}) => {
    const pool = await sql.connect(dbConfig);
    const request = pool.request();

    Object.keys(params).forEach((key) => {
      request.input(key, params[key]);
    });

    const result = await request.query(sqlQuery);
    return result.rowsAffected[0];
  },

  // Kiểm tra kết nối
  healthCheck: async () => {
    try {
      const result = await dbHelpers.query("SELECT GETDATE() AS current_time");
      return { status: "healthy", timestamp: result[0].current_time };
    } catch (error) {
      return { status: "unhealthy", error: error.message };
    }
  },
};

module.exports = {
  connectDatabase: connectSQLServer,
  dbHelpers,
  dbConfig,
};
