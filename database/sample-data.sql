USE bookstore;

-- Chèn dữ liệu categories
INSERT INTO categories (name, description) VALUES
('Tiểu thuyết', 'Các tác phẩm văn học dài, kể về một câu chuyện hư cấu'),
('Khoa học viễn tưởng', 'Thể loại dựa trên các ý tưởng khoa học và công nghệ tưởng tượng'),
('Trinh thám', 'Thể loại tập trung vào các vụ án và sự giải quyết chúng'),
('Lập trình', 'Sách về lập trình máy tính và công nghệ thông tin'),
('Kinh tế', 'Sách về kinh tế học và quản lý kinh doanh'),
('Tâm lý học', 'Sách nghiên cứu về hành vi và tâm trí con người');

-- Chèn dữ liệu users (mật khẩu: 123456 - đã mã hóa bcrypt)
INSERT INTO users (name, email, password, role, address, phone) VALUES
('Admin User', 'admin@bookstore.com', '$2a$10$HxZ0z6.5u5U5U5U5U5U5UO5U5U5U5U5U5U5U5U5U5U5U5U5U5U', 'admin', '123 Đường ABC, Quận 1, TP.HCM', '0901234567'),
('Nguyễn Văn A', 'customer1@email.com', '$2a$10$HxZ0z6.5u5U5U5U5U5U5UO5U5U5U5U5U5U5U5U5U5U5U5U5U5U', 'customer', '456 Đường XYZ, Quận 2, TP.HCM', '0907654321'),
('Trần Thị B', 'customer2@email.com', '$2a$10$HxZ0z6.5u5U5U5U5U5U5UO5U5U5U5U5U5U5U5U5U5U5U5U5U5U', 'customer', '789 Đường DEF, Quận 3, TP.HCM', '0908889999');

-- Chèn dữ liệu books
INSERT INTO books (title, author, price, category_id, description, image_url, stock_quantity, isbn, publisher) VALUES
('Nhà giả kim', 'Paulo Coelho', 80000, 1, 'Hành trình theo đuổi giấc mơ của chàng chăn cừu Santiago', '/images/nha-gia-kim.jpg', 50, '9786046980000', 'Nhà Xuất Bản Trẻ'),
('Dune', 'Frank Herbert', 120000, 2, 'Cuốn tiểu thuyết khoa học viễn tưởng kinh điển', '/images/dune.jpg', 30, '9780593099322', 'Ace Books'),
('Sherlock Holmes', 'Arthur Conan Doyle', 90000, 3, 'Tuyển tập các truyện trinh thám kinh điển', '/images/sherlock.jpg', 40, '9780141033751', 'Penguin Classics'),
('Clean Code', 'Robert C. Martin', 150000, 4, 'Nghệ thuật viết code sạch trong lập trình', '/images/clean-code.jpg', 25, '9780132350884', 'Prentice Hall'),
('Đắc Nhân Tâm', 'Dale Carnegie', 75000, 5, 'Nghệ thuật thu phục lòng người', '/images/dac-nhan-tam.jpg', 60, '9786047736003', 'First News'),
('Tư duy nhanh và chậm', 'Daniel Kahneman', 110000, 6, 'Nghiên cứu về hai hệ thống tư duy của con người', '/images/tu-duy-nhanh-va-cham.jpg', 35, '9786045886330', 'Nhà Xuất Bản Thế Giới'),
('Harry Potter và Hòn đá Phù thủy', 'J.K. Rowling', 95000, 1, 'Câu chuyện về cậu bé phù thủy Harry Potter', '/images/harry-potter.jpg', 45, '9780545010221', 'Bloomsbury'),
('JavaScript: The Good Parts', 'Douglas Crockford', 130000, 4, 'Khám phá những phần tốt nhất của JavaScript', '/images/javascript-good-parts.jpg', 20, '9780596517748', 'OReilly Media');

-- Chèn dữ liệu orders
INSERT INTO orders (user_id, total_amount, status, shipping_address, payment_method, payment_status) VALUES
(2, 170000, 'delivered', '456 Đường XYZ, Quận 2, TP.HCM', 'cod', 'paid'),
(2, 120000, 'confirmed', '456 Đường XYZ, Quận 2, TP.HCM', 'credit_card', 'paid'),
(3, 225000, 'pending', '789 Đường DEF, Quận 3, TP.HCM', 'paypal', 'pending');

-- Chèn dữ liệu order_items
INSERT INTO order_items (order_id, book_id, quantity, price, subtotal) VALUES
(1, 1, 1, 80000, 80000),
(1, 3, 1, 90000, 90000),
(2, 2, 1, 120000, 120000),
(3, 4, 1, 150000, 150000),
(3, 6, 1, 110000, 110000);

-- Chèn dữ liệu reviews (tùy chọn)
INSERT INTO reviews (user_id, book_id, rating, comment) VALUES
(2, 1, 5, 'Sách rất hay và ý nghĩa, đáng đọc!'),
(2, 3, 4, 'Truyện trinh thám hấp dẫn, nhưng hơi dài'),
(3, 4, 5, 'Must-read cho mọi lập trình viên');