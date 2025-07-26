const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    profilePic: {
      url: { type: String, default: "https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2264922221.jpg" },         // Cloudinary secure_url
      public_id: { type: String, default: "" }     // Cloudinary public_id
    },
    coverPhoto: { type: String, default: "" },
    bio: { type: String, default: "" },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    isVerified: { type: Boolean, default: false },
    googleId: { type: String, default: null }, // For Google OAuth

    // 🔑 Forgot password fields
    resetToken: { type: String },
    resetTokenExpires: { type: Date },

    fcmToken: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Plugin for password hashing & local auth
UserSchema.plugin(passportLocalMongoose, { usernameField: "email" });

module.exports = mongoose.model("User", UserSchema);




