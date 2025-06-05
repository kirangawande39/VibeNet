const Story = require("../models/Story");

const createStory = async (req, res) => {
  console.log("Create story logic here");

  try {
    const file = req.file;



    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    console.log("Uploaded File Info:", file); // ✅

    const storyUrl = file.path;
    const mediaType = file.mimetype.startsWith("video") ? "video" : "image";

    const story = await Story.create({
      user: req.user.id,
      mediaUrl: storyUrl,
      mediaType,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    console.log("Story Created:", story); // ✅ Don’t use + story

    res.status(201).json({ success: true, story });
  } catch (err) {
    console.error("Error creating story:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};



const getStories = async (req, res) => {
  console.log("Get stories logic here");

  try {
    const stories = await Story.find()
      .populate('user')
      .populate("seenBy.user", "username name profilePic");

    console.log("Stories:" + stories);
    res.status(201).json({ success: true, stories });
  }
  catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteStory = async (req, res) => {
  res.send("Delete story logic here");
};

const seenStory = async (req, res) => {
  try {
    const storyId = req.params.id;
    const userId = req.user.id;

    const story = await Story.findById(storyId);
    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }

    // Check for existing user in both old and new formats
    const alreadySeen = story.seenBy.some(entry => {
      if (typeof entry === "object" && entry.user) {
        return entry.user.toString() === userId;
      } else {
        // If old format is just ObjectId
        return entry.toString() === userId;
      }
    });

    if (!alreadySeen) {
      story.seenBy.push({
        user: userId,
        viewedAt: new Date()
      });

      await story.save();
      return res.status(200).json({ message: "Story marked as seen" });
    }

    return res.status(200).json({ message: "Already marked as seen" });

  } catch (error) {
    console.error("Error marking story as seen:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};


// Like Story Controller
const likeStory = (req, res) => {
  try {
    console.log("✅ Like route is here");

    const storyId = req.params.id;
    const userId = req.user.id;

    console.log("👉 Story ID:", storyId);
    console.log("👤 User ID:", userId);

    // Dummy response for testing
    return res.status(200).json({
      success: true,
      message: "Story liked successfully",
      data: { storyId, userId }
    });
  } catch (err) {
    console.error("❌ Error in likeStory:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Unlike Story Controller
const unLikeStory = (req, res) => {
  try {
    console.log("✅ Unlike route is here");

    const storyId = req.params.id;
    const userId = req.user.id;

    console.log("👉 Story ID:", storyId);
    console.log("👤 User ID:", userId);

    // Dummy response for testing
    return res.status(200).json({
      success: false,
      message: "Story unliked successfully",
      data: { storyId, userId }
    });
  } catch (err) {
    console.error("❌ Error in unLikeStory:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};




module.exports = { createStory, getStories, deleteStory, seenStory, likeStory, unLikeStory };
