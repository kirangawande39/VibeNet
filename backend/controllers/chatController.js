const Chat = require("../models/Chat");

const createChat = async (req, res) => {
    res.send("Create chat logic here");
};

const getUserChats = async (req, res) => {
    res.send("Get user chats logic here");
};

module.exports = { createChat, getUserChats };
