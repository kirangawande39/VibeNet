const Post = require("../models/Post");
const authMiddleware = require('../middlewares/authMiddleware');

const { cloudinary } = require("../config/cloudConfig"); 

// Create a Post
const createPost = async (req, res) => {
  const { description } = req.body;
  console.log("Create post route is here");

  try {
    const imageUrl = req.file.path; // Cloudinary secure_url
    const imagePublicId = req.file.filename; // Cloudinary public_id

    console.log("Uploaded image URL:", imageUrl);
    console.log("Uploaded image public_id:", imagePublicId);

    const post = await Post.create({
      user: req.params.id,
      text: description,
      image: imageUrl,
      imagePublicId: imagePublicId,
    });

    res.status(201).json({
      message: "Post created successfully",
      post,
    });
  } catch (error) {
    console.error("Error Creating Post:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
;
  
// Get All Posts
const getAllPosts = async (req, res) => {

    console.log("getAllPosts is here");

    try{

      const posts = await Post.find().populate("user");
      // console.log("posts is :"+posts)
      // res.json(posts);
      // res.json({posts})
      res.status(201).json({posts:posts,message:"post fetch sucessfully..."});

    }
    catch(error){
      console.error("Error post getting :",error)
      res.status(500).json({message:"Internal server error"});
    }

    
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
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    // Delete image from Cloudinary if public_id is present
    if (post.imagePublicId) {
      await cloudinary.uploader.destroy(post.imagePublicId);
      console.log("Image deleted from Cloudinary:", post.imagePublicId);
    }

    await post.deleteOne();

    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { createPost, getAllPosts, getPostById, deletePost,getPostsByUserId };
