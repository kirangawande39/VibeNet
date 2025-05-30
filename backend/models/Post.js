const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    image: { type: String, default: "" }, // Cloudinary secure URL
    imagePublicId: { type: String, default: "" }, // Cloudinary public_id
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);
