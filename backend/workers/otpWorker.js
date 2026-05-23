const connection = require('../config/redis');

const SendOTP = require("../utils/SendOtp")

const { Worker } = require("bullmq")


const worker = new Worker(
    "otp-queue",
    async (job) => {
        // console.log("Job resive by otpWorker:",job.data);
        try {
             
            const { email, OTP } = job.data;
            await SendOTP(email, OTP)
        }
        catch (err) {
            console.error("OTP sending time error :", err)
        }

    },
    { connection }
);