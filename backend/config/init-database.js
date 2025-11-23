const { dbHelpers } = require("./database");

// Khởi tạo database và các bảng
const initDatabase = async () => {
  try {
    console.log("🔄 Initializing database...");

    // Kiểm tra xem database có tồn tại không
    const dbExists = await dbHelpers.getOne(
      `
      SELECT name FROM sys.databases WHERE name = @dbname
    `,
      { dbname: process.env.DB_NAME || "bookstore" }
    );

    if (!dbExists) {
      console.log("📦 Creating new database...");
      await dbHelpers.execute(`
        CREATE DATABASE ${process.env.DB_NAME || "bookstore"}
        COLLATE Vietnamese_CI_AS
      `);
    }

    console.log("✅ Database initialized successfully");
    return true;
  } catch (error) {
    console.error("❌ Database initialization failed:", error.message);

    // Nếu lỗi vì database đã tồn tại, vẫn tiếp tục
    if (error.message.includes("already exists")) {
      console.log("ℹ️ Database already exists, continuing...");
      return true;
    }

    throw error;
  }
};

// Kiểm tra và tạo các bảng nếu cần
const checkAndCreateTables = async () => {
  const tables = [
    {
      name: "categories",
      sql: `
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='categories' AND xtype='U')
        CREATE TABLE categories (
            id INT IDENTITY(1,1) PRIMARY KEY,
            name NVARCHAR(100) NOT NULL UNIQUE,
            description NVARCHAR(MAX),
            image_url NVARCHAR(500),
            created_at DATETIME2 DEFAULT GETDATE(),
            updated_at DATETIME2 DEFAULT GETDATE()
        )
      `,
    },
    {
      name: "users",
      sql: `
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='users' AND xtype='U')
        CREATE TABLE users (
            id INT IDENTITY(1,1) PRIMARY KEY,
            name NVARCHAR(100) NOT NULL,
            email NVARCHAR(100) UNIQUE NOT NULL,
            password NVARCHAR(255) NOT NULL,
            role NVARCHAR(20) CHECK (role IN ('customer', 'admin')) DEFAULT 'customer',
            address NVARCHAR(MAX),
            phone NVARCHAR(20),
            avatar_url NVARCHAR(500),
            is_active BIT DEFAULT 1,
            created_at DATETIME2 DEFAULT GETDATE(),
            updated_at DATETIME2 DEFAULT GETDATE()
        )
      `,
    },
    {
      name: "books",
      sql: `
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='books' AND xtype='U')
        CREATE TABLE books (
            id INT IDENTITY(1,1) PRIMARY KEY,
            title NVARCHAR(255) NOT NULL,
            author NVARCHAR(100) NOT NULL,
            price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
            original_price DECIMAL(10, 2) CHECK (original_price >= 0),
            category_id INT,
            description NVARCHAR(MAX),
            image_url NVARCHAR(500),
            stock_quantity INT DEFAULT 0 CHECK (stock_quantity >= 0),
            isbn NVARCHAR(20),
            publisher NVARCHAR(100),
            published_date DATE,
            pages INT,
            language NVARCHAR(50) DEFAULT N'Tiếng Việt',
            weight_kg DECIMAL(5,2),
            dimensions NVARCHAR(50),
            is_featured BIT DEFAULT 0,
            is_bestseller BIT DEFAULT 0,
            rating_avg DECIMAL(3,2) DEFAULT 0 CHECK (rating_avg >= 0 AND rating_avg <= 5),
            rating_count INT DEFAULT 0,
            created_at DATETIME2 DEFAULT GETDATE(),
            updated_at DATETIME2 DEFAULT GETDATE(),
            FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
        )
      `,
    },
    {
      name: "orders",
      sql: `
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='orders' AND xtype='U')
        CREATE TABLE orders (
            id INT IDENTITY(1,1) PRIMARY KEY,
            user_id INT NOT NULL,
            order_number NVARCHAR(50) UNIQUE NOT NULL,
            total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
            status NVARCHAR(20) CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')) DEFAULT 'pending',
            shipping_address NVARCHAR(MAX) NOT NULL,
            shipping_fee DECIMAL(10, 2) DEFAULT 0,
            payment_method NVARCHAR(20) CHECK (payment_method IN ('cod', 'credit_card', 'paypal', 'bank_transfer')) DEFAULT 'cod',
            payment_status NVARCHAR(20) CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')) DEFAULT 'pending',
            customer_note NVARCHAR(MAX),
            admin_note NVARCHAR(MAX),
            estimated_delivery DATE,
            delivered_at DATETIME2,
            created_at DATETIME2 DEFAULT GETDATE(),
            updated_at DATETIME2 DEFAULT GETDATE(),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `,
    },
    {
      name: "order_items",
      sql: `
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='order_items' AND xtype='U')
        CREATE TABLE order_items (
            id INT IDENTITY(1,1) PRIMARY KEY,
            order_id INT NOT NULL,
            book_id INT NOT NULL,
            quantity INT NOT NULL CHECK (quantity > 0),
            price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
            subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
            created_at DATETIME2 DEFAULT GETDATE(),
            FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
            FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
        )
      `,
    },
    {
      name: "reviews",
      sql: `
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='reviews' AND xtype='U')
        CREATE TABLE reviews (
            id INT IDENTITY(1,1) PRIMARY KEY,
            user_id INT NOT NULL,
            book_id INT NOT NULL,
            rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
            title NVARCHAR(200),
            comment NVARCHAR(MAX),
            is_approved BIT DEFAULT 1,
            created_at DATETIME2 DEFAULT GETDATE(),
            updated_at DATETIME2 DEFAULT GETDATE(),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
            UNIQUE (user_id, book_id)
        )
      `,
    },
    {
      name: "wishlists",
      sql: `
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='wishlists' AND xtype='U')
        CREATE TABLE wishlists (
            id INT IDENTITY(1,1) PRIMARY KEY,
            user_id INT NOT NULL,
            book_id INT NOT NULL,
            created_at DATETIME2 DEFAULT GETDATE(),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
            UNIQUE (user_id, book_id)
        )
      `,
    },
    {
      name: "carts",
      sql: `
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='carts' AND xtype='U')
        CREATE TABLE carts (
            id INT IDENTITY(1,1) PRIMARY KEY,
            user_id INT NOT NULL,
            book_id INT NOT NULL,
            quantity INT NOT NULL CHECK (quantity > 0),
            created_at DATETIME2 DEFAULT GETDATE(),
            updated_at DATETIME2 DEFAULT GETDATE(),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
            UNIQUE (user_id, book_id)
        )
      `,
    },
  ];

  try {
    console.log("🔍 Checking database tables...");

    let createdCount = 0;
    for (const table of tables) {
      const tableExists = await dbHelpers.getOne(
        `
        SELECT * FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_NAME = @tableName
      `,
        { tableName: table.name }
      );

      if (!tableExists) {
        console.log(`📦 Creating table: ${table.name}`);
        await dbHelpers.execute(table.sql);
        createdCount++;
      }
    }

    if (createdCount > 0) {
      console.log(`✅ Created ${createdCount} new table(s)`);
    } else {
      console.log("✅ All tables already exist");
    }

    // Tạo indexes để tối ưu hiệu năng
    await createIndexes();

    return true;
  } catch (error) {
    console.error("❌ Table creation failed:", error);
    throw error;
  }
};

// Tạo indexes
const createIndexes = async () => {
  const indexes = [
    "CREATE INDEX idx_books_category ON books(category_id)",
    "CREATE INDEX idx_books_price ON books(price)",
    "CREATE INDEX idx_books_created ON books(created_at)",
    "CREATE INDEX idx_books_featured ON books(is_featured) WHERE is_featured = 1",
    "CREATE INDEX idx_books_bestseller ON books(is_bestseller) WHERE is_bestseller = 1",
    "CREATE INDEX idx_orders_user ON orders(user_id)",
    "CREATE INDEX idx_orders_status ON orders(status)",
    "CREATE INDEX idx_orders_created ON orders(created_at)",
    "CREATE INDEX idx_order_items_order ON order_items(order_id)",
    "CREATE INDEX idx_order_items_book ON order_items(book_id)",
    "CREATE INDEX idx_reviews_book ON reviews(book_id)",
    "CREATE INDEX idx_reviews_user ON reviews(user_id)",
    "CREATE INDEX idx_wishlists_user ON wishlists(user_id)",
    "CREATE INDEX idx_carts_user ON carts(user_id)",
  ];

  try {
    console.log("🔧 Creating indexes for performance...");

    for (const indexSql of indexes) {
      try {
        // Kiểm tra index đã tồn tại chưa
        const indexName = indexSql.match(/idx_(\w+)/)[0];
        await dbHelpers.execute(indexSql);
        console.log(`   ✅ Created index: ${indexName}`);
      } catch (error) {
        // Bỏ qua lỗi nếu index đã tồn tại
        if (!error.message.includes("already exists")) {
          console.warn(`   ⚠️ Could not create index: ${error.message}`);
        }
      }
    }

    console.log("✅ Indexes created successfully");
  } catch (error) {
    console.warn("⚠️ Index creation had some issues:", error.message);
  }
};

// Chèn dữ liệu mẫu
const seedSampleData = async () => {
  try {
    console.log("🌱 Checking for sample data...");

    // Kiểm tra xem đã có dữ liệu chưa
    const hasCategories = await dbHelpers.getOne(
      "SELECT COUNT(*) as count FROM categories"
    );
    const hasBooks = await dbHelpers.getOne(
      "SELECT COUNT(*) as count FROM books"
    );

    if (hasCategories.count > 0 || hasBooks.count > 0) {
      console.log("✅ Sample data already exists");
      return;
    }

    console.log("📥 Seeding sample data...");

    // Chạy file sample data
    const fs = require("fs");
    const path = require("path");
    const sampleDataPath = path.join(
      __dirname,
      "../database/sample-data-new.sql"
    );

    if (fs.existsSync(sampleDataPath)) {
      const sampleData = fs.readFileSync(sampleDataPath, "utf8");

      // Chạy từng câu lệnh SQL
      const statements = sampleData.split("GO").filter((stmt) => stmt.trim());

      for (const statement of statements) {
        if (statement.trim()) {
          await dbHelpers.execute(statement);
        }
      }

      console.log("✅ Sample data seeded successfully");
    } else {
      console.warn("⚠️ Sample data file not found, skipping data seeding");
    }
  } catch (error) {
    console.warn("⚠️ Sample data seeding failed:", error.message);
  }
};

// Kiểm tra database connection
const testConnection = async () => {
  try {
    const health = await dbHelpers.healthCheck();
    console.log("🔍 Database connection test:", health.status);
    return health.status === "healthy";
  } catch (error) {
    console.error("❌ Database connection test failed:", error.message);
    return false;
  }
};

module.exports = {
  initDatabase,
  checkAndCreateTables,
  seedSampleData,
  testConnection,
};
