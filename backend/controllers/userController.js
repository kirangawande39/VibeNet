const userServices = require("../services/userService");

const getUserProfile = async (req, res, next) => {
    try {
        // console.log("getUserProfile called")
        const currentUserId = req.user.id;
        const profileUserId = req.params.id;

        const { profileUser, mutualList } =
            await userServices.getUserProfile(currentUserId, profileUserId);

        // console.log("profileUser",profileUser)
        // console.log("mutualList:",mutualList)

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

const updateUserProfile = async (req, res, next) => {
    try {
        const result = await userServices.updateUserProfile(req);
        res.json(result);
    } catch (error) {
        next(error);
    }
};

const followUser = async (req, res, next) => {
    try {
        const result = await userServices.followUser(req);
        res.send(result);
    } catch (err) {
        next(err);
    }
};

const unfollowUser = async (req, res, next) => {
    try {
        const result = await userServices.unfollowUser(req);
        res.send(result);
    } catch (err) {
        next(err);
    }
};

const searchUsers = async (req, res, next) => {
    try {
        const result = await userServices.searchUsers(req);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

const getSuggestedUsers = async (req, res) => {
    try {
        const result = await userServices.getSuggestedUsers(req);
        res.status(200).json(result);
    } catch (err) {
        console.error("Suggestion fetch failed:", err.message);
        res.status(500).json({ message: "Failed to fetch suggestions" });
    }
};

const uploadProfilePic = async (req, res) => {
    try {
        const result = await userServices.uploadProfilePic(req);
        res.json(result);
    } catch (error) {
        console.error('Error uploading profile picture:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const SaveFcmToken = async (req, res) => {
    try {
        await userServices.SaveFcmToken(req);
    } catch (error) {
        console.error('Error saving fcm token :', error);
        res.status(500).json({ message: 'failed to saved fcm token' });
    }
};

const updatePrivacy = async (req, res) => {
    try {
        const result = await userServices.updatePrivacy(req);
        res.status(201).json(result);
    } catch (error) {
        console.error("Error to update privacy setting", error);
    }
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