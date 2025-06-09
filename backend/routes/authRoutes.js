const express = require("express");
const { register, login, googleAuth } = require("../controllers/authController");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const router = express.Router();
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
    const redirectUrl = `http://localhost:5173/google?token=${token}&username=${encodeURIComponent(
      username
    )}&email=${encodeURIComponent(email)}&id=${_id}`;

    // ✅ Frontend pe redirect with token and user info
    res.redirect(redirectUrl);
  }
);




module.exports = router;
