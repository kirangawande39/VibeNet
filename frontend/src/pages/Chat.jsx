import React, { useState, useContext, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import ChatBox from "../components/ChatBox";
import { AuthContext } from "../context/AuthContext"; // Import AuthContext

const dummyUsers = [
  { id: 1, name: "Rohit Sharma", profilePic: "https://i.pinimg.com/originals/95/95/93/9595933bf6ff106cf6b7b16a54efdb49.jpg" },
  { id: 2, name: "Jane Smith", profilePic: "https://i.pinimg.com/originals/95/95/93/9595933bf6ff106cf6b7b16a54efdb49.jpg" },
  { id: 3, name: "Alex Johnson", profilePic: "https://i.pinimg.com/originals/95/95/93/9595933bf6ff106cf6b7b16a54efdb49.jpg" },
];

const dummyMessages = {
  1: [
    { id: 1, sender: "Rohit Sharma", text: "Hey, how are you?" },
    { id: 2, sender: "You", text: "I'm good! What's up?" },
  ],
  2: [
    { id: 1, sender: "Jane Smith", text: "Hi! What's new?" },
    { id: 2, sender: "You", text: "Just learning React!" },
  ],
  3: [
    { id: 1, sender: "Alex Johnson", text: "Hey, need help with your project?" },
    { id: 2, sender: "You", text: "Sure! That would be great." },
  ],
};

const Chat = () => {
  const { user } = useContext(AuthContext); // Access the current logged-in user from context
  const [selectedUser, setSelectedUser] = useState(dummyUsers[0]); // Default user
  const [messages, setMessages] = useState(dummyMessages[selectedUser.id]);

  const handleSendMessage = (newMessage) => {
    setMessages([...messages, { sender: user.username, text: newMessage }]); // Use logged-in user’s name
  };

  useEffect(() => {
    if (user) {
      // Optionally, set the default user as the logged-in user
      setSelectedUser(dummyUsers[0]); // Or set a default selected user based on the logged-in user
    }
  }, [user]);

  return (
    <div className="container mt-4">
      <div className="row">
        {/* User List */}
        <div className="col-md-4">
          <div className="list-group">
            {dummyUsers.map((userItem) => (
              <button
                key={userItem.id}
                className={`list-group-item list-group-item-action d-flex align-items-center ${userItem.id === selectedUser.id ? "active" : ""}`}
                onClick={() => {
                  setSelectedUser(userItem);
                  setMessages(dummyMessages[userItem.id]); // Load user messages
                }}
              >
                <img
                  src={userItem.profilePic}
                  alt={userItem.name}
                  className="rounded-circle me-2"
                  width="40"
                />
                {userItem.user}
              </button>
            ))}
          </div>
        </div>

        {/* ChatBox Component */}
        <div className="col-md-8">
          <ChatBox messages={messages} onSendMessage={handleSendMessage} />
        </div>
      </div>
    </div>
  );
};

export default Chat;
