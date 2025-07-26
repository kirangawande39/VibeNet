import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import axios from "axios";

const vapidKey = import.meta.env.VITE_VAPID_KEY;
const backendUrl = import.meta.env.VITE_BACKEND_URL;
const apiKey=import.meta.env.VITE_FIREBASE_API_KEY;
const projectId=import.meta.env.VITE_FIREBASE_PROJECT_ID;
const messagingSenderId=import.meta.env.VITE_FIREBASE_MESSAGE_SENDER_ID;
const appId=import.meta.env.VITE_FIREBASE_APP_ID;


const firebaseConfig = {
  apiKey,
  authDomain: "vibenet-d2b6a.firebaseapp.com",
  projectId,
  storageBucket: "vibenet-d2b6a.firebasestorage.app",
  messagingSenderId,
  appId,
  measurementId: "G-DM29KMCD70"
};

const firebaseApp = initializeApp(firebaseConfig);
const messaging = getMessaging(firebaseApp);


// ✅ Function to get FCM token
export const requestForToken = async (authToken) => {
  try {

    // Ya user?.id — jaisa backend me hai

    const token = await getToken(messaging, { vapidKey});

    if (token) {
      console.log("FCM Token:", token);

      // 🔥 API call to save token with userId
      await axios.post(`${backendUrl}/api/users/save-fcm-token`, 
        { token },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`
          },
        }
      );
    } else {
      console.log("No registration token available OR userId missing.");
    }
  } catch (err) {
    console.error("Error retrieving FCM token:", err);
  }
};

// ✅ Function to listen incoming notification in foreground
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log("Foreground Message Received: ", payload);
      resolve(payload);
    });
  });
