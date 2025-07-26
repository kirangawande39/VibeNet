const mongoose = require('mongoose');
require('dotenv').config();

const DB = () => {
    try {
        mongoose.connect(process.env.MONGODB_URL)
        console.log("Mongodb Connected..");
    }
    catch (error) {
        console.log("Error:" + error);
    }
}

module.exports = DB;

