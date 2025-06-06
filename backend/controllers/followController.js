const mongoose = require("mongoose");
const Follow = require("../models/Follow");
const User = require("../models/User");

const followUser = async (req, res) => {
    console.log("Follow user logic here");
    try {
        const followerId = req.user.id; // logged-in user
        const followingId = req.params.userId; // user to follow

        console.log("followerId :" + followerId);
        console.log("followingId :" + followingId);

        // Prevent self-follow
        if (followerId === followingId) {
            return res.status(400).json({ message: "You can't follow yourself." });
        }

        // Check if already following
        const alreadyFollowed = await Follow.findOne({ follower: followerId, following: followingId });
        if (alreadyFollowed) {
            return res.status(400).json({ message: "Already following." });
        }

        // Add userId to the following array of the logged-in user
        await User.findByIdAndUpdate(req.user.id, {
            $addToSet: { following: req.params.userId }
        });

        // Add logged-in user to the followers array of the target user
        await User.findByIdAndUpdate(req.params.userId, {
            $addToSet: { followers: req.user.id }
        });

        const follow = await Follow.create({ follower: followerId, following: followingId });
        res.status(201).json({ message: "User followed.", follow });



    } catch (err) {
        res.status(500).json({ error: "Something went wrong." });
    }
};

const unfollowUser = async (req, res) => {
    console.log("Unfollow user logic here");
    try {
    const currentUserId = req.user.id; // logged-in user
    const targetUserId = req.params.userId; // jise unfollow karna hai

    if (currentUserId.toString() === targetUserId) {
      return res.status(400).json({ message: "You can't unfollow yourself." });
    }

    // Remove from current user's following
    await User.findByIdAndUpdate(currentUserId, {
      $pull: { following: targetUserId },
    });

    // Remove from target user's followers
    await User.findByIdAndUpdate(targetUserId, {
      $pull: { followers: currentUserId },
    });

    await Follow.findOneAndDelete({
      follower: currentUserId,
      following: targetUserId,
    });

    res.status(200).json({ message: "Unfollowed successfully." });
  } catch (err) {
    console.error("Unfollow error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


const removeFollower = async (req, res) => {
  console.log("removeFollower route is called");
  try {
    const currentUserId = req.user.id;
    const followerId = req.params.followedId;

    console.log("Current User ID:", currentUserId);
    console.log("Follower ID:", followerId);

    if (currentUserId === followerId) {
      return res.status(400).json({ message: "You can't remove yourself." });
    }

    const updatedUser = await User.findByIdAndUpdate(
      new mongoose.Types.ObjectId(currentUserId),
      { $pull: { followers: new mongoose.Types.ObjectId(followerId) } },
      { new: true }
    );
    console.log("Updated currentUser followers:", updatedUser?.followers);

    const updatedFollower = await User.findByIdAndUpdate(
      new mongoose.Types.ObjectId(followerId),
      { $pull: { following: new mongoose.Types.ObjectId(currentUserId) } },
      { new: true }
    );
    console.log("Updated follower following:", updatedFollower?.following);

    const deletedFollow = await Follow.findOneAndDelete({
      follower: followerId,
      following: currentUserId,
    });
    console.log("Deleted follow doc:", deletedFollow);

    res.status(200).json({ message: "Follower removed successfully." });
  } catch (err) {
    console.error("Remove follower error:", err);
    res.status(500).json({ message: "Server error" });
  }
};



module.exports = { followUser, unfollowUser, removeFollower };

