const Notification = require("../models/Notification");

const getNotifications = async (req, res) => {
    res.send("Get notifications logic here");
};

const markAsRead = async (req, res) => {
    res.send("Mark notification as read logic here");
};

module.exports = { getNotifications, markAsRead };
