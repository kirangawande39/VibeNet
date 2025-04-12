const express = require("express");
const { createStory, getStories, deleteStory } = require("../controllers/storyController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/",  createStory); // Create a story
router.get("/", getStories); // Get all stories
router.delete("/:id", deleteStory); // Delete a story

module.exports = router;
