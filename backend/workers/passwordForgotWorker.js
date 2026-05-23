const { Worker } = require('bullmq');

const connection = require('../config/redis');

const SendPasswordForgotEmail = require('../utils/SendForgotPasswordEmail')

const worker = new Worker(
    "password-forgot-queue",
    async (job) => {
        try {
            // console.log("Job recived from passWorker:", job.data)

            const { email, name, resetLink } = job.data;

            await SendPasswordForgotEmail(email, name, resetLink)

        }
        catch (err) {
            console.error("Forgot Password job worker failed", err);
            throw err; // important for BullMQ to mark job failed
        }
    },
    { connection }
);


