const User = require('../Models/User');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Utility function for error handling
const handleError = (res, error, status = 400) => {
  console.error(error);
  return res.status(status).json({ error: error.message || error });
};

// Helper function to generate JWT token
const generateToken = (userEmail) => {
  return jwt.sign({ email: userEmail }, process.env.SECRET, { expiresIn: '1h' });
};

// Sign up a new user and issue a JWT token
const signUp = async (req, res) => {
  const { email, password, name } = req.body;

  try {
    const user = await User.Signup(email, password, name);
    const token = generateToken(user.email);
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
    const token = generateToken(user.email);
    res.status(200).json({ user, token });
  } catch (error) {
    handleError(res, error, 406);
  }
};

module.exports = {
  signUp,
  login,
};
