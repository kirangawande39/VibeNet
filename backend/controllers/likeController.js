const likeServices = require("../services/likeService");

// like post
const likePost = async (req, res, next) => {
  try {
    const result = await likeServices.likePost(req);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// unlike post
const unlikePost = async (req, res, next) => {
  try {
    const result = await likeServices.unlikePost(req);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = { likePost, unlikePost };