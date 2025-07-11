const User = require('../models/User');


// Get User Profile
const getUserProfile = async (req, res, next) => {
    try {

        // console.log("user profile is here")
        const user = await User.findById(req.params.id).populate("followers").populate("following");

        // console.log("getUser:" + user)
        if (user) {
            // console.log("data send to frontend ")
            res.json({ user });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    }
    catch (err) {
        next(err);
    }
};

// Update User Profile
const updateUserProfile = async (req, res, next) => {
    // console.log("updateUserProfile is here");
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
const followUser = async (req, res, next) => {
    res.send("Follow user logic here");
};

// Unfollow User
const unfollowUser = async (req, res) => {
    res.send("Unfollow user logic here");
};


const searchUsers = async (req, res, next) => {
    const query = req.query.query; // 👈 query string se data mila

    if (!query) {
        return res.status(400).json({ success: false, message: "No search query provided" });
    }

    try {
        // Search by username or name (you can modify this logic)

        const users = await User.find({
            $or: [
                { username: { $regex: query, $options: "i" } },
                { name: { $regex: query, $options: "i" } }
            ]
        })
            .select("_id username name profilePic followers")  // followers bhi select karna hoga
            .populate({
                path: 'followers',           // followers jo User schema me reference hai
                select: 'username _id'       // followers ke andar se sirf username aur _id lana hai
            });

        // Select only needed fields

        res.status(200).json({ success: true, users });
    } catch (error) {
        next(error)
    }
};


const getSuggestedUsers = async (req, res) => {
    try {
        // console.log("Suggestion route is here");

        // console.log("User ID from token:", req.user.id);

        const currentUser = await User.findById(req.user.id).lean();

        if (!currentUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // console.log("Current User:", currentUser.username);
        const following = currentUser.following || [];

        // console.log("Following:", following);

        const pipeline = [
            {
                $match: {
                    _id: { $ne: currentUser._id, $nin: following }
                }
            },
            {
                $addFields: {
                    mutualIds: {
                        $cond: {
                            if: { $gt: [following.length, 0] },
                            then: { $setIntersection: ["$followers", following] },
                            else: []
                        }
                    },
                    popularity: { $size: "$followers" }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "mutualIds",
                    foreignField: "_id",
                    as: "mutualUsers"
                }
            },
            {
                $project: {
                    _id: 1,
                    username: 1,
                    name: 1,
                    profilePic: 1,
                    mutualCount: { $size: "$mutualIds" },
                    mutualUsernames: {
                        $map: {
                            input: "$mutualUsers",
                            as: "user",
                            in: "$$user.username"
                        }
                    }
                }
            },
            {
                $sort: {
                    mutualCount: -1,
                    popularity: -1
                }
            },
            { $limit: 10 }
        ];


        const suggestions = await User.aggregate(pipeline);

        // console.log("Suggestions:", suggestions);

        res.status(200).json(suggestions);

    } catch (err) {
        console.error("Suggestion fetch failed:", err.message);
        res.status(500).json({ message: "Failed to fetch suggestions" });
    }
};


const uploadProfilePic = async () => {
    try {
        const userId = req.params.id;
        // console.log(`Received request to update profile pic for user: ${userId}`);

        const user = await User.findById(userId);
        if (!user) {
            // console.log(`User with id ${userId} not found.`);
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if file is uploaded
        if (!req.file) {
            // console.log('No file uploaded.');
            return res.status(400).json({ message: 'No profile picture file uploaded' });
        }
        // console.log('File uploaded:', req.file);

        // Delete old profile picture from Cloudinary if exists
        if (user.profilePic && user.profilePic.public_id) {
            // console.log(`Deleting old profile pic with public_id: ${user.profilePic.public_id}`);
            const deleteResult = await cloudinary.uploader.destroy(user.profilePic.public_id);
            // console.log('Cloudinary delete result:', deleteResult);
        }

        // Update user with new profilePic info
        user.profilePic = {
            url: req.file.path,          // multer-storage-cloudinary returns secure_url in path
            public_id: req.file.filename // filename is Cloudinary public_id
        };

        await user.save();
        // console.log('User profile pic updated successfully in DB');

        res.json({
            message: 'Profile picture updated successfully',
            profilePic: user.profilePic
        });
    } catch (error) {
        console.error('Error uploading profile picture:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}


module.exports = { getUserProfile, updateUserProfile, followUser, unfollowUser, searchUsers, getSuggestedUsers, uploadProfilePic };
