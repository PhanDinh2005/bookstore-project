const Book = require("../models/Book");
const Review = require("../models/Review");

const bookController = {
  // Lấy tất cả sách với phân trang và filter
  async getAllBooks(req, res) {
    try {
      const {
        page = 1,
        limit = 12,
        category_id,
        search,
        min_price,
        max_price,
        is_featured,
        is_bestseller,
        sortBy = "created_at",
        sortOrder = "DESC",
      } = req.query;

      const offset = (page - 1) * limit;

      const result = await Book.findAll({
        category_id,
        search,
        min_price,
        max_price,
        is_featured:
          is_featured !== undefined ? Boolean(is_featured) : undefined,
        is_bestseller:
          is_bestseller !== undefined ? Boolean(is_bestseller) : undefined,
        limit: parseInt(limit),
        offset: parseInt(offset),
        sortBy,
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

  // Tìm kiếm sách nâng cao
  async searchBooks(req, res) {
    try {
      const {
        q: query,
        category_id,
        min_price,
        max_price,
        min_rating,
        page = 1,
        limit = 12,
      } = req.query;

      const offset = (page - 1) * limit;

      const result = await Book.searchAdvanced({
        query,
        category_id,
        min_price,
        max_price,
        min_rating,
        limit: parseInt(limit),
        offset: parseInt(offset),
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
      console.error("Search books error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server khi tìm kiếm sách",
        error: error.message,
      });
    }
  },

  // Lấy sách nổi bật
  async getFeaturedBooks(req, res) {
    try {
      const { limit = 8 } = req.query;
      const books = await Book.getFeaturedBooks(parseInt(limit));

      res.json({
        success: true,
        data: books,
      });
    } catch (error) {
      console.error("Get featured books error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server khi lấy sách nổi bật",
        error: error.message,
      });
    }
  },

  // Lấy sách bán chạy
  async getBestsellers(req, res) {
    try {
      const { limit = 8 } = req.query;
      const books = await Book.getBestsellers(parseInt(limit));

      res.json({
        success: true,
        data: books,
      });
    } catch (error) {
      console.error("Get bestsellers error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server khi lấy sách bán chạy",
        error: error.message,
      });
    }
  },

  // Lấy chi tiết sách
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

  // Lấy reviews của sách
  async getBookReviews(req, res) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const book = await Book.findById(id);
      if (!book) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy sách",
        });
      }

      const reviews = await book.getReviews(parseInt(limit), parseInt(offset));

      res.json({
        success: true,
        data: reviews,
      });
    } catch (error) {
      console.error("Get book reviews error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server khi lấy reviews sách",
        error: error.message,
      });
    }
  },

  // Tạo review cho sách
  async createReview(req, res) {
    try {
      const { id } = req.params;
      const { rating, title, comment } = req.body;
      const userId = req.user.id;

      // Validation
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: "Rating phải từ 1 đến 5 sao",
        });
      }

      const book = await Book.findById(id);
      if (!book) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy sách",
        });
      }

      const reviewData = {
        user_id: userId,
        book_id: parseInt(id),
        rating: parseInt(rating),
        title: title || null,
        comment: comment || null,
      };

      const review = await Review.create(reviewData);

      // Cập nhật rating trung bình của sách
      await book.updateRating();

      res.status(201).json({
        success: true,
        message: "Đánh giá thành công",
        data: review,
      });
    } catch (error) {
      console.error("Create review error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server khi tạo review",
        error: error.message,
      });
    }
  },

  // Tạo sách mới (admin only)
  async createBook(req, res) {
    try {
      const {
        title,
        author,
        price,
        original_price,
        category_id,
        description,
        image_url,
        stock_quantity,
        isbn,
        publisher,
        published_date,
        pages,
        language,
        weight_kg,
        dimensions,
        is_featured,
        is_bestseller,
      } = req.body;

      // Validation
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
        original_price: original_price ? parseFloat(original_price) : null,
        category_id: category_id ? parseInt(category_id) : null,
        description: description || null,
        image_url: image_url || null,
        stock_quantity: stock_quantity ? parseInt(stock_quantity) : 0,
        isbn: isbn || null,
        publisher: publisher || null,
        published_date: published_date || null,
        pages: pages ? parseInt(pages) : null,
        language: language || null,
        weight_kg: weight_kg ? parseFloat(weight_kg) : null,
        dimensions: dimensions || null,
        is_featured: is_featured ? Boolean(is_featured) : false,
        is_bestseller: is_bestseller ? Boolean(is_bestseller) : false,
      };

      const book = await Book.create(bookData);

      res.status(201).json({
        success: true,
        message: "Tạo sách thành công",
        data: book,
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

  // Cập nhật sách (admin only)
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

      // Chuyển đổi kiểu dữ liệu
      if (updateData.price) updateData.price = parseFloat(updateData.price);
      if (updateData.original_price)
        updateData.original_price = parseFloat(updateData.original_price);
      if (updateData.category_id)
        updateData.category_id = parseInt(updateData.category_id);
      if (updateData.stock_quantity)
        updateData.stock_quantity = parseInt(updateData.stock_quantity);
      if (updateData.pages) updateData.pages = parseInt(updateData.pages);
      if (updateData.weight_kg)
        updateData.weight_kg = parseFloat(updateData.weight_kg);
      if (updateData.is_featured !== undefined)
        updateData.is_featured = Boolean(updateData.is_featured);
      if (updateData.is_bestseller !== undefined)
        updateData.is_bestseller = Boolean(updateData.is_bestseller);

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

  // Cập nhật stock (admin only)
  async updateStock(req, res) {
    try {
      const { id } = req.params;
      const { quantity } = req.body;

      if (quantity === undefined || quantity < 0) {
        return res.status(400).json({
          success: false,
          message: "Số lượng stock không hợp lệ",
        });
      }

      const book = await Book.findById(id);
      if (!book) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy sách",
        });
      }

      await Book.updateStock(id, parseInt(quantity));

      res.json({
        success: true,
        message: "Cập nhật stock thành công",
      });
    } catch (error) {
      console.error("Update stock error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server khi cập nhật stock",
        error: error.message,
      });
    }
  },

  // Xóa sách (admin only)
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
};

module.exports = bookController;
