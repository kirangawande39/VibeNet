const Story = require("../models/Story");

const createStory = async (req, res) => {
    res.send("Create story logic here");
};

const getStories = async (req, res) => {
    res.send("Get stories logic here");
};

const deleteStory = async (req, res) => {
    res.send("Delete story logic here");
};

module.exports = { createStory, getStories, deleteStory };
