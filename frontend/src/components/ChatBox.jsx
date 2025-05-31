import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import socket from "../socket";
import { RiDeleteBin2Line } from "react-icons/ri";
import "../assets/css/ChatBox.css"
import { IoIosSend } from "react-icons/io";
import { MdInsertPhoto } from "react-icons/md";
const ChatBox = ({ user, selectedUser, localUser, onLastMessageUpdate }) => {
  if (!user || !selectedUser) {
    return <div>Please select a user to start chat</div>;
  }

  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [chatId, setChatId] = useState(null);
  const [lastMessage, setlastMessage] = useState(null)

  const [previewImage, setPreviewImage] = useState(null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const fileInputRef = useRef();

  const handleImageButtonClick = () => {
    fileInputRef.current.click();
  };
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !chatId) return;

    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("chatId", chatId);

      const res = await axios.post(`${backendUrl}/api/messages/image`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });


      console.log("image res :", res.data)

      const sentImageMessage = {
        ...res.data,
        sender: { _id: user.id, profilePic: user.profilePic },
      };

      setMessages((prev) => [...prev, sentImageMessage]);

      socket.emit("send-message", {
        chatId,
        message: sentImageMessage,
      });

      socket.emit("stop-typing", {
        chatId,
        senderId: user.id,
        receiverId: selectedUser._id,
      });

      alert("Image uploaded successfully");
    } catch (error) {
      console.error("Image upload failed:", error);
    }
  };



  // Long press state
  const [longPressMessageId, setLongPressMessageId] = useState(null);
  const longPressTimer = useRef(null);

  const token = user?.token || localStorage.getItem("token");

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });

  }, [messages, isTyping]);

  useEffect(() => {
    if (!selectedUser || !user) return;

    const createOrFetchChat = async () => {
      try {
        const res = await axios.post(
          `${backendUrl}/api/chats`,
          { senderId: user.id, receiverId: selectedUser._id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // console.log("ChatId :",res.data)
        setChatId(res.data._id);
        onLastMessageUpdate(lastMessage);
        setlastMessage(res.data.lastMessage);
      } catch (error) {
        console.error("Error creating chat:", error);
      }
    };

    createOrFetchChat();
  }, [selectedUser, user, token]);

  useEffect(() => {
    if (!chatId) return;

    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          `${backendUrl}/api/messages/${chatId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessages(res.data);
        socket.emit("join-chat", chatId);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [chatId, token]);

  useEffect(() => {
    if (!chatId || !user?.id) return;

    const unseen = messages.some(
      (msg) => msg.sender._id !== user.id && !msg.seen
    );
    if (unseen) {
      axios
        .put(`${backendUrl}/api/messages/seen/${chatId}`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .catch(console.error);

      socket.emit("mark-seen", { chatId, userId: user.id });
    }
  }, [chatId, messages, user, token]);

  useEffect(() => {
    if (!user?.id) return;
    socket.emit("user-online", user.id);

    const handleOnline = (users) => setOnlineUsers(users);
    socket.on("online-users", handleOnline);
    return () => socket.off("online-users", handleOnline);
  }, [user]);

  useEffect(() => {
    const handleReceive = (msg) => {
      if (!msg.sender || !msg.sender._id) {
        msg.sender = { _id: msg.senderId };
      }
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("receive-message", handleReceive);
    return () => socket.off("receive-message", handleReceive);
  }, []);

  useEffect(() => {
    const showTyping = ({ senderId }) =>
      senderId === selectedUser._id && setIsTyping(true);
    const stopTyping = ({ senderId }) =>
      senderId === selectedUser._id && setIsTyping(false);

    socket.on("typing", showTyping);
    socket.on("stop-typing", stopTyping);
    return () => {
      socket.off("typing", showTyping);
      socket.off("stop-typing", stopTyping);
    };
  }, [selectedUser]);

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

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatId) return;

    try {
      const res = await axios.post(
        `${backendUrl}/api/messages`,
        { chatId, text: newMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("msg res :", res.data)

      const sentMessage = {
        ...res.data,
        sender: { _id: user.id, profilePic: user.profilePic },
      };

      onLastMessageUpdate(newMessage);
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
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const isSelectedUserOnline = onlineUsers.includes(selectedUser._id);

  // Long press handlers
  const onMessageMouseDown = (msgId) => {
    longPressTimer.current = setTimeout(() => {
      setLongPressMessageId(msgId);
    }, 800); // 800ms long press duration
  };

  const onMessageMouseUpOrLeave = () => {
    clearTimeout(longPressTimer.current);
  };
  const handleDeleteMessage = async (msgId) => {
    try {
      const res = await axios.delete(
        `${backendUrl}/api/messages/${msgId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // alert(res.data.message);
      setMessages((prev) => prev.filter((msg) => msg._id !== msgId));
      setLongPressMessageId(null);

      // Notify other user
      socket.emit("delete-message", { chatId, msgId });
    } catch (err) {
      console.error("Error deleting message:", err);
    }
  };


  useEffect(() => {
    if (!socket) return;

    socket.on("delete-message", ({ msgId }) => {
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg._id !== msgId)
      );
    });

    return () => {
      socket.off("delete-message");
    };
  }, [socket]);




  useEffect(() => {
    socket.on("message-seen", ({ chatId: seenChatId, seenBy }) => {
      if (seenChatId === chatId && seenBy !== user.id) {
        // Update message list or show "seen" tick mark
        setMessages((prev) =>
          prev.map((msg) =>
            msg.sender._id === user.id ? { ...msg, seen: true } : msg
          )
        );
      }
    });

    return () => {
      socket.off("message-seen");
    };
  }, [chatId, user.id]);


  return (
    <div className="card">
      <div className="card-header d-flex align-items-center bg-light justify-content-between">
        <div className="d-flex align-items-center">
          <img
            src={selectedUser.profilePic.url || selectedUser.profilePic || "/default-profile.png"}
            alt="Profile"
            className="rounded-circle me-2"
            style={{ width: "40px", height: "40px", objectFit: "cover" }}
          />
          <strong>{selectedUser.username}</strong>
        </div>
        <span className={`badge ${isSelectedUserOnline ? "bg-success" : "bg-secondary"}`}>
          {isSelectedUserOnline ? "Online" : "Offline"}
        </span>
      </div>

      <div
        className="card-body chat-box"
        style={{ height: "300px", overflowY: "auto" }}
      >
        {messages.map((msg, index) => {
          const isOwn = msg.sender._id === user.id;
          const time = new Date(msg.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div
              key={msg._id || index}
              className={`d-flex flex-column mb-3 ${isOwn ? "align-items-end" : "align-items-start"}`}
              onMouseDown={() => onMessageMouseDown(msg._id)}
              onMouseUp={onMessageMouseUpOrLeave}
              onMouseLeave={onMessageMouseUpOrLeave}
              onTouchStart={() => onMessageMouseDown(msg._id)}
              onTouchEnd={onMessageMouseUpOrLeave}
              style={{ position: "relative" }}
            >
              {/* <p>chatId:{msg.chatId}</p>
              <p>LastMsg:{lastMessage}</p> */}
              <div className={`d-flex ${isOwn ? "flex-row-reverse" : ""}`}>
                <img
                  src={
                    isOwn
                      ? user.profilePic.url || user.profilePic || "/default-profile.png"
                      : msg.sender?.profilePic.url || msg.sender?.profilePic || "/default-profile.png"
                  }
                  alt="Profile"
                  className="rounded-circle me-2 ms-2"
                  style={{ width: "30px", height: "30px", objectFit: "cover" }}
                />
                {/* <img
                  src={chatImage?.url}
                  alt="Profile"
                  className="me-2 ms-2"
                  style={{ width: "200px", height: "300px", objectFit: "cover" }}
                /> */}
                <div
                  className={`p-2 rounded ${isOwn ? "sender-message" : "receiver-message"}`}
                  style={{ maxWidth: "60%" }}
                >
                  {/* 📝 Show Text if present */}
                  {msg.text && <div>{msg.text}</div>}

                  {/* 🖼️ Show Image if present */}
                  {msg.image.url && (
                    <div className="mt-2">
                      <img
                        src={msg.image.url} // ✅ Cloudinary URL directly
                        alt="sent"
                        style={{
                          width: "250px",
                          maxWidth: "100%",
                          height: "auto",
                          objectFit: "cover",
                          borderRadius: "12px",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                          transition: "transform 0.3s ease",
                          cursor: "pointer",
                        }}
                        onClick={() => window.open(msg.image.url, "_blank")} // Optional full-size view
                      />
                    </div>
                  )}


                  {/* 🕒 Time */}
                  <div className="text-muted text-end mt-1" style={{ fontSize: "0.75rem" }}>
                    {time}
                  </div>

                  {/* ✅ Seen Status (if own message) */}
                  {isOwn && (
                    <div className="text-muted text-end" style={{ fontSize: "0.65rem", marginTop: "2px" }}>
                      <span style={{ color: msg.seen ? "#34B7F1" : "gray" }}>✔✔</span>
                    </div>
                  )}
                </div>

              </div>

              {longPressMessageId === msg._id && isOwn && (
                <button
                  className="msg-delete-btn"
                  onClick={() => handleDeleteMessage(msg._id)}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <RiDeleteBin2Line />
                </button>
              )}
            </div>
          );
        })}


        {isTyping && (
          <div className="d-flex align-items-center gap-2 mb-4 ms-2">
            <img
              src={selectedUser.profilePic.url || selectedUser.profilePic || "/default-profile.png"}
              alt="Typing..."
              className="rounded-circle"
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
            placeholder="Message..."
            value={newMessage}
            onChange={handleTyping}
          />
          <button type="submit" className="btn btn-primary">
            <IoIosSend />
          </button>

          <input
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            ref={fileInputRef}
            onChange={handleFileChange}
          />

          {/* Visible button to trigger file picker */}
          <button onClick={handleImageButtonClick} className="btn btn-primary " style={{marginLeft:"5px"}}>
            <MdInsertPhoto />
          </button>

        </form>
      </div>
    </div>
  );
};

export default ChatBox;
