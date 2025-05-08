const Post = require("../models/Post");
const authMiddleware = require('../middlewares/authMiddleware')
// Create a Post
const createPost = async (req, res) => {
    const { description } = req.body;
  
    try {
      const imagePath = `http://localhost:5000/uploads/${req.file.filename}`;
      const post = await Post.create({
        user: req.params.id,
        text: description,
        image: imagePath,
      });
      
      console.log("post"+post)
      res.status(201).json({
        message: "Post created successfully",
        post: post,
      });
      

    } catch (error) {
      console.error("Error Creating Post:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
  

// Get All Posts
const getAllPosts = async (req, res) => {
    const posts = await Post.find().populate("user", "name");
    res.json(posts);
};

// Get Single Post by ID
const getPostById = async (req, res) => {
    
    const post = await Post.findById(req.params.id);
    if (post) res.json(post);
    else res.status(404).json({ message: "Post not found" });
};


const getPostsByUserId = async (req, res) => {
    try {
      const posts = await Post.find({ user: req.params.id });
  
      if (posts.length > 0) {
        res.json({ posts });
      } else {
        res.status(404).json({ message: "No posts found for this user." });
      }
    } catch (error) {
      console.error("Error fetching posts by user ID:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
  

// Delete Post
const deletePost = async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (post && post.user.toString() === req.user.id) {
        await post.deleteOne();
        res.json({ message: "Post deleted" });
    } else {
        res.status(401).json({ message: "Not authorized" });
    }
};

module.exports = { createPost, getAllPosts, getPostById, deletePost,getPostsByUserId };
