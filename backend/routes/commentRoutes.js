const express = require("express");
const { addComment, getComments, deleteComment } = require("../controllers/commentController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/:postId",  addComment); // Add comment to a post
router.get("/:postId", getComments); // Get comments for a post
router.delete("/:commentId",  deleteComment); // Delete a comment

module.exports = router;
