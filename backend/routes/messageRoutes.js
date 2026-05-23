const express = require("express");
const { sendMessage, getMessages, seenMessages,deleteMessage,sendImage,getUnseenMessageCounts } = require("../controllers/messageController");
const { protect } = require("../middlewares/authMiddleware");

const multer = require('multer');
const { chatImageStorage } = require('../config/cloudConfig');  

const storage=multer.memoryStorage();

const upload = multer({ storage });
  


const router = express.Router();


router.get("/unseen-counts", protect, getUnseenMessageCounts);

router.post("/", protect, sendMessage); // Send a message
router.get("/:chatId", protect, getMessages); // Get all messages in a chat
// Mark message(s) as seen for a chat
router.put('/seen/:chatId', protect , seenMessages);

router.post("/image", upload.single("image"), protect,  sendImage); // Send a message
router.delete('/:msgId',protect, deleteMessage)

module.exports = router;
