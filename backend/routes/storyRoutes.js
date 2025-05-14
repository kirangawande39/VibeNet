const express = require("express");
const { createStory, getStories, deleteStory } = require("../controllers/storyController");
const { protect } = require("../middlewares/authMiddleware");
const multer=require('multer')
const router = express.Router();


// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // store in uploads folder
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  }
});

const upload = multer({ storage });


router.post("/", protect , upload.single('story')  , createStory); // Create a story

router.get("/", getStories); // Get all stories

router.delete("/:id", deleteStory); // Delete a story

module.exports = router;