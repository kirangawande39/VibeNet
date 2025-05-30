const cron = require("node-cron");
const Story = require("../models/Story");
const { cloudinary } = require("../config/cloudConfig");

console.log("🚀 Story Cleanup Cron Job File Loaded");

// Schedule: runs every minute for quick testing; change as needed
cron.schedule("* * * * *", async () => {
  const now = new Date();
  console.log("🕐 Cron Running - Story Cleanup Task");

  try {
    const expiredStories = await Story.find({ expiresAt: { $lte: now } });

    if (expiredStories.length === 0) {
      console.log("👌 No expired stories found.");
      return;
    }

    for (const story of expiredStories) {
      const publicId = extractPublicId(story.mediaUrl);

      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId);
          console.log(`✅ Deleted from Cloudinary: ${publicId}`);
        } catch (cloudErr) {
          console.error(`❌ Cloudinary deletion error for ${publicId}:`, cloudErr);
        }
      } else {
        console.warn(`⚠️ Could not extract public_id from URL: ${story.mediaUrl}`);
      }

      await Story.findByIdAndDelete(story._id);
      console.log(`🗑️ Deleted story from DB: ${story._id}`);
    }
  } catch (err) {
    console.error("❌ Error during story cleanup:", err);
  }
});

// Helper: Extracts public_id from Cloudinary mediaUrl (like 'VibeNet/filename')
function extractPublicId(url) {
  try {
    const parts = url.split("/");
    const fileName = parts.pop().split(".")[0]; // filename without extension
    const folder = parts.pop();                  // folder name, e.g. "VibeNet"
    return `${folder}/${fileName}`;
  } catch (err) {
    console.error("⚠️ Failed to extract public_id from URL:", url);
    return null;
  }
}
