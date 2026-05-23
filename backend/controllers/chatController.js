const chatServices = require("../services/chatService");

// Create Chat
const createChat = async (req, res, next) => {
  try {
    const result = await chatServices.createChat(req);
    res.status(result.status).json(result.data);
  } catch (err) {
    next(err);
  }
};

// Get User Chats
const getUserChats = async (req, res, next) => {
  try {
    const result = await chatServices.getUserChats(req);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = { createChat, getUserChats };