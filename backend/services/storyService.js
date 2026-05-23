const Story = require("../models/Story");
const User = require("../models/User");
const {notificationQueue} = require("../queues/notificationQueue");

// 👉 Create Story
const createStoryService = async (req) => {

  console.log("createStoryService called")
  const file = req.file;

  console.log("File :",file)

  if (!file) {
    throw new Error("No file uploaded");
  }
  
  

  const story = await Story.create({
    user: req.user.id,
    mediaUrl: file.path,
    mediaType: file.mimetype.startsWith("video") ? "video" : "image",
    publicId: file.filename,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  return story;
};

// 👉 Get Stories
const getStoriesService = async (userId) => {
  const stories = await Story.find()
    .populate("user")
    .populate("seenBy.user", "username name profilePic");

  const unseenStories = [];
  const seenStories = [];

  for (const story of stories) {
    const seenByCurrentUser = story.seenBy.some(
      (viewer) => viewer.user._id.toString() === userId
    );

    if (seenByCurrentUser) {
      seenStories.push(story);
    } else {
      unseenStories.push(story);
    }
  }

  unseenStories.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  seenStories.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return [...unseenStories, ...seenStories];
};

// 👉 Delete Story (FIXED 🔥)
const deleteStoryService = async (storyId, userId) => {
  const story = await Story.findById(storyId);

  if (!story) {
    throw new Error("Story not found");
  }

  if (story.user.toString() !== userId) {
    throw new Error("Not authorized to delete this story");
  }

  await story.deleteOne();

  return true;
};

// 👉 Seen Story
const seenStoryService = async (storyId, userId) => {
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

    const user = await User.findById(story.user).select("fcmToken");
    const fcmToken = user?.fcmToken;

    if (fcmToken) {
      await notificationQueue.add("send-notification", {
        fcmToken,
        title: "VibeNet • Story Viewed 👀",
        text: "Someone viewed your story.",
      });
    }

    return { message: "Story marked as seen" };
  }

  return { message: "Already marked as seen" };
};

// 👉 Like Story
const likeStoryService = async (storyId, userId) => {
  const story = await Story.findById(storyId);

  if (!story) {
    throw new Error("Story not found");
  }

  const alreadyLiked = story.likedBy.some(
    (like) => like.user.toString() === userId
  );

  if (alreadyLiked) {
    throw new Error("Story already liked");
  }

  story.likedBy.push({ user: userId });
  await story.save();

  return story;
};

// 👉 Unlike Story
const unLikeStoryService = async (storyId, userId) => {
  const story = await Story.findByIdAndUpdate(
    storyId,
    { $pull: { likedBy: { user: userId } } },
    { new: true }
  );

  return story;
};

module.exports = {createStoryService,getStoriesService,deleteStoryService,seenStoryService,likeStoryService,unLikeStoryService};