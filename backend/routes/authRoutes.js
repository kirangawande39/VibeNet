const express = require("express");
const { register, login, googleAuth } = require("../controllers/authController");
const passport=require("passport");

const router = express.Router();

router.post("/register", register); // User registration


router.post("/login",
  passport.authenticate("local", {
    failureRedirect:"/login",
    failureFlash:true,
}), login);

    
  
router.post("/google", googleAuth); // Google OAuth login


module.exports = router;

