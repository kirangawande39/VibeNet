const User = require("../models/User");

// Get User Profile
const getUserProfile = async (req, res) => {

    console.log("user profile is here")
    const user = await User.findById(req.params.id);

    console.log("getUser:"+user)
    if (user) {
        res.json(user);
    } else {
        res.status(404).json({ message: "User not found" });
    }
};

// Update User Profile
const updateUserProfile = async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
        user.name = req.body.name || user.name;
        user.bio = req.body.bio || user.bio;
        await user.save();
        res.json({ message: "Profile updated" });
    } else {
        res.status(404).json({ message: "User not found" });
    }
};

// Follow User
const followUser = async (req, res) => {
    res.send("Follow user logic here");
};

// Unfollow User
const unfollowUser = async (req, res) => {
    res.send("Unfollow user logic here");
};

module.exports = { getUserProfile, updateUserProfile, followUser, unfollowUser };
