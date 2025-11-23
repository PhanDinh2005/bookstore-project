const sql = require("mssql");
require("dotenv").config();

// Config kết nối SQL Server
const dbConfig = {
  server: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT) || 1433,
  user: process.env.DB_USER || "sa",
  password: process.env.DB_PASSWORD || "123",
  database: process.env.DB_NAME || "bookstore",
  options: {
    encrypt: process.env.DB_ENCRYPT === "true",
    trustServerCertificate: true,
    enableArithAbort: true,
    connectTimeout: 30000,
    requestTimeout: 30000,
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000,
    },
  },
};

// Biến toàn cục để lưu connection pool
let pool = null;

// Kết nối SQL Server
const connectSQLServer = async () => {
  try {
    console.log("🔌 Attempting to connect to SQL Server...");
    console.log("📊 Configuration:", {
      server: dbConfig.server,
      port: dbConfig.port,
      database: dbConfig.database,
      user: dbConfig.user,
    });

    // Tạo connection pool
    pool = await sql.connect(dbConfig);

    console.log("✅ SQL Server connected successfully!");

    // Test connection với query đơn giản
    const result = await pool.request().query("SELECT @@VERSION AS version");
    console.log("📦 SQL Server version check passed");

    return pool;
  } catch (error) {
    console.error("❌ SQL Server connection failed:", error.message);
    console.log("\n💡 TROUBLESHOOTING TIPS:");
    console.log("1. Make sure SQL Server is running");
    console.log("2. Check SQL Server Configuration Manager");
    console.log("3. Verify username/password in .env file");
    console.log("4. Ensure TCP/IP is enabled in SQL Server");
    console.log("5. Check if database exists");

    throw error;
  }
};

// Helper functions for SQL Server
const dbHelpers = {
  // Get connection pool
  getPool: () => {
    if (!pool) {
      throw new Error("Database not connected. Call connectDatabase first.");
    }
    return pool;
  },

  // Execute query với parameters
  query: async (sqlQuery, params = {}) => {
    try {
      const pool = dbHelpers.getPool();
      const request = pool.request();

      // Thêm parameters nếu có
      Object.keys(params).forEach((key) => {
        request.input(key, params[key]);
      });

      const result = await request.query(sqlQuery);
      return result.recordset;
    } catch (error) {
      console.error("Database query error:", error);
      throw new Error(`Database query failed: ${error.message}`);
    }
  },

  // Execute non-query (INSERT, UPDATE, DELETE)
  execute: async (sqlQuery, params = {}) => {
    try {
      const pool = dbHelpers.getPool();
      const request = pool.request();

      Object.keys(params).forEach((key) => {
        request.input(key, params[key]);
      });

      const result = await request.query(sqlQuery);
      return result;
    } catch (error) {
      console.error("Database execute error:", error);
      throw new Error(`Database execute failed: ${error.message}`);
    }
  },

  // Lấy một bản ghi
  getOne: async (sqlQuery, params = {}) => {
    const result = await dbHelpers.query(sqlQuery, params);
    return result[0] || null;
  },

  // Insert và trả về ID
  insert: async (sqlQuery, params = {}) => {
    try {
      // Đảm bảo query có OUTPUT INSERTED.id
      if (!sqlQuery.includes("OUTPUT INSERTED.")) {
        throw new Error("INSERT query must include OUTPUT INSERTED clause");
      }

      const result = await dbHelpers.query(sqlQuery, params);
      return result[0]; // Trả về toàn bộ bản ghi đã insert
    } catch (error) {
      console.error("Database insert error:", error);
      throw error;
    }
  },

  // Update và trả về số bản ghi bị ảnh hưởng
  update: async (sqlQuery, params = {}) => {
    const result = await dbHelpers.execute(sqlQuery, params);
    return result.rowsAffected[0];
  },

  // Transaction support
  transaction: async (callback) => {
    const pool = dbHelpers.getPool();
    const transaction = new sql.Transaction(pool);

    try {
      await transaction.begin();
      const result = await callback(transaction);
      await transaction.commit();
      return result;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  // Kiểm tra kết nối
  healthCheck: async () => {
    try {
      const result = await dbHelpers.query(
        "SELECT GETDATE() AS current_time, DB_NAME() AS database_name"
      );
      return {
        status: "healthy",
        timestamp: result[0].current_time,
        database: result[0].database_name,
        connection: "active",
      };
    } catch (error) {
      return {
        status: "unhealthy",
        error: error.message,
        database: dbConfig.database,
        connection: "inactive",
      };
    }
  },

  // Đóng kết nối
  close: async () => {
    if (pool) {
      await pool.close();
      pool = null;
      console.log("🔌 Database connection closed");
    }
  },
};

// Kiểm tra loại database từ environment
const getDatabaseType = () => {
  return process.env.DB_TYPE || "sqlserver";
};

// Kết nối database dựa trên config
const connectDatabase = async () => {
  const dbType = getDatabaseType();

  console.log(`🔌 Connecting to ${dbType.toUpperCase()} database...`);

  if (dbType === "sqlserver") {
    return await connectSQLServer();
  } else {
    throw new Error(`Unsupported database type: ${dbType}`);
  }
};

module.exports = {
  connectDatabase,
  dbHelpers,
  dbConfig,
  getDatabaseType,
};
