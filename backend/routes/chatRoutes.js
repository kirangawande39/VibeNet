const express = require("express");
const { createChat, getUserChats } = require("../controllers/chatController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/",  createChat); // Start a new chat
router.get("/:userId", getUserChats); // Get user chats

module.exports = router;
