const express = require("express");
const { createChat, getUserChats } = require("../controllers/chatController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", protect,  createChat); // Start a new chat
router.get("/:userId", protect, getUserChats); // Get user chats

module.exports = router;
