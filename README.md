# 📚 BookStore - Website Bán Sách Trực Tuyến

## 📋 Giới Thiệu Dự Án

BookStore là một ứng dụng web bán sách trực tuyến được phát triển với mục tiêu cung cấp trải nghiệm mua sách dễ dàng và tiện lợi cho người dùng. Dự án kết hợp giữa frontend đơn giản và backend mạnh mẽ với đầy đủ các tính năng CRUD.

## 🎯 Mục Tiêu Dự Án

- Xây dựng website bán sách trực tuyến đầy đủ tính năng
- Phát triển kỹ năng full-stack (frontend + backend + database)
- Áp dụng các công nghệ web hiện đại
- Triển khai hệ thống hoàn chỉnh từ thiết kế đến deployment

## 🛠 Công Nghệ Sử Dụng

### **Frontend**
- **HTML5** - Cấu trúc trang web
- **CSS3** - Styling và responsive design
- **JavaScript ES6+** - Xử lý tương tác người dùng
- **Fetch API** - Giao tiếp với backend

### **Backend**
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **SQL Server** - Hệ quản trị cơ sở dữ liệu
- **MSSQL** - Driver kết nối SQL Server

### **Development Tools**
- **Git** - Version control
- **Nodemon** - Auto-restart server khi development
- **Dotenv** - Quản lý environment variables

## 📁 Cấu Trúc Dự Án
bookstore-project/
├── 📁 frontend/ # Giao diện người dùng
│ ├── 📁 pages/ # Các trang con
│ │ ├── home.html # Trang chủ
│ │ ├── products.html # Trang sản phẩm
│ │ ├── cart.html # Trang giỏ hàng
│ │ ├── login.html # Trang đăng nhập
│ │ └── register.html # Trang đăng ký
│ ├── 📁 js/ # JavaScript files
│ │ ├── api.js # Xử lý API calls
│ │ ├── app.js # Logic chính
│ │ ├── auth.js # Xác thực người dùng
│ │ └── cart.js # Quản lý giỏ hàng
│ ├── 📁 styles/ # CSS files
│ │ ├── main.css # Styles chính
│ │ ├── variables.css # Biến CSS
│ │ └── responsive.css # Responsive design
│ └── index.html # Trang chủ
│
├── 📁 backend/ # Server và API
│ ├── 📁 config/ # Cấu hình
│ │ ├── database.js # Kết nối database
│ │ └── init-database.js # Khởi tạo database
│ ├── 📁 controllers/ # Xử lý business logic
│ │ ├── bookController.js # Controller sách
│ │ └── categoryController.js # Controller danh mục
│ ├── 📁 models/ # Data models
│ │ ├── Book.js # Model sách
│ │ ├── Category.js # Model danh mục
│ │ ├── User.js # Model người dùng
│ │ ├── Order.js # Model đơn hàng
│ │ └── OrderItem.js # Model chi tiết đơn hàng
│ ├── 📁 routes/ # API routes
│ │ ├── books.js # Routes sách
│ │ └── categories.js # Routes danh mục
│ ├── 📁 database/ # Database scripts
│ │ ├── schema.sql # Tạo bảng
│ │ └── sample-data.sql # Dữ liệu mẫu
│ └── server.js # Server chính
│
└── 📄 README.md # Tài liệu dự án

## 🗄 Thiết Kế Database

### **Các Bảng Chính**

1. **users** - Quản lý người dùng
2. **categories** - Danh mục sách
3. **books** - Thông tin sách
4. **orders** - Đơn hàng
5. **order_items** - Chi tiết đơn hàng
6. **reviews** - Đánh giá sách

### **Quan Hệ**
- Một user có nhiều orders
- Một category có nhiều books
- Một order có nhiều order_items
- Một book có nhiều reviews

## 🚀 Tính Năng Đã Triển Khai

### **✅ Đã Hoàn Thành**
- [x] **Backend API hoàn chỉnh**
  - RESTful API cho books và categories
  - Kết nối SQL Server
  - CRUD operations đầy đủ
  - Validation và error handling

- [x] **Frontend cơ bản**
  - Trang chủ với sách nổi bật
  - Trang sản phẩm với tìm kiếm và lọc
  - Responsive design
  - Giao diện người dùng thân thiện

- [x] **Database design**
  - Thiết kế schema chuẩn
  - Dữ liệu mẫu đa dạng
  - Quan hệ rõ ràng

### **🔄 Đang Phát Triển**
- [ ] Authentication & Authorization
- [ ] Shopping cart functionality
- [ ] Order management
- [ ] Payment integration
- [ ] Admin dashboard

## 🔧 Hướng Dẫn Cài Đặt

### **Yêu Cầu Hệ Thống**
- Node.js (v14+)
- SQL Server
- Git

### **Bước 1: Clone Dự Án**
```bash
git clone <repository-url>
cd bookstore-project
```
### **Bước 2: Cài đặt Backend**
```bash
cd backend
npm install
```
### **Bước 3: Cấu Hình Database**
1. Tạo database `bookstore` trong SQL Server

2. Chạy file `database/schema.sql` để tạo bảng

3. Chạy file `database/sample-data.sql` để thêm dữ liệu mẫu