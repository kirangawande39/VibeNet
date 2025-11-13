const { cloudinary } = require('../config/cloudConfig');
const Message = require("../models/Message");
const Chat = require("../models/Chat");
const mongoose = require("mongoose")

const { generateBotReply } = require("../utils/botReplyLogic.js");
const User = require('../models/User.js');
const sendNotification = require('../utils/sendNotification.js');

const { getAIReply } = require("../utils/botReplay.js");

const BOT_USER_ID = process.env.BOT_USER_ID;


const sendMessage = async (req, res, next) => {
  // console.log("✅ send message route is here");

  const { chatId, receiverId, text } = req.body;
  const sender = req.user.id;

  // console.log("chatId::", chatId);
  // console.log("sender::", sender);
  // console.log("receiverId::", receiverId);

  try {
    // Step 1: Save user message
    const message = new Message({ chatId, sender, text });
    const savedMessage = await message.save();
    // console.log("✅ Message saved:", savedMessage);

    // Step 2: Update chat last message
    await Chat.findByIdAndUpdate(chatId, { lastMessage: text });

    const receiverUser = await User.findById(receiverId).select('fcmToken');

    const fcmToken = receiverUser?.fcmToken;


    if (fcmToken) {
      sendNotification(fcmToken, "new message form VibeNet", text);
    }



    // Step 3: Emit user message
    if (req.io) {
      // console.log("📡 Emitting receive-message from backend (user)");
      req.io.to(chatId).emit("receive-message", {
        ...savedMessage._doc,
        sender: {
          _id: sender,
          name: req.user.name || "User",
          profilePic: req.user.profilePic || "",
        },
      });
    }

    // const boatreplay=await getAIReply(text);

    // console.log("boatreplay ::",boatreplay);



    // Step 4: Check if chat has bot and sender is not bot
    const chat = await Chat.findById(chatId);
    if (chat && chat.members.includes(BOT_USER_ID) && sender !== BOT_USER_ID) {
      // ✅ Step 5: Await bot reply
      let botReplyText;
      try {
        botReplyText = await getAIReply(text); // 💡 FIXED
      } catch (err) {
        console.error("🤖 Bot failed:", err.message);
        botReplyText = "Sorry, I'm having trouble replying right now. 😔";
      }

      // Step 6: Save bot message
      const botMessage = new Message({
        chatId,
        sender: BOT_USER_ID,
        receiver: sender,
        text: botReplyText,
        seen: true,
      });

      const savedBotMessage = await botMessage.save();

      // Step 7: Update chat with bot's reply
      await Chat.findByIdAndUpdate(chatId, { lastMessage: botReplyText });

      // Step 8: Emit bot reply
      if (req.io) {
        // console.log("📡 Emitting bot receive-message from backend");
        req.io.to(chatId).emit("receive-message", {
          ...savedBotMessage._doc,
          sender: {
            _id: BOT_USER_ID,
            name: "VibeBot",
            profilePic: {
              url: "https://png.pngtree.com/png-clipart/20230401/original/pngtree-smart-chatbot-cartoon-clipart-png-image_9015126.png"
            }
          }
        });
      }
    }

    // Final: Respond to sender
    res.status(201).json(savedMessage);
  } catch (err) {
    next(err);
  }
};



// 👉 Get all messages of a chat
const getMessages = async (req, res, next) => {
  const { chatId } = req.params;

  try {
    const messages = await Message.find({ chatId })
      .populate("sender", "name profilePic")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (err) {
    next(err);
  }
};

// 👉 Seen messages
const seenMessages = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    await Message.updateMany(
      { chatId, sender: { $ne: userId }, seen: false },
      { $set: { seen: true } }
    );

    res.status(200).json({ message: "Messages marked as seen" });
  } catch (err) {
    next(err);
  }
};



// 👉 Delete a message
const deleteMessage = async (req, res, next) => {
  try {
    const messageId = req.params.msgId;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    if (message.image?.public_id) {
      await cloudinary.uploader.destroy(message.image.public_id);
    }

    await Message.findByIdAndDelete(messageId);

    res.status(200).json({ success: true, message: "Message and image deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// 👉 Send image message
const sendImage = async (req, res, next) => {
  try {
    const { chatId } = req.body;
    const sender = req.user.id;

    if (!req.file || !chatId) {
      return res.status(400).json({ error: "Missing image or chatId" });
    }

    const imageUrl = req.file.path;
    const publicId = req.file.filename;

    const savedMessage = new Message({
      chatId,
      sender,
      image: {
        url: imageUrl,
        public_id: publicId,
      },
    });

    await savedMessage.save();
    res.status(201).json(savedMessage);
  } catch (err) {
    next(err);
  }
};



const getUnseenMessageCounts = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const user = await User.findById(userId).select("isPrivate");

    // console.log("User privacy status:", user.isPrivate);

    const unseenCounts = await Message.aggregate([
      {
        $match: {
          seen: false,
          sender: { $ne: userId },
        },
      },
      {
        $lookup: {
          from: "chats",
          localField: "chatId",
          foreignField: "_id",
          as: "chat",
        },
      },
      {
        $unwind: "$chat"
      },
      {
        $match: {
          "chat.members": userId
        }
      },
      {
        $group: {
          _id: "$chatId",
          unseenCount: { $sum: 1 }
        }
      }
    ]);

    // console.log("Unseen Counts:", unseenCounts);
    res.status(200).json({ success: true, data: unseenCounts ,privacyStatus:user.isPrivate });
  } catch (err) {
    console.error("Aggregation error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};










module.exports = { sendMessage, getMessages, seenMessages, deleteMessage, sendImage, getUnseenMessageCounts };
