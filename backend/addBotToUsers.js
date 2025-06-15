const mongoose = require("mongoose");
const User = require("./models/User"); // path adjust kar apne project ke hisab se

const MONGO_URI = "mongodb://localhost:27017/VibeNet"; // ya tera Mongo Atlas ka URI
const BOT_USER_ID = "684db4e39d76770c4d55dd7b"; // yaha tu chatbot ka _id daal

async function addBotToAllUsers() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("📦 MongoDB connected");

    // Sab users nikaalo except chatbot
    const users = await User.find({ _id: { $ne: BOT_USER_ID } });

    for (const user of users) {
      // Agar already follow nahi kar raha chatbot ko
      const alreadyFollowing = user.following.includes(BOT_USER_ID);
      const alreadyFollowedBy = user.followers.includes(BOT_USER_ID);

      if (!alreadyFollowing) {
        user.following.push(BOT_USER_ID);
      }
      if (!alreadyFollowedBy) {
        user.followers.push(BOT_USER_ID);
      }

      await user.save();
      console.log(`✅ Bot added to: ${user.username}`);
    }

    console.log("🎉 All users updated with chatbot.");
    process.exit();
  } catch (error) {
    console.error("❌ Error adding bot to users:", error);
    process.exit(1);
  }
}

addBotToAllUsers();
