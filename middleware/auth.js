const jwt = require('jsonwebtoken');
require('dotenv').config();

// Utility function for error handling
const handleError = (res, error, status = 400) => {
    console.error(error);
    return res.status(status).json({ error: error.message || error });
};

// Middleware for token authorization
const tokenAuthorization = (req, res, next) => {
    const Authtoken = req.headers["x-access-token"];
    if (!Authtoken) return handleError(res, "Token required", 403);

    jwt.verify(Authtoken, process.env.SECRET, (err, user) => {
        if (err) return handleError(res, "Invalid Token", 400);
        req.body.user = user;
        next();
    });
};

// Export the middleware
module.exports = { tokenAuthorization };
