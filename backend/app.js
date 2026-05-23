const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const errorHandler = require("./middlewares/errorHandler");
const notFound = require("./middlewares/notFound");
const setupRoutes = require("./routes");

const app = express();

// Middlewares
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));


app.use("/uploads", express.static("uploads"));



module.exports = app;