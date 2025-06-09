const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// Register User
const register = async (req, res, next) => {
  try {
    const { name, email, password, username } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error("User already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ name, email, username });
    const registeredUser = await User.register(newUser, password); // passport-local-mongoose

    if (registeredUser) {
      res.status(201).json({
        _id: registeredUser.id,
        name: registeredUser.name,
        email: registeredUser.email,
        token: generateToken(registeredUser.id)
      });
    } else {
      res.status(400);
      throw new Error("Invalid user data");
    }
  } catch (err) {
    next(err);
  }
};

// Login User
const login = async (req, res, next) => {
  try {
    const { id, username, email } = req.user;

    const token = generateToken(id);

    res.json({
      success: true,
      message: "Login Successful",
      user: { id, username, email },
      token,
      redirectUrl: "/"
    });
  } catch (err) {
    next(err);
  }
};

// Google OAuth
const googleAuth = async (req, res, next) => {
  try {
     cosole.log("google auth route is here")
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, googleAuth };
