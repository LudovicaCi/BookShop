const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config({ path: './backend/.env' });

const app = express();
app.use(cors());
app.use(express.json());

// Import book routes
const bookRoutes = require('./routes/bookRoutes');

// Set up book routes at /api/books
app.use('/api/books', bookRoutes);

// Connect to MongoDB and start the server
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("Connected to MongoDB"))
    .catch((error) => console.error("Connection error:", error));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
