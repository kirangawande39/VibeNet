const admin = require('../firebase/firebaseConfig');

const sendNotification = async (fcmToken, title, body) => {
  const message = {
    notification: { title, body },
    token: fcmToken,
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('✅ Notification sent:', response);
  } catch (err) {
    console.error('❌ Error sending notification:', err);
  }
};

module.exports = sendNotification;
