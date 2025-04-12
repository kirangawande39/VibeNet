const mongoose = require("mongoose");

const StorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    image: { type: String, required: true },
    expiresAt: { type: Date, required: true }, // Story expires after 24 hours
  },
  { timestamps: true }
);

module.exports = mongoose.model("Story", StorySchema);
