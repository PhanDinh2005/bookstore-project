const express = require('express');
const router = express.Router();
const { dbHelpers } = require('../config/database');

// GET /api/books - Phân trang, tìm kiếm, lọc danh mục
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      category = '',
      sortBy = 'id',
      sortOrder = 'ASC'
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Xây dựng WHERE clause
    let whereConditions = [];
    let params = {};

    if (search) {
      whereConditions.push('(b.title LIKE @search OR b.author LIKE @search)');
      params.search = `%${search}%`;
    }

    if (category) {
      whereConditions.push('b.category_id = @category');
      params.category = category;
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(' AND ')}` 
      : '';

    // Query lấy tổng số bản ghi
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM books b
      ${whereClause}
    `;
    const countResult = await dbHelpers.query(countQuery, params);
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limitNum);

    // Query lấy dữ liệu phân trang
    const booksQuery = `
      SELECT 
        b.*,
        c.name as category_name
      FROM books b
      LEFT JOIN categories c ON b.category_id = c.id
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder}
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY
    `;

    params.offset = offset;
    params.limit = limitNum;

    const books = await dbHelpers.query(booksQuery, params);

    res.json({
      success: true,
      data: books,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: total,
        itemsPerPage: limitNum,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1
      }
    });
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
});

// GET /api/books/:id - Lấy chi tiết sách
router.get('/:id', async (req, res) => {
  try {
    const book = await dbHelpers.getOne(
      `SELECT 
        b.*,
        c.name as category_name
       FROM books b
       LEFT JOIN categories c ON b.category_id = c.id
       WHERE b.id = @id`,
      { id: req.params.id }
    );

    if (book) {
      res.json({
        success: true,
        data: book
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Book not found'
      });
    }
  } catch (error) {
    console.error('Error fetching book:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// POST /api/books - Tạo sách mới (chỉ admin)
router.post('/', async (req, res) => {
  try {
    // TODO: Thêm middleware xác thực admin
    const {
      title,
      author,
      price,
      category_id,
      description,
      image_url,
      stock_quantity,
      isbn,
      publisher,
      published_date
    } = req.body;

    // Validation cơ bản
    if (!title || !author || !price) {
      return res.status(400).json({
        success: false,
        error: 'Title, author and price are required'
      });
    }

    const insertQuery = `
      INSERT INTO books (
        title, author, price, category_id, description, 
        image_url, stock_quantity, isbn, publisher, published_date
      ) 
      OUTPUT INSERTED.*
      VALUES (
        @title, @author, @price, @category_id, @description,
        @image_url, @stock_quantity, @isbn, @publisher, @published_date
      )
    `;

    const newBook = await dbHelpers.query(insertQuery, {
      title,
      author,
      price: parseFloat(price),
      category_id: category_id || null,
      description: description || '',
      image_url: image_url || '',
      stock_quantity: stock_quantity || 0,
      isbn: isbn || '',
      publisher: publisher || '',
      published_date: published_date || null
    });

    res.status(201).json({
      success: true,
      data: newBook[0],
      message: 'Book created successfully'
    });
  } catch (error) {
    console.error('Error creating book:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// PUT /api/books/:id - Cập nhật sách (chỉ admin)
router.put('/:id', async (req, res) => {
  try {
    // TODO: Thêm middleware xác thực admin
    const {
      title,
      author,
      price,
      category_id,
      description,
      image_url,
      stock_quantity,
      isbn,
      publisher,
      published_date
    } = req.body;

    // Kiểm tra sách tồn tại
    const existingBook = await dbHelpers.getOne(
      'SELECT id FROM books WHERE id = @id',
      { id: req.params.id }
    );

    if (!existingBook) {
      return res.status(404).json({
        success: false,
        error: 'Book not found'
      });
    }

    const updateQuery = `
      UPDATE books 
      SET 
        title = @title,
        author = @author,
        price = @price,
        category_id = @category_id,
        description = @description,
        image_url = @image_url,
        stock_quantity = @stock_quantity,
        isbn = @isbn,
        publisher = @publisher,
        published_date = @published_date,
        updated_at = GETDATE()
      OUTPUT INSERTED.*
      WHERE id = @id
    `;

    const updatedBook = await dbHelpers.query(updateQuery, {
      id: req.params.id,
      title,
      author,
      price: parseFloat(price),
      category_id: category_id || null,
      description: description || '',
      image_url: image_url || '',
      stock_quantity: stock_quantity || 0,
      isbn: isbn || '',
      publisher: publisher || '',
      published_date: published_date || null
    });

    res.json({
      success: true,
      data: updatedBook[0],
      message: 'Book updated successfully'
    });
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// DELETE /api/books/:id - Xóa sách (chỉ admin)
router.delete('/:id', async (req, res) => {
  try {
    // TODO: Thêm middleware xác thực admin
    
    // Kiểm tra sách tồn tại
    const existingBook = await dbHelpers.getOne(
      'SELECT id FROM books WHERE id = @id',
      { id: req.params.id }
    );

    if (!existingBook) {
      return res.status(404).json({
        success: false,
        error: 'Book not found'
      });
    }

    const deleteQuery = 'DELETE FROM books WHERE id = @id';
    await dbHelpers.query(deleteQuery, { id: req.params.id });

    res.json({
      success: true,
      message: 'Book deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;