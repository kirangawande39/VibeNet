const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const UI_URL = process.env.FRONTEND_URL;
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

const googleCallBack = async (req, res, next) => {
  try {
    const { _id, username, email } = req.user;


    const token = generateToken(_id);


    const redirectUrl = `${UI_URL}/google?token=${token}&username=${encodeURIComponent(
      username
    )}&email=${encodeURIComponent(email)}&id=${_id}`;


    res.redirect(redirectUrl);
  } catch (err) {
    next(err);
  }
}

const checkEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Email not found" });
    }

    return res.status(200).json({ message: "Email exists" });
  } catch (err) {
    // Pass any unexpected errors to your global error handler
    next(err);
  }
}

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate new reset token
    const token = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = Date.now() + 3600000; // 1 hour

    user.resetToken = token;
    user.resetTokenExpires = tokenExpiry;

    await user.save();

    res.status(200).json({
      token,
      name: user.name || user.username || "User",
    });
  } catch (err) {
    next(err);
  }
}
const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpires: { $gt: new Date() },
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    user.setPassword(newPassword, async (err) => {
      if (err) return res.status(500).json({ message: "Password reset failed" });

      user.resetToken = undefined;
      user.resetTokenExpires = undefined;
      await user.save();

      res.status(200).json({ message: "Password has been reset successfully" });
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, googleAuth, checkEmail, forgotPassword, resetPassword, googleCallBack };
