const Story = require("../models/Story");

const createStory = async (req, res, next) => {
  // console.log("Create story logic here");

  try {
    const file = req.file;
    const publicId=req.file.filename;

   console.log("Story publicId ::", publicId);

    if (!file) {
      throw new Error("No file uploaded");
    }

    const storyUrl = file.path;
    const mediaType = file.mimetype.startsWith("video") ? "video" : "image";
    
    const story = await Story.create({
      user: req.user.id,
      mediaUrl: storyUrl,
      mediaType,
      publicId,
      expiresAt: new Date(Date.now() + 2 * 60 * 1000),
    });

    res.status(201).json({ success: true, story });
  } catch (err) {
    next(err);
  }
};

// const getStories = async (req, res, next) => {

//   console.log(req.user.id);
//   console.log("Get stories logic here");

//   try {
//     const stories = await Story.find()
//       .populate("user")
//       .populate("seenBy.user", "username name profilePic");

//     res.status(201).json({ success: true, stories });
//   } catch (err) {
//     next(err);
//   }
// };

const getStories = async (req, res, next) => {
  // console.log("Get stories logic here");

  try {
    const currentUserId = req.user.id;

    const stories = await Story.find()
      .populate("user")
      .populate("seenBy.user", "username name profilePic");

    // 1. Divide into seen and unseen for current user
    const unseenStories = [];
    const seenStories = [];

    for (const story of stories) {
      const seenByCurrentUser = story.seenBy.some(
        (viewer) => viewer.user._id.toString() === currentUserId
      );

      if (seenByCurrentUser) {
        seenStories.push(story);
      } else {
        unseenStories.push(story);
      }
    }

    // 2. Sort each group by latest first
    unseenStories.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    seenStories.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // 3. Combine both groups (unseen first)
    const sortedStories = [...unseenStories, ...seenStories];

    res.status(200).json({ success: true, stories: sortedStories });
  } catch (err) {
    next(err);
  }
};


const deleteStory = async (req, res, next) => {
  try {
    res.send("Delete story logic here");
  } catch (err) {
    next(err);
  }
};

const seenStory = async (req, res, next) => {
  try {
    const storyId = req.params.id;
    const userId = req.user.id;

    const story = await Story.findById(storyId);
    if (!story) {
      throw new Error("Story not found");
    }

    const alreadySeen = story.seenBy.some((entry) => {
      if (typeof entry === "object" && entry.user) {
        return entry.user.toString() === userId;
      } else {
        return entry.toString() === userId;
      }
    });

    if (!alreadySeen) {
      story.seenBy.push({ user: userId, viewedAt: new Date() });
      await story.save();
      return res.status(200).json({ message: "Story marked as seen" });
    }

    return res.status(200).json({ message: "Already marked as seen" });
  } catch (err) {
    next(err);
  }
};

const likeStory = async (req, res, next) => {
  try {
    const storyId = req.params.id;
    const userId = req.user.id;

    const story = await Story.findById(storyId);
    if (!story) {
      throw new Error("Story not found");
    }

    const alreadyLiked = story.likedBy.some((like) => like.user.toString() === userId);
    if (alreadyLiked) {
      throw new Error("Story already liked");
    }

    story.likedBy.push({ user: userId });
    await story.save();

    return res.status(200).json({
      success: true,
      message: "Story liked successfully",
      data: story,
    });
  } catch (err) {
    next(err);
  }
};

const unLikeStory = async (req, res, next) => {
  try {
    const storyId = req.params.id;
    const userId = req.user.id;

    const story = await Story.findByIdAndUpdate(
      storyId,
      { $pull: { likedBy: { user: userId } } },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Story unliked successfully",
      data: story,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createStory,
  getStories,
  deleteStory,
  seenStory,
  likeStory,
  unLikeStory,
};
