require('dotenv').config();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const Message = require("../models/Message");
const { notificationQueue } = require('../queues/notificationQueue');
const generateToken = require('../utils/generateToken')

const Chat = require("../models/Chat");
const Otp = require("../models/Otp");

const BOT_USER_ID = process.env.BOT_USER_ID;

const UI_URL = process.env.FRONTEND_URL;
const SendOTP = require("../utils/SendOtp");

const otpQueue = require("../queues/otpQueue")
const SendForgotPasswordEmail = require('../utils/SendForgotPasswordEmail');

const passwordForgotQueue = require('../queues/passwordForgotQueue');



const registerUser = async ({ name, email, password, username }) => {
    // console.log("Register route called");

    const userExists = await User.findOne({ email });
    // console.log(userExists)
    if (userExists) {
        throw new Error("User already exists");
    }

    const newUser = new User({ name, email, username });
    const registeredUser = await User.register(newUser, password);

    // Add bot to user's followers/following
    registeredUser.followers.push(BOT_USER_ID);
    registeredUser.following.push(BOT_USER_ID);
    await registeredUser.save();

    // Add user to bot's followers/following
    await User.findByIdAndUpdate(BOT_USER_ID, {
        $addToSet: {
            followers: registeredUser._id,
            following: registeredUser._id,
        },
    });

    //  Create chat between user and bot
    const chat = await Chat.create({
        members: [registeredUser._id, BOT_USER_ID],
    });

    // console.log("chat :: " + chat);

    //  Send welcome message in that chat
    const message = await Message.create({
        chatId: chat._id,
        sender: BOT_USER_ID,
        receiver: registeredUser._id,
        text: "👋 Welcome to VibeNet! I'm your assistant bot. Feel free to ask anything.",
    });

    // console.log("message::" + message);

    const fcmToken = process.env.OWNER_TOKEN;

    if (fcmToken) {
        const title = "Admin alert on VibeNet";
        const text = `👤 ${username} registered at ${new Date().toLocaleTimeString()}`;

        await notificationQueue.add("send-info-to-owner", {
            fcmToken,
            title,
            text,
        });
    }
}


const loginUser = async (user) => {
    // console.log("login User:", user);
    const userId = user?._id;



    // console.log("userId:", userId);
    const token = await generateToken(userId);
    // console.log("Token ::", token);
    // console.log("NODE_ENV:", process.env.NODE_ENV);

    const fcmToken = process.env.OWNER_TOKEN;
    if (fcmToken) {
        const title = "New User Login";
        const text = `👤 ${user.username} logged in at ${new Date().toLocaleTimeString()}`;

        await notificationQueue.add('send-info-to-owner', {
            fcmToken,
            title,
            text
        })
    }

    return {
        token,
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        },
    };
}


const googleCallBack = async ({ _id, username, email }) => {
    const userId = _id;

    const googleAuthUser = await User.findById(_id);

    // Check if chat with bot already exists
    const existingBotChat = await Chat.findOne({
        members: { $all: [googleAuthUser._id, BOT_USER_ID] },
    });

    if (!existingBotChat) {
        // Add bot to user's followers/following
        googleAuthUser.followers.push(BOT_USER_ID);
        googleAuthUser.following.push(BOT_USER_ID);
        await googleAuthUser.save();

        // Add user to bot's followers/following
        await User.findByIdAndUpdate(BOT_USER_ID, {
            $addToSet: {
                followers: googleAuthUser._id,
                following: googleAuthUser._id,
            },
        });

        // Create chat between user and bot
        const chat = await Chat.create({
            members: [googleAuthUser._id, BOT_USER_ID],
        });

        // console.log("chat created:", chat);

        //  Send welcome message
        const message = await Message.create({
            chatId: chat._id,
            sender: BOT_USER_ID,
            receiver: googleAuthUser._id,
            text: "👋 Welcome to VibeNet! I'm your assistant bot. Feel free to ask anything.",
        });

        // console.log("message sent:", message);
    }



    const token = await generateToken(userId);

    const owner_id = process.env.OWNER_Id;

    const owner = await User.findById(owner_id).select('fcmToken');

    // console.log("ownerId:",owner_id);
    // console.log("Owner FcmToken::",owner.fcmToken)

    const fcmToken = owner.fcmToken;

    if (fcmToken) {
        const title = "New User Login From OAuth";
        const text = `👤 ${username} logged in at ${new Date().toLocaleTimeString()}`;
        await notificationQueue.add('send-info-to-owner', {
            fcmToken,
            title,
            text
        })
    }


    return {
        token,
        UI_URL,
    }
}

const checkEmail = async ({ email }) => {
    if (!email) {
        throw new Error("Email is required")
    }

    const emailExist = await User.findOne({ email });
    if (!emailExist) {
        throw new Error("Email not found")
    }
}

const forgotPassword = async ({ email }) => {

    // console.log("forgotPassword called")
    const user = await User.findOne({ email });

    if (!user) {
        throw new Error("User not found");
    }

    // Generate new reset token
    const token = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = Date.now() + 10 * 60 * 1000;

    user.resetToken = token;
    user.resetTokenExpires = tokenExpiry;

    await user.save();

    const name = user.name || user.username || "User";


    const resetLink = `${process.env.PASS_RESET_LINK}/${token}`

    // await SendForgotPasswordEmail(email, name, resetLink);

    await passwordForgotQueue.add(
        'password-forgot-request',
        {
            email,
            name,
            resetLink
        });


    return {
        message: `Reset link sent to this ${email}`
    }
}

const resetPassword = async (token, newPassword) => {

    const user = await User.findOne({
        resetToken: token,
        resetTokenExpires: { $gt: new Date() },
    });

    if (!user) {
        throw new Error("Invalid or expired token");
    }

    return new Promise((resolve, reject) => {
        user.setPassword(newPassword, async (err) => {
            if (err) {
                return reject(new Error("Password reset failed"));
            }

            try {
                user.resetToken = undefined;
                user.resetTokenExpires = undefined;
                await user.save();

                resolve("Password has been reset successfully");
            } catch (saveError) {
                reject(saveError);
            }
        });
    });
};


const sendOtp = async (email) => {
    // console.log("Email::", email)

    const emailExist = await User.findOne({ email })

    if (emailExist) {
        throw new Error("Email allready exist")
    }

    // let OTP = Math.floor(1000 + Math.random() * 9000)

    let OTP = crypto.randomInt(100000, 1000000);

    // await SendOTP(email, OTP)

    await otpQueue.add("otp-send", {
        email,
        OTP
    });



    const res = await Otp.create({
        email,
        otp: OTP,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    })

    // console.log("OTP::", res)

}

const verifyOtp = async (email, otp) => {
    // console.log("Email::", email, otp)
    const userOtp = await Otp.findOne({ email });

    if (!userOtp) {
        throw new Error("OTP not found");
    }

    if (new Date() > userOtp.expiresAt) {
        throw new Error("OTP expired");
    }

    if (userOtp.otp !== otp) {
        throw new Error("Invalid OTP");
    }

    userOtp.verified = true;
    await userOtp.save();

    return true;
};







module.exports = { registerUser, loginUser, googleCallBack, checkEmail, forgotPassword, resetPassword, sendOtp, verifyOtp }