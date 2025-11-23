const Cart = require("../models/Cart");
const Book = require("../models/Book");

const cartController = {
  // Lấy giỏ hàng của user
  async getCart(req, res) {
    try {
      const userId = req.user.id;
      const cart = await Cart.getByUserId(userId);

      res.json({
        success: true,
        data: cart,
        summary: {
          total_items: cart.reduce((sum, item) => sum + item.quantity, 0),
          total_amount: cart.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          ),
        },
      });
    } catch (error) {
      console.error("Get cart error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server khi lấy giỏ hàng",
        error: error.message,
      });
    }
  },

  // Thêm sách vào giỏ hàng
  async addToCart(req, res) {
    try {
      const userId = req.user.id;
      const { bookId, quantity = 1 } = req.body;

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

      // Kiểm tra số lượng tồn kho
      if (book.stock_quantity < quantity) {
        return res.status(400).json({
          success: false,
          message: `Số lượng tồn kho không đủ. Chỉ còn ${book.stock_quantity} sản phẩm`,
        });
      }

      // Thêm vào giỏ hàng
      const cartItem = await Cart.addItem(userId, bookId, parseInt(quantity));

      res.status(201).json({
        success: true,
        message: "Đã thêm vào giỏ hàng",
        data: cartItem,
      });
    } catch (error) {
      console.error("Add to cart error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server khi thêm vào giỏ hàng",
        error: error.message,
      });
    }
  },

  // Cập nhật số lượng trong giỏ hàng
  async updateCartItem(req, res) {
    try {
      const userId = req.user.id;
      const { bookId } = req.params;
      const { quantity } = req.body;

      if (!quantity || quantity < 1) {
        return res.status(400).json({
          success: false,
          message: "Số lượng phải lớn hơn 0",
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

      // Kiểm tra số lượng tồn kho
      if (book.stock_quantity < quantity) {
        return res.status(400).json({
          success: false,
          message: `Số lượng tồn kho không đủ. Chỉ còn ${book.stock_quantity} sản phẩm`,
        });
      }

      // Cập nhật giỏ hàng
      const updatedItem = await Cart.updateItem(
        userId,
        bookId,
        parseInt(quantity)
      );

      res.json({
        success: true,
        message: "Cập nhật giỏ hàng thành công",
        data: updatedItem,
      });
    } catch (error) {
      console.error("Update cart error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server khi cập nhật giỏ hàng",
        error: error.message,
      });
    }
  },

  // Xóa sách khỏi giỏ hàng
  async removeFromCart(req, res) {
    try {
      const userId = req.user.id;
      const { bookId } = req.params;

      await Cart.removeItem(userId, bookId);

      res.json({
        success: true,
        message: "Đã xóa khỏi giỏ hàng",
      });
    } catch (error) {
      console.error("Remove from cart error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server khi xóa khỏi giỏ hàng",
        error: error.message,
      });
    }
  },

  // Xóa toàn bộ giỏ hàng
  async clearCart(req, res) {
    try {
      const userId = req.user.id;
      await Cart.clearUserCart(userId);

      res.json({
        success: true,
        message: "Đã xóa toàn bộ giỏ hàng",
      });
    } catch (error) {
      console.error("Clear cart error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server khi xóa giỏ hàng",
        error: error.message,
      });
    }
  },

  // Lấy tổng số lượng trong giỏ hàng
  async getCartCount(req, res) {
    try {
      const userId = req.user.id;
      const count = await Cart.getCartCount(userId);

      res.json({
        success: true,
        data: { count },
      });
    } catch (error) {
      console.error("Get cart count error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server khi lấy số lượng giỏ hàng",
        error: error.message,
      });
    }
  },
};

module.exports = cartController;
