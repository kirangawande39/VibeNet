const {createStoryService,getStoriesService,deleteStoryService,seenStoryService,likeStoryService,unLikeStoryService} = require("../services/storyService");

// 👉 Create
const createStory = async (req, res, next) => {
  try {
    const story = await createStoryService(req);

    res.status(201).json({ success: true, story });
  } catch (err) {
    next(err);
  }
};

// 👉 Get
const getStories = async (req, res, next) => {
  try {
    const stories = await getStoriesService(req.user.id);

    res.status(200).json({ success: true, stories });
  } catch (err) {
    next(err);
  }
};

// 👉 Delete (NOW REAL IMPLEMENTATION 🔥)
const deleteStory = async (req, res, next) => {
  try {
    await deleteStoryService(req.params.id, req.user.id);

    res.status(200).json({
      success: true,
      message: "Story deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

// 👉 Seen
const seenStory = async (req, res, next) => {
  try {
    const result = await seenStoryService(
      req.params.id,
      req.user.id
    );

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

// 👉 Like
const likeStory = async (req, res, next) => {
  try {
    const story = await likeStoryService(
      req.params.id,
      req.user.id
    );

    res.status(200).json({
      success: true,
      message: "Story liked successfully",
      data: story,
    });
  } catch (err) {
    next(err);
  }
};

// 👉 Unlike
const unLikeStory = async (req, res, next) => {
  try {
    const story = await unLikeStoryService(
      req.params.id,
      req.user.id
    );

    res.status(200).json({
      success: true,
      message: "Story unliked successfully",
      data: story,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {createStory,getStories,deleteStory,seenStory,likeStory,unLikeStory };