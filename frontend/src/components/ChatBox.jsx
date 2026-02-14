import React, { useState, useEffect, useRef } from "react";
import socket from "../socket";
import { RiDeleteBin2Line } from "react-icons/ri";

import "../assets/css/ChatBox.css"
import { MdInsertPhoto, MdArrowBack } from "react-icons/md";
import { handleError } from '../utils/errorHandler';
import { toast } from 'react-toastify';
import Spinner from "./Spinner";
import API from "../services/api";
const ChatBox = ({ user, selectedUser, localUser, onLastMessageUpdate, onBack }) => {

  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [chatId, setChatId] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const [page, setPage] = useState(1);

  const [lastMessage, setlastMessage]=useState(null);


  const [startX, setStartX] = useState(0); // touch starting position
  const [isSwiping, setIsSwiping] = useState(false);


  const [loading, setLoading] = useState(true);

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

      const res = await API.post(`/api/messages/image`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });


      // console.log("image res :", res.data)

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

      toast.success("Image uploaded successfully");
    } catch (err) {
      handleError(err);
    }
  };



  // Long press state
  const [longPressMessageId, setLongPressMessageId] = useState(null);
  const longPressTimer = useRef(null);


  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });

  }, [messages, isTyping]);

  useEffect(() => {

    if (!selectedUser || !user) return;
    const createOrFetchChat = async () => {
      try {
        const res = await API.post(
          `/api/chats`,
          { senderId: user.id, receiverId: selectedUser._id },
        );
        // // console.log("ChatId :",res.data)
        setChatId(res.data._id);


        onLastMessageUpdate(res.data.lastMessage);
        setlastMessage(res.data.lastMessage);
      } catch (err) {
        console.error("failed to get chat", err)
      }
    };

    createOrFetchChat();
  }, [selectedUser, user]);




  useEffect(() => {
    if (!chatId) return;
    fetchMessages(1);
  }, [chatId]);

  const fetchMessages = async (pageNumber) => {
    try {
      setLoading(true);
      const res = await API.get(
        `/api/messages/${chatId}?page=${pageNumber}&limit=20`,
      );

      if (res.data.lenght === 0) {
        setHasMore(false);
        return;
      }

      setMessages(prev =>
        pageNumber === 1 ? res.data : [...res.data, ...prev]
      );

      socket.emit("join-chat", chatId);
    } catch (err) {
      handleError(err);
    }
    finally {
      setLoading(false);
    }
  };


  const loadOlder = () => {
    if (!hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchMessages(nextPage);
  }



  const hasMarkedSeen = useRef(false);

  useEffect(() => {
    if (!chatId || !user?.id || hasMarkedSeen.current) return;

    const unseen = messages.some(
      (msg) => msg.sender._id !== user.id && !msg.seen
    );

    if (!unseen) return;

    hasMarkedSeen.current = true;

    API.put(`/api/messages/seen/${chatId}`, {}).catch(console.error);

    socket.emit("mark-seen", { chatId, userId: user.id });

  }, [chatId, messages]);







  useEffect(() => {

    if (!user?.id) return;

    socket.emit("user-online", user.id);

    const handleOnline = (users) => setOnlineUsers(users);

    socket.on("online-users", handleOnline);


    return () => socket.off("online-users", handleOnline);


  }, [user]);







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
    const receiverId = selectedUser._id;
    try {
      const res = await API.post(
        `/api/messages`,
        { chatId, receiverId, text: newMessage },
      );

      // console.log("msg res :", res.data)

      const sentMessage = {
        ...res.data,
        sender: { _id: user.id, profilePic: user.profilePic },
      };

      // onLastMessageUpdate(newMessage);
      // setMessages((prev) => [...prev, sentMessage]);
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
      handleError(err);
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
      const res = await API.delete(
        `/api/messages/${msgId}`,

      );

      // alert(res.data.message);
      setMessages((prev) => prev.filter((msg) => msg._id !== msgId));
      setLongPressMessageId(null);

      // Notify other user
      socket.emit("delete-message", { chatId, msgId });
    } catch (err) {
      handleError(err);
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
    const handleReceive = (msg) => {
      // console.log("Message received via socket:", msg);
      // console.log("Current Chat ID:", chatId)

      if (!msg.sender || !msg.sender._id) {
        msg.sender = { _id: msg.senderId };
      }

      const incomingChatId = msg.chatId?._id || msg.chatId;

      if (incomingChatId === chatId) {
        setMessages((prev) => {
          //  Check if this message already exists
          const exists = prev.some((m) => m._id === msg._id);
          if (!exists && msg._id) {
            return [...prev, msg];
          }
          return prev;
        });

        //  Scroll to bottom (optional)
        setTimeout(() => {
          chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    };

    socket.on("receive-message", handleReceive);
    return () => socket.off("receive-message", handleReceive);
  }, [chatId]);




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

  const handleTouchStart = (e) => {
    setStartX(e.touches[0].clientX);
    setIsSwiping(true);
  };


  const handleTouchMove = (e) => {
    if (!isSwiping) return;

    const currentX = e.touches[0].clientX;

    const diff = currentX - startX; // right swipe kitna hua

    // 50px threshold like WhatsApp
    if (diff > 50) {
      setIsSwiping(false);
      // onReply(message);  // ORIGINAL MESSAGE KO REPLY KAREGA
    }
  };

  const handleTouchEnd = () => {
    setIsSwiping(false);
  };





  if (!user || !selectedUser) {
    return <div>Please select a user to start chat</div>;
  }



  // console.log("lastMessage :",lastMessage);


  return (
    <div className="card chat-b">
      <div className="card-header d-flex align-items-center bg-light justify-content-between">
        <div className="d-flex align-items-center">
          <div className="d-md-none mb-2">
            <button className="btn btn-link" onClick={onBack}>
              <MdArrowBack size={24} />
            </button>
          </div>
          {/* <p>lastMessage::{lastMessage}</p> */}
          <img
            src={selectedUser.profilePic.url || "https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2264922221.jpg"}
            alt="Profile"
            className="rounded-circle me-2"
            style={{ width: "40px", height: "40px", objectFit: "cover" }}
          />
          <strong>{selectedUser.username}</strong>
        </div>
        <span className={`badge ${selectedUser?._id === "684f268c7dad0bf1b1dfd4f8" || isSelectedUserOnline ? "bg-success" : "bg-secondary"}`}>
          {selectedUser?._id === "684f268c7dad0bf1b1dfd4f8"
            ? "Online"
            : isSelectedUserOnline
              ? "Online"
              : "Offline"}
        </span>

      </div>


      <div
        className="card-body chat-box  overflow-y-auto relative"
        style={{ height: "400px", }}
      >
        {hasMore &&
          <p
            onClick={loadOlder}
            className="sticky top-0 z-20
             mx-auto w-fit
             text-sm text-black
             bg-amber-100
             px-4 py-1
             rounded-full
             shadow-md
             cursor-pointer
             my-2"
          >
            Load older messages
          </p>



        }
        {/* no latest msg avialable  */}
        {/* // console.log("🧾 Messages rendering:", messages) */}

        {loading ? (
          <Spinner />
        ) : (
          messages.map((msg, index) => {
            const isOwn = msg?.sender?._id === user.id;
            const time = new Date(msg.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });
            // latest msg is here  
            // console.log("🧾 Rendering message:", msg?.sender?.profilePic?.url, "from", msg.sender?.name || msg.sender?._id);

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

                <div className={`d-flex ${isOwn ? "flex-row-reverse" : ""}`}>
                  <img
                    src={
                      isOwn
                        ?
                        user?.profilePic?.url || "https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2264922221.jpg"
                        : selectedUser.profilePic.url || "https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2264922221.jpg"
                    }
                    alt="Profile"
                    className="rounded-circle me-2 ms-2"
                    style={{ width: "30px", height: "30px", objectFit: "cover" }}
                  />



                  <div style={{ maxWidth: "60%" }}>
                    {/* 📝 Text Message Box */}

                    {msg.text &&

                      <div className={`p-2 rounded ${isOwn ? "sender-message" : "receiver-message"}`} onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}>

                        <div>
                          {msg.text}
                        </div>


                        {/* 🕒 Time */}
                        <div className="text-muted text-end mt-1" style={{ fontSize: "0.75rem" }}>
                          {time}
                        </div>

                        {/* ✅ Seen Status (only own message) */}
                        {isOwn && selectedUser._id !== "684f268c7dad0bf1b1dfd4f8" && (
                          <div
                            className="text-muted text-end"
                            style={{ fontSize: "0.65rem", marginTop: "2px" }}
                          >
                            <span style={{ color: msg.seen ? "#34B7F1" : "gray" }}>✔✔</span>

                          </div>
                        )}


                      </div>
                    }



                    {/* 🖼️ Image Block */}
                    {msg.image?.url && (
                      <div className={`message-image-container ${isOwn ? "sender-image" : "receiver-image"}`}>
                        <img
                          src={msg.image.url}
                          alt="sent"
                          className="message-image"
                          onClick={() => window.open(msg.image.url, "_blank")}
                        />

                        {/* Time below image */}
                        <div className="message-time">{time}</div>

                        {/* Seen Status */}
                        {isOwn && (
                          <div className="message-seen">
                            <span style={{ color: msg.seen ? "#34B7F1" : "gray" }}>✔✔</span>
                          </div>
                        )}
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
          })
        )}



        {isTyping && (
          <div className="d-flex align-items-center gap-2 mb-4 ms-2">
            <img
              src={selectedUser.profilePic?.url || "https://www.shutterstock.com/image-vector/vector-flat-illustration-grayscale-avatar-600nw-2264922221.jpg"}
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

          <button type="submit" className="btn btn-primary d-none">

          </button>

          <input
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            ref={fileInputRef}
            onChange={handleFileChange}
          />

          {/* Visible button to trigger file picker */}
          {
            selectedUser._id !== "684f268c7dad0bf1b1dfd4f8" &&

            <button onClick={handleImageButtonClick} className="btn btn-primary " style={{ marginLeft: "5px" }}>
              <MdInsertPhoto />
            </button>
          }

        </form>
      </div>
    </div>
  );
};
export default ChatBox;

