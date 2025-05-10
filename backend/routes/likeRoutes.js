const express = require("express");
const { likePost, unlikePost } = require("../controllers/likeController");
const { protect } = require("../middlewares/authMiddleware"); // ✅ correct


const router = express.Router();

router.post("/:postId/like",protect, likePost);    // 👈 protect added
router.post("/:postId/unlike",protect, unlikePost); // 👈 protect added

module.exports = router;
