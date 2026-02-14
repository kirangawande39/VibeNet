require("dotenv").config({ path: "../.env" }); // path to backend/.env

const { Worker } = require("bullmq");
// const IORedis = require("ioredis");
const admin = require("../firebase/firebaseConfig");

const connection = require("../config/redis");

const sendNotification = require("../utils/sendNotification")

// const connection = new IORedis();

const worker = new Worker(
  "notification-queue",
  async (job) => {
    try {
      // console.log("Worker received:", job.data);

      const { fcmToken, title, text } = job.data;

      if (!fcmToken) {
        console.log("No FCM token, skipping");
        return;
      }

      const response = await admin.messaging().send({
        token: fcmToken,
        data: {
          title,
          body: text,
        },
      });

      // console.log("Notification sent!", response);
    } catch (error) {
      console.error("Error sending notification:", error.message);
      throw error; // important for BullMQ to mark job failed
    }
  },
  { connection }
);

