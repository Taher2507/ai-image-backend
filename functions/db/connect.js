const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Get MongoDB URL from environment variables
const mongoURL = process.env.MONGODB_URL;

// Set Mongoose's strictQuery option
mongoose.set('strictQuery', true);

// Connect to MongoDB
mongoose.connect(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error.message);
  });

// Check for connection errors
const connection = mongoose.connection;
connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

// Successful connection
connection.once("open", () => {
  console.log("Successfully connected to MongoDB");
});

module.exports = mongoose;
