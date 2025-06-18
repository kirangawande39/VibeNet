const express = require("express");
require("dotenv").config();
const callDB = require("./config/db");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const flash = require("connect-flash");
const MongoStore = require("connect-mongo");
const http = require("http");
const { Server } = require("socket.io");

require("./config/passport");
require("./cron/storyCleanup.js");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const commentRoutes = require("./routes/commentRoutes");
const likeRoutes = require("./routes/likeRoutes");
const followRoutes = require("./routes/followRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const storyRoutes = require("./routes/storyRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");

const errorHandler = require("./middlewares/errorHandler");
const notFound = require("./middlewares/notFound");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
});


const PORT = process.env.PORT || 5000;
callDB();

// ✅ Online Status Maps: move these to top
const onlineUsers = new Map();
const lastSeen = new Map();

app.use((req, res, next) => {
  req.io = io;
  next();
});
// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
}));

app.use("/uploads", express.static("uploads"));

const store = MongoStore.create({
  mongoUrl: process.env.MONGODB_URL,
  crypto: { secret: process.env.SECRET },
  touchAfter: 24 * 3600,
});


app.use(session({
  store,
  secret: process.env.SECRET || "defaultsecret",
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 7 * 24 * 60 * 60 * 1000, httpOnly: true },
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.get("/", (req, res) => {
  res.send("Hello, I am root route");
});
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

// ✅ Online Status API (after maps are declared)
app.get("/api/online-status", (req, res) => {
  // console.log("🟢 /api/online-status CALLED");
  // console.log("Online Users:", Array.from(onlineUsers.keys()));
  // console.log("Last Seen:", Object.fromEntries(lastSeen));

  res.json({
    onlineUsers: Array.from(onlineUsers.keys()),
    lastSeen: Object.fromEntries(lastSeen),
  });
});

// Error Middlewares
app.use(notFound);
app.use(errorHandler);

// ⚡️ Socket.io Logic
io.on("connection", (socket) => {
  // console.log("Socket connected:", socket.id);

  socket.on("user-online", (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit("online-users", Array.from(onlineUsers.keys()));
  });

  socket.on("join-chat", (chatId) => socket.join(chatId));

  socket.on("send-message", ({ chatId, message }) => {
    socket.to(chatId).emit("receive-message", message);
  });

  socket.on("join-post", (postId) => {
    socket.join(postId);
    // console.log(`Socket ${socket.id} joined room ${postId}`);
  });

  socket.on("new-comment", (comment) => {
    const { postId } = comment;
    if (postId) socket.to(postId).emit("new-comment", comment);
  });

  socket.on("delete-comment", ({ commentId, postId }) => {
    if (postId) socket.to(postId).emit("delete-comment", { commentId });
  });

  socket.on("typing", ({ chatId, senderId }) => {
    socket.to(chatId).emit("typing", { senderId });
  });

  socket.on("stop-typing", ({ chatId, senderId }) => {
    socket.to(chatId).emit("stop-typing", { senderId });
  });

  socket.on("delete-message", ({ chatId, msgId }) => {
    socket.to(chatId).emit("delete-message", { msgId });
  });

  socket.on("message-seen", ({ chatId, userId }) => {
    socket.to(chatId).emit("message-seen", { chatId, userId });
  });

  socket.on("mark-seen", ({ chatId, userId }) => {
    socket.to(chatId).emit("message-seen", { chatId, seenBy: userId });
  });

  socket.on("disconnect", () => {
    for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        lastSeen.set(userId, new Date().toISOString());
        io.emit("online-users", Array.from(onlineUsers.keys()));
        break;
      }
    }
  });
});

// Server Start
server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

// Optional: export io for other files
module.exports = { io };
