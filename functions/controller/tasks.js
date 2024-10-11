const { Configuration, OpenAIApi } = require("openai");
const cloudinary = require('cloudinary').v2;
const Image = require('../Models/Image');
const User = require('../Models/User');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Cloudinary Configuration 
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// OPENAI Configuration
const openai = new OpenAIApi(new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
}));

// Utility function for error handling
const handleError = (res, error, status = 400) => {
  return res.status(status).json({ error: error.message || error });
};

const createImage = async (req, res) => {
  try {
    const response = await openai.createImage({
      prompt: req.body.prompt,
      n: 1,
      size: "512x512",
      response_format: "b64_json",
    });
    res.status(200).json({ photo: response.data.data[0].b64_json });
  } catch (error) {
    handleError(res, error);
  }
};

const shareImage = async (req, res) => {
  const { name, prompt, photo } = req.body;
  if (!name || !prompt || !photo) {
    return handleError(res, "Information Incomplete", 400);
  }
  
  try {
    const photoURL = await cloudinary.uploader.upload(photo);
    const task = await Image.create({ name, prompt, photo: photoURL.url });
    res.status(200).json({ userentry: task });
  } catch (error) {
    handleError(res, error);
  }
};

const getImage = async (req, res) => {
  try {
    const posts = await Image.find();
    res.status(200).json({ posts });
  } catch (error) {
    handleError(res, error, 500);
  }
};

const signUp = async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const user = await User.Signup(email, password, name);
    const access_token = jwt.sign({ email: user.email }, process.env.SECRET);
    res.status(200).json({ user, token: access_token });
  } catch (error) {
    handleError(res, error, 406);
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.Login(email, password);
    const access_token = jwt.sign({ email: user.email }, process.env.SECRET);
    res.status(200).json({ user, token: access_token });
  } catch (error) {
    handleError(res, error, 406);
  }
};

const tokenAuthorization = (req, res, next) => {
  const Authtoken = req.headers["x-access-token"];
  if (!Authtoken) return handleError(res, "Token required", 403);

  jwt.verify(Authtoken, process.env.SECRET, (err, user) => {
    if (err) return handleError(res, "Invalid Token", 400);
    req.body.user = user;
    next();
  });
};

const likeImage = async (req, res) => {
  try {
    const { likes, userName } = req.body;
    const imageId = req.params.id;

    await Image.updateOne({ _id: imageId }, { Likes: likes });

    if (userName) {
      const user = await User.findOne({ name: userName });
      const updated_list = user.likedImages.includes(imageId)
        ? user.likedImages.filter((a) => a !== imageId)
        : [...user.likedImages, imageId];

      await User.updateOne({ name: userName }, { likedImages: updated_list });
      return res.status(200).json({ likes, updated_list });
    }

    res.status(200).json({ likes });
  } catch (error) {
    handleError(res, error);
  }
};

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
