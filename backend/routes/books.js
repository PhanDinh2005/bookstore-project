const express = require('express');
const router = express.Router();
const { dbHelpers } = require('../config/database');

// GET /api/books - Lấy danh sách sách
router.get('/', async (req, res) => {
  try {
    const sql = `
      SELECT b.*, c.name as category_name 
      FROM books b 
      LEFT JOIN categories c ON b.category_id = c.id 
      ORDER BY b.created_at DESC
    `;
    
    const books = await dbHelpers.query(sql);
    
    res.json({
      success: true,
      data: books
    });
  } catch (error) {
    console.error('Get books error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách sách',
      error: error.message
    });
  }
});

// GET /api/books/search - Tìm kiếm sách
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.json({
        success: true,
        data: []
      });
    }

    const sql = `
      SELECT b.*, c.name as category_name 
      FROM books b 
      LEFT JOIN categories c ON b.category_id = c.id 
      WHERE b.title LIKE @search OR b.author LIKE @search OR b.description LIKE @search
    `;
    
    const books = await dbHelpers.query(sql, {
      search: `%${q}%`
    });

    res.json({
      success: true,
      data: books
    });
  } catch (error) {
    console.error('Search books error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi tìm kiếm sách',
      error: error.message
    });
  }
});

// GET /api/books/:id - Lấy chi tiết sách
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const sql = `
      SELECT b.*, c.name as category_name 
      FROM books b 
      LEFT JOIN categories c ON b.category_id = c.id 
      WHERE b.id = @id
    `;
    
    const book = await dbHelpers.getOne(sql, { id });

    if (book) {
      res.json({
        success: true,
        data: book
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy sách'
      });
    }
  } catch (error) {
    console.error('Get book error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thông tin sách',
      error: error.message
    });
  }
});

module.exports = router;