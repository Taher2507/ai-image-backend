require('dotenv').config();
const express = require('express');
const {
    createImage,
    shareImage,
    getImage,
    signUp,
    login,
    tokenAuthorization,
    likeImage,
    likedImages
} = require('./functions/controller/tasks.js');
const dbConfig = require("./functions/db/connect.js");
const cors = require('cors');
const app = express();
const jwt = require('jsonwebtoken');

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Connecting to the database
dbConfig(); // Ensure DB connection logic is implemented

const BASE_URL = require("./config/index.js");

app.post(`${BASE_URL}/signup`, signUp);
app.post(`${BASE_URL}/login`, login);
app.post(`${BASE_URL}/post`, tokenAuthorization, createImage);
app.post(`${BASE_URL}/share`, shareImage);
app.get(`${BASE_URL}/get`, getImage);
app.patch(`${BASE_URL}/:id`, likeImage);
app.get(`${BASE_URL}/get/:name`, likedImages);
app.post(`${BASE_URL}/Authorize`, (req, res) => {
    const Authtoken = req.headers["x-access-token"];

    jwt.verify(Authtoken, process.env.SECRET, (err, user) => {
        if (err) return res.status(400).json({ err: "Invalid token" });
        return res.status(200).json({ msg: 'Authorized' });
    });
});
app.get(`${BASE_URL}/`, (req, res) => {
    res.send("Server is Running...");
});

// For Render (binding to a port)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
