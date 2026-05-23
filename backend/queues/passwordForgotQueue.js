const { Queue } = require('bullmq')

const connection = require('../config/redis');

const passwordForgotQueue = new Queue("password-forgot-queue",
    {
        connection,
        defaultJobOptions: {
            removeOnComplete: true,
            removeOnFail: 100
        }
    }

);

module.exports = passwordForgotQueue;