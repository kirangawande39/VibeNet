import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import socket from "../socket";

import "../assets/css/ChatBox.css"

const ChatBox = ({ user, selectedUser, localUser }) => {
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [chatId, setChatId] = useState(null);

  const token = user?.token || localStorage.getItem("token");

  // Scroll to bottom when messages update
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Create or get chat
  useEffect(() => {
    if (!selectedUser || !user) return;

    const createChat = async () => {
      try {
        const res = await axios.post(
          "http://localhost:5000/api/chats",
          {
            senderId: user.id,
            receiverId: selectedUser._id,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setChatId(res.data._id);
        socket.emit("join-chat", res.data._id);
      } catch (error) {
        console.error("Error creating chat:", error);
      }
    };

    createChat();
  }, [selectedUser, user]);

  // Fetch messages
  useEffect(() => {
    if (!chatId) return;

    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/messages/${chatId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setMessages(res.data);
        socket.emit("join-chat", chatId);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [chatId]);


  useEffect(() => {
    if (!chatId) return;

    // Call API to mark messages as seen
    axios.put(`http://localhost:5000/api/messages/seen/${chatId}`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    }).catch(console.error);
  }, [chatId]);


  useEffect(() => {
    if (chatId && user?.id) {
      socket.emit("mark-seen", { chatId, userId: user.id });
    }
  }, [chatId, user?.id]);


  useEffect(() => {
    socket.on("messages-seen", ({ chatId: seenChatId, seenBy }) => {
      // Optionally update state if needed
      if (seenChatId === chatId && seenBy !== user.id) {
        console.log("Messages marked as seen");
        // Optionally refetch messages or update state
      }
    });

    return () => socket.off("messages-seen");
  }, [chatId]);

  // Online users
  useEffect(() => {
    if (!user?.id) return;

    socket.emit("user-online", user.id);

    socket.on("online-users", (users) => {
      setOnlineUsers(users);
    });

    return () => {
      socket.off("online-users");
    };
  }, [user]);

  // Handle incoming message
  useEffect(() => {
    const handleReceiveMessage = (msg) => {
      // Attach user info manually if missing
      if (!msg.sender || !msg.sender._id) {
        msg.sender = { _id: msg.senderId };
      }
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("receive-message", handleReceiveMessage);

    return () => {
      socket.off("receive-message", handleReceiveMessage);
    };
  }, [user]);

  // Typing indicator
  useEffect(() => {
    const handleTyping = ({ senderId }) => {
      if (senderId === selectedUser._id) {
        setIsTyping(true);
      }
    };

    const handleStopTyping = ({ senderId }) => {
      if (senderId === selectedUser._id) {
        setIsTyping(false);
      }
    };

    socket.on("typing", handleTyping);
    socket.on("stop-typing", handleStopTyping);

    return () => {
      socket.off("typing", handleTyping);
      socket.off("stop-typing", handleStopTyping);
    };
  }, [selectedUser]);

  // Handle typing
  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    if (!chatId) return;

    socket.emit("typing", {
      chatId,
      senderId: user.id,
      receiverId: selectedUser._id,
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop-typing", {
        chatId,
        senderId: user.id,
        receiverId: selectedUser._id,
      });
    }, 2000);
  };

  // Send message
  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatId) return;

    try {
      const res = await axios.post(
        "http://localhost:5000/api/messages",
        {
          chatId,
          text: newMessage,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const sentMessage = {
        ...res.data,
        sender: { _id: user.id, profilePic: user.profilePic }, // Manually attach sender
      };

      setMessages((prev) => [...prev, sentMessage]);
      setNewMessage("");

      socket.emit("send-message", {
        chatId,
        message: sentMessage,
      });

      socket.emit("stop-typing", {
        chatId,
        senderId: user.id,
        receiverId: selectedUser._id,
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const isSelectedUserOnline = onlineUsers.includes(selectedUser?._id);

  return (
    <div className="card">
      {selectedUser && (
        <div className="card-header d-flex align-items-center bg-light justify-content-between">
          <div className="d-flex align-items-center">
            <img
              src={selectedUser.profilePic || "/default-profile.png"}
              alt="Profile"
              className="rounded-circle me-2"
              style={{ width: "40px", height: "40px", objectFit: "cover" }}
            />
            <strong>{selectedUser.username}</strong>
          </div>
          <span
            className={`badge ${isSelectedUserOnline ? "bg-success" : "bg-secondary"}`}
          >
            {isSelectedUserOnline ? "Online" : "Offline"}
          </span>
        </div>
      )}

      <div className="card-body chat-box " style={{ height: "300px", overflowY: "auto" }}>
        {messages.map((msg, index) => {
          const isOwnMessage = msg.sender._id === user.id;
          const formattedTime = new Date(msg.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div
              key={index}
              className={`d-flex flex-column mb-3 ${isOwnMessage ? "align-items-end" : "align-items-start"}`}
            >
              <div className={`d-flex ${isOwnMessage ? "flex-row-reverse" : ""}`}>
                <img
                  src={
                    isOwnMessage
                      ? user.profilePic || "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                      : msg.sender?.profilePic || "/default-profile.png"
                  }
                  alt="Profile"
                  className="rounded-circle me-2 ms-2"
                  style={{ width: "30px", height: "30px", objectFit: "cover" }}
                />
                <div
                  className={`p-2 rounded ${isOwnMessage ? "bg-primary text-white" : "bg-light"}`}
                  style={{ maxWidth: "60%" }}
                >
                  <div>{msg.text}</div>
                  <div className="text-muted text-end mt-1" style={{ fontSize: "0.75rem" }}>
                    {formattedTime}
                  </div>
                  {/* Seen Status */}
                  {isOwnMessage && msg.seen && (
                    <div className="text-muted text-end" style={{ fontSize: "0.65rem", marginTop: "2px" }}>
                      <span style={{ color: 'blue' }}>✔✔</span>

                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}



        {isTyping && selectedUser && (
          <div className="d-flex align-items-center gap-2 mb-4 ms-2">
            <img
              src={selectedUser.profilePic || "/default-profile.png"}
              alt="Typing..."
              className="rounded-circle typing-profile-pic"
              style={{ width: "32px", height: "32px", objectFit: "cover" }}
            />
            <div className="typing-bubble px-3 py-2 rounded shadow-sm">
              <div className="typing-dot-bounce">
                <span className="dot" />
                <span className="dot" />
                <span className="dot" />
              </div>
            </div>
          </div>
        )}


        <div ref={chatEndRef} />
      </div>

      <div className="card-footer">
        <form onSubmit={handleSend} className="d-flex">
          <input
            type="text"
            className="form-control me-2"
            placeholder="Type a message..."
            value={newMessage}
            onChange={handleTyping}
          />
          <button type="submit" className="btn btn-primary">
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatBox;
