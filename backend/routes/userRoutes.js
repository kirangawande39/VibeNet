const express = require("express");
const { getUserProfile, updateUserProfile, followUser, unfollowUser, searchUsers, getSuggestedUsers,uploadProfilePic,SaveFcmToken ,updatePrivacy} = require("../controllers/userController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();
const User = require('../models/User');
// adjust path as needed

const multer = require('multer');
const { profilePicStorage, cloudinary } = require('../config/cloudConfig');  // yaha import karo


const upload = multer({ storage: profilePicStorage });




// Multer setup


router.get('/suggestions', protect, getSuggestedUsers);


router.get("/search", protect, searchUsers);

router.get("/:id", getUserProfile); // Get user profile by ID

router.put("/privacy", protect,updatePrivacy)
router.put("/:id", updateUserProfile);

// Update profile
router.post("/:id/follow", protect, followUser); // Follow a user
router.post("/:id/unfollow",protect, unfollowUser); // Unfollow a user

// PUT /api/users/:id/uploadProfilePic




router.put('/:id/uploadProfilePic', upload.single('profilePic'),protect, uploadProfilePic);



router.post('/save-fcm-token', protect, SaveFcmToken)






module.exports = router;
