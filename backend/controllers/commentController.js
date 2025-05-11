const Comment = require("../models/Comment");
const Post = require("../models/Post");

// Add a Comment
const addComment = async (req, res) => {
  try {
    console.log("Comment route is here");

    const comment = await Comment.create({
      user: req.user.id,
      post: req.params.postId,
      text: req.body.newComment,
    });

    // Add comment ID to the post's comments array
    await Post.findByIdAndUpdate(req.params.postId, {
      $push: { comments: comment._id },
    });

    // Respond with the created comment
    res.status(201).json(comment);

  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ error: "Failed to add comment" });
  }
};

// Get Comments
const getComments = async (req, res) => {

    console.log("All comments is here"+req.params.postId)
    const comments = await Comment.find({ post: req.params.postId }).populate("user");

    console.log("Comments:"+comments)

    res.json({comments});
};

// Delete Comment
const deleteComment = async (req, res) => {
    res.send("Delete comment logic here");
};

module.exports = { addComment, getComments, deleteComment };
