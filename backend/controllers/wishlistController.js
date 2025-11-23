const Wishlist = require("../models/Wishlist");
const Book = require("../models/Book");

const wishlistController = {
  // Lấy wishlist của user
  async getWishlist(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 12 } = req.query;
      const offset = (page - 1) * limit;

      const result = await Wishlist.getByUserId(
        userId,
        parseInt(limit),
        parseInt(offset)
      );

      res.json({
        success: true,
        data: result.items,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(result.total / limit),
          totalItems: result.total,
          itemsPerPage: parseInt(limit),
        },
      });
    } catch (error) {
      console.error("Get wishlist error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server khi lấy wishlist",
        error: error.message,
      });
    }
  },

  // Thêm sách vào wishlist
  async addToWishlist(req, res) {
    try {
      const userId = req.user.id;
      const { bookId } = req.params;

      if (!bookId) {
        return res.status(400).json({
          success: false,
          message: "Book ID là bắt buộc",
        });
      }

      // Kiểm tra sách tồn tại
      const book = await Book.findById(bookId);
      if (!book) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy sách",
        });
      }

      // Kiểm tra đã có trong wishlist chưa
      const existingItem = await Wishlist.checkItem(userId, bookId);
      if (existingItem) {
        return res.status(400).json({
          success: false,
          message: "Sách đã có trong wishlist",
        });
      }

      // Thêm vào wishlist
      const wishlistItem = await Wishlist.addItem(userId, bookId);

      res.status(201).json({
        success: true,
        message: "Đã thêm vào wishlist",
        data: wishlistItem,
      });
    } catch (error) {
      console.error("Add to wishlist error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server khi thêm vào wishlist",
        error: error.message,
      });
    }
  },

  // Xóa sách khỏi wishlist
  async removeFromWishlist(req, res) {
    try {
      const userId = req.user.id;
      const { bookId } = req.params;

      await Wishlist.removeItem(userId, bookId);

      res.json({
        success: true,
        message: "Đã xóa khỏi wishlist",
      });
    } catch (error) {
      console.error("Remove from wishlist error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server khi xóa khỏi wishlist",
        error: error.message,
      });
    }
  },

  // Kiểm tra sách có trong wishlist không
  async checkInWishlist(req, res) {
    try {
      const userId = req.user.id;
      const { bookId } = req.params;

      const exists = await Wishlist.checkItem(userId, bookId);

      res.json({
        success: true,
        data: { inWishlist: exists },
      });
    } catch (error) {
      console.error("Check wishlist error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server khi kiểm tra wishlist",
        error: error.message,
      });
    }
  },
};

module.exports = wishlistController;
