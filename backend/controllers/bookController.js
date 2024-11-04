const Book = require('../models/bookModel');
const OpenAI = require('openai');
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

/* ==============
    CRUD QUERIES
   ==============  */

/**
 * Retrieve all books with pagination
 * @param {Object} req - The request object, containing query params `page` and `limit`
 * @param {Object} res - The response object
 */
const getAllBooks = async (req, res) => {
    const { page = 1, limit = 10 } = req.query; // Get page and limit from query parameters

    try {
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);

        const books = await Book.find()
            .limit(limitNum)
            .skip((pageNum - 1) * limitNum);

        const totalBooks = await Book.countDocuments();

        res.json({
            books,
            totalPages: Math.ceil(totalBooks / limitNum), // Calculate total pages
            currentPage: pageNum,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


/**
 * Add a new book to the collection
 * @param {Object} req - The request object, containing book data in the body
 * @param {Object} res - The response object
 */
const createBook = async (req, res) => {

    const existingBook = await Book.findOne({
        title: req.body.title,
        author: req.body.author
    });

    if (existingBook) {
        return res.status(409).json({ message: 'The book already exists in the database' });
    }

    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        year: req.body.year,
        publisher: req.body.publisher,
        price: req.body.price
    });

    try {
        const newBook = await book.save();
        res.status(201).json(newBook);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * Update an existing book by ID
 * @param {Object} req - The request object, containing book ID in params and updated data in body
 * @param {Object} res - The response object
 */
const updateBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ message: 'Book not found' });

        book.title = req.body.title;
        book.authors = req.body.authors;
        book.publication_date = req.body.publication_date;
        book.publisher = req.body.publisher;
        book.price = req.body.price;
        book.description = req.body.description;

        const updatedBook = await book.save();
        res.status(200).json(updatedBook);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * Remove a book by ID
 * @param {Object} req - The request object, containing book ID in params
 * @param {Object} res - The response object
 */
const deleteBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ message: 'Book not found' });

        await Book.findByIdAndDelete(req.params.id);

        res.json({ message: 'Book deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/* ===============
    OTHER QUERIES
   =============== */

/**
 * Search books by title or author with pagination
 * @param {Object} req - The request object, containing query params `page`, `limit`, and `search`
 * @param {Object} res - The response object
 */
const searchBooks = async (req, res) => {
    const {page = 1, limit = 10, search='' } = req.query; // Ottieni il parametro di ricerca, pagina e limite dalla query

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const searchTerm = String(search)

    try {
        if (!searchTerm) {
            return res.status(400).json({ message: "Please provide a search query" });
        }

        const searchCondition = {
            $or: [
                { title: { $regex: searchTerm, $options: "i" } },
                { authors: { $regex: searchTerm, $options: "i" } }
            ]
        };

        const books = await Book.find(searchCondition)
            .limit(limitNum)
            .skip((pageNum - 1) * limitNum);

        const totalBooks = await Book.countDocuments(searchCondition);

        res.json({
            books,
            totalPages: Math.ceil(totalBooks / limitNum),
            currentPage: pageNum,
            totalBooks,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Generate a book description using OpenAI
 * @param {Object} req - The request object, containing `input` text in the body
 * @param {Object} res - The response object
 */
const generateBookDescription = async (req, res) => {
    const { input } = req.body;

    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: 'You are a book shop assistant who generates book descriptions.' },
                { role: 'user', content: input }
            ],
            max_tokens: 100
        });

        const description = completion.choices[0].message.content;
        res.status(200).json({ description });
    } catch (error) {
        console.error("Error communicating with OpenAI:", error);
        res.status(500).json({ message: "Error generating description from AI." });
    }
};

module.exports = {
    getAllBooks,
    createBook,
    updateBook,
    deleteBook,
    searchBooks,
    generateBookDescription
};
