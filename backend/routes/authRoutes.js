const express = require("express");
const { register, login, googleAuth, checkEmail, forgotPassword, resetPassword, googleCallBack } = require("../controllers/authController");
const {registerLimiter, loginLimiter, forgotPasswordLimiter} = require("../middlewares/rateLimit");
const passport = require("passport");
const User = require("../models/User")

require("dotenv").config();
const router = express.Router();

// router.post('/bulk-register', async (req, res, next) => {
//   try {
//     const users = req.body.users;

//     const createdUsers = [];

//     for (let user of users) {
//       const { name, email, password, username } = user;

//       const existing = await User.findOne({ email });
//       if (existing) continue;

//       const newUser = new User({ name, email, username });
//       const registeredUser = await User.register(newUser, password); // passport-local-mongoose

//       createdUsers.push({
//         id: registeredUser._id,
//         username: registeredUser.username
//       });
//     }

//     res.status(201).json({ message: "Users created", users: createdUsers });
//   } catch (err) {
//     next(err);
//   }
// });


router.post("/register", registerLimiter, register);

router.post("/login",loginLimiter,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  login
);

// POST /api/auth/check-email
router.post("/check-email", checkEmail);

router.post("/forgot-password",forgotPasswordLimiter, forgotPassword);

router.post("/reset-password",  resetPassword);



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
