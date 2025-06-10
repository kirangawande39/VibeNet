const express = require("express");
const { register, login, googleAuth, checkEmail } = require("../controllers/authController");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();
const router = express.Router();

const crypto = require("crypto");

const UI_URL = process.env.FRONTEND_URL;

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// ---------------- Local Login/Register ---------------- //
router.post("/register", register);

router.post("/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  login
);

// ---------------- Google OAuth ---------------- //

router.get("/google",
  passport.authenticate("google", { scope: ["profile", "email"] }), googleAuth
);


router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false, // ❌ No session if you're using JWT
  }),
  (req, res) => {
    const { _id, username, email } = req.user;

    // ✅ JWT token generate karo
    const token = generateToken(_id);

    // ✅ Encode URI components in case of special characters
    const redirectUrl = `${UI_URL}/google?token=${token}&username=${encodeURIComponent(
      username
    )}&email=${encodeURIComponent(email)}&id=${_id}`;

    // ✅ Frontend pe redirect with token and user info
    res.redirect(redirectUrl);
  }
);

// POST /api/auth/check-email
router.post("/check-email", checkEmail);

router.post("/forgot-password", async (req, res, next) => {
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
});

router.post("/reset-password", async (req, res) => {
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
    res.status(500).json({ message: "Something went wrong" });
  }
});




module.exports = router;
