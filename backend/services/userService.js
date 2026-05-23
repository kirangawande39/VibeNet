const User = require('../models/User');
const { cloudinary } = require('../config/cloudConfig');
const streamifier = require("streamifier");
const sharp = require('sharp')


const getUserProfile = async (currentUserId, profileUserId) => {

    const currentUser = await User.findById(currentUserId).select("following").lean();
    if (!currentUser) {
        throw new Error("Current user not found")
    }

    const currentFollowing = currentUser.following || [];

    const profileUser = await User.findById(profileUserId)
        .populate("followers", "username profilePic")
        .populate("following", "username profilePic")
        .populate("followRequests.user", "username profilePic");

    if (!profileUser) {
        throw new Error("user not found")
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

    return {
        profileUser,
        mutualList,
    }



};



const updateUserProfile = async (req) => {

   
    const userId = req.params.id;
    const { name, bio } = req.body;

    if (userId !== req.user.id) {
        throw { status: 403, message: "Not Allowed!" };
    }

    const user = await User.findById(userId);

    if (user) {
        user.bio = name || user.bio;
        user.name = bio || user.name;

        await user.save();

        const updatedUser = await User.findById(user._id).select('name bio');

        return {
            message: "Profile updated successfully",
            name: updatedUser.name,
            bio: updatedUser.bio,
        };
    } else {
        throw { status: 404, message: "User not found" };
    }
};

const followUser = async () => {
    return "Follow user logic here";
};

const unfollowUser = async () => {
    return "Unfollow user logic here";
};

const searchUsers = async (req) => {
    const query = req.query.query;

    if (!query) {
        throw { status: 400, message: "No search query provided" };
    }

    const users = await User.find({
        $or: [
            { username: { $regex: query, $options: "i" } },
            { name: { $regex: query, $options: "i" } }
        ]
    })
        .select("_id username name profilePic followers")
        .populate({
            path: 'followers',
            select: 'username _id'
        });

    return { success: true, users };
};

const getSuggestedUsers = async (req) => {
    const userId = req.user.id;

    const currentUser = await User.findById(userId).lean();

    if (!currentUser) {
        throw new Error("User not found");
    }

    const following = currentUser.following || [];

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
        { $limit: 7 }
    ];

    return await User.aggregate(pipeline);
};

// const uploadProfilePic = async (req) => {
//     const userId = req.params.id;

//     const user = await User.findById(userId);
//     if (!user) {
//         throw new Error('User not found');
//     }

//     if (!req.file) {
//         throw new Error('No profile picture file uploaded');
//     }

//     if (user.profilePic && user.profilePic.public_id) {
//         await cloudinary.uploader.destroy(user.profilePic.public_id);
//     }

//     user.profilePic = {
//         url: req.file.path,
//         public_id: req.file.filename
//     };

//     await user.save();

//     return {
//         message: 'Profile picture updated successfully',
//         profilePic: user.profilePic
//     };
// };

const uploadProfilePic =
    async (req) => {
        //  console.log("uploadProfilePic called")

        const userId = req.params.id;

        const user =
            await User.findById(userId);

        if (!user) {

            throw new Error(
                "User not found"
            );

        }

        if (!req.file) {

            throw new Error(
                "No profile picture uploaded"
            );

        }

        // Delete old image
        if (
            user.profilePic &&
            user.profilePic.public_id
        ) {

            await cloudinary
                .uploader
                .destroy(
                    user.profilePic.public_id
                );

        }

        // Compress Image
        const compressedBuffer =
            await sharp(req.file.buffer)

                .resize(300)

                .webp({
                    quality: 70,
                })

                .toBuffer();

        // Upload compressed image
        const result =
            await new Promise(
                (resolve, reject) => {

                    const stream =
                        cloudinary
                            .uploader
                            .upload_stream(

                                {
                                    folder:
                                        "profilePics",
                                },

                                (
                                    error,
                                    result
                                ) => {

                                    if (error)
                                        reject(error);

                                    else
                                        resolve(result);

                                }
                            );

                    streamifier
                        .createReadStream(
                            compressedBuffer
                        )
                        .pipe(stream);

                }
            );

        // Save in DB
        user.profilePic = {

            url: result.secure_url,

            public_id:
                result.public_id,

        };

        await user.save();

        return {

            message:
                "Profile picture updated successfully",

            profilePic:
                user.profilePic,

        };

    };

const SaveFcmToken = async (req) => {
    const userId = req.user.id;
    const { token } = req.body;

    const user = await User.findById(userId);
    user.fcmToken = token;
    await user.save();
};

const updatePrivacy = async (req) => {
    const { isPrivate } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    user.isPrivate = isPrivate;

    const updatedUser = await user.save();

    return {
        message: `${updatedUser.isPrivate ? 'Switched to Private Account' : 'Switched to Public Account'}`,
        isPrivate: updatedUser.isPrivate,
    };
};

module.exports = {
    getUserProfile,
    updateUserProfile,
    followUser,
    unfollowUser,
    searchUsers,
    getSuggestedUsers,
    uploadProfilePic,
    SaveFcmToken,
    updatePrivacy
};