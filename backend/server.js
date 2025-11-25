const express = require("express");
require("dotenv").config();
const callDB = require("./config/db");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");


const MongoStore = require("connect-mongo"); // this line used to  store user session in mongodb

//Express app ke liye ek HTTP server banane ke liye use hota hai
const http = require("http");

//real-time features (chat, notifications etc.) ke liye use hota hai
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
const groupRoutes = require("./routes/groupRoutes.js")




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

// Online Status Maps: move these to top
const onlineUsers = new Map();
const lastSeen = new Map();

app.use((req, res, next) => {
  req.io = io;
  next();
});
9
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
app.use("/api/groups", groupRoutes)

// Online Status API (after maps are declared)
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




io.on("connection", (socket) => {


  // Jab user online hota hai, uska socket.id ko userId se map karo
  socket.on("user-online", (userId) => {
    onlineUsers.set(userId, socket.id); // userId -> socketId
    io.emit("online-users", Array.from(onlineUsers.keys()));
  });

  socket.on("join-chat", (chatId) => socket.join(chatId));


  socket.on("send-message", ({ chatId, message }) => {
    socket.to(chatId).emit("receive-message", {
      ...message,
      chatId,
    });

  });


  socket.on("join-post", (postId) => {
    socket.join(postId);
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



  // forward typing indicator to other users in the room
  socket.on("group-typing", ({ groupId, user }) => {
    // broadcast to all in room except sender
    socket.to(groupId).emit("user-typing", { userId: user._id, username: user.username , icon: user.icon });
      // console.log("groupId::",groupId)
    // console.log("user::",user)
  });

  socket.on("stop-group-typing", ({ groupId, userId }) => {
    socket.to(groupId).emit("user-stop-typing", { userId });
    // console.log("groupId::",groupId)
    // console.log("userId::",userId)
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

  socket.on("join-group", (groupId) => {
    socket.join(groupId);
    // console.log("User joined group:", groupId);
  });

  // When message sent inside group
  // socket.on("send-group-message", ({ groupId, message }) => {
  //   io.to(groupId).emit("receive-group-message", message);
  //   console.log("groupId::",groupId)
  //   console.log("message::",message)
  // });


  socket.on("disconnect", () => {
    for (let [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId); // User offline hua
        lastSeen.set(userId, new Date().toISOString()); // Uska last seen store karo
        io.emit("online-users", Array.from(onlineUsers.keys())); // Updated list sabko bhejo
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
