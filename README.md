🌐 VibeNet – A Modern Social Media Website

VibeNet is a full-featured, responsive social media web application built with the MERN stack (MongoDB, Express.js, React.js, Node.js).
It combines core features of Instagram and WhatsApp — including real-time chat, stories, follow system, and a scalable background notification architecture.

✨ Features
👥 User System

Secure Sign Up / Login with JWT Authentication

Edit profile: name, bio, and profile picture

View followers and following list

Protected routes accessible only to logged-in users

🔔 Advanced Notification System (FCM + BullMQ + Redis)

VibeNet includes a production-ready background notification system built using:

Firebase Cloud Messaging (FCM)

BullMQ (Job Queue)

Redis Cloud

Background Workers

All notifications are processed asynchronously using queue-based architecture for better scalability and performance.

📲 Types of Notifications Implemented
💬 1. Private Chat Notification

Triggered when a user sends a direct message.

Receiver gets an instant push notification.

Works even when the user is offline.

👥 2. Group Chat Notification

When a message is sent in a group,

All group members (except sender) receive notifications.

Efficiently handled using background queue jobs.

❤️ 3. Follow Notification

When a user follows another user,

The followed user receives a push notification.

📖 4. Story View Notification

When someone views your story,

The story owner gets notified.

👍 5. Post Like Notification

When someone likes your post,

You receive a push notification.

💬 6. Comment Notification

When someone comments on your post,

You receive a real-time + push notification.

⚙️ Notification Architecture Highlights

Non-blocking API (queue-based processing)

Jobs stored in Redis Cloud

Worker processes notification jobs in background

Automatic cleanup using:

removeOnComplete: true


Scalable: multiple workers can run simultaneously

Retry mechanism for failed notifications

🖼️ Post Features

Create posts with text and images (Cloudinary integration)

View posts in gallery format

Like / Unlike any post

Add & delete comments in real-time (Socket.IO)

Delete your own posts

Live comment count updates

📖 Story System (Instagram-style)

Upload temporary 24-hour stories (image/video)

Display “Your Story” with ➕ if no active story

Multiple stories per user shown in one bubble

Auto-deletion after 24 hours using MongoDB TTL

Media uploaded via Cloudinary

Story view tracking system

💬 Real-Time Chat (WhatsApp-style)

One-to-one chat between users

Real-time messaging using Socket.IO

Send text and image messages

Seen status & typing indicators

Online/offline status indicators

Push notifications using FCM

Image preview, zoom & gallery view

Delete messages with long press

Chat list logic (only connected users visible)

👤 Follow / Unfollow System

Follow/unfollow users easily

Followers / Following count on profile

Personalized feed (shows content from followed users only)

🤖 Chatbot Assistant

In-app chatbot helper

Guides new users about features

Helps navigate the application

🛠️ Tech Stack
Layer	Technology
Frontend	React.js + Vite + Tailwind CSS
Backend	Node.js + Express.js
Database	MongoDB (Mongoose)
Auth	JWT + Passport.js
Realtime	Socket.IO
Media Host	Cloudinary
Push Notify	Firebase Cloud Messaging (FCM)
Queue	BullMQ
Queue DB	Redis Cloud
🛡️ License

This project is licensed under the MIT License
 © 2025 Kiran Gawande.
