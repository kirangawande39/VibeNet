const Like = require("../models/Like");
const Post = require("../models/Post");
const User = require('../models/User');
const notificationQueue = require("../queues/notificationQueue");

// Like a Post
const likePost = async (req, res, next) => {
  const userId = req.user.id;
  const postId = req.params.postId;

  // console.log("userId by post route::",userId);
  // console.log("postId by post route::",postId);




  try {
    const alreadyLiked = await Like.findOne({ user: userId, post: postId });


    if (alreadyLiked) {
      const error = new Error("Post already liked");
      error.statusCode = 400;
      throw error;
    }

    await Like.create({ user: userId, post: postId });

    const postUserDetails=await Post.findByIdAndUpdate(postId, {
      $addToSet: { likes: userId },
    }).select('user').populate('user', 'fcmToken');

    

    const updatedPost = await Post.findById(postId);

    // console.log("postUserDetails::",postUserDetails.user.fcmToken);

    const fcmToken=postUserDetails.user.fcmToken;
    

    if(fcmToken){
      const likedUserDetails=await User.findById(userId).select('username')
      // console.log("likedUserDetails::",likedUserDetails.username);
      const username=likedUserDetails.username;



        
      const title='VibeNet'
      const text=`❤️ ${username} • liked your post.`;
      
       await notificationQueue.add('send-post-like',{
        fcmToken,
        title,
        text
       });
     
    }






    res.status(200).json({
      message: "Post liked successfully",
      totalLikes: updatedPost.likes.length,
    });
  } catch (error) {
    next(error);
  }
};

// Unlike a Post
const unlikePost = async (req, res, next) => {
  const userId = req.user.id;
  const postId = req.params.postId;

  try {
    const existingLike = await Like.findOne({ user: userId, post: postId });

    if (!existingLike) {
      const error = new Error("You have not liked this post.");
      error.statusCode = 400;
      throw error;
    }

    await Like.deleteOne({ user: userId, post: postId });

    await Post.findByIdAndUpdate(postId, {
      $pull: { likes: userId },
    });

    const updatedPost = await Post.findById(postId);

    res.status(200).json({
      message: "Post unliked successfully!",
      totalLikes: updatedPost.likes.length,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { likePost, unlikePost };
