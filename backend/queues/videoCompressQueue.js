const { Queue } = require('bullmq')

const connection = require('../config/redis');

const videoCompressQueue = new Queue("video-compress-queue",{
    connection,
    defaultJobOptions:{
        removeOnComplete:true,
        removeOnFail:100,
    }
})

module.exports = videoCompressQueue;
