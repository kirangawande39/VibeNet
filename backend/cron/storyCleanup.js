const cron = require("node-cron");
const Story = require("../models/Story");
const { cloudinary } = require("../config/cloudConfig");

console.log("🚀 Story Cleanup Cron Job File Loaded");

// Schedule: runs every minute for quick testing; change as needed
cron.schedule("0 * * * * *", async () => {
  const now = new Date();
  console.log("Cron Running - Story Cleanup Task");

  try {
    const expiredStories = await Story.find({ expiresAt: { $lte: now } });

    if (expiredStories.length === 0) {
      console.log("No expired stories found.");
      return;
    }
    

    for (const story of expiredStories) {


      // console.log("Story exp ::",story)

      // const publicId = extractPublicId(story.publicId);
      
      if (story.publicId) {
        try {
          // console.log("publicId story ::",story.publicId)
          await cloudinary.uploader.destroy(story.publicId);

          // console.log(`✅ Deleted from Cloudinary: ${story.publicId}`);

        } catch (cloudErr) {
          console.error(`❌ Cloudinary deletion error for ${story.publicId}:`, cloudErr);
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




