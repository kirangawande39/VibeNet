const express = require("express");
const router = express.Router();


const { onlineUsers, lastSeen } = require("../socket/socket");

router.get("/", (req, res) => {
  res.json({
    onlineUsers: Array.from(onlineUsers.keys()),
    lastSeen: Object.fromEntries(lastSeen),
  });
});

module.exports = router;