const { dbHelpers } = require('./database');

// Khởi tạo database và các bảng nếu chưa tồn tại
const initDatabase = async () => {
  try {
    console.log('🔄 Initializing database...');

    // Tạo database nếu chưa tồn tại
    await dbHelpers.query(`
      IF NOT EXISTS(SELECT * FROM sys.databases WHERE name = 'bookstore')
      BEGIN
        CREATE DATABASE bookstore
      END
    `);

    // Sử dụng database bookstore
    await dbHelpers.query('USE bookstore');

    console.log('✅ Database initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    return false;
  }
};

// Kiểm tra và tạo các bảng nếu cần
const checkAndCreateTables = async () => {
  const tables = [
    `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='categories' AND xtype='U')
    CREATE TABLE categories (
        id INT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(100) NOT NULL UNIQUE,
        description NVARCHAR(MAX),
        created_at DATETIME2 DEFAULT GETDATE()
    )`,

    `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='users' AND xtype='U')
    CREATE TABLE users (
        id INT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(100) NOT NULL,
        email NVARCHAR(100) UNIQUE NOT NULL,
        password NVARCHAR(255) NOT NULL,
        role NVARCHAR(20) CHECK (role IN ('customer', 'admin')) DEFAULT 'customer',
        address NVARCHAR(MAX),
        phone NVARCHAR(20),
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE()
    )`,

    `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='books' AND xtype='U')
    CREATE TABLE books (
        id INT IDENTITY(1,1) PRIMARY KEY,
        title NVARCHAR(255) NOT NULL,
        author NVARCHAR(100) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        category_id INT,
        description NVARCHAR(MAX),
        image_url NVARCHAR(500),
        stock_quantity INT DEFAULT 0,
        isbn NVARCHAR(20),
        publisher NVARCHAR(100),
        published_date DATE,
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    )`,

    `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='orders' AND xtype='U')
    CREATE TABLE orders (
        id INT IDENTITY(1,1) PRIMARY KEY,
        user_id INT NOT NULL,
        total_amount DECIMAL(10, 2) NOT NULL,
        status NVARCHAR(20) CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')) DEFAULT 'pending',
        shipping_address NVARCHAR(MAX) NOT NULL,
        payment_method NVARCHAR(20) CHECK (payment_method IN ('cod', 'credit_card', 'paypal')) DEFAULT 'cod',
        payment_status NVARCHAR(20) CHECK (payment_status IN ('pending', 'paid', 'failed')) DEFAULT 'pending',
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,

    `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='order_items' AND xtype='U')
    CREATE TABLE order_items (
        id INT IDENTITY(1,1) PRIMARY KEY,
        order_id INT NOT NULL,
        book_id INT NOT NULL,
        quantity INT NOT NULL CHECK (quantity > 0),
        price DECIMAL(10, 2) NOT NULL,
        subtotal DECIMAL(10, 2) NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
    )`
  ];

  try {
    for (const tableSql of tables) {
      await dbHelpers.query(tableSql);
    }
    console.log('✅ All tables checked/created successfully');
  } catch (error) {
    console.error('❌ Table creation failed:', error);
  }
};

module.exports = {
  initDatabase,
  checkAndCreateTables
};