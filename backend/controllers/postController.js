const Post = require("../models/Post");

// Create a Post
const createPost = async (req, res) => {
    const post = await Post.create({ user: req.user.id, content: req.body.content });
    res.status(201).json(post);
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

module.exports = { createPost, getAllPosts, getPostById, deletePost };
