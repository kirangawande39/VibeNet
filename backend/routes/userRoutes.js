const express = require("express");
const { getUserProfile, updateUserProfile, followUser, unfollowUser, searchUsers, getSuggestedUsers,uploadProfilePic } = require("../controllers/userController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();
const User = require('../models/User');
// adjust path as needed

const multer = require('multer');
const { profilePicStorage, cloudinary } = require('../config/cloudConfig');  // yaha import karo


const upload = multer({ storage: profilePicStorage });




// Multer setup


router.get('/suggestions', protect, getSuggestedUsers);


router.get("/search", searchUsers);

router.get("/:id", getUserProfile); // Get user profile by ID
router.put("/:id", updateUserProfile);
// Update profile
router.post("/:id/follow", followUser); // Follow a user
router.post("/:id/unfollow", unfollowUser); // Unfollow a user

// PUT /api/users/:id/uploadProfilePic




router.put('/:id/uploadProfilePic', upload.single('profilePic'), uploadProfilePic);










module.exports = router;
