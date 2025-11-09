const mongoose = require("mongoose");
const Follow = require("../models/Follow");
const User = require("../models/User");

const followUser = async (req, res, next) => {
  try {
    const followerId = req.user.id;
    const followingId = req.params.userId;

    // console.log("followerId:", followerId);
    // console.log("followingId:", followingId);

    if (followerId === followingId) {
      return res.status(400).json({ message: "You can't follow yourself." });
    }

    // ✅ Already following ?
    const allreadyFollowed = await Follow.findOne({
      follower: followerId,
      following: followingId
    });

    if (allreadyFollowed) {
      return res.status(400).json({ message: "Already following." });
    }

    // console.log("step 2 pass ✅");

    // ✅ get only isPrivate field
    const { isPrivate } = await User.findById(followingId).select("isPrivate");

    // console.log("followingUserPrivateStatus::", isPrivate);

    if (isPrivate) {
      // ✅ Check if follow request already pending!
      const alreadySent = await User.findOne({
        _id: followingId,
        "followRequests.user": followerId,
        "followRequests.status": "pending",
      });

      // console.log("alreadyFollowRequest Sent::", alreadySent);

      if (alreadySent) {
        return res.status(400).json({ message: "Request already sent!" });
      }

      // Add follow request
      await User.findByIdAndUpdate(
        followingId,
        {
          $addToSet: {
            followRequests: {
              user: followerId,
              status: "pending",
              createdAt: new Date()
            }
          }
        }
      );

      return res.status(201).json({
        message: "Follow request sent ",
        sendrequest: true
      });
    }

    // ✅ Public Account → Direct Follow
    // console.log("Public user → direct follow ✅");

    await User.findByIdAndUpdate(followerId, {
      $addToSet: { following: followingId }
    });

    await User.findByIdAndUpdate(followingId, {
      $addToSet: { followers: followerId }
    });

    const follow = await Follow.create({
      follower: followerId,
      following: followingId
    });

    return res.status(201).json({
      message: "User followed successfully ",
      follow
    });

  } catch (err) {
    console.error("Follow error:", err.message);
    return next(err);
  }
};


const unfollowUser = async (req, res, next) => {
  // console.log("Unfollow user logic here");
  try {
    const currentUserId = req.user.id;
    const targetUserId = req.params.userId;

    if (currentUserId === targetUserId) {
      const error = new Error("You can't unfollow yourself.");
      error.statusCode = 400;
      throw error;
    }

    await User.findByIdAndUpdate(currentUserId, {
      $pull: { following: targetUserId },
    });

    await User.findByIdAndUpdate(targetUserId, {
      $pull: { followers: currentUserId },
    });

    await Follow.findOneAndDelete({
      follower: currentUserId,
      following: targetUserId,
    });

    res.status(200).json({ message: "Unfollowed successfully." });
  } catch (err) {
    next(err);
  }
};

const removeFollower = async (req, res, next) => {
  // console.log("removeFollower route is called");
  try {
    const currentUserId = req.user.id;
    const followerId = req.params.followedId;

    // console.log("Current User ID:", currentUserId);
    // console.log("Follower ID:", followerId);

    if (currentUserId === followerId) {
      const error = new Error("You can't remove yourself.");
      error.statusCode = 400;
      throw error;
    }

    const updatedUser = await User.findByIdAndUpdate(
      new mongoose.Types.ObjectId(currentUserId),
      { $pull: { followers: new mongoose.Types.ObjectId(followerId) } },
      { new: true }
    );
    // console.log("Updated currentUser followers:", updatedUser?.followers);

    const updatedFollower = await User.findByIdAndUpdate(
      new mongoose.Types.ObjectId(followerId),
      { $pull: { following: new mongoose.Types.ObjectId(currentUserId) } },
      { new: true }
    );
    // console.log("Updated follower following:", updatedFollower?.following);

    const deletedFollow = await Follow.findOneAndDelete({
      follower: followerId,
      following: currentUserId,
    });

    // console.log("Deleted follow doc:", deletedFollow);

    res.status(200).json({ message: "Follower removed successfully." });
  } catch (err) {
    next(err);
  }
};

const declineUser = async (req, res, next) => {
  try {
    const userId = req.user.id;
    // const declineuserId = req.params.declineuserId;
    const declineuserId = new mongoose.Types.ObjectId(req.params.declineuserId);

    // console.log("Decline Request call");
    // console.log("userId:", userId);
    // console.log("declineuserId:", declineuserId);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $pull: { followRequests: { user: declineuserId } }
      },
      { new: true }
    );

    // console.log("updatedUser", updatedUser);

    res.status(200).json({
      success: true,
      message: "User declined successfully.",
      updatedUser
    });

  } catch (err) {
    next(err);
  }
};


const acceptUser = async (req, res, next) => {
  try {
    // console.log("Accept user route hit");

    const userId = req.user.id; // Current logged-in user (who is 

    // const acceptUserId = new mongoose.Types.ObjectId(req.params.acceptUserId);

    const acceptUserId=req.params.acceptUserId;


    // console.log("User ID:", userId);

    // console.log("Accept User ID 1:", acceptUserId);
    // Remove accepted user from followRequests
    await User.findByIdAndUpdate(
      userId,
      {
        $pull: { followRequests: { user: acceptUserId } }
      },
      { new: true }
    );



    // Add current user to following of accepted user
    const AddFollowing=await User.findByIdAndUpdate(acceptUserId,{
        $addToSet: { following: userId }
      });

    // console.log("AddFollowing::",AddFollowing)

    //  Add accepted user to followers of current user
    const AddFollowers=await User.findByIdAndUpdate(userId,{
        $addToSet: { followers: acceptUserId }
      });
     
      // console.log("AddFollowers::",AddFollowers)

      

    // Create new entry in Follow collection
    const followCreated = await Follow.create({
      follower: acceptUserId, // the one who sent request
      following: userId       // the one who accepted request
    });

    // console.log("✅ Follow Created:", followCreated);

    res.status(200).json({
      success: true,
      message: "Follow request accepted successfully",
      
    });

  } catch (err) {
    console.error("❌ Error in acceptUser:", err);
    next(err);
  }
};

const followBack = async (req,res,next)=>{
  // console.log("FollowBack route is here")
  try{
    const userId=req.user.id;
    const followbackUserId=req.params.followbackUserId;


    // console.log("userId::",userId)
    // console.log("followbackUserId::",followbackUserId)
    

    await User.findByIdAndUpdate(
      userId,
      {
        $addToSet:{following:followbackUserId}
      },
      {new:true}
    )

    await User.findByIdAndUpdate(
      followbackUserId,
      {
        $addToSet:{followers:userId}
      },
      {new:true}
    )


    await Follow.create({
      follower:userId,   // who is send followback request
      following:followbackUserId // who is followback user 
    })


    res.status(200).json({
      success:true,
      message:"Follow Back Sucessfully."
    })
  }
  catch(err){
    console.error("Error FollowBack ",err)
    next(err)
  }
}


module.exports = { followUser, unfollowUser, removeFollower, declineUser, acceptUser, followBack };
