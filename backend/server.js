const express = require("express");
require("dotenv").config();
const callDB = require("./config/db");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const flash = require("connect-flash");
const MongoStore = require('connect-mongo');

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

require("./config/passport"); // Passport Config

const app = express();
const PORT = process.env.PORT || 5000;

// Call MongoDB Connection
callDB();

// Middleware
app.use(express.json());

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
}));

app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));


const mongodb_url=process.env.MONGODB_URL;
const store = MongoStore.create({
  mongoUrl: mongodb_url,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
})
// Session Middleware
const sessionOption = {
  store,
  secret: process.env.SECRET || "defaultsecret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
  },
};

app.use(session(sessionOption));
app.use(flash()); // Flash messages should be after session

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Default Route
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

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
