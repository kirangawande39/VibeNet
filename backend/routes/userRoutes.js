const express = require("express");
const { getUserProfile, updateUserProfile, followUser, unfollowUser } = require("../controllers/userController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();
const User = require('../models/User');
// adjust path as needed

const multer = require('multer');
const { profilePicStorage , cloudinary } = require('../config/cloudConfig');  // yaha import karo


const upload = multer({ storage: profilePicStorage });




// Multer setup





router.get("/:id", getUserProfile); // Get user profile by ID
router.put("/:id", updateUserProfile);
// Update profile
router.post("/:id/follow", followUser); // Follow a user
router.post("/:id/unfollow", unfollowUser); // Unfollow a user
// PUT /api/users/:id/uploadProfilePic




router.put('/:id/uploadProfilePic', upload.single('profilePic'), async (req, res) => {
  try {
    const userId = req.params.id;
    console.log(`Received request to update profile pic for user: ${userId}`);

    const user = await User.findById(userId);
    if (!user) {
      console.log(`User with id ${userId} not found.`);
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if file is uploaded
    if (!req.file) {
      console.log('No file uploaded.');
      return res.status(400).json({ message: 'No profile picture file uploaded' });
    }
    console.log('File uploaded:', req.file);

    // Delete old profile picture from Cloudinary if exists
    if (user.profilePic && user.profilePic.public_id) {
      console.log(`Deleting old profile pic with public_id: ${user.profilePic.public_id}`);
      const deleteResult = await cloudinary.uploader.destroy(user.profilePic.public_id);
      console.log('Cloudinary delete result:', deleteResult);
    }

    // Update user with new profilePic info
    user.profilePic = {
      url: req.file.path,          // multer-storage-cloudinary returns secure_url in path
      public_id: req.file.filename // filename is Cloudinary public_id
    };

    await user.save();
    console.log('User profile pic updated successfully in DB');

    res.json({
      message: 'Profile picture updated successfully',
      profilePic: user.profilePic
    });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});










module.exports = router;
