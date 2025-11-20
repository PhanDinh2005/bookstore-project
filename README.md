# lệnh chạy sever
    cd backend
    npm run dev
# Bookstore Project
http://localhost:5000/
http://localhost:5000/api/books
http://localhost:5000/health    
# Tất cả sách
curl "http://localhost:5000/api/books"

# Phân trang
curl "http://localhost:5000/api/books?page=2&limit=5"

# Tìm kiếm
curl "http://localhost:5000/api/books?search=harry"

# Lọc danh mục
curl "http://localhost:5000/api/books?category=1"

# Kết hợp
curl "http://localhost:5000/api/books?page=1&limit=10&search=harry&category=1"
# GET /api/books/:id
curl "http://localhost:5000/api/books/1"
# POST /api/books (Tạo sách mới)
curl -X POST "http://localhost:5000/api/books" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Sách mới",
    "author": "Tác giả mới",
    "price": 99000,
    "category_id": 1,
    "description": "Mô tả sách mới",
    "stock_quantity": 50
  }'
#  PUT /api/books/:id (Cập nhật sách)
    curl -X PUT "http://localhost:5000/api/books/1" \
    -H "Content-Type: application/json" \
    -d '{
        "title": "Sách đã cập nhật",
        "price": 120000
    }'
# DELETE /api/books/:id
    bash
    curl -X DELETE "http://localhost:5000/api/books/1"
# GET /api/categories
    bash
    curl "http://localhost:5000/api/categories"