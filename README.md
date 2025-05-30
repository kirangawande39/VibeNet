# 🌐 VibeNet - A Modern Social Media Website

**VibeNet** is a full-featured, responsive **social media web application** built with the **MERN stack** (MongoDB, Express.js, React.js, Node.js).  
It includes a real-time chat system, image/video stories, like/comment features, post sharing, and follow/unfollow system — inspired by Instagram & WhatsApp.

---

## ✨ Features

### 👥 User System
- Secure Sign Up / Login (JWT Authentication)
- Edit profile with name, bio, profile picture
- Followers / Following list
- Protected routes for logged-in users only

### 🖼️ Post Features
- Create posts with text & image (via Cloudinary)
- View your posts and others’ posts in gallery format
- Like / Unlike any post
- Add and delete comments (live with Socket.IO)
- Delete your own posts
- Real-time comment count update via sockets

### 📖 Story System (Like Instagram)
- Upload temporary 24-hour stories (image/video)
- Show “Your Story” with a `+` if none uploaded
- Multiple stories in one bubble
- Auto-delete after 24 hours (MongoDB TTL index)
- Cloudinary used for media upload

### 💬 Real-Time Chat (Like WhatsApp)
- One-to-one chat system (user-to-user)
- Real-time messaging using **Socket.IO**
- Text & Image support
- Seen status, typing status
- Online/offline indicators
- Push notifications using **Firebase Cloud Messaging (FCM)**
- Image zoom, preview, and gallery view
- Delete messages with long press
- Only visible to connected users (chat list logic)

### 👥 Follow / Unfollow System
- Follow any user and see their posts/stories
- Followers / Following count on profile
- User feed shows followed users' content only

---

## 🛠️ Tech Stack

| Layer       | Technology               |
|-------------|--------------------------|
| Frontend    | React.js + Vite + Tailwind CSS |
| Backend     | Node.js + Express.js     |
| Database    | MongoDB (Mongoose)       |
| Auth        | JWT + Passport.js        |
| Realtime    | Socket.IO                |
| Media Host  | Cloudinary               |
| Push Notify | Firebase Cloud Messaging |

---


