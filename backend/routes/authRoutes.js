const express = require("express");
const { register, login, googleAuth, checkEmail, forgotPassword, resetPassword, googleCallBack } = require("../controllers/authController");
const passport = require("passport");

require("dotenv").config();
const router = express.Router();


router.post("/register", register);

router.post("/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  login
);

// POST /api/auth/check-email
router.post("/check-email", checkEmail);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password", resetPassword);



router.get("/google",
  passport.authenticate("google", { scope: ["profile", "email"] }), googleAuth
);


router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }), googleCallBack

);




module.exports = router;
