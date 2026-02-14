const User = require('../models/User');


const { cloudinary } = require('../config/cloudConfig')



// Get User Profile
const getUserProfile = async (req, res, next) => {

    try {

        const currentUserId = req.user.id;
        const profileUserId = req.params.id;


        const currentUser = await User.findById(currentUserId).select("following").lean();
        if (!currentUser) {
            return res.status(404).json({ message: "Current user not found" });
        }

        const currentFollowing = currentUser.following || [];

        const profileUser = await User.findById(profileUserId)
            .populate("followers", "username profilePic")
            .populate("following", "username profilePic")
            .populate("followRequests.user", "username profilePic");

        if (!profileUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const profileFollowersIds = profileUser.followers.map(f => f._id.toString());

        const mutualIds = profileFollowersIds.filter(id =>
            currentFollowing.map(f => f.toString()).includes(id)
        );

        const mutualUsers = profileUser.followers.filter(f =>
            mutualIds.includes(f._id.toString())
        );

        const mutualList = mutualUsers.map(u => ({
            username: u.username,
            profilePic: u.profilePic?.url || null
        }));


        // console.log("mutualList ::",mutualList)


        res.json({
            success: true,
            user: profileUser,
            mutualCount: mutualList.length,
            mutualList
        });

    } catch (err) {
        next(err);
    }
};


// Update User Profile
const updateUserProfile = async (req, res, next) => {
    // console.log("updateUserProfile is here");
    const userId = req.params.id;
    const { name, bio } = req.body;


    // console.log("User ID:", userId);
    // console.log("Name::",name);
    // console.log("Bio::",bio);


    try {
        if (userId !== req.user.id) {
            return res.status(403).json({ message: "Not Allowed!" })
        }


        const user = await User.findById(userId);
        if (user) {
            user.bio = name || user.bio;
            user.name = bio || user.name;

            await user.save();

            const updatedUser = await User.findById(user._id).select('name bio')
            // console.log("updatedUser:",updatedUser);

            res.json({
                message: "Profile updated successfully",
                name: updatedUser.name, // sending updated data back
                bio: updatedUser.bio, // sending updated data back
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

        // console.log("Search Users::", users)

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
        const userId = req.user.id;

        const currentUser = await User.findById(userId).lean();

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

// const getSuggestedUsers = async (req, res) => {
//     try {
//         const userId = req.user.id;

//         const currentUser = await User.findById(userId).lean();
//         if (!currentUser) return res.status(404).json({ message: "User not found" });

//         const following = currentUser.following || []; // Already following users
//         const visited = new Set([userId, ...following]); // Avoid suggesting self & already following

//         const queue = [...following]; // BFS queue: start from direct friends
//         const suggestionsMap = new Map(); // userId -> mutualCount

//         while (queue.length) {
//             const friendId = queue.shift(); // dequeue
//             const friend = await User.findById(friendId).lean();
//             if (!friend || !friend.following) continue;

//             for (let fId of friend.following) {
//                 if (!visited.has(fId)) {
//                     visited.add(fId); // mark visited
//                     queue.push(fId); // enqueue next level

//                     // Count mutuals
//                     suggestionsMap.set(
//                         fId,
//                         (suggestionsMap.get(fId) || 0) + 1
//                     );
//                 }
//             }
//         }

//         // Convert map to array of user objects
//         const suggestions = [];
//         for (let [sId, mutualCount] of suggestionsMap) {
//             const user = await User.findById(sId)
//                 .select("_id username name profilePic followers")
//                 .lean();
//             if (user) {
//                 suggestions.push({
//                     _id: user._id,
//                     username: user.username,
//                     name: user.name,
//                     profilePic: user.profilePic,
//                     mutualCount,
//                     popularity: user.followers.length
//                 });
//             }
//         }

//         // Sort: first by mutualCount, then by popularity
//         suggestions.sort((a, b) => {
//             if (b.mutualCount !== a.mutualCount) return b.mutualCount - a.mutualCount;
//             return b.popularity - a.popularity;
//         });

//         res.status(200).json(suggestions.slice(0, 10)); // Top 10 suggestions

//     } catch (err) {
//         console.error("BFS Friend suggestion failed:", err.message);
//         res.status(500).json({ message: "Failed to fetch suggestions" });
//     }
// };



const uploadProfilePic = async (req, res) => {

    const userId = req.params.id;
    // console.log(`Received request to update profile pic for user: ${userId}`);

    try {
        


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
            url: req.file.path,
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

const SaveFcmToken = async (req, res) => {
    const userId = req.user.id;
    const { token } = req.body;
    //  console.log("FCM TOKEN ::",token)
    //  console.log("UserId form save token ",userId)
    try {
        const user = await User.findById(userId);
        user.fcmToken = token;
        await user.save();
        // console.log("fcm token save sucessfully ")
    }
    catch (error) {
        console.error('Error saving fcm token :', error);
        res.status(500).json({ message: 'failed to saved fcm token' });
    }

}

const updatePrivacy = async (req, res) => {
    const { isPrivate } = req.body;

    const userId = req.user.id;
    // console.log("isPrivate",isPrivate)
    // console.log("Privacy Updated")
    // console.log("Your user id is : ",userId)


    try {
        const user = await User.findById(userId);
        user.isPrivate = isPrivate;
        const updatedUser = await user.save()






        res.status(201).json({
            message: `${updatedUser.isPrivate ? 'Switched to Private Account' : 'Switched to Public Account'}`,
            isPrivate: updatedUser.isPrivate,
        });
        // console.log("User Privacy Setting Updated Sucessfully")
    }
    catch (error) {
        console.error("Error to update privacy setting", error)
    }


}


module.exports = { getUserProfile, updateUserProfile, followUser, unfollowUser, searchUsers, getSuggestedUsers, uploadProfilePic, SaveFcmToken, updatePrivacy };
