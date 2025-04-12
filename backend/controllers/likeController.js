const Like = require("../models/Like");

// Like a Post
const likePost = async (req, res) => {
    res.send("Like post logic here");
};

// Unlike a Post
const unlikePost = async (req, res) => {
    res.send("Unlike post logic here");
};

module.exports = { likePost, unlikePost };
