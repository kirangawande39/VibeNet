const { Queue } = require("bullmq")

const connection = require('../config/redis');


const otpQueue = new Queue("otp-queue",
    {
        connection,
        defaultJobOptions: {
            removeOnComplete: true,
            removeOnFail: 100
        },

    });

module.exports=otpQueue; 