# 🌐 VibeNet - A Social Media Website

**VibeNet** is a responsive full-stack **social media website** built using the **MERN stack (MongoDB, Express, React, Node.js)**. The platform allows users to share posts and stories, chat in real-time, and manage their social profile — all through a modern web interface.

---

## 🚀 Features

### 👤 User Features
- User registration and login (JWT-based authentication)
- Profile update with picture and bio (separately editable)
- Secure session handling

### 🖼️ Post System
- Create and share image-based posts with text
- View posts in grid layout (Instagram-style)
- Delete own posts securely
- Backend image hosting using Cloudinary

### 📖 Story System
- Upload 24-hour stories (image/video)
- 'Your Story' shows with "+" icon if user has no story
- Multiple stories grouped inside the same story circle
- Auto-delete after 24 hours using MongoDB TTL index
- Supports jpg, png, mp4, webm, and more

### 💬 Real-Time Chat (Web-based)
- Real-time messaging using Socket.IO
- Text + image chat with preview and download
- Online/typing indicator
- "Seen" status for messages
- Gallery view for all shared images
- Push notifications using Firebase Cloud Messaging (FCM)
- Chat route protection for logged-in users only

### 🔔 Notifications
- Website notifications for new messages
- Online status indicators
- Seen/unseen message tracking

---

## 🛠️ Tech Stack

- **Frontend:** React.js + Vite + Tailwind CSS
- **Backend:** Node.js + Express.js
- **Database:** MongoDB (with Mongoose)
- **Authentication:** JWT + Passport.js
- **Real-time Communication:** Socket.IO
- **Media Hosting:** Cloudinary
- **Push Notifications:** Firebase Cloud Messaging (FCM)

---

## 🌍 Live Preview



---

## 🧑‍💻 Getting Started Locally

### 1. Clone the Repo

```bash
git clone https://github.com/your-username/vibenet.git
cd vibenet
