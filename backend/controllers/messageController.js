const { cloudinary } = require('../config/cloudConfig');
const Message = require("../models/Message");
const Chat = require("../models/Chat");

// 👉 Send a message
const sendMessage = async (req, res, next) => {
  const { chatId, text } = req.body;
  const sender = req.user.id;

  try {
    const message = new Message({ chatId, sender, text });
    const savedMessage = await message.save();

    await Chat.findByIdAndUpdate(chatId, { lastMessage: text });

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

module.exports = { sendMessage, getMessages, seenMessages, deleteMessage, sendImage };
