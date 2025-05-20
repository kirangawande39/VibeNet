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

// Import Routes
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

require("./config/passport");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

const PORT = process.env.PORT || 5000;

callDB();

app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
}));
app.use(express.urlencoded({ extended: true }));
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

app.get("/", (req, res) => {
  res.send("Hello, I am root route");
});

// API Routes
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

// ⚡️ Socket.io
const onlineUsers = new Map();
// ... baaki code jaisa hai

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("user-online", (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit("online-users", Array.from(onlineUsers.keys()));
  });

  socket.on("join-chat", (chatId) => {
    socket.join(chatId);
  });

  socket.on("send-message", ({ chatId, message }) => {
    socket.to(chatId).emit("receive-message", message);
  });

  socket.on("typing", ({ chatId, senderId }) => {
    socket.to(chatId).emit("typing", { senderId });
  });

  socket.on("stop-typing", ({ chatId, senderId }) => {
    socket.to(chatId).emit("stop-typing", { senderId });
  });

  // Naya event for marking messages as seen
 // Socket.io in server.js
socket.on("mark-seen", async ({ chatId, userId }) => {
  try {
    const result = await Message.updateMany(
      { chatId, sender: { $ne: userId }, seen: false },
      { $set: { seen: true } }
    );

    // Seen hone ke baad message bhej do client ko
    io.to(chatId).emit("messages-seen", { chatId, seenBy: userId });
  } catch (err) {
    console.error("Error in mark-seen socket:", err);
  }
});


  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
    for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        io.emit("online-users", Array.from(onlineUsers.keys()));
        break;
      }
    }
  });
});


// Export io if needed in other files
module.exports = { io };

server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
