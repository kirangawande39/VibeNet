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


const seenMessages = async (req,res)=>{
     try {
        const { chatId } = req.params;
        const userId = req.user.id; 
        
        // Assume auth middleware sets this

        // console.log("chatId"+chatId)
        // console.log("userId"+userId)

        // Update all messages in chat where receiver is current user and message is not sent by this user
        const updatedMessage=await Message.updateMany(
            { chatId, sender: { $ne: userId }, seen: false },
            { $set: { seen: true } }
        );

        // console.log("updatedMessage", updatedMessage);


        res.status(200).json({ message: "Messages marked as seen" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
}


const deleteMessage = async (req, res) => {
  try {
    const messageId = req.params.msgId;
    // console.log("Delete Message is here");
    // console.log("Message ID:", messageId);

    // Check if message exists
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    // Delete message
    await Message.findByIdAndDelete(messageId);

    return res.status(200).json({ success: true, message: "Message deleted successfully" });
  } catch (error) {
    console.error("Error deleting message:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = { sendMessage, getMessages ,seenMessages,deleteMessage};
