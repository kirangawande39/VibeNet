require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");

const app = require("./app");
const callDB = require("./config/db");
const { initSocket } = require("./socket/socket");

const setupRoutes = require('./routes');
const notFound = require('./middlewares/notFound')
const errorHandler = require('./middlewares/errorHandler')

require("./config/passport.session");
require("./workers/notificationWorker");
require("./workers/otpWorker");
require("./cron/storyCleanup");
require('./workers/passwordForgotWorker');

app.get('/', (req, res) => {
  res.send("Hello I am server")
})

const PORT = process.env.PORT || 5000;
callDB();


const server = http.createServer(app);


const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    // origin: [
    //   "http://localhost:5173",
    //   "https://res-toe-cast-satellite.trycloudflare.com",
    // ],
    // origin:'*',
    credentials: true,
  },
});


app.use((req, res, next) => {
  req.io = io;
  next();
});

setupRoutes(app);

// Error middlewares
app.use(notFound);
app.use(errorHandler);


initSocket(io);


server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});