const { cloudinary } = require("../config/cloudConfig");
const Message = require("../models/Message");
const Chat = require("../models/Chat");
const mongoose = require("mongoose");
const User = require("../models/User");
const { getAIReply } = require("../utils/botReplay.js");
const { notificationQueue } = require("../queues/notificationQueue.js");

const BOT_USER_ID = process.env.BOT_USER_ID;
const sharp = require("sharp");

const streamifier =
  require("streamifier");


// send message
const sendMessage = async (req) => {

  const { chatId, receiverId, text } = req.body;
  const sender = req.user.id;

  // save user message
  const message = new Message({ chatId, sender, text });
  const savedMessage = await message.save();

  // update last message
  await Chat.findByIdAndUpdate(chatId, { lastMessage: text });

  const receiverUser = await User.findById(receiverId).select("fcmToken");
  const fcmToken = receiverUser?.fcmToken;

  // send notification
  if (fcmToken) {
    await notificationQueue.add("send-notification", {
      fcmToken,
      title: "new message form VibeNet",
      text,
    });
  }

  // socket emit user message
  if (req.io) {
    req.io.to(chatId).emit("receive-message", {
      ...savedMessage._doc,
      sender: {
        _id: sender,
        name: req.user.name || "User",
        profilePic: req.user.profilePic || "",
      },
    });
  }

  // bot reply logic
  const chat = await Chat.findById(chatId);

  if (chat && chat.members.includes(BOT_USER_ID) && sender !== BOT_USER_ID) {

    let botReplyText;

    try {
      botReplyText = await getAIReply(text);
    } catch (err) {
      botReplyText = "Sorry, I'm having trouble replying right now. 😔";
    }

    const botMessage = new Message({
      chatId,
      sender: BOT_USER_ID,
      receiver: sender,
      text: botReplyText,
      seen: true,
    });

    const savedBotMessage = await botMessage.save();

    await Chat.findByIdAndUpdate(chatId, { lastMessage: botReplyText });

    // emit bot message
    if (req.io) {
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

  return savedMessage;
};


// get messages
const getMessages = async (req) => {

  const { chatId } = req.params;
  const { page = 1, limit = 20 } = req.query;

  const skip = (page - 1) * limit;

  const messages = await Message.find({ chatId })
    .populate("sender", "name profilePic")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  return messages.reverse();
};


// seen messages
const seenMessages = async (req) => {

  const { chatId } = req.params;
  const userId = req.user.id;

  await Message.updateMany(
    { chatId, sender: { $ne: userId }, seen: false },
    { $set: { seen: true } }
  );

  return { message: "Messages marked as seen" };
};


// delete message
const deleteMessage = async (req) => {

  const messageId = req.params.msgId;

  const message = await Message.findById(messageId);
  if (!message) {
    throw new Error("Message not found");
  }

  if (message.image?.public_id) {
    await cloudinary.uploader.destroy(message.image.public_id);
  }

  await Message.findByIdAndDelete(messageId);

  return { success: true, message: "Message and image deleted successfully" };
};


// send image
const sendImage = async (req) => {
  // console.log("sendImage called");
  
  const { chatId } = req.body;

  const sender = req.user.id;

  if (!req.file || !chatId) {

    throw new Error(
      "Missing image or chatId"
    );

  }

  // Compress Chat Image
  const compressedBuffer =
    await sharp(req.file.buffer)

      .resize(600)

      .webp({
        quality: 60,
      })

      .toBuffer();

  // Upload Compressed Image
  const result =
    await new Promise(
      (resolve, reject) => {

        const stream =
          cloudinary
            .uploader
            .upload_stream(

              {
                folder:
                  "chatImages",
              },

              (
                error,
                result
              ) => {

                if (error)
                  reject(error);

                else
                  resolve(result);

              }
            );

        streamifier
          .createReadStream(
            compressedBuffer
          )
          .pipe(stream);

      }
    );

  // Save Message
  const savedMessage =
    new Message({

      chatId,

      sender,

      image: {

        url:
          result.secure_url,

        public_id:
          result.public_id,

      },

    });

  await savedMessage.save();

  return savedMessage;

};




// unseen count
const getUnseenMessageCounts = async (req) => {

  const userId = new mongoose.Types.ObjectId(req.user.id);

  const user = await User.findById(userId).select("isPrivate");

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

  return {
    success: true,
    data: unseenCounts,
    privacyStatus: user.isPrivate
  };
};


module.exports = {
  sendMessage,
  getMessages,
  seenMessages,
  deleteMessage,
  sendImage,
  getUnseenMessageCounts
};