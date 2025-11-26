const Cart = require("../models/Cart");
const Book = require("../models/Book");

const cartController = {
  // Lấy giỏ hàng
  async getCart(req, res) {
    try {
      const userId = req.user.id;
      const cart = await Cart.getByUserId(userId);

      // Tính toán tổng tiền
      const summary = {
        total_items: cart.reduce((sum, item) => sum + item.quantity, 0),
        total_amount: cart.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        ),
      };

      res.json({ success: true, data: cart, summary });
    } catch (error) {
      console.error("Get cart error:", error);
      res.status(500).json({ success: false, message: "Lỗi server" });
    }
  },

  // Thêm vào giỏ
  async addToCart(req, res) {
    try {
      const userId = req.user.id;
      let { bookId, quantity = 1 } = req.body;

      if (!bookId)
        return res
          .status(400)
          .json({ success: false, message: "Thiếu ID sách" });

      // Ép kiểu số (Quan trọng)
      bookId = parseInt(bookId);
      quantity = parseInt(quantity);

      // Kiểm tra sách
      const book = await Book.findById(bookId);
      if (!book)
        return res
          .status(404)
          .json({ success: false, message: "Sách không tồn tại" });

      if (book.stock_quantity < quantity) {
        return res
          .status(400)
          .json({ success: false, message: "Kho không đủ hàng" });
      }

      const item = await Cart.addItem(userId, bookId, quantity);
      res
        .status(201)
        .json({ success: true, message: "Đã thêm vào giỏ", data: item });
    } catch (error) {
      console.error("Add cart error:", error);
      res.status(500).json({ success: false, message: "Lỗi thêm giỏ hàng" });
    }
  },

  // Cập nhật số lượng
  async updateCartItem(req, res) {
    try {
      const userId = req.user.id;
      const { bookId } = req.params; // Lấy từ URL
      const { quantity } = req.body;

      // Ép kiểu số (Quan trọng)
      const bookIdInt = parseInt(bookId);
      const qtyInt = parseInt(quantity);

      if (qtyInt < 1)
        return res
          .status(400)
          .json({ success: false, message: "Số lượng phải >= 1" });

      console.log(`UPDATE: User ${userId} - Book ${bookIdInt} - Qty ${qtyInt}`);

      await Cart.updateItem(userId, bookIdInt, qtyInt);

      res.json({ success: true, message: "Cập nhật thành công" });
    } catch (error) {
      console.error("Update cart error:", error);
      res.status(500).json({ success: false, message: "Lỗi cập nhật" });
    }
  },

  // Xóa 1 món
  async removeFromCart(req, res) {
    try {
      const userId = req.user.id;
      const { bookId } = req.params;

      await Cart.removeItem(userId, parseInt(bookId));

      res.json({ success: true, message: "Đã xóa sản phẩm" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Lỗi xóa sản phẩm" });
    }
  },

  // Xóa hết
  async clearCart(req, res) {
    try {
      await Cart.clearUserCart(req.user.id);
      res.json({ success: true, message: "Giỏ hàng đã được làm trống" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Lỗi dọn giỏ hàng" });
    }
  },
};

module.exports = cartController;
