



const sendNotification = require('./utils/sendNotification');


const fcmToken = "fTB0c_61jBRWV_s56iMgh7:APA91bEDiSRSFW37SoZcIZX0NKgSCEUIMAJw49YROnXo0Th14tM1gSdoR0SSxAdVCl8Nm5-RRKsfiq2Zb0A0hL51WwphUnHBeBWfFWMYS3dxRmiEGIB0nv"; 


const test = async () => {
  const title = '🚀 Hello from Backend!';
  const body = 'This is a test push notification using Firebase Admin SDK.';
  
  await sendNotification(fcmToken, title, body)
};

test();

