const Like = require("../models/Like");
const Post = require("../models/Post");

// Like a Post
const likePost = async (req, res, next) => {
  const userId = req.user.id;
  const postId = req.params.postId;

  try {
    const alreadyLiked = await Like.findOne({ user: userId, post: postId });
    if (alreadyLiked) {
      const error = new Error("Post already liked");
      error.statusCode = 400;
      throw error;
    }

    await Like.create({ user: userId, post: postId });

    await Post.findByIdAndUpdate(postId, {
      $addToSet: { likes: userId },
    });

    const updatedPost = await Post.findById(postId);

    res.status(200).json({
      message: "Post liked successfully",
      totalLikes: updatedPost.likes.length,
    });
  } catch (error) {
    next(error);
  }
};

// Unlike a Post
const unlikePost = async (req, res, next) => {
  const userId = req.user.id;
  const postId = req.params.postId;

  try {
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

    res.status(200).json({
      message: "Post unliked successfully!",
      totalLikes: updatedPost.likes.length,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { likePost, unlikePost };
