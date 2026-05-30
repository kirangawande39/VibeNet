const { Worker } = require('bullmq');

const connection = require('../config/redis');

const worker = new Worker("video-compress-worker", async (job) => {


    try {
        console.log("Job recived by Video Worker:", job.data)
    }
    catch (err) {
        console.err("video worker failed:", err);
    }
},
    { connection }
);


