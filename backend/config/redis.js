
// for development
// const { Redis } = require("ioredis");

// const connection = new Redis({
//     host: "127.0.0.1",
//     port: 6379,
//     maxRetriesPerRequest: null,   // Important for BullMQ
// });

// module.exports = connection;





// For production 

// console.log("Redis url ::", process.env.REDIS_URL)

// const { Redis } = require("ioredis");

// const connection = new Redis(process.env.REDIS_URL, {
//   maxRetriesPerRequest: null,
//   tls: process.env.REDIS_TLS === "true" ? {} : undefined
// });

// module.exports = connection;

// console.log("PORT:", process.env.REDIS_PORT);


require("dotenv").config();
const { Redis } = require("ioredis");

const connection = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null
});

module.exports = connection;

