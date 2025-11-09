const express = require("express");
const { followUser, unfollowUser, removeFollower , declineUser, acceptUser, followBack } = require("../controllers/followController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();


router.put("/follow-back/:followbackUserId", protect, followBack)
router.put("/follow-request/accept/:acceptUserId" , protect , acceptUser)
router.post("/:userId/follow" , protect , followUser); // Follow a user
router.post("/:userId/unfollow" ,protect , unfollowUser); // Unfollow a user
router.put("/remove-follower/:followedId",protect, removeFollower);

router.delete("/follow-request/decline/:declineuserId" , protect , declineUser)


module.exports = router;
