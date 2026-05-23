const Post = require("../models/Post");
const { cloudinary } = require("../config/cloudConfig");

// Create Post Service
const sharp = require("sharp");

const streamifier =
  require("streamifier");

const createPostService =
  async (req) => {

    // console.log("createPostService called")

    const { description } =
      req.body;

    if (!req.file) {

      throw new Error(
        "No image uploaded"
      );

    }

    // Compress Post Image
    const compressedBuffer =
      await sharp(req.file.buffer)

        .resize(800)

        .webp({
          quality: 70,
        })

        .toBuffer();

    // Upload Compressed Image
    const result =
      await new Promise(
        (resolve, reject) => {

          const stream =
            cloudinary
              .uploader
              .upload_stream(

                {
                  folder:
                    "posts",
                },

                (
                  error,
                  result
                ) => {

                  if (error)
                    reject(error);

                  else
                    resolve(result);

                }
              );

          streamifier
            .createReadStream(
              compressedBuffer
            )
            .pipe(stream);

        }
      );

    // Create Post
    const post =
      await Post.create({

        user: req.params.id,

        text: description,

        image:
          result.secure_url,

        imagePublicId:
          result.public_id,

      });

    return post;

  };



// Get All Posts Service
const getAllPostsService = async (req) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const skip = (page - 1) * limit;

  const posts = await Post.aggregate([
    {
      $addFields: {
        engagementScore: {
          $add: [{ $size: "$likes" }, { $size: "$comments" }],
        },
      },
    },
    {
      $sort: {
        engagementScore: -1,
        createdAt: -1,
      },
    },
    { $skip: skip },
    { $limit: limit },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: "$user",
    },
  ]);

  return posts;
};

// Get Single Post
const getPostByIdService = async (id) => {
  const post = await Post.findById(id);
  if (!post) {
    const error = new Error("Post not found");
    error.statusCode = 404;
    throw error;
  }
  return post;
};

// Get Posts by User
const getPostsByUserIdService = async (userId) => {
  const posts = await Post.find({ user: userId });

  if (!posts.length) {
    return null;
  }

  return posts;
};

// Delete Post
const deletePostService = async (req) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    const error = new Error("Post not found");
    error.statusCode = 404;
    throw error;
  }

  if (post.user.toString() !== req.user.id) {
    const error = new Error("Not authorized");
    error.statusCode = 401;
    throw error;
  }

  if (post.imagePublicId) {
    await cloudinary.uploader.destroy(post.imagePublicId);
  }

  await post.deleteOne();

  return true;
};

module.exports = { createPostService, getAllPostsService, getPostByIdService, getPostsByUserIdService, deletePostService };