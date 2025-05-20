const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    seen: { type: Boolean, default: false }, // New field for seen status
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", MessageSchema);
