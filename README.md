# 🌐 VibeNet – A Modern Social Media Website

**VibeNet** is a full-featured, responsive social media web application built with the **MERN stack** (MongoDB, Express.js, React.js, Node.js).  
It combines core features of Instagram and WhatsApp — including real-time chat, image/video stories, likes, comments, and a follow/unfollow system.

---

## ✨ Features

### 👥 User System
- Secure Sign Up / Login with JWT Authentication
- Edit profile: name, bio, and profile picture
- View followers and following list
- Protected routes accessible only to logged-in users

### 🖼️ Post Features
- Create posts with text and images (Cloudinary integration)
- View posts in gallery format (yours and others)
- Like / Unlike any post
- Add & delete comments in real-time (Socket.IO)
- Delete your own posts
- Live comment count updates

### 📖 Story System (Instagram-style)
- Upload temporary 24-hour stories (image/video)
- Display “Your Story” with ➕ if no active story
- Multiple stories per user shown in one bubble
- Auto-deletion after 24 hours using MongoDB TTL
- Media uploaded via Cloudinary

### 💬 Real-Time Chat (WhatsApp-style)
- One-to-one chat between users
- Real-time messaging using Socket.IO
- Send text and image messages
- Seen status & typing indicators
- Online/offline status indicators
- Push notifications using Firebase Cloud Messaging (FCM)
- Image preview, zoom & gallery view
- Delete messages with long press
- Chats only visible to connected users (chat list logic)

### 👤 Follow / Unfollow System
- Follow/unfollow users easily
- Followers / Following count on profile
- User feed shows content only from followed users

### 🤖 Chatbot Assistant (New)
- In-app chatbot helper for guiding new users
- Provides feature tips and navigation support

---

## 🛠️ Tech Stack

| Layer       | Technology                             |
|-------------|----------------------------------------|
| Frontend    | React.js + Vite + Tailwind CSS         |
| Backend     | Node.js + Express.js                   |
| Database    | MongoDB (with Mongoose)                |
| Auth        | JWT + Passport.js                      |
| Realtime    | Socket.IO                              |
| Media Host  | Cloudinary                             |
| Push Notify | Firebase Cloud Messaging (FCM)         |

---

## 🛡️ License

This project is licensed under the [MIT License](./LICENSE) © 2025 Kiran Gawande.
