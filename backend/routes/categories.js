const express = require('express');
const router = express.Router();
const { dbHelpers } = require('../config/database');

// GET /api/categories - Lấy danh sách danh mục
router.get('/', async (req, res) => {
  try {
    const categories = await dbHelpers.query(`
      SELECT 
        c.*,
        COUNT(b.id) as book_count
      FROM categories c
      LEFT JOIN books b ON c.id = b.category_id
      GROUP BY c.id, c.name, c.description, c.created_at
      ORDER BY c.name
    `);

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;