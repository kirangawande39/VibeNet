const express = require("express");
const { followUser, unfollowUser } = require("../controllers/followController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/:userId/follow" , protect , followUser); // Follow a user
router.post("/:userId/unfollow" ,protect , unfollowUser); // Unfollow a user

module.exports = router;
