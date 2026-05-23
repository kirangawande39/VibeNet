const groupServices = require("../services/groupService");

const cretaeNewGroup = async (req, res, next) => {
  try {
    const result = await groupServices.cretaeNewGroup(req);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

const getGroups = async (req, res, next) => {
  try {
    const result = await groupServices.getGroups(req);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

const sendGroupMessage = async (req, res, next) => {
  // console.log("sendGroupMessage controller called:" )
  try {
    const result = await groupServices.sendGroupMessage(req);
    // console.log("Result:",result);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

const getGroupsMessage = async (req, res, next) => {
  try {
    const result = await groupServices.getGroupsMessage(req);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

const addGropuMembers = async (req, res, next) => {
  try {
    const result = await groupServices.addGropuMembers(req);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

const deleteGroupByCreator = async (req, res, next) => {
  try {
    const result = await groupServices.deleteGroupByCreator(req);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  cretaeNewGroup,
  getGroups,
  sendGroupMessage,
  getGroupsMessage,
  addGropuMembers,
  deleteGroupByCreator
};