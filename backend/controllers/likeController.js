const Like = require("../models/Like");
const Post = require("../models/Post");
const { post } = require("../routes/authRoutes");

// Like a Post

const likePost = async (req, res) => {
  const userId = req.user.id;
  const postId = req.params.postId;

  try {
    const alreadyLiked = await Like.findOne({ user: userId, post: postId });
    if (alreadyLiked) {
      return res.status(400).json({ message: "Post already liked" });
    }

    await Like.create({ user: userId, post: postId });

    await Post.findByIdAndUpdate(postId, {
      $addToSet: { likes: userId },
    });

    // Fetch updated post to get likes count
    const updatedPost = await Post.findById(postId);

    res.status(200).json({
      message: "Post liked successfully",
      totalLikes: updatedPost.likes.length,
    });
  } catch (error) {
    console.error("Error liking post:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


// Unlike a Post
const unlikePost = async (req, res) => {
  const userId = req.user.id;
  const postId = req.params.postId;

  try {
    const existingLike = await Like.findOne({ user: userId, post: postId });

    if (!existingLike) {
      return res.status(400).json({ message: "You have not liked this post." });
    }

    await Like.deleteOne({ user: userId, post: postId });

    await Post.findByIdAndUpdate(postId, {
      $pull: { likes: userId },
    });

    // Fetch updated post to get likes count
    const updatedPost = await Post.findById(postId);

    return res.status(200).json({
      message: "Post unliked successfully!",
      totalLikes: updatedPost.likes.length,
    });
  } catch (error) {
    console.error("Error in unlikePost:", error);
    return res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};


module.exports = { likePost, unlikePost };
