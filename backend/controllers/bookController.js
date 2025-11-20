const Book = require("../models/Book");
const Category = require("../models/Category");

const bookController = {
  // Lấy danh sách tất cả sách với phân trang và filter
  async getAllBooks(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        category_id,
        search,
        sort = "newest",
      } = req.query;

      const offset = (page - 1) * limit;

      // Xử lý sort
      let sortField = "b.created_at";
      let sortOrder = "DESC";

      switch (sort) {
        case "price_asc":
          sortField = "b.price";
          sortOrder = "ASC";
          break;
        case "price_desc":
          sortField = "b.price";
          sortOrder = "DESC";
          break;
        case "title":
          sortField = "b.title";
          sortOrder = "ASC";
          break;
        default:
          sortField = "b.created_at";
          sortOrder = "DESC";
      }

      const result = await Book.findAll({
        category_id,
        search,
        limit: parseInt(limit),
        offset: parseInt(offset),
        sortField,
        sortOrder,
      });

      res.json({
        success: true,
        data: result.books,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(result.total / limit),
          totalItems: result.total,
          itemsPerPage: parseInt(limit),
        },
      });
    } catch (error) {
      console.error("Get all books error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server khi lấy danh sách sách",
        error: error.message,
      });
    }
  },

  // Lấy chi tiết một cuốn sách
  async getBookById(req, res) {
    try {
      const { id } = req.params;

      const book = await Book.findById(id);
      if (!book) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy sách",
        });
      }

      res.json({
        success: true,
        data: book,
      });
    } catch (error) {
      console.error("Get book by id error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server khi lấy thông tin sách",
        error: error.message,
      });
    }
  },

  // Tạo sách mới (Admin only)
  async createBook(req, res) {
    try {
      const {
        title,
        author,
        price,
        category_id,
        description,
        image_url,
        stock_quantity,
        isbn,
        publisher,
        published_date,
      } = req.body;

      // Validation cơ bản
      if (!title || !author || !price) {
        return res.status(400).json({
          success: false,
          message: "Tiêu đề, tác giả và giá là bắt buộc",
        });
      }

      const bookData = {
        title,
        author,
        price: parseFloat(price),
        category_id: category_id ? parseInt(category_id) : null,
        description: description || "",
        image_url: image_url || "/images/default-book.jpg",
        stock_quantity: stock_quantity ? parseInt(stock_quantity) : 0,
        isbn: isbn || "",
        publisher: publisher || "",
        published_date: published_date || null,
      };

      const newBook = await Book.create(bookData);

      res.status(201).json({
        success: true,
        message: "Tạo sách thành công",
        data: newBook,
      });
    } catch (error) {
      console.error("Create book error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server khi tạo sách",
        error: error.message,
      });
    }
  },

  // Cập nhật sách (Admin only)
  async updateBook(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const book = await Book.findById(id);
      if (!book) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy sách",
        });
      }

      // Chuyển đổi kiểu dữ liệu nếu có
      if (updateData.price) updateData.price = parseFloat(updateData.price);
      if (updateData.category_id)
        updateData.category_id = parseInt(updateData.category_id);
      if (updateData.stock_quantity)
        updateData.stock_quantity = parseInt(updateData.stock_quantity);

      const updatedBook = await book.update(updateData);

      res.json({
        success: true,
        message: "Cập nhật sách thành công",
        data: updatedBook,
      });
    } catch (error) {
      console.error("Update book error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server khi cập nhật sách",
        error: error.message,
      });
    }
  },

  // Xóa sách (Admin only)
  async deleteBook(req, res) {
    try {
      const { id } = req.params;

      const book = await Book.findById(id);
      if (!book) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy sách",
        });
      }

      await Book.delete(id);

      res.json({
        success: true,
        message: "Xóa sách thành công",
      });
    } catch (error) {
      console.error("Delete book error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server khi xóa sách",
        error: error.message,
      });
    }
  },

  // Tìm kiếm sách
  async searchBooks(req, res) {
    try {
      const {
        q,
        category_id,
        min_price,
        max_price,
        limit = 10,
        page = 1,
      } = req.query;

      const offset = (page - 1) * limit;

      let whereClause = "";
      const params = { limit: parseInt(limit), offset: parseInt(offset) };

      if (q) {
        whereClause +=
          " AND (b.title LIKE @search OR b.author LIKE @search OR b.description LIKE @search)";
        params.search = `%${q}%`;
      }

      if (category_id) {
        whereClause += " AND b.category_id = @category_id";
        params.category_id = parseInt(category_id);
      }

      if (min_price) {
        whereClause += " AND b.price >= @min_price";
        params.min_price = parseFloat(min_price);
      }

      if (max_price) {
        whereClause += " AND b.price <= @max_price";
        params.max_price = parseFloat(max_price);
      }

      const sql = `
        SELECT b.*, c.name as category_name 
        FROM books b 
        LEFT JOIN categories c ON b.category_id = c.id 
        WHERE 1=1 ${whereClause}
        ORDER BY b.created_at DESC 
        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
      `;

      const countSql = `
        SELECT COUNT(*) as total 
        FROM books b 
        WHERE 1=1 ${whereClause}
      `;

      const [books, countResult] = await Promise.all([
        require("../config/database").dbHelpers.query(sql, params),
        require("../config/database").dbHelpers.getOne(countSql, params),
      ]);

      res.json({
        success: true,
        data: books.map((book) => new Book(book)),
        pagination: {
          current: parseInt(page),
          total: Math.ceil(countResult.total / limit),
          totalItems: countResult.total,
          itemsPerPage: parseInt(limit),
        },
      });
    } catch (error) {
      console.error("Search books error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server khi tìm kiếm sách",
        error: error.message,
      });
    }
  },
};

module.exports = bookController;
