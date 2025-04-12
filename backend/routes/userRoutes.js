const express = require("express");
const { getUserProfile, updateUserProfile, followUser, unfollowUser } = require("../controllers/userController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/:id", getUserProfile); // Get user profile by ID
router.put("/:id",  updateUserProfile); // Update profile
router.post("/:id/follow",  followUser); // Follow a user
router.post("/:id/unfollow",  unfollowUser); // Unfollow a user

module.exports = router;
