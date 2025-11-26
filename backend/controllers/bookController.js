const sql = require("mssql");

const bookController = {
  // --- PUBLIC ROUTES ---

  // 1. Lấy tất cả sách (Có phân trang & lọc danh mục)
  getAllBooks: async (req, res) => {
    try {
      const { page = 1, limit = 10, category } = req.query;
      const offset = (page - 1) * limit;
      const request = new sql.Request();

      let query = "SELECT * FROM Books";

      // Nếu có lọc theo danh mục
      if (category) {
        query += " WHERE category_id = @category";
        request.input("category", sql.Int, category);
      }

      query +=
        " ORDER BY id DESC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY";

      const result = await request
        .input("offset", sql.Int, offset)
        .input("limit", sql.Int, parseInt(limit))
        .query(query);

      // Đếm tổng số lượng để làm phân trang
      const countReq = new sql.Request();
      if (category) countReq.input("category", sql.Int, category);
      const countQuery = category
        ? "SELECT COUNT(*) as total FROM Books WHERE category_id = @category"
        : "SELECT COUNT(*) as total FROM Books";
      const countResult = await countReq.query(countQuery);

      res.json({
        success: true,
        data: result.recordset,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult.recordset[0].total,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Lỗi server" });
    }
  },

  // 2. Tìm kiếm sách
  searchBooks: async (req, res) => {
    try {
      const { q } = req.query; // ?q=Harry Potter
      if (!q)
        return res
          .status(400)
          .json({ success: false, message: "Nhập từ khóa tìm kiếm" });

      const request = new sql.Request();
      const result = await request
        .input("keyword", sql.NVarChar, `%${q}%`)
        .query(
          "SELECT * FROM Books WHERE title LIKE @keyword OR author LIKE @keyword"
        );

      res.json({ success: true, data: result.recordset });
    } catch (error) {
      res.status(500).json({ success: false, message: "Lỗi tìm kiếm" });
    }
  },

  // 3. Sách nổi bật (Lấy random hoặc sách mới nhất)
  getFeaturedBooks: async (req, res) => {
    try {
      const request = new sql.Request();
      // Lấy 8 cuốn sách ngẫu nhiên
      const result = await request.query(
        "SELECT TOP 8 * FROM Books ORDER BY NEWID()"
      );
      res.json({ success: true, data: result.recordset });
    } catch (error) {
      res.status(500).json({ success: false, message: "Lỗi server" });
    }
  },

  // 4. Sách bán chạy (Tạm thời lấy theo số lượng tồn kho ít nhất hoặc logic giả lập)
  getBestsellers: async (req, res) => {
    try {
      const request = new sql.Request();
      const result = await request.query(
        "SELECT TOP 5 * FROM Books ORDER BY price DESC"
      );
      res.json({ success: true, data: result.recordset });
    } catch (error) {
      res.status(500).json({ success: false, message: "Lỗi server" });
    }
  },

  // 5. Chi tiết sách
  getBookById: async (req, res) => {
    try {
      const { id } = req.params;
      const request = new sql.Request();
      const result = await request
        .input("id", sql.Int, id)
        .query("SELECT * FROM Books WHERE id = @id");

      if (result.recordset.length > 0) {
        res.json({ success: true, data: result.recordset[0] });
      } else {
        res
          .status(404)
          .json({ success: false, message: "Không tìm thấy sách" });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: "Lỗi server" });
    }
  },

  // 6. Lấy Reviews của sách
  getBookReviews: async (req, res) => {
    try {
      const { id } = req.params;
      const request = new sql.Request();
      // Cần join bảng Users để lấy tên người review
      const result = await request.input("bookId", sql.Int, id).query(`
                SELECT r.*, u.name as user_name, u.avatar_url 
                FROM Reviews r 
                JOIN Users u ON r.user_id = u.id 
                WHERE r.book_id = @bookId 
                ORDER BY r.created_at DESC
            `);
      res.json({ success: true, data: result.recordset });
    } catch (error) {
      // Nếu chưa có bảng Reviews thì trả về mảng rỗng để không crash
      res.json({ success: true, data: [] });
    }
  },

  // --- PROTECTED ROUTES ---

  // 7. Viết Review (Cần bảng Reviews)
  createReview: async (req, res) => {
    try {
      const { id } = req.params; // bookId
      const { rating, comment } = req.body;
      const userId = req.user.id;

      const request = new sql.Request();
      await request
        .input("userId", sql.Int, userId)
        .input("bookId", sql.Int, id)
        .input("rating", sql.Int, rating)
        .input("comment", sql.NVarChar, comment).query(`
                    INSERT INTO Reviews (user_id, book_id, rating, comment)
                    VALUES (@userId, @bookId, @rating, @comment)
                `);

      res.status(201).json({ success: true, message: "Đã gửi đánh giá" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Lỗi khi đánh giá" });
    }
  },

  // --- ADMIN ROUTES ---

  // 8. Tạo sách mới
  createBook: async (req, res) => {
    try {
      const {
        title,
        author,
        price,
        category_id,
        description,
        image_url,
        stock_quantity,
      } = req.body;
      const request = new sql.Request();

      await request
        .input("title", sql.NVarChar, title)
        .input("author", sql.NVarChar, author)
        .input("price", sql.Decimal(18, 2), price)
        .input("catId", sql.Int, category_id)
        .input("desc", sql.NVarChar, description)
        .input("img", sql.NVarChar, image_url)
        .input("stock", sql.Int, stock_quantity || 0).query(`
                    INSERT INTO Books (title, author, price, category_id, description, image_url, stock_quantity)
                    VALUES (@title, @author, @price, @catId, @desc, @img, @stock)
                `);

      res.status(201).json({ success: true, message: "Thêm sách thành công" });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi thêm sách",
        error: error.message,
      });
    }
  },

  // 9. Cập nhật sách
  updateBook: async (req, res) => {
    try {
      const { id } = req.params;
      const { title, author, price, description, stock_quantity } = req.body;
      const request = new sql.Request();

      await request
        .input("id", sql.Int, id)
        .input("title", sql.NVarChar, title)
        .input("author", sql.NVarChar, author)
        .input("price", sql.Decimal(18, 2), price)
        .input("desc", sql.NVarChar, description)
        .input("stock", sql.Int, stock_quantity).query(`
                    UPDATE Books 
                    SET title=@title, author=@author, price=@price, description=@desc, stock_quantity=@stock
                    WHERE id=@id
                `);

      res.json({ success: true, message: "Cập nhật thành công" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Lỗi cập nhật" });
    }
  },

  // 10. Xóa sách
  deleteBook: async (req, res) => {
    try {
      const { id } = req.params;
      const request = new sql.Request();
      await request
        .input("id", sql.Int, id)
        .query("DELETE FROM Books WHERE id = @id");
      res.json({ success: true, message: "Đã xóa sách" });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi xóa sách (Có thể sách đang có trong đơn hàng)",
      });
    }
  },

  // 11. Cập nhật kho nhanh (Patch)
  updateStock: async (req, res) => {
    try {
      const { id } = req.params;
      const { stock } = req.body;
      const request = new sql.Request();
      await request
        .input("id", sql.Int, id)
        .input("stock", sql.Int, stock)
        .query("UPDATE Books SET stock_quantity = @stock WHERE id = @id");
      res.json({ success: true, message: "Đã cập nhật kho" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Lỗi cập nhật kho" });
    }
  },
};

module.exports = bookController;
