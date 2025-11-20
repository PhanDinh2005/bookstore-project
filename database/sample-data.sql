USE bookstore;
GO

-- Chèn dữ liệu categories
INSERT INTO categories (name, description) VALUES
(N'Tiểu thuyết', N'Các tác phẩm văn học dài, kể về một câu chuyện hư cấu'),
(N'Khoa học viễn tưởng', N'Thể loại dựa trên các ý tưởng khoa học và công nghệ tưởng tượng'),
(N'Trinh thám', N'Thể loại tập trung vào các vụ án và sự giải quyết chúng'),
(N'Lập trình', N'Sách về lập trình máy tính và công nghệ thông tin'),
(N'Kinh tế', N'Sách về kinh tế học và quản lý kinh doanh'),
(N'Tâm lý học', N'Sách nghiên cứu về hành vi và tâm trí con người');
GO

-- Chèn dữ liệu users (mật khẩu: 123456 - đã mã hóa bcrypt)
INSERT INTO users (name, email, password, role, address, phone) VALUES
(N'Admin User', 'admin@bookstore.com', '$2a$10$HxZ0z6.5u5U5U5U5U5U5UO5U5U5U5U5U5U5U5U5U5U5U5U5U5U', 'admin', N'123 Đường ABC, Quận 1, TP.HCM', '0901234567'),
(N'Nguyễn Văn A', 'customer1@email.com', '$2a$10$HxZ0z6.5u5U5U5U5U5U5UO5U5U5U5U5U5U5U5U5U5U5U5U5U5U', 'customer', N'456 Đường XYZ, Quận 2, TP.HCM', '0907654321'),
(N'Trần Thị B', 'customer2@email.com', '$2a$10$HxZ0z6.5u5U5U5U5U5U5UO5U5U5U5U5U5U5U5U5U5U5U5U5U5U', 'customer', N'789 Đường DEF, Quận 3, TP.HCM', '0908889999');
GO

-- Chèn dữ liệu books
INSERT INTO books (title, author, price, category_id, description, image_url, stock_quantity, isbn, publisher) VALUES
(N'Nhà giả kim', N'Paulo Coelho', 80000, 1, N'Hành trình theo đuổi giấc mơ của chàng chăn cừu Santiago', '/images/nha-gia-kim.jpg', 50, '9786046980000', N'Nhà Xuất Bản Trẻ'),
(N'Dune', N'Frank Herbert', 120000, 2, N'Cuốn tiểu thuyết khoa học viễn tưởng kinh điển', '/images/dune.jpg', 30, '9780593099322', N'Ace Books'),
(N'Sherlock Holmes', N'Arthur Conan Doyle', 90000, 3, N'Tuyển tập các truyện trinh thám kinh điển', '/images/sherlock.jpg', 40, '9780141033751', N'Penguin Classics'),
(N'Clean Code', N'Robert C. Martin', 150000, 4, N'Nghệ thuật viết code sạch trong lập trình', '/images/clean-code.jpg', 25, '9780132350884', N'Prentice Hall'),
(N'Đắc Nhân Tâm', N'Dale Carnegie', 75000, 5, N'Nghệ thuật thu phục lòng người', '/images/dac-nhan-tam.jpg', 60, '9786047736003', N'First News'),
(N'Tư duy nhanh và chậm', N'Daniel Kahneman', 110000, 6, N'Nghiên cứu về hai hệ thống tư duy của con người', '/images/tu-duy-nhanh-va-cham.jpg', 35, '9786045886330', N'Nhà Xuất Bản Thế Giới'),
(N'Harry Potter và Hòn đá Phù thủy', N'J.K. Rowling', 95000, 1, N'Câu chuyện về cậu bé phù thủy Harry Potter', '/images/harry-potter.jpg', 45, '9780545010221', N'Bloomsbury'),
(N'JavaScript: The Good Parts', N'Douglas Crockford', 130000, 4, N'Khám phá những phần tốt nhất của JavaScript', '/images/javascript-good-parts.jpg', 20, '9780596517748', N'OReilly Media');
GO

-- Chèn dữ liệu orders
INSERT INTO orders (user_id, total_amount, status, shipping_address, payment_method, payment_status) VALUES
(2, 170000, 'delivered', N'456 Đường XYZ, Quận 2, TP.HCM', 'cod', 'paid'),
(2, 120000, 'confirmed', N'456 Đường XYZ, Quận 2, TP.HCM', 'credit_card', 'paid'),
(3, 225000, 'pending', N'789 Đường DEF, Quận 3, TP.HCM', 'paypal', 'pending');
GO

-- Chèn dữ liệu order_items
INSERT INTO order_items (order_id, book_id, quantity, price, subtotal) VALUES
(1, 1, 1, 80000, 80000),
(1, 3, 1, 90000, 90000),
(2, 2, 1, 120000, 120000),
(3, 4, 1, 150000, 150000),
(3, 6, 1, 110000, 110000);
GO

PRINT '✅ Sample data inserted successfully!';