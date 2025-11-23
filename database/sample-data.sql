USE bookstore;
GO

-- Xóa dữ liệu cũ nếu có
DELETE FROM carts;
DELETE FROM wishlists;
DELETE FROM reviews;
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM books;
DELETE FROM categories;
DELETE FROM users;
GO

-- Chèn dữ liệu categories (DÙNG N TRƯỚC CHUỖI TIẾNG VIỆT)
INSERT INTO categories (name, description, image_url) VALUES
(N'Tiểu thuyết', N'Các tác phẩm văn học dài, kể về một câu chuyện hư cấu', '/images/categories/novel.jpg'),
(N'Khoa học viễn tưởng', N'Thể loại dựa trên các ý tưởng khoa học và công nghệ tưởng tượng', '/images/categories/scifi.jpg'),
(N'Trinh thám', N'Thể loại tập trung vào các vụ án và sự giải quyết chúng', '/images/categories/mystery.jpg'),
(N'Lập trình & Công nghệ', N'Sách về lập trình máy tính và công nghệ thông tin', '/images/categories/programming.jpg'),
(N'Kinh tế & Kinh doanh', N'Sách về kinh tế học và quản lý kinh doanh', '/images/categories/business.jpg'),
(N'Tâm lý học', N'Sách nghiên cứu về hành vi và tâm trí con người', '/images/categories/psychology.jpg'),
(N'Văn học kinh điển', N'Các tác phẩm văn học có giá trị nghệ thuật cao qua thời gian', '/images/categories/classic.jpg'),
(N'Sách thiếu nhi', N'Sách dành cho độc giả nhỏ tuổi', '/images/categories/children.jpg');
GO

-- Chèn dữ liệu users (mật khẩu: 123456 - đã mã hóa bcrypt)
INSERT INTO users (name, email, password, role, address, phone, avatar_url) VALUES
(N'Quản trị viên', 'admin@bookstore.com', '$2a$10$HxZ0z6.5u5U5U5U5U5U5UO5U5U5U5U5U5U5U5U5U5U5U5U5U', 'admin', N'123 Đường Lê Lợi, Quận 1, TP.HCM', '0901234567', '/images/avatars/admin.jpg'),
(N'Nguyễn Văn An', 'customer1@email.com', '$2a$10$HxZ0z6.5u5U5U5U5U5U5UO5U5U5U5U5U5U5U5U5U5U5U5U5U', 'customer', N'456 Đường Nguyễn Huệ, Quận 1, TP.HCM', '0907654321', '/images/avatars/user1.jpg'),
(N'Trần Thị Bình', 'customer2@email.com', '$2a$10$HxZ0z6.5u5U5U5U5U5U5UO5U5U5U5U5U5U5U5U5U5U5U5U5U', 'customer', N'789 Đường Pasteur, Quận 3, TP.HCM', '0908889999', '/images/avatars/user2.jpg'),
(N'Lê Văn Cường', 'customer3@email.com', '$2a$10$HxZ0z6.5u5U5U5U5U5U5UO5U5U5U5U5U5U5U5U5U5U5U5U5U', 'customer', N'321 Đường Cách Mạng Tháng 8, Quận 10, TP.HCM', '0901112222', '/images/avatars/user3.jpg');
GO

-- Chèn dữ liệu books (DÙNG N TRƯỚC CHUỖI TIẾNG VIỆT)
INSERT INTO books (title, author, price, original_price, category_id, description, image_url, stock_quantity, isbn, publisher, pages, is_featured, is_bestseller) VALUES
(N'Nhà giả kim', N'Paulo Coelho', 80000, 100000, 1, N'Hành trình theo đuổi giấc mơ của chàng chăn cừu Santiago - một câu chuyện đầy cảm hứng về việc theo đuổi vận mệnh của mình.', '/images/books/nha-gia-kim.jpg', 50, '9786046980000', N'Nhà Xuất Bản Trẻ', 208, 1, 1),
(N'Dune - Xứ cát', N'Frank Herbert', 150000, 180000, 2, N'Cuốn tiểu thuyết khoa học viễn tưởng kinh điển về hành tinh sa mạc Arrakis và cuộc chiến giành gia vị.', '/images/books/dune.jpg', 30, '9780593099322', N'Penguin Books', 412, 1, 1),
(N'Sherlock Holmes: Toàn tập', N'Arthur Conan Doyle', 120000, 150000, 3, N'Tuyển tập đầy đủ các truyện trinh thám kinh điển về thám tử Sherlock Holmes và bác sĩ Watson.', '/images/books/sherlock-holmes.jpg', 40, '9780141033751', N'Penguin Classics', 512, 0, 1),
(N'Clean Code: Mã sạch', N'Robert C. Martin', 180000, 220000, 4, N'Nghệ thuật viết code sạch trong lập trình - cuốn sách gối đầu giường của mọi lập trình viên chuyên nghiệp.', '/images/books/clean-code.jpg', 25, '9780132350884', N'Prentice Hall', 464, 1, 0),
(N'Đắc Nhân Tâm', N'Dale Carnegie', 75000, 89000, 5, N'Nghệ thuật thu phục lòng người - cuốn sách kinh điển về kỹ năng giao tiếp và thuyết phục.', '/images/books/dac-nhan-tam.jpg', 60, '9786047736003', N'First News', 320, 1, 1),
(N'Tư duy nhanh và chậm', N'Daniel Kahneman', 110000, 135000, 6, N'Nghiên cứu đột phá về hai hệ thống tư duy của con người: tư duy nhanh (trực giác) và tư duy chậm (phân tích).', '/images/books/tu-duy-nhanh-va-cham.jpg', 35, '9786045886330', N'Nhà Xuất Bản Thế Giới', 584, 1, 0),
(N'Harry Potter và Hòn đá Phù thủy', N'J.K. Rowling', 95000, 120000, 1, N'Câu chuyện phiêu lưu kỳ thú về cậu bé phù thủy Harry Potter và những cuộc phiêu lưu tại trường Hogwarts.', '/images/books/harry-potter.jpg', 45, '9780545010221', N'Bloomsbury', 332, 1, 1),
(N'JavaScript: The Good Parts', N'Douglas Crockford', 130000, 160000, 4, N'Khám phá những phần tốt nhất của JavaScript - hướng dẫn chuyên sâu về ngôn ngữ lập trình phổ biến nhất thế giới web.', '/images/books/javascript-good-parts.jpg', 20, '9780596517748', N'OReilly Media', 176, 0, 0),
(N'Nghệ thuật giao tiếp', N'Leil Lowndes', 85000, 99000, 5, N'90 mẹo nhỏ để đạt được thành công trong giao tiếp và xây dựng mối quan hệ hiệu quả.', '/images/books/nghe-thuat-giao-tiep.jpg', 28, '9786045886347', N'Nhà Xuất Bản Tổng hợp', 256, 0, 1),
(N'Tâm lý học đám đông', N'Gustave Le Bon', 99000, 119000, 6, N'Phân tích sâu sắc về tâm lý và hành vi của đám đông - tác phẩm kinh điển trong ngành tâm lý học xã hội.', '/images/books/tam-ly-hoc-dam-dong.jpg', 22, '9786045886354', N'Nhà Xuất Bản Thế Giới', 312, 0, 0),
(N'Chiến tranh và Hòa bình', N'Leo Tolstoy', 145000, 175000, 7, N'Bộ tiểu thuyết sử thi vĩ đại về nước Nga thời Napoleon, khám phá số phận con người trong bối cảnh lịch sử biến động.', '/images/books/chien-tranh-va-hoa-binh.jpg', 18, '9780140447934', N'Penguin Classics', 1392, 1, 0),
(N'Harry Potter và Phòng chứa Bí mật', N'J.K. Rowling', 98000, 120000, 1, N'Cuộc phiêu lưu thứ hai của Harry Potter tại trường Hogwarts với những bí mật được hé lộ.', '/images/books/harry-potter-2.jpg', 38, '9780545010222', N'Bloomsbury', 352, 0, 1);
GO

-- Chèn dữ liệu orders
INSERT INTO orders (user_id, order_number, total_amount, status, shipping_address, shipping_fee, payment_method, payment_status, customer_note) VALUES
(2, 'ORD-2024-001', 275000, 'delivered', N'456 Đường Nguyễn Huệ, Quận 1, TP.HCM', 15000, 'cod', 'paid', N'Giao hàng giờ hành chính'),
(2, 'ORD-2024-002', 120000, 'confirmed', N'456 Đường Nguyễn Huệ, Quận 1, TP.HCM', 15000, 'credit_card', 'paid', N'Đóng gói cẩn thận'),
(3, 'ORD-2024-003', 295000, 'pending', N'789 Đường Pasteur, Quận 3, TP.HCM', 15000, 'paypal', 'pending', N'Gọi điện trước khi giao'),
(4, 'ORD-2024-004', 180000, 'shipped', N'321 Đường Cách Mạng Tháng 8, Quận 10, TP.HCM', 20000, 'bank_transfer', 'paid', '');
GO

-- Chèn dữ liệu order_items
INSERT INTO order_items (order_id, book_id, quantity, price, subtotal) VALUES
(1, 1, 1, 80000, 80000),
(1, 3, 1, 120000, 120000),
(1, 5, 1, 75000, 75000),
(2, 2, 1, 120000, 120000),
(3, 4, 1, 180000, 180000),
(3, 6, 1, 110000, 110000),
(4, 7, 1, 95000, 95000),
(4, 8, 1, 85000, 85000);
GO

-- Chèn dữ liệu reviews
INSERT INTO reviews (user_id, book_id, rating, title, comment, is_approved) VALUES
(2, 1, 5, N'Sách rất hay và ý nghĩa', N'Tôi rất thích thông điệp của cuốn sách này. Nó truyền cảm hứng mạnh mẽ về việc theo đuổi ước mơ.', 1),
(2, 3, 4, N'Truyện trinh thám hấp dẫn', N'Sherlock Holmes thực sự là một thám tử thiên tài. Truyện rất cuốn hút dù hơi dài.', 1),
(3, 4, 5, N'Must-read cho developer', N'Cuốn sách này đã thay đổi cách tôi viết code. Rất đáng để đọc và áp dụng.', 1),
(4, 7, 5, N'Phiêu lưu kỳ thú', N'Harry Potter thật tuyệt vời! Tôi không thể dừng đọc cho đến trang cuối cùng.', 1),
(3, 5, 4, N'Sách hay về giao tiếp', N'Nhiều bài học thực tế có thể áp dụng ngay trong công việc và cuộc sống.', 1);
GO

-- Chèn dữ liệu wishlists
INSERT INTO wishlists (user_id, book_id) VALUES
(2, 4),
(2, 6),
(3, 1),
(3, 2),
(4, 3),
(4, 5);
GO

-- Chèn dữ liệu carts
INSERT INTO carts (user_id, book_id, quantity) VALUES
(2, 2, 1),
(2, 8, 2),
(3, 1, 1),
(4, 7, 1);
GO

-- Cập nhật rating trung bình cho books
UPDATE books 
SET rating_avg = (
    SELECT AVG(CAST(rating AS DECIMAL(3,2))) 
    FROM reviews 
    WHERE reviews.book_id = books.id AND is_approved = 1
),
rating_count = (
    SELECT COUNT(*) 
    FROM reviews 
    WHERE reviews.book_id = books.id AND is_approved = 1
)
WHERE id IN (SELECT DISTINCT book_id FROM reviews);
GO

PRINT '✅ Sample data inserted successfully!';
PRINT '📊 Total categories: ' + CAST((SELECT COUNT(*) FROM categories) AS NVARCHAR);
PRINT '📚 Total books: ' + CAST((SELECT COUNT(*) FROM books) AS NVARCHAR);
PRINT '👥 Total users: ' + CAST((SELECT COUNT(*) FROM users) AS NVARCHAR);
PRINT '📦 Total orders: ' + CAST((SELECT COUNT(*) FROM orders) AS NVARCHAR);