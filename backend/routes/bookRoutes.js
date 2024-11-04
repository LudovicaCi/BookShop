const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');

// GET: Retrieve all books
router.get('/', bookController.getAllBooks);

// POST: Add a new book
router.post('/', bookController.createBook);

// PUT: Update an existing book by ID
router.put('/:id', bookController.updateBook);

// DELETE: Remove a book by ID
router.delete('/:id', bookController.deleteBook);

// GET: Search for books by title or author
router.get('/search', bookController.searchBooks);

// POST: Generate a book description using AI
router.post('/chat-ai', bookController.generateBookDescription);

module.exports = router;
