const express = require('express');
const router = express.Router();
const { dbHelpers } = require('../config/database');

// GET /api/books - Lấy danh sách sách
router.get('/', async (req, res) => {
  try {
    const books = await dbHelpers.query('SELECT * FROM books');
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/books/:id - Lấy chi tiết sách
router.get('/:id', async (req, res) => {
  try {
    const book = await dbHelpers.getOne('SELECT * FROM books WHERE id = @id', {
      id: req.params.id
    });
    
    if (book) {
      res.json(book);
    } else {
      res.status(404).json({ error: 'Book not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;