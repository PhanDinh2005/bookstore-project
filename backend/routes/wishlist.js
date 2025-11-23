const express = require("express");
const router = express.Router();
const wishlistController = require("../controllers/wishlistController");
const { authenticate } = require("../middleware/auth");

// All routes require authentication
router.get("/", authenticate, wishlistController.getWishlist);
router.post("/add/:bookId", authenticate, wishlistController.addToWishlist);
router.delete(
  "/remove/:bookId",
  authenticate,
  wishlistController.removeFromWishlist
);
router.get("/check/:bookId", authenticate, wishlistController.checkInWishlist);

module.exports = router;
