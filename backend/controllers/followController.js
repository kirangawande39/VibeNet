const mongoose = require("mongoose");
const Follow = require("../models/Follow");
const User = require("../models/User");

const followUser = async (req, res, next) => {
  console.log("Follow user logic here");
  try {
    const followerId = req.user.id;
    const followingId = req.params.userId;

    // console.log("followerId:", followerId);
    // console.log("followingId:", followingId);

    if (followerId === followingId) {
      const error = new Error("You can't follow yourself.");
      error.statusCode = 400;
      throw error;
    }

    const alreadyFollowed = await Follow.findOne({ follower: followerId, following: followingId });
    if (alreadyFollowed) {
      const error = new Error("Already following.");
      error.statusCode = 400;
      throw error;
    }

    await User.findByIdAndUpdate(followerId, {
      $addToSet: { following: followingId },
    });

    await User.findByIdAndUpdate(followingId, {
      $addToSet: { followers: followerId },
    });

    const follow = await Follow.create({ follower: followerId, following: followingId });

    res.status(201).json({ message: "User followed.", follow });
  } catch (err) {
    next(err);
  }
};

const unfollowUser = async (req, res, next) => {
  console.log("Unfollow user logic here");
  try {
    const currentUserId = req.user.id;
    const targetUserId = req.params.userId;

    if (currentUserId === targetUserId) {
      const error = new Error("You can't unfollow yourself.");
      error.statusCode = 400;
      throw error;
    }

    await User.findByIdAndUpdate(currentUserId, {
      $pull: { following: targetUserId },
    });

    await User.findByIdAndUpdate(targetUserId, {
      $pull: { followers: currentUserId },
    });

    await Follow.findOneAndDelete({
      follower: currentUserId,
      following: targetUserId,
    });

    res.status(200).json({ message: "Unfollowed successfully." });
  } catch (err) {
    next(err);
  }
};

const removeFollower = async (req, res, next) => {
  // console.log("removeFollower route is called");
  try {
    const currentUserId = req.user.id;
    const followerId = req.params.followedId;

    // console.log("Current User ID:", currentUserId);
    // console.log("Follower ID:", followerId);

    if (currentUserId === followerId) {
      const error = new Error("You can't remove yourself.");
      error.statusCode = 400;
      throw error;
    }

    const updatedUser = await User.findByIdAndUpdate(
      new mongoose.Types.ObjectId(currentUserId),
      { $pull: { followers: new mongoose.Types.ObjectId(followerId) } },
      { new: true }
    );
    // console.log("Updated currentUser followers:", updatedUser?.followers);

    const updatedFollower = await User.findByIdAndUpdate(
      new mongoose.Types.ObjectId(followerId),
      { $pull: { following: new mongoose.Types.ObjectId(currentUserId) } },
      { new: true }
    );
    // console.log("Updated follower following:", updatedFollower?.following);

    const deletedFollow = await Follow.findOneAndDelete({
      follower: followerId,
      following: currentUserId,
    });
    // console.log("Deleted follow doc:", deletedFollow);

    res.status(200).json({ message: "Follower removed successfully." });
  } catch (err) {
    next(err);
  }
};

module.exports = { followUser, unfollowUser, removeFollower };
