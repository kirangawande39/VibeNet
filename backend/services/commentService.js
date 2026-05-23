const Comment = require("../models/Comment");
const Post = require("../models/Post");
const User = require('../models/User');
const {notificationQueue} = require("../queues/notificationQueue");

// Add Comment
const addComment = async (req) => {
  const userId = req.user.id;

  let comment = await Comment.create({
    user: req.user.id,
    post: req.params.postId,
    text: req.body.newComment,
  });

  const commentedPost = await Post.findByIdAndUpdate(req.params.postId, {
    $push: { comments: comment._id },
  }).select('user').populate('user', 'fcmToken');

  comment = await comment.populate("user", "username profilePic");

  const fcmToken = commentedPost.user.fcmToken;
  const username = comment.user.username;

  if (fcmToken) {
    const title = "VibeNet";
    const text = `💬 ${username} • commented on your post.`;

    await notificationQueue.add('send-post-comment', {
      fcmToken,
      title,
      text
    });
  }

  return comment;
};

// Get Comments
const getComments = async (req) => {
  const comments = await Comment.find({ post: req.params.postId }).populate("user");
  return { comments };
};

// Delete Comment
const deleteComment = async (req) => {
  const commentId = req.params.commentId;

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw { status: 404, message: "Comment not found" };
  }

  const postId = comment.post;

  await Comment.findByIdAndDelete(commentId);

  await Post.findByIdAndUpdate(postId, {
    $pull: { comments: commentId },
  });

  return { message: "Comment deleted and removed from post" };
};

module.exports = { addComment, getComments, deleteComment };