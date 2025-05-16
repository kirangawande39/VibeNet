const Message = require("../models/Message");
const Chat = require("../models/Chat");

// 👉 Send a message
const sendMessage = async (req, res) => {


    const { chatId, text } = req.body;
    const sender = req.user.id; // From protect middleware
    console.log("send message is here")
    console.log('ChatId :'+chatId);
    console.log('Text :'+text);
    console.log('Sender :'+sender);
    try {
        const message = new Message({
            chatId,
            sender,
            text,
        });

        const savedMessage = await message.save();

        // Update the last message in chat
        await Chat.findByIdAndUpdate(chatId, {
            lastMessage: text,
        });

        console.log("SaveMessage :"+savedMessage)

        res.status(201).json(savedMessage);
    } catch (err) {
        res.status(500).json({ message: "Failed to send message", error: err.message });
    }
};

// 👉 Get all messages of a chat
const getMessages = async (req, res) => {
    const { chatId } = req.params;
    console.log("Gell all message route is here");
    try {
        const messages = await Message.find({ chatId })
            .populate("sender", "name profilePic") // Optional: if you want sender info
            .sort({ createdAt: 1 });

        res.status(200).json(messages);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch messages", error: err.message });
    }
};

module.exports = { sendMessage, getMessages };
