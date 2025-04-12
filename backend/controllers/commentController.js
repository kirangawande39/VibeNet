const Comment = require("../models/Comment");

// Add a Comment
const addComment = async (req, res) => {
    const comment = await Comment.create({ user: req.user.id, post: req.params.postId, text: req.body.text });
    res.status(201).json(comment);
};

// Get Comments
const getComments = async (req, res) => {
    const comments = await Comment.find({ post: req.params.postId }).populate("user", "name");
    res.json(comments);
};

// Delete Comment
const deleteComment = async (req, res) => {
    res.send("Delete comment logic here");
};

module.exports = { addComment, getComments, deleteComment };
