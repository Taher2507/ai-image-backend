const express = require('express');
const router = express.Router();
const imageController = require('../controller/imageController');
const { tokenAuthorization, authorize } = require('../middleware/authMiddleware'); // Import both middlewares

// Image Routes
router.post('/create', tokenAuthorization, authorize, imageController.createImage); // Ensure user is authorized
router.post('/share', tokenAuthorization, authorize, imageController.shareImage);   // Ensure user is authorized
router.get('/get', imageController.getImage); // Assuming this does not require authorization
router.patch('/like/:id', tokenAuthorization, authorize, imageController.likeImage); // Ensure user is authorized
router.get('/liked/:name', tokenAuthorization, authorize, imageController.likedImages); // Ensure user is authorized























































module.exports = router;
