import React, { useState, useContext, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import ChatBox from "../components/ChatBox";
import { AuthContext } from "../context/AuthContext";

const Chat = () => {
  const { user } = useContext(AuthContext);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

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

  // Resize listener for responsive handling
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Don't auto-select user on mount to preserve list view on mobile
  useEffect(() => {
    if (!isMobile && user && user.followers.length > 0) {
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

  return (
    <div className="container mt-4">
      <div className="row">
        {/* Follower List - Hide on mobile when a user is selected */}
        <div className={`col-md-4 ${isMobile && selectedUser ? "d-none" : ""}`}>
          <div className="list-group">
            {user && user.followers.length > 0 ? (
              user.followers.map((follower, index) => (
                <button
                  key={index}
                  className={`list-group-item list-group-item-action d-flex align-items-center ${selectedUser && follower._id === selectedUser._id ? "active" : ""
                    }`}
                  onClick={() => handleUserSelect(follower)}
                >
                  <img
                    src={follower.profilePic || "/default-profile.png"}
                    alt={follower.username}
                    className="rounded-circle me-2"
                    width="40"
                    height="40"
                    style={{ objectFit: "cover" }}
                  />
                  {follower.username}
                </button>
              ))
            ) : (
              <div className="text-muted p-2">No followers to show</div>
            )}
          </div>
        </div>

        {/* Chat Box - Show only if a user is selected */}
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
