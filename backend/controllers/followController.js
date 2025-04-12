const Follow = require("../models/Follow");

const followUser = async (req, res) => {
    res.send("Follow user logic here");
};

const unfollowUser = async (req, res) => {
    res.send("Unfollow user logic here");
};

module.exports = { followUser, unfollowUser };
