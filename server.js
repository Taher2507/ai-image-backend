require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dbConfig = require("./db/connect.js");

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Connect to the database
dbConfig(); 

// Routes
const BASE_URL = process.env.BASE_URL; // Default to '/api' if BASE_URL isn't set

// Import Routes
const userRoutes = require('./routes/userRoutes');
const imageRoutes = require('./routes/imageRoutes');

// Use Routes
app.use(`${BASE_URL}users`, userRoutes); // For user-related routes
app.use(`${BASE_URL}images`, imageRoutes); // For image-related routes

// Base Route to check if the server is running
app.get(`${BASE_URL}`, (req, res) => {
    res.send("Server is Running...");
});

// Handle unknown routes
app.use((req, res) => {
    res.status(404).send("Route not found");
});

// For Render (binding to a port)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
