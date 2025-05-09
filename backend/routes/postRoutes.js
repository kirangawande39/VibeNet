const express = require("express");
const { createPost, getAllPosts, getPostById, getPostsByUserId , deletePost } = require("../controllers/postController");
const  protect  = require("../middlewares/authMiddleware");
const multer =require('multer');
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


router.post("/:id" , upload.single('postImage'),  createPost); // Create a post

router.get("/", getAllPosts); // Get all posts
// router.get("/", getPostById);

// Get a single post by ID

router.get("/:id",getPostsByUserId);
router.delete("/:id", deletePost); // Delete a post

module.exports = router;
