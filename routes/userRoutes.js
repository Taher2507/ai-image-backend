const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const { tokenAuthorization, authorize } = require('../middleware/authMiddleware'); // Import the middlewares

// User Routes
router.post('/signup', userController.signUp);
router.post('/login', userController.login);
router.post('/authorize', tokenAuthorization, authorize, (req, res) => {
    res.status(200).json({ msg: 'Authorized' });
});

module.exports = router;
