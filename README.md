# 🌐 VibeNet – Scalable Social Media Platform

VibeNet is a full-featured, production-oriented social media web application built using the MERN Stack (MongoDB, Express.js, React.js, Node.js).

It combines modern social features like real-time chat, group messaging, stories, follow system, smart suggestions, privacy controls, secure authentication, and a scalable background notification architecture.

---

# ✨ Key Highlights

- 🔐 JWT Authentication & Protected APIs  
- 📧 OTP-Based Email Verification (15 min expiry)  
- 🔑 Forgot Password with Secure Reset Token (1 hour expiry)  
- 🔓 Google Signup/Login (Passport.js)  
- 🌍 Public / 🔒 Private Account System  
- 🤝 Friends-of-Friends Recommendation Engine  
- 💬 Real-Time 1:1 & Group Chat (Socket.IO)  
- 📖 24-Hour Stories with Auto Cleanup  
- 🔔 Queue-Based Push Notification System  
- ⚡ Background Workers (BullMQ + Redis)  
- 🛡️ API Rate Limiting  
- ☁️ Cloudinary Media Management  
- ⏳ Cron Job for Story Media Cleanup  

---

# 🔐 Advanced Authentication System

## 📧 Email Verification (OTP System)

- OTP sent during registration
- OTP valid for 15 minutes
- OTP stored securely in database
- Email sent using EmailJS
- Account activated only after OTP verification

Prevents fake accounts and ensures verified users.

---

## 🔓 Google Authentication

- Google Sign Up / Login
- Implemented using Passport.js
- OAuth 2.0 secure authentication flow
- Auto account creation for new Google users

---

## 🔑 Forgot Password System

- User requests password reset
- Unique reset token generated
- Token stored in user's profile (1 hour expiry)
- Reset link sent via EmailJS
- Token verified before allowing password change
- Token invalidated after successful reset

Ensures secure password recovery workflow.

---

# 👥 User & Profile System

- Secure Sign Up / Login (JWT)
- Protected Routes
- Edit Profile (Name, Bio, Profile Image)
- Followers / Following System
- Personalized Feed
- Public / Private Account Toggle

---

# 🔒 Public & Private Account System

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

Backend-level access control ensures data security.

---

# 🔎 User Search & Follow

- Search users by username (case-insensitive)
- Follow directly from search
- Privacy-aware follow logic
- Optimized MongoDB queries

---

# 🤝 Smart User Suggestions (Friends of Friends)

Recommendation engine:

- Suggests friends of friends
- Ranks by mutual connections
- Excludes already followed users
- Excludes self
- Social graph-based filtering

---

# 💬 Real-Time Messaging System

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

### 🆕 Group Creation
- Create group with name
- Optional group image
- Add members

### ➕ Add Friends to Group
- Add users from following list
- Prevent duplicate members

### 💬 Group Chat
- Real-time group messaging
- Text & image support
- Notifications for all members (except sender)

---

# 📖 Story System (24-Hour Expiry)

- Upload image/video stories
- Multiple stories per user
- Story view tracking
- MongoDB TTL index for auto-expiry
- Cloudinary media storage

## ⏳ Story Cleanup Cron Job

- Scheduled cron job
- Deletes expired story media from Cloudinary
- Prevents storage overflow
- Keeps cloud resources optimized

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

## 📲 Notifications Implemented

- Private Chat Notification
- Group Chat Notification
- Follow Notification
- Follow Request Notification
- Follow Request Accepted Notification
- Story View Notification
- Post Like Notification
- Comment Notification

## ⚙️ Architecture Highlights

- Non-blocking APIs
- Queue-based async processing
- Background worker execution
- Redis-backed job storage
- Retry mechanism
- Auto cleanup:

~~~js
removeOnComplete: true
~~~

- Horizontally scalable worker system

---

# 🛡️ Security Features

- JWT-based authentication
- OTP email verification
- Secure reset token mechanism
- Google OAuth integration
- API Rate Limiting
- Protected routes
- Input validation & sanitization
- Backend-level access validation

---

# 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React.js + Vite + Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | MongoDB (Mongoose) |
| Authentication | JWT + Passport.js |
| Email Service | EmailJS |
| Real-Time | Socket.IO |
| Media Storage | Cloudinary |
| Push Notifications | Firebase Cloud Messaging |
| Queue System | BullMQ |
| Queue Storage | Redis Cloud |
| Background Jobs | Node Cron |

---

# 📦 Installation Guide

~~~bash
git clone <your-repo-link>

cd backend
npm install
npm run dev

cd ../frontend
npm install
npm run dev
~~~

---

# 📄 License

This project is licensed under the MIT License  
© 2025 Kiran Gawande

---

# ⭐ Project Strength

VibeNet demonstrates:

- Production-level authentication system
- Secure OTP & token-based verification
- Real-time communication architecture
- Queue-based background processing
- Social graph recommendation logic
- Cloud storage lifecycle management
- Scalable backend system design

