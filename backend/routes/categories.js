const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");

// Public routes
router.get("/", categoryController.getAllCategories);
router.get("/:id", categoryController.getCategoryById);
router.get("/:id/books", categoryController.getBooksByCategory);

// Admin routes (sẽ thêm middleware auth sau)
router.post("/", categoryController.createCategory);
router.put("/:id", categoryController.updateCategory);
router.delete("/:id", categoryController.deleteCategory);

module.exports = router;
