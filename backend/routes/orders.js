const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { authenticate } = require("../middleware/auth");

// Tất cả các route đơn hàng đều bắt buộc phải đăng nhập
router.post("/", authenticate, orderController.createOrder); // Tạo đơn
router.get("/my-orders", authenticate, orderController.getMyOrders); // Xem lịch sử

module.exports = router;
