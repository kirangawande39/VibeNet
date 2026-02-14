const admin = require("firebase-admin");
require("dotenv").config();

if (!process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
  console.log("⚠ FIREBASE_SERVICE_ACCOUNT_BASE64 not defined, Worker will not start Firebase.");

}
else {
  const serviceAccountJson = Buffer.from(
    process.env.FIREBASE_SERVICE_ACCOUNT_BASE64,
    "base64"
  ).toString("utf8");


  // Parse JSON string from .env
const serviceAccount = JSON.parse(serviceAccountJson);

// Fix the \n issue in private_key


// console.log("Parsed Service Account:", serviceAccount);


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
}



module.exports = admin;
