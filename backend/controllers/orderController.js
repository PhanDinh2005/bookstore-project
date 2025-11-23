const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const Cart = require("../models/Cart");
const Book = require("../models/Book");

const orderController = {
  // Tạo đơn hàng mới
  async createOrder(req, res) {
    try {
      const userId = req.user.id;
      const { shipping_address, payment_method, customer_note } = req.body;

      if (!shipping_address) {
        return res.status(400).json({
          success: false,
          message: "Địa chỉ giao hàng là bắt buộc",
        });
      }

      // Lấy giỏ hàng của user
      const cartItems = await Cart.getByUserId(userId);
      if (!cartItems || cartItems.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Giỏ hàng trống",
        });
      }

      // Tính tổng tiền và kiểm tra tồn kho
      let totalAmount = 0;
      const orderItems = [];

      for (const item of cartItems) {
        const book = await Book.findById(item.book_id);
        if (!book) {
          return res.status(400).json({
            success: false,
            message: `Sách "${item.title}" không tồn tại`,
          });
        }

        if (book.stock_quantity < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Sách "${item.title}" chỉ còn ${book.stock_quantity} sản phẩm`,
          });
        }

        const subtotal = item.price * item.quantity;
        totalAmount += subtotal;

        orderItems.push({
          book_id: item.book_id,
          quantity: item.quantity,
          price: item.price,
          subtotal: subtotal,
        });
      }

      // Thêm phí ship
      const shippingFee = 15000; // 15k VND
      totalAmount += shippingFee;

      // Tạo đơn hàng
      const orderData = {
        user_id: userId,
        total_amount: totalAmount,
        shipping_address: shipping_address,
        shipping_fee: shippingFee,
        payment_method: payment_method || "cod",
        customer_note: customer_note || null,
      };

      const order = await Order.create(orderData);

      // Thêm order items
      for (const item of orderItems) {
        await OrderItem.create({
          order_id: order.id,
          book_id: item.book_id,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.subtotal,
        });

        // Cập nhật số lượng tồn kho
        await Book.updateStock(item.book_id, item.quantity);
      }

      // Xóa giỏ hàng sau khi tạo đơn hàng
      await Cart.clearUserCart(userId);

      // Lấy thông tin đơn hàng đầy đủ
      const completeOrder = await Order.findById(order.id);

      res.status(201).json({
        success: true,
        message: "Tạo đơn hàng thành công",
        data: completeOrder,
      });
    } catch (error) {
      console.error("Create order error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server khi tạo đơn hàng",
        error: error.message,
      });
    }
  },

  // Lấy đơn hàng của user
  async getMyOrders(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 10, status } = req.query;
      const offset = (page - 1) * limit;

      const result = await Order.findByUserId(
        userId,
        parseInt(limit),
        parseInt(offset)
      );

      res.json({
        success: true,
        data: result,
        pagination: {
          current: parseInt(page),
          itemsPerPage: parseInt(limit),
        },
      });
    } catch (error) {
      console.error("Get my orders error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server khi lấy đơn hàng",
        error: error.message,
      });
    }
  },

  // Lấy chi tiết đơn hàng của user
  async getMyOrderById(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const order = await Order.findById(id);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy đơn hàng",
        });
      }

      // Kiểm tra user có quyền xem đơn hàng này không
      if (order.user_id !== userId) {
        return res.status(403).json({
          success: false,
          message: "Không có quyền truy cập đơn hàng này",
        });
      }

      res.json({
        success: true,
        data: order,
      });
    } catch (error) {
      console.error("Get my order error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server khi lấy chi tiết đơn hàng",
        error: error.message,
      });
    }
  },

  // Lấy tất cả đơn hàng (admin only)
  async getAllOrders(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        payment_status,
        start_date,
        end_date,
      } = req.query;
      const offset = (page - 1) * limit;

      const result = await Order.findAll({
        status,
        payment_status,
        start_date,
        end_date,
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      res.json({
        success: true,
        data: result.orders,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(result.total / limit),
          totalItems: result.total,
          itemsPerPage: parseInt(limit),
        },
      });
    } catch (error) {
      console.error("Get all orders error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server khi lấy danh sách đơn hàng",
        error: error.message,
      });
    }
  },

  // Lấy chi tiết đơn hàng (admin only)
  async getOrderById(req, res) {
    try {
      const { id } = req.params;

      const order = await Order.findById(id);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy đơn hàng",
        });
      }

      res.json({
        success: true,
        data: order,
      });
    } catch (error) {
      console.error("Get order error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server khi lấy chi tiết đơn hàng",
        error: error.message,
      });
    }
  },

  // Cập nhật trạng thái đơn hàng (admin only)
  async updateOrderStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, admin_note } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: "Trạng thái là bắt buộc",
        });
      }

      const order = await Order.findById(id);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy đơn hàng",
        });
      }

      const updatedOrder = await order.updateStatus(status, admin_note);

      res.json({
        success: true,
        message: "Cập nhật trạng thái đơn hàng thành công",
        data: updatedOrder,
      });
    } catch (error) {
      console.error("Update order status error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server khi cập nhật trạng thái đơn hàng",
        error: error.message,
      });
    }
  },

  // Cập nhật trạng thái thanh toán (admin only)
  async updatePaymentStatus(req, res) {
    try {
      const { id } = req.params;
      const { payment_status } = req.body;

      if (!payment_status) {
        return res.status(400).json({
          success: false,
          message: "Trạng thái thanh toán là bắt buộc",
        });
      }

      const order = await Order.findById(id);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy đơn hàng",
        });
      }

      const updatedOrder = await order.updatePaymentStatus(payment_status);

      res.json({
        success: true,
        message: "Cập nhật trạng thái thanh toán thành công",
        data: updatedOrder,
      });
    } catch (error) {
      console.error("Update payment status error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server khi cập nhật trạng thái thanh toán",
        error: error.message,
      });
    }
  },

  // Thống kê doanh thu (admin only)
  async getRevenueStats(req, res) {
    try {
      const { start_date, end_date } = req.query;

      const stats = await Order.getTotalRevenue(start_date, end_date);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error("Get revenue stats error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server khi lấy thống kê doanh thu",
        error: error.message,
      });
    }
  },
};

module.exports = orderController;
