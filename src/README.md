Thêm module books
book.types.ts: định nghĩa kiểu dữ liệu Book, cấu trúc payload khi tạo/cập nhật sách.
book.repository.ts: tạm thời dùng một mảng trong bộ nhớ để lưu dữ liệu, có seed sẵn 2 cuốn sách mẫu và các hàm CRUD (find, create, update, delete).
book.service.ts: lớp trung gian gọi repository. Đây là nơi sau này mình có thể thay repository bằng database thực mà không đổi controller.
book.controller.ts: xử lý request/response Express, include validate payload (đảm bảo title/author có, price/stock hợp lệ, các trường optional xử lý null).
Định tuyến
book.routes.ts: khai báo các endpoint REST /api/books (GET, POST, PUT, DELETE).
routes/index.ts: gắn router /books vào /api.
Tài liệu API
docs/API_DOCUMENTATION.md: mô tả các endpoint mới, cấu trúc response.
Kiểm tra
npm run build và npm run lint đảm bảo TypeScript không báo lỗi.