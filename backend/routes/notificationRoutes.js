const express = require("express");
const { getNotifications, markAsRead } = require("../controllers/notificationController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/",  getNotifications); // Get all notifications for user
router.put("/:id/read", markAsRead); // Mark a notification as read

module.exports = router;
