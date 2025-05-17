const express = require("express");
const { createStory, getStories, deleteStory } = require("../controllers/storyController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();
const multer = require('multer');
const { storage } = require('../config/cloudConfig');  // yaha import karo
const upload = multer({ storage });

// Multer setup


router.post("/", protect , upload.single('story')  , createStory); // Create a story

router.get("/", getStories); // Get all stories

router.delete("/:id", deleteStory); // Delete a story

module.exports = router;