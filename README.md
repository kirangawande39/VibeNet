# 🌐 VibeNet – Scalable Social Media Platform

VibeNet is a full-featured, production-oriented social media web application built using the MERN Stack (MongoDB, Express.js, React.js, Node.js).

It combines the experience of modern platforms like Instagram and WhatsApp — including real-time chat, group messaging, stories, follow system, smart user suggestions, privacy controls, and a scalable background notification architecture.

---

# ✨ Key Highlights

- 🔐 JWT Authentication & Protected APIs  
- 🌍 Public / 🔒 Private Account System  
- 🤝 Friends-of-Friends Recommendation Engine  
- 💬 Real-Time 1:1 & Group Chat (Socket.IO)  
- 📖 24-Hour Stories with Auto Cleanup  
- 🔔 Queue-Based Push Notification System  
- ⚡ Background Workers (BullMQ + Redis)  
- 🛡️ API Rate Limiting for Security  
- ☁️ Cloudinary Media Management  
- ⏳ Cron Job for Story Media Cleanup  

---

# 🚀 Core Features

---

## 👥 Authentication & User System

- Secure Sign Up / Login (JWT)
- Protected Routes
- Edit Profile (Name, Bio, Profile Image)
- Followers / Following System
- Personalized Feed
- Account Privacy Toggle

---

## 🔒 Public & Private Account System

### 🌍 Public Account
- Anyone can view posts & profile
- Instant follow

### 🔒 Private Account
- Follow request approval required
- Only approved users can:
  - View posts
  - View stories
  - See followers list
- Follow request notifications
- Approval notification system

Access control implemented securely at backend level.

---

## 🔎 User Search & Follow

- Search users by username (case-insensitive)
- Follow directly from search
- Privacy-aware follow logic
- Optimized MongoDB queries

---

## 🤝 Smart User Suggestions (Friends of Friends)

Advanced recommendation logic:

- Suggests friends of friends
- Ranks by mutual connections
- Excludes already followed users
- Excludes self
- Social graph-based filtering

---

# 💬 Real-Time Messaging System

---

## 💬 One-to-One Chat

- Real-time messaging (Socket.IO)
- Text & image messages
- Typing indicators
- Seen status
- Online / Offline presence
- Push notifications (FCM)
- Delete message functionality

---

## 👥 Group Feature

Users can create and manage chat groups.

### 🆕 Group Creation
- Create group with name
- Optional group image
- Add members

### ➕ Add Friends to Group
- Add users from following list
- Prevent duplicate members
- Controlled membership logic

### 💬 Group Chat
- Real-time group messaging
- Text & image support
- All members notified (except sender)

### 🔔 Group Notifications
- Push notifications for all members
- Processed asynchronously using BullMQ + Redis

---

# 📖 Story System (24-Hour Expiry)

- Upload image/video stories
- Multiple stories per user
- Story view tracking
- MongoDB TTL index for auto-expiry
- Cloudinary media storage

### ⏳ Story Cleanup Cron Job

- Scheduled cron job runs periodically
- Deletes expired story media from Cloudinary
- Prevents unused storage accumulation
- Keeps cloud storage optimized

---

# 🖼️ Post System

- Create post (text + image)
- Like / Unlike
- Real-time comments
- Delete own posts
- Live comment count updates

---

# 🔔 Advanced Notification Architecture

Built using:

- Firebase Cloud Messaging (FCM)
- BullMQ (Job Queue)
- Redis Cloud
- Background Workers

### 📲 Notifications Implemented

- Private Chat Notification
- Group Chat Notification
- Follow Notification
- Follow Request Notification
- Follow Request Accepted Notification
- Story View Notification
- Post Like Notification
- Comment Notification

### ⚙️ Architecture Highlights

- Non-blocking APIs
- Queue-based async processing
- Background worker execution
- Redis-backed job storage
- Retry mechanism for failures
- Auto cleanup:

~~~js
removeOnComplete: true
~~~

- Horizontally scalable worker system

---

# 🛡️ Security Features

- JWT-based authentication
- Protected API routes
- Rate limiting on sensitive routes
- Secure media upload handling
- Backend-level access validation
- Input validation & error handling

---

# 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React.js + Vite + Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | MongoDB (Mongoose) |
| Authentication | JWT + Passport.js |
| Real-Time | Socket.IO |
| Media Storage | Cloudinary |
| Push Notifications | Firebase Cloud Messaging |
| Queue System | BullMQ |
| Queue Storage | Redis Cloud |
| Background Jobs | Node Cron |

---



# 📄 License

This project is licensed under the MIT License  
© 2025 Kiran Gawande

---

# ⭐ Project Strength

VibeNet demonstrates:

- Real-time systems  
- Queue-based architecture  
- Background job processing  
- Social graph logic  
- Cloud resource management  
- Production-level API security  
- Scalable backend design  

