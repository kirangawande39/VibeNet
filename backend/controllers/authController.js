const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// Register User
const register = async (req, res) => {
    const { name, email, password, username } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ name, email, username });
    const registeredUser = await User.register(newUser, password); // if using passport-local-mongoose

    if (registeredUser) {
        res.status(201).json({
            _id: registeredUser.id,
            name: registeredUser.name,
            email: registeredUser.email,
            token: generateToken(registeredUser.id) // ✅ sending token
        });
    } else {
        res.status(400).json({ message: "Invalid user data" });
    }
};

// Login User
const login = async (req, res) => {
    const { id, username, email } = req.user;

    const token = generateToken(id); // ✅ generate JWT

    res.json({
        success: true,
        message: "Login Successful",
        user: { id, username, email },
        token, // ✅ send token to frontend
        redirectUrl: "/", // optional
    });
};

// Google OAuth (Optional)
const googleAuth = async (req, res) => {
    res.send("Google Authentication Logic Here");
};

module.exports = { register, login, googleAuth };
