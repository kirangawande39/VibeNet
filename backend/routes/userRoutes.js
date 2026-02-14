const express = require("express");
const { getUserProfile, updateUserProfile, followUser, unfollowUser, searchUsers, getSuggestedUsers,uploadProfilePic,SaveFcmToken ,updatePrivacy} = require("../controllers/userController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();
const User = require('../models/User');


const multer = require('multer');
const { profilePicStorage } = require('../config/cloudConfig');  


const upload = multer({ storage: profilePicStorage });




// Multer setup


router.get('/suggestions', protect, getSuggestedUsers);


router.get("/search", protect, searchUsers);

router.get("/:id", protect, getUserProfile); 

router.put("/privacy", protect,updatePrivacy)
router.put("/:id", protect, updateUserProfile);

// Update profile
router.post("/:id/follow", protect, followUser); // Follow a user
router.post("/:id/unfollow",protect, unfollowUser); // Unfollow a user






router.put('/:id/uploadProfilePic', protect , upload.single('profilePic'), uploadProfilePic);



router.post('/save-fcm-token', protect, SaveFcmToken)






module.exports = router;
