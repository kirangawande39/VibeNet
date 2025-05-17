const express = require("express");
const { createPost, getAllPosts, getPostsByUserId, deletePost } = require("../controllers/postController");
const multer = require('multer');
const { storage } = require('../config/cloudConfig');  // yaha import karo
const upload = multer({ storage });  // CloudinaryStorage se multer banayen

const router = express.Router();

router.post("/:id", upload.single('postImage'), createPost); // Image upload with Cloudinary
router.get("/", getAllPosts);
router.get("/:id", getPostsByUserId);
router.delete("/:id", deletePost);

// router.post("/:id", upload.single('postImage'), (req, res) => {
//   console.log("post route is here now");

//   const imageUrl = req.file ? req.file.path : "jlkdfjasdlfj";

// console.log("image url object: " + JSON.stringify(imageUrl));


//   // Send response to client
//   res.status(200).json({ message: "Image received", imageUrl });
// });


module.exports = router;
