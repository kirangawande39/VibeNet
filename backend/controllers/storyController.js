const Story = require("../models/Story");




const createStory = async (req, res) => {
    console.log("Create story logic here");
    try {
        const file = req.file;
        console.log("filename: "+file.filename)
        if (!file) return res.status(400).json({ message: "No file uploaded" });

        const mediaType = file.mimetype.startsWith("video") ? "video" : "image";

        const story = await Story.create({
            user: req.user.id, // assuming user is authenticated
            mediaUrl: `http://localhost:5000/uploads/${file.filename}`,
            mediaType,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });

        console.log("Stroy :"+story);
        

        res.status(201).json({ success: true, story });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getStories = async (req, res) => {
    console.log("Get stories logic here");

    try{
        const  stories=await Story.find().populate('user');
        console.log("Stories:"+stories);
        res.status(201).json({success: true, stories });
    }
    catch(err){
        res.status(500).json({ message: err.message });
    }
};

const deleteStory = async (req, res) => {
    res.send("Delete story logic here");
};

module.exports = { createStory, getStories, deleteStory };
