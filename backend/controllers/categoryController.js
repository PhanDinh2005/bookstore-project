const Category = require("../models/Category");
const Book = require("../models/Book");

const categoryController = {
  // Lấy tất cả categories
  async getAllCategories(req, res) {
    try {
      const categories = await Category.findAll();

      // Lấy số lượng sách cho mỗi category
      const categoriesWithCount = await Promise.all(
        categories.map(async (category) => {
          const count = await category.getBookCount();
          return {
            ...category.toJSON(),
            book_count: count,
          };
        })
      );

      res.json({
        success: true,
        data: categoriesWithCount,
      });
    } catch (error) {
      console.error("Get all categories error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server khi lấy danh sách danh mục",
        error: error.message,
      });
    }
  },

  // Lấy chi tiết category
  async getCategoryById(req, res) {
    try {
      const { id } = req.params;

      const category = await Category.findById(id);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy danh mục",
        });
      }

      const bookCount = await category.getBookCount();

      res.json({
        success: true,
        data: {
          ...category.toJSON(),
          book_count: bookCount,
        },
      });
    } catch (error) {
      console.error("Get category by id error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server khi lấy thông tin danh mục",
        error: error.message,
      });
    }
  },

  // Tạo category mới (Admin only)
  async createCategory(req, res) {
    try {
      const { name, description } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: "Tên danh mục là bắt buộc",
        });
      }

      const categoryData = {
        name,
        description: description || "",
      };

      const newCategory = await Category.create(categoryData);

      res.status(201).json({
        success: true,
        message: "Tạo danh mục thành công",
        data: newCategory,
      });
    } catch (error) {
      console.error("Create category error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server khi tạo danh mục",
        error: error.message,
      });
    }
  },

  // Cập nhật category (Admin only)
  async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const { name, description } = req.body;

      const category = await Category.findById(id);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy danh mục",
        });
      }

      const updateData = {};
      if (name) updateData.name = name;
      if (description !== undefined) updateData.description = description;

      const updatedCategory = await category.update(updateData);

      res.json({
        success: true,
        message: "Cập nhật danh mục thành công",
        data: updatedCategory,
      });
    } catch (error) {
      console.error("Update category error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server khi cập nhật danh mục",
        error: error.message,
      });
    }
  },

  // Xóa category (Admin only)
  async deleteCategory(req, res) {
    try {
      const { id } = req.params;

      const category = await Category.findById(id);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy danh mục",
        });
      }

      // Kiểm tra xem category có sách không
      const bookCount = await category.getBookCount();
      if (bookCount > 0) {
        return res.status(400).json({
          success: false,
          message:
            "Không thể xóa danh mục đang có sách. Hãy chuyển các sách sang danh mục khác trước.",
        });
      }

      await Category.delete(id);

      res.json({
        success: true,
        message: "Xóa danh mục thành công",
      });
    } catch (error) {
      console.error("Delete category error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server khi xóa danh mục",
        error: error.message,
      });
    }
  },

  // Lấy sách theo category
  async getBooksByCategory(req, res) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const offset = (page - 1) * limit;

      const category = await Category.findById(id);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy danh mục",
        });
      }

      const result = await Book.findAll({
        category_id: parseInt(id),
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      res.json({
        success: true,
        data: {
          category: category.toJSON(),
          books: result.books,
          pagination: {
            current: parseInt(page),
            total: Math.ceil(result.total / limit),
            totalItems: result.total,
            itemsPerPage: parseInt(limit),
          },
        },
      });
    } catch (error) {
      console.error("Get books by category error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server khi lấy sách theo danh mục",
        error: error.message,
      });
    }
  },
};

module.exports = categoryController;
