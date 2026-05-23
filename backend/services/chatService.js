const Chat = require("../models/Chat");

// Create Chat
const createChat = async (req) => {
  const { senderId, receiverId } = req.body;

  // Check if chat already exists
  let chat = await Chat.findOne({
    members: { $all: [senderId, receiverId] }
  });

  if (chat) {
    return { status: 200, data: chat };
  }

  // Create new chat
  chat = new Chat({ members: [senderId, receiverId] });
  await chat.save();

  return { status: 201, data: chat };
};

// Get User Chats
const getUserChats = async (req) => {
  const userId = req.params.userId;

  const chats = await Chat.find({
    members: userId,
    lastMessage: { $ne: "" }
  }).populate("members", "name profilePic");

  return chats;
};

module.exports = { createChat, getUserChats };