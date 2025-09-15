import React, { useState, useContext, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import ChatBox from "../components/ChatBox";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import Spinner from "../components/Spinner";
import { useParams } from "react-router-dom";
import { handleError } from "../utils/errorHandler";
import { useOnline } from "../context/OnlineStatusContext";
import "../assets/css/Chat.css";

// 🔹 Component Start
const Chat = () => {
  const { user, updateUser } = useContext(AuthContext);
  const { allOnlineUsers } = useOnline();

  const [localUser, setLocalUser] = useState();
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [chats, setChats] = useState([]); // 🔹 Stores last messages
  const [onlineUsers, setOnlineUsers] = useState(allOnlineUsers);
  const [lastSeen, setLastSeen] = useState({});
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
    const [lastMessage, setlastMessage] = useState(null);
  

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const { id } = useParams();

  const CHATBOT_ID = "684f268c7dad0bf1b1dfd4f8";

  // Dummy messages for testing
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

  // Sorting followers: chatbot → online → last seen
  const sortedFollowers = [...(user?.followers || [])].sort((a, b) => {
    const isAChatBot = a._id === CHATBOT_ID;
    const isBChatBot = b._id === CHATBOT_ID;

    if (isAChatBot) return -1;
    if (isBChatBot) return 1;

    const isAOnline = onlineUsers.includes(a._id);
    const isBOnline = onlineUsers.includes(b._id);

    if (isAOnline && !isBOnline) return -1;
    if (!isAOnline && isBOnline) return 1;

    const aLast = new Date(lastSeen[a._id] || 0).getTime();
    const bLast = new Date(lastSeen[b._id] || 0).getTime();

    return bLast - aLast;
  });

  // ✅ Update lastMessage in chats state
  const updateLastMessage = (chatId, newMessage) => {
    setChats((prev) =>
      prev.some((chat) => chat._id === chatId)
        ? prev.map((chat) =>
            chat._id === chatId ? { ...chat, lastMessage: newMessage } : chat
          )
        : [...prev, { _id: chatId, lastMessage: newMessage }]
    );
  };



  // Called from ChatBox
  const handleLastMessageUpdate = (newMessage) => {
    if (selectedUser) {
      updateLastMessage(selectedUser._id, newMessage);
      console.log(
        "newMessage Updated:",
        selectedUser._id,
        selectedUser.username,
        newMessage
      );
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
      const res = await axios.get(
        `${backendUrl}/api/users/${id ? id : user.id}`
      );
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

  // ✅ Fetch online + last seen every 10s
  useEffect(() => {
    const fetchOnlineStatus = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/online-status`);
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
    const updatedMessages = [
      ...messages,
      { sender: user.username, text: newMessage },
    ];
    setMessages(updatedMessages);
    handleLastMessageUpdate(newMessage); // ✅ Update last message when sending
  };



  const handleUserSelect = (follower) => {
    setSelectedUser(follower);
    setMessages(dummyMessages[follower.username] || []);
  };

  const handleBack = () => {
    setSelectedUser(null);
  };

  const formatLastSeen = (timestamp) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return "just now";
    if (minutes < 5) return "a few moments ago";
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return "yesterday";
    if (days <= 3) return `${days} days ago`;
    return "a while ago";
  };

  if (loading || statusLoading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "80vh" }}
      >
        <Spinner />
      </div>
    );
  }

  return (
    <div className="container chat-app mt-4">
      
      <div className="row">
        {/* Followers List */}
        <div className={`col-md-4 ${isMobile && selectedUser ? "d-none" : ""}`}>
          <div className="list-group">
            {localUser && localUser.followers?.length > 0 ? (
              sortedFollowers.map((follower, index) => {
                const isChatBot = follower._id === CHATBOT_ID;
                const isOnline =
                  isChatBot || onlineUsers.includes(follower._id);
                const lastSeenTime = lastSeen[follower._id];

                // 🔹 Get last message from chats state
                const chatData = chats.find((c) => c._id === follower._id);
                const lastMsg = chatData?.lastMessage;

                return (
                  <button
                    key={index}
                    className={`list-group-item list-group-item-action d-flex align-items-center justify-content-between ${
                      selectedUser && follower._id === selectedUser._id
                        ? "active"
                        : ""
                    }`}
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
                        <div className="fw-bold">{follower.username}</div>

                        {/* ✅ Last Message */}
                        <div
                          className="text-truncate text-muted"
                          style={{ maxWidth: "180px" }}
                        >
                          <small>{lastMsg}</small>
                        </div>

                        {/* ✅ Online / Last Seen */}
                        <small className="text-muted">
                          {isOnline ? (
                            <span className="text-success">Active</span>
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
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => window.history.back()}
                >
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
            <ChatBox
              messages={messages}
              onSendMessage={handleSendMessage}
              user={user}
              selectedUser={selectedUser}
              localUser={localUser}
              onLastMessageUpdate={handleLastMessageUpdate}
              onBack={handleBack}
            />
          ) : (
            <div className="text-muted p-4">Select a user to start chatting</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
