const { cloudinary, openai } = require('../config/cloudinaryOpenAIConfig');
const Image = require('../Models/Image');
const User = require('../Models/User');
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
      if (err) reject(err);
      else resolve(user);
    });
  });
};

// Create an image using OpenAI's API
const createImage = async (req, res) => {
  const { prompt, size = "512x512" } = req.body;
  try {
    const { data } = await openai.createImage({
      prompt,
      n: 1,
      size,
      response_format: "b64_json",
    });
    res.status(200).json({ photo: data.data[0].b64_json });
  } catch (error) {
    handleError(res, error);
  }
};

// Share an image and store it in the database
const shareImage = async (req, res) => {
  const { name, prompt, photo } = req.body;
  if (!name || !prompt || !photo) {
    return handleError(res, "Information Incomplete", 400);
  }

  try {
    const { url } = await cloudinary.uploader.upload(photo);
    const task = await Image.create({ name, prompt, photo: url });
    res.status(200).json({ userentry: task });
  } catch (error) {
    handleError(res, error);
  }
};

// Get all images from the database
const getImage = async (req, res) => {
  try {
    const posts = await Image.find();
    res.status(200).json({ posts });
  } catch (error) {
    handleError(res, error, 500);
  }
};

// Sign up a new user and issue a JWT token
const signUp = async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const user = await User.Signup(email, password, name);
    const token = jwt.sign({ email: user.email }, process.env.SECRET);
    res.status(200).json({ user, token });
  } catch (error) {
    handleError(res, error, 406);
  }
};

// Log in an existing user and issue a JWT token
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.Login(email, password);
    const token = jwt.sign({ email: user.email }, process.env.SECRET);
    res.status(200).json({ user, token });
  } catch (error) {
    handleError(res, error, 406);
  }
};

// Middleware for token authorization
const tokenAuthorization = async (req, res, next) => {
  const token = req.headers["x-access-token"];
  if (!token) return handleError(res, "Token required", 403);

  try {
    const user = await verifyToken(token);
    req.body.user = user;
    next();
  } catch (err) {
    handleError(res, "Invalid Token", 400);
  }
};

// Update image likes and update the user's liked images
const likeImage = async (req, res) => {
  try {
    const { likes, userName } = req.body;
    const imageId = req.params.id;

    // Update the image likes
    await Image.updateOne({ _id: imageId }, { Likes: likes });

    if (userName) {
      const user = await User.findOne({ name: userName });
      const updatedList = user.likedImages.includes(imageId)
        ? user.likedImages.filter((a) => a !== imageId)
        : [...user.likedImages, imageId];

      await User.updateOne({ name: userName }, { likedImages: updatedList });
      return res.status(200).json({ likes, updatedList });
    }

    res.status(200).json({ likes });
  } catch (error) {
    handleError(res, error);
  }
};

// Get liked images for a specific user
const likedImages = async (req, res) => {
  try {
    const user = await User.findOne({ name: req.params.name });
    if (!user) return handleError(res, "User not found", 404);
    res.status(200).json(user.likedImages);
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  createImage,
  shareImage,
  getImage,
  signUp,
  login,
  tokenAuthorization,
  likeImage,
  likedImages,
};
