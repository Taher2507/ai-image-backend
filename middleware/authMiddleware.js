const jwt = require('jsonwebtoken');
require('dotenv').config();

// Utility function for error handling
const handleError = (res, error, status = 400) => {
  console.error(error);
  return res.status(status).json({ error: error.message || error });
};

// Helper function to verify JWT token
const verifyToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.SECRET, (err, user) => {
      if (err) return reject(err);
      resolve(user);
    });
  });
};

// Middleware for token authorization
const tokenAuthorization = async (req, res, next) => {
  const token = req.headers["x-access-token"];
  if (!token) return handleError(res, "Token required", 403);

  try {
    const user = await verifyToken(token);
    req.body.user = user; // Attach user info to request
    next();
  } catch (err) {
    handleError(res, "Invalid Token", 401);
  }
};

// Middleware to check if the user is authorized
const authorize = (req, res, next) => {
  if (!req.body.user) {
    return handleError(res, "Unauthorized", 403);
  }
  next(); // Call next if authorized
};

module.exports = { tokenAuthorization, authorize };
