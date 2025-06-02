const mongoose = require("mongoose");

const StorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    mediaUrl: { type: String, required: true }, // image or video URL
    mediaType: { type: String, enum: ["image", "video"], required: true },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    },
    seenBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // ✅ New field added
  },
  { timestamps: true }
);

// TTL index for automatic deletion
// StorySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Story", StorySchema);
