const mongoose = require("mongoose");
const User = require("./models/User"); // path adjust kar apne project ke hisab se
require("dotenv").config();

const MONGO_URI = process.env.MONGO_URI;
const BOT_USER_ID = process.env.BOT_USER_ID;

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
