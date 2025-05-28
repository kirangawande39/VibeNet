const { cloudinary } = require('../config/cloudConfig');
const Message = require("../models/Message");
const Chat = require("../models/Chat");

// 👉 Send a message
const sendMessage = async (req, res) => {


    const { chatId, text } = req.body;
    const sender = req.user.id; // From protect middleware
    console.log("send message is here")
    console.log('ChatId :' + chatId);
    console.log('Text :' + text);
    console.log('Sender :' + sender);
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

        console.log("SaveMessage :" + savedMessage)

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


const seenMessages = async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.user.id;

        // Assume auth middleware sets this

        // console.log("chatId"+chatId)
        // console.log("userId"+userId)

        // Update all messages in chat where receiver is current user and message is not sent by this user
        const updatedMessage = await Message.updateMany(
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

        // Find message
        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ success: false, message: "Message not found" });
        }

        // Delete from Cloudinary if image and public_id exist
        if (message.image && message.image.public_id) {
            await cloudinary.uploader.destroy(message.image.public_id); // already includes 'VibeNet/'
            console.log("✅ Deleted image from Cloudinary:", message.image.public_id);
        }

        // Delete from DB
        await Message.findByIdAndDelete(messageId);

        return res.status(200).json({ success: true, message: "Message and image deleted successfully" });
    } catch (error) {
        console.error("❌ Error deleting message:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const sendImage = async (req, res) => {
  try {
    const { chatId } = req.body;
    const sender = req.user.id;

    if (!req.file || !chatId) {
      return res.status(400).json({ error: "Missing image or chatId" });
    }

    // multer-storage-cloudinary already uploaded the image to cloudinary
    const imageUrl = req.file.path;         // secure_url of the image
    const publicId = req.file.filename;     // includes folder name e.g., "VibeNet/abc123"

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
    console.error("Error uploading image message:", err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { sendMessage, getMessages, seenMessages, deleteMessage, sendImage };
