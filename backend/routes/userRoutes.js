const express = require("express");
const { getUserProfile, updateUserProfile, followUser, unfollowUser } = require("../controllers/userController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();
const User = require('../models/User');
 // adjust path as needed

const multer = require('multer');
const { storage } = require('../config/cloudConfig');  // yaha import karo
const upload = multer({ storage });


// Multer setup





router.get("/:id", getUserProfile); // Get user profile by ID
router.put("/:id", updateUserProfile);
 // Update profile
router.post("/:id/follow",  followUser); // Follow a user
router.post("/:id/unfollow",  unfollowUser); // Unfollow a user
// PUT /api/users/:id/uploadProfilePic




router.put('/:id/uploadProfilePic', upload.single('profilePic'), async (req, res) => {
  try {
    const userId = req.params.id;
    const imagePath = req.file.path;

    const updatedUser = await User.findByIdAndUpdate(userId, { profilePic: imagePath }, { new: true });
    res.json({ profilePic: updatedUser.profilePic });
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});









module.exports = router;
