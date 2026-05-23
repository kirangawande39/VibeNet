const messageServices = require("../services/messageService");

// send message
const sendMessage = async (req, res, next) => {
  try {
    const result = await messageServices.sendMessage(req);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

// get messages
const getMessages = async (req, res, next) => {
  try {
    const result = await messageServices.getMessages(req);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

// seen messages
const seenMessages = async (req, res, next) => {
  try {
    const result = await messageServices.seenMessages(req);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

// delete message
const deleteMessage = async (req, res, next) => {
  try {
    const result = await messageServices.deleteMessage(req);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

// send image
const sendImage = async (req, res, next) => {
  try {
    const result = await messageServices.sendImage(req);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

// unseen count
const getUnseenMessageCounts = async (req, res, next) => {
  try {
    const result = await messageServices.getUnseenMessageCounts(req);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  sendMessage,
  getMessages,
  seenMessages,
  deleteMessage,
  sendImage,
  getUnseenMessageCounts
};