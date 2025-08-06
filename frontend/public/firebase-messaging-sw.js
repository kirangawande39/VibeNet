/* eslint-disable no-undef */
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

firebase.initializeApp({
 apiKey: "AIzaSyCQUeEa_kO1DRoTT76boL80jI5xJaR8PCw",
  authDomain: "vibenet-d2b6a.firebaseapp.com",
  projectId: "vibenet-d2b6a",
  storageBucket: "vibenet-d2b6a.firebasestorage.app",
  messagingSenderId: "10293109824",
  appId: "1:10293109824:web:74140f2a2185f12f7faba5",
  measurementId: "G-DM29KMCD70"
});






const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("Received background message ", payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
