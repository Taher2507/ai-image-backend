require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const dbConfig = require("./db/connect.js"); // Assuming you moved connect.js to config/db.js
const tasksController = require('./controller/tasksController.js'); // Assuming you've renamed the tasks controller
const { tokenAuthorization } = require('./middleware/auth.js'); // If token auth is middleware

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Connect to the database
dbConfig(); 

// Routes
const BASE_URL = process.env.BASE_URL || '/api'; // Default to '/api' if BASE_URL isn't set

// Authentication Routes
app.post(`${BASE_URL}signup`, tasksController.signUp);
app.post(`${BASE_URL}login`, tasksController.login);

// Image-related Routes
app.post(`${BASE_URL}post`, tokenAuthorization, tasksController.createImage);
app.post(`${BASE_URL}share`, tasksController.shareImage);
app.get(`${BASE_URL}get`, tasksController.getImage);

// Like-related Routes
app.patch(`${BASE_URL}:id`, tasksController.likeImage);
app.get(`${BASE_URL}get/:name`, tasksController.likedImages);

// Authorization Route
app.post(`${BASE_URL}Authorize`, (req, res) => {
    const Authtoken = req.headers["x-access-token"];

    jwt.verify(Authtoken, process.env.SECRET, (err, user) => {
        if (err) return res.status(400).json({ err: "Invalid token" });
        return res.status(200).json({ msg: 'Authorized' });
    });
});

// Base Route to check if the server is running
app.get(`${BASE_URL}/`, (req, res) => {
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
