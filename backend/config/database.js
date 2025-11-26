const sql = require("mssql");
require("dotenv").config();

const config = {
  user: process.env.DB_USER || "sa", // Tự lấy biến môi trường hoặc dùng mặc định
  password: process.env.DB_PASSWORD || "123",
  server: process.env.DB_SERVER || "localhost",
  database: process.env.DB_NAME || "BookStore",
  port: parseInt(process.env.DB_PORT) || 1433,
  options: {
    encrypt: false, // Để false nếu chạy localhost
    trustServerCertificate: true, // Bắt buộc true với SQL Server dev
    enableArithAbort: true,
  },
};

// Hàm kết nối chính
const connectDB = async () => {
  try {
    await sql.connect(config);
    console.log("✅ SQL Server Connected Successfully!");
  } catch (err) {
    console.error("❌ SQL Server Connection Failed:", err.message);
    process.exit(1); // Dừng server nếu không kết nối được DB
  }
};

// Bộ công cụ hỗ trợ query (dbHelpers) - Rất quan trọng cho các Model mới
const dbHelpers = {
  getPool: () => {
    return sql;
  },
  query: async (sqlQuery, params = {}) => {
    try {
      const request = new sql.Request();
      // Gán tham số
      Object.keys(params).forEach((key) => {
        request.input(key, params[key]);
      });
      const result = await request.query(sqlQuery);
      return result.recordset;
    } catch (err) {
      console.error("Query Error:", err);
      throw err;
    }
  },
  execute: async (sqlQuery, params = {}) => {
    try {
      const request = new sql.Request();
      Object.keys(params).forEach((key) => {
        request.input(key, params[key]);
      });
      const result = await request.query(sqlQuery);
      return result;
    } catch (err) {
      console.error("Execute Error:", err);
      throw err;
    }
  },
  getOne: async (sqlQuery, params = {}) => {
    const result = await dbHelpers.query(sqlQuery, params);
    return result[0] || null;
  },
};

// 👇 QUAN TRỌNG: Phải export đúng tên connectDB
module.exports = { connectDB, sql, dbHelpers };
