const express = require("express");
const { addComment, getComments, deleteComment } = require("../controllers/commentController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/:postId", protect , addComment); // Add comment to a post
router.get("/:postId", protect, getComments); // Get comments for a post
router.delete("/:commentId", protect, deleteComment); // Delete a comment

module.exports = router;
