const express = require("express");
const { createPost, getAllPosts, getPostById, deletePost } = require("../controllers/postController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/",  createPost); // Create a post
router.get("/", getAllPosts); // Get all posts
router.get("/:id", getPostById); // Get a single post by ID
router.delete("/:id", deletePost); // Delete a post

module.exports = router;
