require('dotenv').config();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const Message = require("../models/Message");
const notificationQueue = require('../queues/notificationQueue');

const Chat = require("../models/Chat");

const BOT_USER_ID = process.env.BOT_USER_ID;

const UI_URL = process.env.FRONTEND_URL;
// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};



const register = async (req, res, next) => {
  try {

    // console.log("Register route called");
    const { name, email, password, username } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error("User already exists");
    }

    const newUser = new User({ name, email, username });

    const registeredUser = await User.register(newUser, password);


    // Add bot to user's followers/following
    registeredUser.followers.push(BOT_USER_ID);
    registeredUser.following.push(BOT_USER_ID);
    await registeredUser.save();

    // Add user to bot's followers/following
    await User.findByIdAndUpdate(BOT_USER_ID, {
      $addToSet: {
        followers: registeredUser._id,
        following: registeredUser._id,
      },
    });

    //  Create chat between user and bot
    const chat = await Chat.create({
      members: [registeredUser._id, BOT_USER_ID],
    });

    // console.log("chat :: " + chat);

    //  Send welcome message in that chat
    const message = await Message.create({
      chatId: chat._id,
      sender: BOT_USER_ID,
      receiver: registeredUser._id,
      text: "👋 Welcome to VibeNet! I'm your assistant bot. Feel free to ask anything.",
    });

    // console.log("message::" + message);

    const fcmToken=process.env.OWNER_TOKEN;

    if (fcmToken) {
      const title = "Admin alert on VibeNet";
      const text = `👤 ${username} registered at ${new Date().toLocaleTimeString()}`;

      await notificationQueue.add("send-info-to-owner", {
        fcmToken,
        title,
        text,
      });
    }


    //  Final response
    res.status(201).json({ message: 'Registration Sucessfully..' });

  } catch (err) {
    next(err);
  }
};


// Login User
const login = async (req, res, next) => {
  try {

    // console.log("login User:", req.user);
    const userId = req.user._id;

    // console.log("userId:", userId);
    const token = generateToken(userId);
    // console.log("Token ::", token);
    // console.log("NODE_ENV:", process.env.NODE_ENV);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });


    const fcmToken = process.env.OWNER_TOKEN;
    if (fcmToken) {
      const title = "New User Login";
      const text = `👤 ${req.user.username} logged in at ${new Date().toLocaleTimeString()}`;

      await notificationQueue.add('send-info-to-owner', {
        fcmToken,
        title,
        text
      })
    }


    res.json({
      success: true,
      message: "Login Successful",
      user: { id: req.user._id, username: req.user.username, email: req.user.email },
      // token,
      redirectUrl: "/"
    });
  } catch (err) {
    next(err);
  }
};




const logout = async (req, res, next) => {
  try {
    // console.log("logout called")
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === 'production',
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully"
    });

  } catch (err) {
    next(err);
  }
};


// Google OAuth
const googleAuth = async (req, res, next) => {
  try {
    cosole.log("google auth route is here")
  } catch (err) {
    next(err);
  }
};

const googleCallBack = async (req, res, next) => {
  try {
    const { _id, username, email } = req.user;

    const googleAuthUser = await User.findById(_id);

    // Check if chat with bot already exists
    const existingBotChat = await Chat.findOne({
      members: { $all: [googleAuthUser._id, BOT_USER_ID] },
    });

    if (!existingBotChat) {
      // Add bot to user's followers/following
      googleAuthUser.followers.push(BOT_USER_ID);
      googleAuthUser.following.push(BOT_USER_ID);
      await googleAuthUser.save();

      // Add user to bot's followers/following
      await User.findByIdAndUpdate(BOT_USER_ID, {
        $addToSet: {
          followers: googleAuthUser._id,
          following: googleAuthUser._id,
        },
      });

      // Create chat between user and bot
      const chat = await Chat.create({
        members: [googleAuthUser._id, BOT_USER_ID],
      });

      // console.log("chat created:", chat);

      //  Send welcome message
      const message = await Message.create({
        chatId: chat._id,
        sender: BOT_USER_ID,
        receiver: googleAuthUser._id,
        text: "👋 Welcome to VibeNet! I'm your assistant bot. Feel free to ask anything.",
      });

      // console.log("message sent:", message);
    }

    const token = generateToken(_id);

    const redirectUrl = `${UI_URL}/google?token=${token}&username=${encodeURIComponent(
      username
    )}&email=${encodeURIComponent(email)}&id=${_id}`;

    res.redirect(redirectUrl);
  } catch (err) {
    next(err);
  }
};

const checkEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Email not found" });
    }

    return res.status(200).json({ message: "Email exists" });
  } catch (err) {
    // Pass any unexpected errors to your global error handler
    next(err);
  }
}

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate new reset token
    const token = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = Date.now() + 3600000; // 1 hour

    user.resetToken = token;
    user.resetTokenExpires = tokenExpiry;

    await user.save();

    res.status(200).json({
      token,
      name: user.name || user.username || "User",
    });
  } catch (err) {
    next(err);
  }
}

const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpires: { $gt: new Date() },
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    user.setPassword(newPassword, async (err) => {
      if (err) return res.status(500).json({ message: "Password reset failed" });

      user.resetToken = undefined;
      user.resetTokenExpires = undefined;
      await user.save();

      res.status(200).json({ message: "Password has been reset successfully" });
    });
  } catch (err) {
    next(err);
  }
}


const check = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ loggedIn: false })
  }


  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);

    if (user) {
      res.json({ loggedIn: true });
    }
  }
  catch (err) {
    return res.status(401).json({ loggedIn: false });
  }
}



module.exports = { register, login, logout, googleAuth, checkEmail, forgotPassword, resetPassword, googleCallBack, check };
