
const rateLimit = require("express-rate-limit");

const registerLimiter = rateLimit({
  windowMs: 60 * 1000, 
  max: 2,
  message: "Too many accounts created from this IP, try again later.",
  keyGenerator: (req) => req.ip, 
});


const loginLimiter = rateLimit({
  windowMs: 2 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => req.body.email || req.ip, 
  message: "Too many login attempts for this email, please try again later.",
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 3,
  keyGenerator: (req) => req.body.email || req.ip,
  message: "Too many OTP requests, please try again later.",
});


const storyUploadLimiter = rateLimit({
  windowMs: 30 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => req.user?.id || req.ip, 
  message: "Too many stories uploaded, wait before trying again.",
});


module.exports = {registerLimiter,loginLimiter,storyUploadLimiter,forgotPasswordLimiter};