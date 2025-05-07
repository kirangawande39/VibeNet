const express = require("express");
const { getUserProfile, updateUserProfile, followUser, unfollowUser } = require("../controllers/userController");
const { protect } = require("../middlewares/authMiddleware");
const multer = require('multer');
const router = express.Router();
const User = require('../models/User'); // adjust path as needed



// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // store in uploads folder
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  }
});

const upload = multer({ storage });


router.get("/:id", getUserProfile); // Get user profile by ID
router.put("/:id", updateUserProfile);
 // Update profile
router.post("/:id/follow",  followUser); // Follow a user
router.post("/:id/unfollow",  unfollowUser); // Unfollow a user
// PUT /api/users/:id/uploadProfilePic




router.put('/:id/uploadProfilePic', upload.single('profilePic'), async (req, res) => {
  try {
    const userId = req.params.id;
    const imagePath = `http://localhost:5000/uploads/${req.file.filename}`;

    const updatedUser = await User.findByIdAndUpdate(userId, { profilePic: imagePath }, { new: true });
    res.json({ profilePic: updatedUser.profilePic });
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});









module.exports = router;
