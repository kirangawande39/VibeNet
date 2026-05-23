const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const postRoutes = require("./postRoutes");
const commentRoutes = require("./commentRoutes");
const likeRoutes = require("./likeRoutes");
const followRoutes = require("./followRoutes");
const notificationRoutes = require("./notificationRoutes");
const storyRoutes = require("./storyRoutes");
const chatRoutes = require("./chatRoutes");
const messageRoutes = require("./messageRoutes");
const groupRoutes = require("./groupRoutes");
const onlineStatusRoutes=require("./onlineStatusRoutes")

const setupRoutes = (app) => {
  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/posts", postRoutes);
  app.use("/api/comments", commentRoutes);
  app.use("/api/likes", likeRoutes);
  app.use("/api/follow", followRoutes);
  app.use("/api/notifications", notificationRoutes);
  app.use("/api/stories", storyRoutes);
  app.use("/api/chats", chatRoutes);
  app.use("/api/messages", messageRoutes);
  app.use("/api/groups", groupRoutes);
  app.use("/api/online-status", onlineStatusRoutes)
};

module.exports = setupRoutes;