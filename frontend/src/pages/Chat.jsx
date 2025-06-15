import React, { useState, useContext, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import ChatBox from "../components/ChatBox";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import Spinner from "../components/Spinner";
import { useParams } from "react-router-dom";
import { handleError } from '../utils/errorHandler';
import { io } from "socket.io-client";

import "../assets/css/Chat.css";

// Initialize socket outside the component to avoid reconnection
const socket = io(import.meta.env.VITE_BACKEND_URL, {
  withCredentials: true,
});

const Chat = () => {
  const { user, updateUser } = useContext(AuthContext);
  const [localUser, setLocalUser] = useState();
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [chats, setChats] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [lastSeen, setLastSeen] = useState({});
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(true);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const { id } = useParams();

  const dummyMessages = {
    user1: [
      { id: 1, sender: "user1", text: "Hey!" },
      { id: 2, sender: "You", text: "Hello!" },
    ],
    user2: [
      { id: 1, sender: "user2", text: "What's up?" },
      { id: 2, sender: "You", text: "All good!" },
    ],
  };

  const updateLastMessage = (chatId, newMessage) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat._id === chatId ? { ...chat, lastMessage: newMessage } : chat
      )
    );
  };

  const handleLastMessageUpdate = (newMessage) => {
    if (selectedUser) {
      updateLastMessage(selectedUser._id, newMessage);
      // console.log("newMessage :", newMessage);
    }
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${backendUrl}/api/users/${id ? id : user.id}`);
      setLocalUser(res.data.user);
      updateUser(res.data.user);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  // ✅ Emit user-online after user info is ready
  useEffect(() => {
    if (user && user._id) {
      socket.emit("user-online", user._id);
      // console.log("📡 Emitted user-online:", user._id);
    }
  }, [user]);

  // ✅ Listen to online-users broadcast (optional for live update)
  useEffect(() => {
    socket.on("online-users", (users) => {
      // console.log("🌐 Live online users:", users);
      setOnlineUsers(users);
    });

    return () => {
      socket.off("online-users");
    };
  }, []);

  // ✅ Fetch online + last seen from backend REST API every 10 seconds
  useEffect(() => {
    const fetchOnlineStatus = async () => {
      // console.log("🌐 Trying to fetch online status...");
      try {
        const res = await axios.get(`${backendUrl}/api/online-status`);
        // console.log("✅ Online users:", res.data);
        // console.log("res.data.onlineUsers:", res.data.onlineUsers);
        // console.log("res.data.lastSeen:", res.data.lastSeen);
        setOnlineUsers(res.data.onlineUsers || []);
        setLastSeen(res.data.lastSeen || {});
      } catch (err) {
        console.error("❌ Failed to fetch online status:", err);
      } finally {
        setStatusLoading(false);
      }
    };

    fetchOnlineStatus();
    const interval = setInterval(fetchOnlineStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isMobile && user && user.followers?.length > 0) {
      setSelectedUser(user.followers[0]);
      setMessages(dummyMessages[user.followers[0].username] || []);
    }
  }, [user, isMobile]);

  const handleSendMessage = (newMessage) => {
    if (!selectedUser) return;
    const updatedMessages = [...messages, { sender: user.username, text: newMessage }];
    setMessages(updatedMessages);
  };

  const handleUserSelect = (follower) => {
    setSelectedUser(follower);
    setMessages(dummyMessages[follower.username] || []);
  };

  const handleBack = () => {
    setSelectedUser(null);
  };

  const formatLastSeen = (timestamp) => {
    const timeDiff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(timeDiff / 60000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  };

  if (loading || statusLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "80vh" }}>
        <Spinner />
      </div>
    );
  }

  return (
    <div className="container chat-app mt-4">
      <div className="row">
        {/* Follower List */}
        <div className={`col-md-4 ${isMobile && selectedUser ? "d-none" : ""}`}>
          <div className="list-group">
            {localUser && localUser.followers?.length > 0 ? (
              user.followers?.map((follower, index) => {
                const isOnline = onlineUsers.includes(follower._id);
                const lastSeenTime = lastSeen[follower._id];

                return (
                  <button
                    key={index}
                    className={`list-group-item list-group-item-action d-flex align-items-center justify-content-between ${selectedUser && follower._id === selectedUser._id ? "active" : ""}`}
                    onClick={() => handleUserSelect(follower)}
                  >
                    <div className="d-flex align-items-center">
                      <img
                        src={
                          follower.profilePic?.url ||
                          "https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2264922221.jpg"
                        }
                        alt={follower.username}
                        className="rounded-circle me-2"
                        width="40"
                        height="40"
                        style={{ objectFit: "cover" }}
                      />
                      <div>
                        <div>{follower.username}</div>
                        <small className="text-muted">
                          {isOnline ? (
                            <span className="text-success">Online</span>
                          ) : lastSeenTime ? (
                            <span>Last seen {formatLastSeen(lastSeenTime)}</span>
                          ) : (
                            "Offline"
                          )}
                        </small>
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="text-muted p-2 d-flex justify-between items-center gap-2">
                <button className="btn btn-sm btn-outline-secondary" onClick={() => window.history.back()}>
                  ← Back
                </button>
                <span>No followers to show</span>
              </div>
            )}
          </div>
        </div>

        {/* Chat Box */}
        <div className={`col-md-8 ${isMobile && !selectedUser ? "d-none" : ""}`}>
          {selectedUser ? (
            <>
              {isMobile && (
                <div className="mb-2">
                  <button className="btn btn-link" onClick={handleBack}>
                    ← Back
                  </button>
                </div>
              )}
              <ChatBox
                messages={messages}
                onSendMessage={handleSendMessage}
                user={user}
                selectedUser={selectedUser}
                localUser={localUser}
                onLastMessageUpdate={handleLastMessageUpdate}
              />
            </>
          ) : (
            <div className="text-muted p-4">Select a user to start chatting</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
