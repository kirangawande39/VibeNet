const Chat = require("../models/Chat");

// 👉 Create Chat (only once per user pair)
const createChat = async (req, res, next) => {
  const { senderId, receiverId } = req.body;

  try {
    // Check if chat already exists
    let chat = await Chat.findOne({
      members: { $all: [senderId, receiverId] }
    });

    if (chat) return res.status(200).json(chat);

    // If not exists, create new chat
    chat = new Chat({ members: [senderId, receiverId] });
    await chat.save();

    res.status(201).json(chat);
  } catch (err) {
    next(err);
  }
};

// 👉 Get All Chats of a User
const getUserChats = async (req, res, next) => {
  const userId = req.params.userId;

  try {
    const chats = await Chat.find({
      members: userId,
      lastMessage: { $ne: "" }
    }).populate("members", "name profilePic");
     console.log("chsts"+chats)
    res.status(200).json(chats);
  } catch (err) {
    next(err);
  }
};

module.exports = { createChat, getUserChats };
