const User = require("../models/User");

// Get User Profile
const getUserProfile = async (req, res,next) => {
    try{

        console.log("user profile is here")
        const user = await User.findById(req.params.id).populate("followers").populate("following");
    
        console.log("getUser:" + user)
        if (user) {
            console.log("data send to frontend ")
            res.json({user});
        } else {
            res.status(404).json({ message: "User not found" });
        }
    }
    catch(err){
        next(err);
    }
};

// Update User Profile
const updateUserProfile = async (req, res,next)  => {
    console.log("updateUserProfile is here");
    // console.log("User ID:", req.params.id);
    // console.log("New Bio:", req.body);

    try {
        const user = await User.findById(req.params.id);
        
        if (user) {
            user.bio = req.body.bio || user.bio;
            user.name = req.body.name || user.name;

            const updatedUser = await user.save();

            res.json({
                message: "Profile updated successfully",
                updatedUser, // sending updated data back
            });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        next(error);
    }
};




// PUT /api/users/:id



// Follow User
const followUser = async (req, res) => {
    res.send("Follow user logic here");
};

// Unfollow User
const unfollowUser = async (req, res) => {
    res.send("Unfollow user logic here");
};

module.exports = { getUserProfile, updateUserProfile, followUser, unfollowUser };
