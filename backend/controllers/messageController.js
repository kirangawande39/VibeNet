const Message = require("../models/Message");

const sendMessage = async (req, res) => {
    res.send("Send message logic here");
};

const getMessages = async (req, res) => {
    res.send("Get messages logic here");
};

module.exports = { sendMessage, getMessages };
