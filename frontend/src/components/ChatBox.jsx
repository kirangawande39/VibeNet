import React, { useState, useEffect, useRef } from "react";

const ChatBox = ({ messages, onSendMessage, user, selectedUser }) => {
  const [newMessage, setNewMessage] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (newMessage.trim() === "") return;
    onSendMessage(newMessage);
    setNewMessage("");
  };

  return (
    <div className="card">
      {/* Selected user info at top */}
      {selectedUser && (
        <div className="card-header d-flex align-items-center bg-light">
          <img
            src={selectedUser.profilePic || "/default-profile.png"}
            alt="Profile"
            className="rounded-circle me-2"
            style={{ width: "40px", height: "40px", objectFit: "cover" }}
          />
          <strong>{selectedUser.username}</strong>
        </div>
      )}

      {/* Chat Messages */}
      <div className="card-body chat-box" style={{ height: "300px", overflowY: "auto" }}>
        {messages.map((msg, index) => (
          <div key={index} className={`mb-2 ${msg.sender === user.username ? "text-end" : ""}`}>
            <strong>{msg.sender}:</strong> {msg.text}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Message Input */}
      <div className="card-footer">
        <form onSubmit={handleSend} className="d-flex">
          <input
            type="text"
            className="form-control me-2"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">Send</button>
        </form>
      </div>
    </div>
  );
};

export default ChatBox;
