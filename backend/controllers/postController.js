const Post = require("../models/Post");
const { cloudinary } = require("../config/cloudConfig");

// 👉 Create a Post
const createPost = async (req, res, next) => {
  const { description } = req.body;

  try {
    const imageUrl = req.file.path;
    const imagePublicId = req.file.filename;

    const post = await Post.create({
      user: req.params.id,
      text: description,
      image: imageUrl,
      imagePublicId,
    });

    res.status(201).json({
      message: "Post created successfully",
      post,
    });
  } catch (error) {
    next(error);
  }
};

// 👉 Get All Posts with Pagination
const getAllPosts = async (req, res, next) => {
  try {
    console.log("All posts route hit");

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const posts = await Post.aggregate([
      {
        $addFields: {
          engagementScore: {
            $add: [
              { $size: "$likes" },
              { $size: "$comments" }
            ]
          }
        }
      },
      {
        $sort: {
          engagementScore: -1, // highest engagement first
          createdAt: -1        // if tie, show newer one first
        }
      },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user"
        }
      },
      {
        $unwind: "$user"
      }
    ]);

    res.status(200).json({
      posts,
      message: "Posts fetched successfully",
    });
  } catch (error) {
    next(error);
  }
};


// 👉 Get Single Post by ID
const getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json(post);
  } catch (error) {
    next(error);
  }
};

// 👉 Get Posts by User ID
const getPostsByUserId = async (req, res, next) => {
  try {
    const posts = await Post.find({ user: req.params.id });
    if (!posts.length) {
      return res.status(404).json({ message: "No posts found for this user" });
    }
    res.json({ posts });
  } catch (error) {
    next(error);
  }
};

// 👉 Delete Post
const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized to delete this post" });
    }

    if (post.imagePublicId) {
      await cloudinary.uploader.destroy(post.imagePublicId);
      console.log("Image deleted from Cloudinary:", post.imagePublicId);
    }

    await post.deleteOne();
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPost,
  getAllPosts,
  getPostById,
  deletePost,
  getPostsByUserId,
};
