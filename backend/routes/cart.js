const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const { authenticate } = require("../middleware/auth");

// All routes require authentication
router.get("/", authenticate, cartController.getCart);
router.post("/add", authenticate, cartController.addToCart);
router.put("/update/:bookId", authenticate, cartController.updateCartItem);
router.delete("/remove/:bookId", authenticate, cartController.removeFromCart);
router.delete("/clear", authenticate, cartController.clearCart);

module.exports = router;
