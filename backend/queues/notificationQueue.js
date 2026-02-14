const { Queue } = require("bullmq")
// const IORedis = require("ioredis")

const connection = require("../config/redis")

const notificationQueue = new Queue("notification-queue", {
    connection,
    defaultJobOptions: {
        removeOnComplete: true,  // completed jobs delete
        removeOnFail: 100        // last 100 failed jobs rakho
    },
});

module.exports = notificationQueue;


