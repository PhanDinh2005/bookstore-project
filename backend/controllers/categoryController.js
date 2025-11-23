const Category = require("../models/Category");

const categoryController = {
  // Lấy tất cả categories
  async getAllCategories(req, res) {
    try {
      const categories = await Category.findAll();

      res.json({
        success: true,
        data: categories,
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

  // Lấy categories phổ biến
  async getPopularCategories(req, res) {
    try {
      const { limit = 6 } = req.query;
      const categories = await Category.findPopular(parseInt(limit));

      res.json({
        success: true,
        data: categories,
      });
    } catch (error) {
      console.error("Get popular categories error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi server khi lấy danh mục phổ biến",
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

      res.json({
        success: true,
        data: category,
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

  // Lấy sách theo category
  async getBooksByCategory(req, res) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 12 } = req.query;
      const offset = (page - 1) * limit;

      const category = await Category.findById(id);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy danh mục",
        });
      }

      const result = await category.getBooks(parseInt(limit), parseInt(offset));

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

  // Tạo category mới (admin only)
  async createCategory(req, res) {
    try {
      const { name, description, image_url } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: "Tên danh mục là bắt buộc",
        });
      }

      const categoryData = {
        name,
        description: description || null,
        image_url: image_url || null,
      };

      const category = await Category.create(categoryData);

      res.status(201).json({
        success: true,
        message: "Tạo danh mục thành công",
        data: category,
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

  // Cập nhật category (admin only)
  async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const { name, description, image_url } = req.body;

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
      if (image_url !== undefined) updateData.image_url = image_url;

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

  // Xóa category (admin only)
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

      await Category.delete(id);

      res.json({
        success: true,
        message: "Xóa danh mục thành công",
      });
    } catch (error) {
      console.error("Delete category error:", error);
      if (error.message.includes("Không thể xóa danh mục đang có sách")) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: "Lỗi server khi xóa danh mục",
        error: error.message,
      });
    }
  },
};

module.exports = categoryController;
