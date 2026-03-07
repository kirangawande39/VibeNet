
// for development
// const { Redis } = require("ioredis");

// const connection = new Redis({
//     host: "127.0.0.1",
//     port: 6379,
//     maxRetriesPerRequest: null,   // Important for BullMQ
// });

// module.exports = connection;


require("dotenv").config();
const { Redis } = require("ioredis");

const connection = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null
});

module.exports = connection;

