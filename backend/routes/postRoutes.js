const express = require("express");
const { createPost, getAllPosts, getPostsByUserId, deletePost } = require("../controllers/postController");
const multer = require('multer');
const { PostImageStorage } = require('../config/cloudConfig');  
const { protect } = require("../middlewares/authMiddleware");

const storage=multer.memoryStorage();

const upload = multer({ storage }); 


const router = express.Router();

router.post("/:id", upload.single('postImage'), protect, createPost); // Image upload with Cloudinary
router.get("/", getAllPosts);
router.get("/:id", getPostsByUserId);
router.delete("/:id", protect, deletePost);

// router.post("/:id", upload.single('postImage'), (req, res) => {
//   console.log("post route is here now");

//   const imageUrl = req.file ? req.file.path : "jlkdfjasdlfj";

// console.log("image url object: " + JSON.stringify(imageUrl));


//   // Send response to client
//   res.status(200).json({ message: "Image received", imageUrl });
// });


module.exports = router;
