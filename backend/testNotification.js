
require('dotenv').config()


const sendNotification = require('./utils/sendNotification')


const fcmToken = process.env.fcmToken; 


console.log("fcmToken form testNotification :: ",fcmToken)


const test = async () => {
  const title = 'Hello from Backend!';
  const body = 'This is a test push notification using Firebase Admin SDK.';
  
  await sendNotification(fcmToken, title, body)
};

test();

