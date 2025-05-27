const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, default: null }, // Optional text message

    // Image object
    image: {
      url: { type: String, default: null },         // Cloudinary image URL
      public_id: { type: String, default: null },    // Cloudinary public_id (used for deletion)
    },

    seen: { type: Boolean, default: false }, // Seen status
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", MessageSchema);
