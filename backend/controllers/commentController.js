const Comment = require("../models/Comment");
const Post = require("../models/Post");

// Add a Comment
const addComment = async (req, res, next) => {
  try {
    // console.log("Comment route is here");

    // Step 1: Create the comment
    let comment = await Comment.create({
      user: req.user.id,
      post: req.params.postId,
      text: req.body.newComment,
    });

    // Step 2: Add comment ID to the Post's comments array
    await Post.findByIdAndUpdate(req.params.postId, {
      $push: { comments: comment._id },
    });

    // ✅ Step 3: Populate the user field so client gets full user info
    comment = await comment.populate("user", "username profilePic");

    // Step 4: Respond with populated comment
    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
};

// Get Comments
const getComments = async (req, res, next) => {
  try {
    // console.log("All comments is here" + req.params.postId);
    const comments = await Comment.find({ post: req.params.postId }).populate("user");
    res.json({ comments });
  } catch (error) {
    next(error);
  }
};

// Delete Comment
const deleteComment = async (req, res, next) => {
  // console.log("Delete comment logic here");
  // console.log("CommentId:" + req.params.commentId);
  const commentId = req.params.commentId;

  try {
    // Find the comment to get the postId
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const postId = comment.post;

    const comments = await Comment.findByIdAndDelete(commentId);
    // console.log("deleted comment:" + comments);

    await Post.findByIdAndUpdate(postId, {
      $pull: { comments: commentId },
    });

    res.status(200).json({ message: "Comment deleted and removed from post" });
  } catch (error) {
    next(error);
  }
};

module.exports = { addComment, getComments, deleteComment };
