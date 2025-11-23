const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { authenticate, authorize } = require("../middleware/auth");

// Protected routes (user specific)
router.get("/my-orders", authenticate, orderController.getMyOrders);
router.get("/my-orders/:id", authenticate, orderController.getMyOrderById);
router.post("/", authenticate, orderController.createOrder);

// Admin only routes
router.get(
  "/",
  authenticate,
  authorize(["admin"]),
  orderController.getAllOrders
);
router.get(
  "/:id",
  authenticate,
  authorize(["admin"]),
  orderController.getOrderById
);
router.put(
  "/:id/status",
  authenticate,
  authorize(["admin"]),
  orderController.updateOrderStatus
);
router.put(
  "/:id/payment-status",
  authenticate,
  authorize(["admin"]),
  orderController.updatePaymentStatus
);
router.get(
  "/stats/revenue",
  authenticate,
  authorize(["admin"]),
  orderController.getRevenueStats
);

module.exports = router;
