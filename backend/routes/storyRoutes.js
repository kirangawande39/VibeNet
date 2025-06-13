const express = require("express");
const { createStory, getStories, deleteStory ,seenStory,likeStory,unLikeStory } = require("../controllers/storyController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();
const multer = require('multer');
const { StoryStorage } = require('../config/cloudConfig');  // yaha import karo
const { storyUploadLimiter } = require("../middlewares/rateLimit");
const upload = multer({ storage:StoryStorage });

// Multer setup


router.post("/", protect, storyUploadLimiter , upload.single('story')  , createStory); // Create a story

router.get("/",protect, getStories); // Get all stories

router.delete("/:id", deleteStory); // Delete a story

router.put("/:id/seen", protect, seenStory);

router.put("/:id/like", protect, likeStory);
router.put("/:id/unlike", protect, unLikeStory);

module.exports = router;