const Chat = require("../models/Chat");

// 👉 Create Chat (only once per user pair)
const createChat = async (req, res) => {
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
        res.status(500).json({ message: "Error creating chat", error: err.message });
    }
};

// 👉 Get All Chats of a User
const getUserChats = async (req, res) => {
    const userId = req.params.userId;

    try {
        const chats = await Chat.find({
            members: userId,
            lastMessage: { $ne: "" } // optional: only active chats
        }).populate("members", "name profilePic"); // optional if you want user info

        res.status(200).json(chats);
    } catch (err) {
        res.status(500).json({ message: "Error fetching chats", error: err.message });
    }
};

module.exports = { createChat, getUserChats };
