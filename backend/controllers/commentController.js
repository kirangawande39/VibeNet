const commentServices = require("../services/commentService");

// Add Comment
const addComment = async (req, res, next) => {
  try {
    const result = await commentServices.addComment(req);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

// Get Comments
const getComments = async (req, res, next) => {
  try {
    const result = await commentServices.getComments(req);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Delete Comment
const deleteComment = async (req, res, next) => {
  try {
    const result = await commentServices.deleteComment(req);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = { addComment, getComments, deleteComment };