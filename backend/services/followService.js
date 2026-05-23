const mongoose = require("mongoose");
const Follow = require("../models/Follow");
const User = require("../models/User");
const {notificationQueue} = require("../queues/notificationQueue");

// follow user logic
const followUser = async (req) => {

  // user who follows
  const followerId = req.user.id;

  // user being followed
  const followingId = req.params.userId;

  if (followerId === followingId) {
    return { status: 422, data: { message: "You can't follow yourself." } };
  }

  // check if already following
  const alreadyFollowed = await Follow.findOne({
    follower: followerId,
    following: followingId
  });

  if (alreadyFollowed) {
    return { status: 409, data: { message: "Already following." } };
  }

  // get follower username
  const { username } = await User.findById(followerId).select("username");

  // get target user privacy + token
  const { isPrivate, fcmToken } = await User.findById(followingId)
    .select("isPrivate fcmToken");

  // private account case
  if (isPrivate) {

    // check if request already sent
    const alreadySent = await User.findOne({
      _id: followingId,
      "followRequests.user": followerId,
      "followRequests.status": "pending"
    });

    if (alreadySent) {
      return {
        status: 409,
        data: { message: "Follow request already sent!" }
      };
    }

    // add follow request
    await User.findByIdAndUpdate(followingId, {
      $addToSet: {
        followRequests: {
          user: followerId,
          status: "pending",
          createdAt: new Date()
        }
      }
    });

    // send notification
    if (fcmToken) {
      await notificationQueue.add("send-follow-request", {
        fcmToken,
        title: "Follow Request 💌",
        text: `${username} sent you a follow request on VibeNet!`,
      });
    }

    return {
      status: 201,
      data: {
        message: "Follow request sent successfully...",
        sendRequest: true
      }
    };
  }

  // public account follow
  await User.findByIdAndUpdate(followerId, {
    $addToSet: { following: followingId }
  });

  await User.findByIdAndUpdate(followingId, {
    $addToSet: { followers: followerId }
  });

  // create follow record
  const follow = await Follow.create({
    follower: followerId,
    following: followingId
  });

  // send notification
  if (fcmToken) {
    await notificationQueue.add("send-new-follower", {
      fcmToken,
      title: "New Follower 👥",
      text: `${username} started following you on VibeNet!`
    });
  }

  return {
    status: 201,
    data: {
      message: "User followed successfully",
      follow
    }
  };
};


// unfollow user
const unfollowUser = async (req) => {

  const currentUserId = req.user.id;
  const targetUserId = req.params.userId;

  if (currentUserId === targetUserId) {
    throw new Error("You can't unfollow yourself.");
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

  return { message: "Unfollowed successfully." };
};


// remove follower
const removeFollower = async (req) => {

  const currentUserId = req.user.id;
  const followerId = req.params.followedId;

  if (currentUserId === followerId) {
    throw new Error("You can't remove yourself.");
  }

  await User.findByIdAndUpdate(
    new mongoose.Types.ObjectId(currentUserId),
    { $pull: { followers: new mongoose.Types.ObjectId(followerId) } }
  );

  await User.findByIdAndUpdate(
    new mongoose.Types.ObjectId(followerId),
    { $pull: { following: new mongoose.Types.ObjectId(currentUserId) } }
  );

  await Follow.findOneAndDelete({
    follower: followerId,
    following: currentUserId,
  });

  return { message: "Follower removed successfully." };
};


// decline follow request
const declineUser = async (req) => {

  const userId = req.user.id;
  const declineuserId = new mongoose.Types.ObjectId(req.params.declineuserId);

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      $pull: { followRequests: { user: declineuserId } }
    },
    { new: true }
  );

  return {
    success: true,
    message: "User declined successfully.",
    updatedUser
  };
};


// accept follow request
const acceptUser = async (req) => {

  const userId = req.user.id;
  const FollowRequestUserId = req.params.acceptUserId;

  // remove from followRequests
  await User.findByIdAndUpdate(
    userId,
    {
      $pull: { followRequests: { user: FollowRequestUserId } }
    }
  );

  // add following + followers
  await User.findByIdAndUpdate(FollowRequestUserId, {
    $addToSet: { following: userId }
  });

  await User.findByIdAndUpdate(userId, {
    $addToSet: { followers: FollowRequestUserId }
  });

  // create follow record
  await Follow.create({
    follower: FollowRequestUserId,
    following: userId
  });

  return {
    success: true,
    message: "Follow request accepted successfully"
  };
};


// follow back
const followBack = async (req) => {

  const userId = req.user.id;
  const followbackUserId = req.params.followbackUserId;

  await User.findByIdAndUpdate(userId, {
    $addToSet: { following: followbackUserId }
  });

  await User.findByIdAndUpdate(followbackUserId, {
    $addToSet: { followers: userId }
  });

  await Follow.create({
    follower: userId,
    following: followbackUserId
  });

  return {
    success: true,
    message: "Follow Back Sucessfully."
  };
};


module.exports = {
  followUser,
  unfollowUser,
  removeFollower,
  declineUser,
  acceptUser,
  followBack
};