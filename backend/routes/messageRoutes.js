const express = require("express");
const { sendMessage, getMessages, seenMessages,deleteMessage } = require("../controllers/messageController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", protect, sendMessage); // Send a message
router.get("/:chatId", protect, getMessages); // Get all messages in a chat
// Mark message(s) as seen for a chat
router.put('/seen/:chatId', protect , seenMessages);

router.delete('/:msgId',protect, deleteMessage)

module.exports = router;
