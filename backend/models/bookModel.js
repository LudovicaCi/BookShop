// Import mongoose for MongoDB interactions
const mongoose = require('mongoose');

// Define the book schema
const bookSchema = new mongoose.Schema({
    title: { type: String, required: [true, 'Title is required'] },
    authors: { type: String, required: [true, 'Author is required'] },
    publication_date: { type: String, required: [true, 'Year is required'] },
    publisher: { type: String, required: [true, 'Publisher is required'] },
    price: { type: String, required: [true, 'Price is required'] },
    description: { type: String, default: '' }
});

// Create the model
const Book = mongoose.model('Book', bookSchema);

// Export the model
module.exports = Book;
