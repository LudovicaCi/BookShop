import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './BookTab.css'; // Import CSS for additional custom styling
import bookCover from '../book_cover.jpg';

const BookTab = () => {
    // Variables for managing the books data and pagination
    const [books, setBooks] = useState([]); // Array to store the list of books
    const [currentPage, setCurrentPage] = useState(1); // Track the current page number for pagination
    const [totalPages, setTotalPages] = useState(0); // Store the total number of pages
    const [searchTerm, setSearchTerm] = useState(''); // Store the user's search input
    const [newBook, setNewBook] = useState({ title: '', authors: '', publication_date: '', publisher: '', price: '', description: 'No description available.' }); // Variable of the new book
    const [showModal, setShowModal] = useState(false); // Variable to control the visibility of the modal
    const [successMessage, setSuccessMessage] = useState(''); // Variable to hold success messages
    const [errorMessage, setErrorMessage] = useState(''); // Variable to hold error messages
    const [bookToUpdate, setBookToUpdate] = useState(null); // Store the updated book
    const [activeModal, setActiveModal] = useState(null); // Track the type of modal to activate

    const booksPerPage = 12; // Number of books displayed per page

    // Function for getting books from the server with pagination
    const fetchBooks = async (page) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/books?page=${page}&limit=${booksPerPage}&search=${searchTerm}`);
            setBooks(response.data.books);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error('Error fetching books:', error);
        }
    };

    // Function for getting books from the server based on the user's input
    const searchBooks = async (page) => {
        try {
            // Chiamata per cercare libri in base al termine di ricerca
            const response = await axios.get(`http://localhost:5000/api/books/search?page=${page}&limit=${booksPerPage}&search=${searchTerm}`);
            setBooks(response.data.books);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error('Error searching books:', error);
        }
    };

    // Function for loading books when the page is loaded, the page changes, or a search is performed
    useEffect(() => {
        if (searchTerm !== '') {
            searchBooks(currentPage); // Se c'è un termine di ricerca, cerca i libri
        } else {
            fetchBooks(currentPage); // Altrimenti, carica tutti i libri
        }
    }, [currentPage, searchTerm]);

    // Function to navigate to the next page in the book list
    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(prevPage => prevPage + 1);
        }
    };

    // Function to navigate to the previous page in the book list
    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prevPage => prevPage - 1);
        }
    };

    // Function to delete a book by its ID
    const removeBook = async (bookId) => {
        try {
            const response = await axios.delete(`http://localhost:5000/api/books/${bookId}`);
            if (response.status === 200) {
                setBooks(books.filter(book => book._id !== bookId));
                fetchBooks(currentPage);
            }
        } catch (error) {
            console.error('Error deleting book:', error);
        }
    };

    // Function for search input changes
    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
        setCurrentPage(1);
    };

    // Function to add a new book to the list
    const handleAddBook = async (event) => {
        event.preventDefault();

        setShowModal(false);

        const formattedBook = {
            ...newBook,
            year: newBook.year.toString(),
            price: parseFloat(newBook.price).toFixed(2)
        };

        console.log("Book data to be sent:", formattedBook);

        try {
            const response = await axios.post(`http://localhost:5000/api/books`, formattedBook);
            if (response.status === 201) {
                console.log("Book successfully added:", response.data);
                setBooks([...books, response.data]);
                setShowModal(false);
                setNewBook({ title: '', authors: '', publication_date: '', price: '', publisher: '', description: 'No description available.' });
                fetchBooks(currentPage);
                setSuccessMessage('Book added successfully!'); // Mostra il messaggio di successo
                setTimeout(() => setSuccessMessage(''), 3000); // Nasconde il messaggio dopo 3 secondi
            }
        } catch (error) {
            console.error('Error adding book:', error);
            if (error.response.status === 409) {
                console.error('Book already exists');
                setErrorMessage('Book already exists.');
                setTimeout(() => setErrorMessage(''), 3000);
            } else {
                console.error('Error adding book:');
                setErrorMessage('Error adding book. Please try again!');
                setTimeout(() => setErrorMessage(''), 3000);
            }
        }
    };

    // Function for handling changes in the new book form inputs
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewBook({ ...newBook, [name]: value });
    };

    // Function to open the modal for adding a new book
    const handleAddBookModal = () => {
        setNewBook({ title: '', authors: '', publication_date: '', price: '', publisher: '', description: '' });
        setActiveModal('add');
        setShowModal(true);
    }

    // Function to open the modal for updating an existing book
    const handleUpdateBookModal = (book) => {
        setBookToUpdate(book);
        setNewBook({
            title: book.title || '',
            authors: book.authors || '',
            publication_date: book.publication_date || '',
            price: book.price || '',
            publisher: book.publisher || '',
            description: book.description || 'No description available.'
        });
        setActiveModal('add');
        setShowModal(true);
    };

    // Function to show details of a book in a modal
    const handleShowBookModal = (book) => {
        setBookToUpdate(book); // Puoi riutilizzare questo stato per il libro da mostrare
        setNewBook({
            title: book.title || '',
            authors: book.authors || '',
            publication_date: book.publication_date || '',
            price: book.price || '',
            publisher: book.publisher || '',
            description: book.description || 'No description available.'
        });
        setActiveModal('info');
        setShowModal(true); // Riapre il modal
    };

    // Function to update an existing book
    const handleUpdateBook = async (event) => {
        event.preventDefault(); // Previeni il comportamento di invio del modulo

        setShowModal(false);

        const formattedBook = {
            ...newBook,
            year: newBook.year ? newBook.year.toString() : '', // Assicura che year sia una stringa
            price: newBook.price ? parseFloat(newBook.price).toFixed(2) : '0.00', // Assicura che price sia valido
        };

        try {
            const response = await axios.put(`http://localhost:5000/api/books/${bookToUpdate._id}`, formattedBook);
            if (response.status === 200) {
                console.log("Book successfully updated:", response.data);
                setBooks((prevBooks) =>
                    prevBooks.map((book) => (book._id === bookToUpdate._id ? response.data : book))
                );
                setShowModal(false);
                setNewBook({ title: '', authors: '', publication_date: '', price: '', publisher: '', description: 'No description available.' });
                fetchBooks(currentPage);
                setSuccessMessage('Book updated successfully!'); // Mostra il messaggio di successo
                setTimeout(() => setSuccessMessage(''), 3000); // Nasconde il messaggio dopo 3 secondi
                setBookToUpdate(null); // Resetta il libro da aggiornare
            }
        } catch (error) {
            console.error('Error updating book:', error);
            if (error.response && error.response.status === 404) {
                setErrorMessage('Book already exists.');
            } else {
                setErrorMessage(error.response.data.message);
            }
            setTimeout(() => setErrorMessage(''), 3000);
        }
    };

    // Function for updating the description of a book
    const handleUpdateDescription = async () => {
        try {
            const updatedBook = { ...bookToUpdate, description: newBook.description }; // Aggiorna la descrizione
            const response = await axios.put(`http://localhost:5000/api/books/${updatedBook._id}`, updatedBook); // Aggiorna il libro nel DB
            if (response.status === 200) {
                console.log("Description successfully updated:", response.data);
                setBooks((prevBooks) =>
                    prevBooks.map((book) => (book._id === updatedBook._id ? response.data : book))
                );
                setShowModal(false); // Chiudi il modal
                setSuccessMessage('Description updated successfully!'); // Mostra messaggio di successo
                setTimeout(() => setSuccessMessage(''), 3000); // Nasconde il messaggio dopo 3 secondi
            }
        } catch (error) {
            console.error('Error updating description:', error);
            setErrorMessage('Error updating description. Please try again!'); // Mostra messaggio di errore
            setTimeout(() => setErrorMessage(''), 3000); // Nasconde il messaggio dopo 3 secondi
        }
    };

    // Function for generating a book description using AI
    const generateDescription = async () => {
        const input = `Write a description for a book titled "${newBook.title}" by ${newBook.authors}.`;

        try {
            const response = await axios.post('http://localhost:5000/api/books/chat-ai', { input });

            if (response.status === 200) {
                setNewBook({ ...newBook, description: response.data.description });
            }
        } catch (error) {
            console.error('Error generating description from AI:', error);
            setErrorMessage('Error generating description. Please try again!');
            setTimeout(() => setErrorMessage(''), 3000);
        }
    };


    return (
        <div className="container my-4">
            <h1 className="text-center mb-4">Book Shop</h1>

            {/* Display success message if it exists */}
            {successMessage && <div className="alert alert-success text-center">{successMessage}</div>}

            {/* Display error message if it exists */}
            {errorMessage && <div className="alert alert-danger text-center">{errorMessage}</div>}

            {/* Search bar and button for adding new books */}
            <div className="d-flex justify-content-between mb-4 align-items-center">
                <input
                    type="text"
                    className="form-control w-75 me-2"
                    placeholder="Search books by title or author"
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
                <button className="btn btn-success btn-lg" onClick={handleAddBookModal}>
                    <i className="bi bi-plus-circle me-1"></i> Add Book
                </button>
            </div>

            {/* Modal for adding or updating a book */}
            {showModal && activeModal === 'add' && (
                <div className="modal show d-block" tabIndex="-1" role="dialog">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{bookToUpdate ? 'Update Book' : 'Add New Book'}</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <form onSubmit={bookToUpdate ? handleUpdateBook : handleAddBook}>
                                    <input type="text" className="form-control my-2" placeholder="Title" name="title" value={newBook.title} onChange={handleInputChange} required />
                                    <input type="text" className="form-control my-2" placeholder="Author" name="author" value={newBook.authors} onChange={handleInputChange} required />
                                    <input type="date" className="form-control my-2" placeholder="Publication Date" name="year" value={newBook.publication_date} onChange={handleInputChange} required />
                                    <input type="number" step="0.01" className="form-control my-2" placeholder="Price" name="price" value={newBook.price} onChange={handleInputChange} required />
                                    <input type="text" className="form-control my-2" placeholder="Publisher" name="publisher" value={newBook.publisher} onChange={handleInputChange} required />
                                    <button type="submit" className="btn btn-primary w-100">{bookToUpdate ? 'Update Book' : 'Add Book'}</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal for displaying book information */}
            {showModal && activeModal === 'info' && (
                <div className="modal show d-block" tabIndex="-1" role="dialog">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Book Information</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="d-flex justify-content-center">
                                    <img src={bookCover}
                                         alt="Book Cover" className="img-fluid mb-3"/>
                                </div>
                                <h5>{bookToUpdate.title}</h5>
                                <p><strong>Author:</strong> {bookToUpdate.authors}</p>
                                <p><strong>Publication Date:</strong> {bookToUpdate.publication_date}</p>
                                <p><strong>Price:</strong> {bookToUpdate.price} $</p>
                                <p><strong>Publisher:</strong> {bookToUpdate.publisher}</p>
                                <p><strong>Description:</strong></p>
                                <textarea
                                    className="form-control"
                                    placeholder="Generated Description"
                                    name="description"
                                    value={newBook.description}
                                    onChange={(e) => setNewBook({...newBook, description: e.target.value})}
                                    rows="4"
                                />
                                {/* Pulsante per utilizzare il chatbot qui */}
                                <button className=" btn btn-secondary mt-3"
                                        onClick={generateDescription}>
                                    Use AI to Generate Description
                                </button>
                                <button type=" button" className=" btn btn-primary w-100"
                                        onClick={handleUpdateDescription}>
                                    Save Description
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Grid layout for displaying books */}
            <div className=" row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
                {books.map((book) => (
                    <div className=" col" key={book._id}>
                        <div className=" card h-100 shadow-sm border-0">
                            <img src={bookCover} alt=" Book Cover" className=" card-img-top book-cover" />
                            <div className=" card-body">
                                <h5 className=" card-title text-center text-dark">{book.title}</h5>
                                <p className=" card-text text-center text-muted">{book.authors}</p>
                                <p className=" card-text text-center fw-bold text-primary">{book.price} $</p>

                                {/* Pulsanti " Update" e " Remove" */}
                                <div className=" d-flex justify-content-between mt-3">
                                    <button
                                        onClick={() => handleShowBookModal(book)}
                                        className=" btn btn-info w-45 text-white"
                                    >
                                        <i className=" bi bi-eye me-1"></i> Show Book
                                    </button>
                                    <button
                                        onClick={() => handleUpdateBookModal(book)}
                                        className=" btn btn-warning w-45 text-white"
                                    >
                                        <i className=" bi bi-pencil-square me-1"></i> Update
                                    </button>
                                    <button
                                        onClick={() => removeBook(book._id)}
                                        className=" btn btn-danger w-45"
                                    >
                                        <i className=" bi bi-trash me-1"></i> Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination controls */}
            <div className=" d-flex justify-content-center align-items-center my-4">
                <button className=" btn btn-outline-primary mx-2" onClick={handlePreviousPage} disabled={currentPage === 1}>
                    <i className=" bi bi-arrow-left"></i> Previous
                </button>
                <span className=" mx-3"> Page {currentPage} of {totalPages} </span>
                <button className=" btn btn-outline-primary mx-2" onClick={handleNextPage} disabled={currentPage === totalPages}>
                    Next <i className=" bi bi-arrow-right"></i>
                </button>
            </div>
        </div>
    );
};

export default BookTab;
