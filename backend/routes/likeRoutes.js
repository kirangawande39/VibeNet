const express = require("express");
const { likePost, unlikePost } = require("../controllers/likeController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/:postId/like",  likePost); // Like a post
router.post("/:postId/unlike", unlikePost); // Unlike a post

module.exports = router;
