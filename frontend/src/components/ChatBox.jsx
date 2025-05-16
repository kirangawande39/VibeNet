import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import socket from "../socket";

const ChatBox = ({ user, selectedUser }) => {
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]); // online users list
  const [isTyping, setIsTyping] = useState(false); // typing indicator
  const chatEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [chatId, setChatId] = useState(null);

  const token = user?.token || localStorage.getItem("token");

  // Scroll chat to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Create or join chat when selectedUser changes
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

  // Fetch messages when chatId changes
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

  // Live users socket logic
  useEffect(() => {
    if (!user?.id) return;

    socket.emit("user-online", user.id); // tell server this user is online

    socket.on("online-users", (users) => {
      setOnlineUsers(users); // update online users list
    });

    return () => {
      socket.off("online-users");
    };
  }, [user]);

  // Listen for new incoming messages
  useEffect(() => {
    const handleReceiveMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("receive-message", handleReceiveMessage);

    return () => {
      socket.off("receive-message", handleReceiveMessage);
    };
  }, []);

  // Listen for typing events
  useEffect(() => {
    const handleTypingEvent = ({ senderId }) => {
      if (senderId === selectedUser._id) {
        setIsTyping(true);
      }
    };

    const handleStopTypingEvent = ({ senderId }) => {
      if (senderId === selectedUser._id) {
        setIsTyping(false);
      }
    };

    socket.on("typing", handleTypingEvent);
    socket.on("stop-typing", handleStopTypingEvent);

    return () => {
      socket.off("typing", handleTypingEvent);
      socket.off("stop-typing", handleStopTypingEvent);
    };
  }, [selectedUser]);

  // Handle typing and emit events
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

      const sentMessage = res.data;
      setMessages((prev) => [...prev, sentMessage]);
      setNewMessage("");

      socket.emit("send-message", {
        chatId,
        message: sentMessage,
      });

      // Stop typing immediately after sending message
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
          <div>
            <span
              className={`badge ${isSelectedUserOnline ? "bg-success" : "bg-secondary"
                }`}
            >
              {isSelectedUserOnline ? "Live" : "Offline"}
            </span>
          </div>
        </div>
      )}

      <div
        className="card-body chat-box"
        style={{ height: "300px", overflowY: "auto" }}
      >
        {messages.map((msg, index) => {
          const isOwnMessage = msg.sender._id === user.id;
          const formattedTime = new Date(msg.createdAt).toLocaleTimeString(
            [],
            {
              hour: "2-digit",
              minute: "2-digit",
            }
          );

          return (
            <div
              key={index}
              className={`d-flex flex-column mb-3 ${isOwnMessage ? "align-items-end" : "align-items-start"
                }`}
            >
              <div className={`d-flex ${isOwnMessage ? "flex-row-reverse" : ""}`}>
                <img
                  src={
                    isOwnMessage
                      ? user.profilePic || "/default-profile.png"
                      : msg.sender.profilePic || "/default-profile.png"
                  }
                  alt="Profile"
                  className="rounded-circle me-2 ms-2"
                  style={{ width: "30px", height: "30px", objectFit: "cover" }}
                />

                <div
                  className={`p-2 rounded ${isOwnMessage ? "bg-primary text-white" : "bg-light"
                    }`}
                  style={{ maxWidth: "60%" }}
                >
                  <div>{msg.text}</div>
                  <div
                    className="text-muted text-end mt-1"
                    style={{ fontSize: "0.75rem" }}
                  >
                    {formattedTime}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {/* Typing indicator */}
        {isTyping && selectedUser && (
          <div className="d-flex align-items-center gap-2 mb-2 ms-2">
            <img
              src={selectedUser.profilePic || "/default-profile.png"}
              alt="Typing..."
              className="rounded-circle"
              style={{ width: "28px", height: "28px", objectFit: "cover" }}
            />
            <div className="bg-light rounded px-3 py-1 d-flex align-items-center shadow-sm">
              <span className="text-muted" style={{ fontSize: "0.9rem" }}>
                {selectedUser.username} is typing
              </span>
              <span className="typing-dots ms-1">
                <span>.</span>
                <span>.</span>
                <span>.</span>
              </span>
            </div>
          </div>
        )}
         <br />
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
        <br />
        {/* <p>User Id: {user.id}</p>
        <p>Chat Id: {chatId ? chatId : "Creating chat..."}</p> */}
      </div>
    </div>
  );
};

export default ChatBox;
