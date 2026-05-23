const Like = require("../models/Like");
const Post = require("../models/Post");
const User = require("../models/User");
const {notificationQueue} = require("../queues/notificationQueue");

// like a post
const likePost = async (req) => {

  const userId = req.user.id;
  const postId = req.params.postId;

  // check already liked or not
  const alreadyLiked = await Like.findOne({ user: userId, post: postId });

  if (alreadyLiked) {
    const error = new Error("Post already liked");
    error.statusCode = 400;
    throw error;
  }

  // create like
  await Like.create({ user: userId, post: postId });

  // update post likes + get post owner token
  const postUserDetails = await Post.findByIdAndUpdate(postId, {
    $addToSet: { likes: userId },
  }).select("user").populate("user", "fcmToken");

  const updatedPost = await Post.findById(postId);

  const fcmToken = postUserDetails.user.fcmToken;

  // send notification
  if (fcmToken) {

    const likedUserDetails = await User.findById(userId).select("username");
    const username = likedUserDetails.username;

    const title = "VibeNet";
    const text = `❤️ ${username} • liked your post.`;

    await notificationQueue.add("send-post-like", {
      fcmToken,
      title,
      text
    });
  }

  return {
    message: "Post liked successfully",
    totalLikes: updatedPost.likes.length,
  };
};


// unlike post
const unlikePost = async (req) => {

  const userId = req.user.id;
  const postId = req.params.postId;

  const existingLike = await Like.findOne({ user: userId, post: postId });

  if (!existingLike) {
    const error = new Error("You have not liked this post.");
    error.statusCode = 400;
    throw error;
  }

  await Like.deleteOne({ user: userId, post: postId });

  await Post.findByIdAndUpdate(postId, {
    $pull: { likes: userId },
  });

  const updatedPost = await Post.findById(postId);

  return {
    message: "Post unliked successfully!",
    totalLikes: updatedPost.likes.length,
  };
};

module.exports = { likePost, unlikePost };