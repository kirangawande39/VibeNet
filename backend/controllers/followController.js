const followServices = require("../services/followService");

const followUser = async (req, res, next) => {
  try {
    const result = await followServices.followUser(req);
    res.status(result.status).json(result.data);
  } catch (err) {
    next(err);
  }
};

const unfollowUser = async (req, res, next) => {
  try {
    const result = await followServices.unfollowUser(req);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

const removeFollower = async (req, res, next) => {
  try {
    const result = await followServices.removeFollower(req);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

const declineUser = async (req, res, next) => {
  try {
    const result = await followServices.declineUser(req);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

const acceptUser = async (req, res, next) => {
  try {
    const result = await followServices.acceptUser(req);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

const followBack = async (req, res, next) => {
  try {
    const result = await followServices.followBack(req);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  followUser,
  unfollowUser,
  removeFollower,
  declineUser,
  acceptUser,
  followBack,
};