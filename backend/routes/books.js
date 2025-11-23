const express = require("express");
const router = express.Router();
const bookController = require("../controllers/bookController");
const { authenticate, authorize } = require("../middleware/auth");

// Public routes
router.get("/", bookController.getAllBooks);
router.get("/search", bookController.searchBooks);
router.get("/featured", bookController.getFeaturedBooks);
router.get("/bestsellers", bookController.getBestsellers);
router.get("/:id", bookController.getBookById);
router.get("/:id/reviews", bookController.getBookReviews);

// Protected routes
router.post("/:id/reviews", authenticate, bookController.createReview);

// Admin only routes
router.post("/", authenticate, authorize(["admin"]), bookController.createBook);
router.put(
  "/:id",
  authenticate,
  authorize(["admin"]),
  bookController.updateBook
);
router.delete(
  "/:id",
  authenticate,
  authorize(["admin"]),
  bookController.deleteBook
);
router.patch(
  "/:id/stock",
  authenticate,
  authorize(["admin"]),
  bookController.updateStock
);

module.exports = router;
