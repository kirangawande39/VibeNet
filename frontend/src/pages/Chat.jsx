// import React, { useState, useContext, useEffect } from "react";
// import "bootstrap/dist/css/bootstrap.min.css";
// import ChatBox from "../components/ChatBox";
// import { AuthContext } from "../context/AuthContext"; // Import AuthContext

// const dummyUsers = [
//   { id: 1, name: "Rohit Sharma", profilePic: "https://i.pinimg.com/originals/95/95/93/9595933bf6ff106cf6b7b16a54efdb49.jpg" },
//   { id: 2, name: "Jane Smith", profilePic: "https://i.pinimg.com/originals/95/95/93/9595933bf6ff106cf6b7b16a54efdb49.jpg" },
//   { id: 3, name: "Alex Johnson", profilePic: "https://i.pinimg.com/originals/95/95/93/9595933bf6ff106cf6b7b16a54efdb49.jpg" },
// ];

// const dummyMessages = {
//   1: [
//     { id: 1, sender: "Rohit Sharma", text: "Hey, how are you?" },
//     { id: 2, sender: "You", text: "I'm good! What's up?" },
//   ],
//   2: [
//     { id: 1, sender: "Jane Smith", text: "Hi! What's new?" },
//     { id: 2, sender: "You", text: "Just learning React!" },
//   ],
//   3: [
//     { id: 1, sender: "Alex Johnson", text: "Hey, need help with your project?" },
//     { id: 2, sender: "You", text: "Sure! That would be great." },
//   ],
// };

// const Chat = () => {
//   const { user } = useContext(AuthContext); // Access the current logged-in user from context
//   const [selectedUser, setSelectedUser] = useState(dummyUsers[0]); // Default user
//   const [messages, setMessages] = useState(dummyMessages[selectedUser.id]);

//   const handleSendMessage = (newMessage) => {
//     setMessages([...messages, { sender: user.username, text: newMessage }]); // Use logged-in user’s name
//   };

//   useEffect(() => {
//     if (user) {
//       // Optionally, set the default user as the logged-in user
//       setSelectedUser(dummyUsers[0]); // Or set a default selected user based on the logged-in user
//     }
//   }, [user]);

//   return (
//     <div className="container mt-4">
//       <div className="row">
//         {/* User List */}
//         <div className="col-md-4">
//           <div className="list-group">
//             {dummyUsers.map((userItem) => (
//               <button
//                 key={userItem.id}
//                 className={`list-group-item list-group-item-action d-flex align-items-center ${userItem.id === selectedUser.id ? "active" : ""}`}
//                 onClick={() => {
//                   setSelectedUser(userItem);
//                   setMessages(dummyMessages[userItem.id]); // Load user messages
//                 }}
//               >
//                 <img
//                   src={userItem.profilePic}
//                   alt={userItem.name}
//                   className="rounded-circle me-2"
//                   width="40"
//                 />
//                 {userItem.user}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* ChatBox Component */}
//         <div className="col-md-8">
//           <ChatBox messages={messages} onSendMessage={handleSendMessage} />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Chat;




import React, { useState, useContext, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { AuthContext } from "../context/AuthContext";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faEllipsisV, faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import '../assets/css/Chat.css'; // We'll create this CSS file

const dummyUsers = [
  { id: 1, name: "Rohit Sharma", lastMessage: "Hey, how are you?", time: "10:30 AM", unread: 2, profilePic: "https://i.pinimg.com/originals/95/95/93/9595933bf6ff106cf6b7b16a54efdb49.jpg" },
  { id: 2, name: "Jane Smith", lastMessage: "Hi! What's new?", time: "Yesterday", unread: 0, profilePic: "https://i.pinimg.com/originals/95/95/93/9595933bf6ff106cf6b7b16a54efdb49.jpg" },
  { id: 3, name: "Alex Johnson", lastMessage: "Need help with your project?", time: "Monday", unread: 1, profilePic: "https://i.pinimg.com/originals/95/95/93/9595933bf6ff106cf6b7b16a54efdb49.jpg" },
];

const dummyMessages = {
  1: [
    { id: 1, sender: "Rohit Sharma", text: "Hey, how are you?", time: "10:30 AM", isMe: false },
    { id: 2, sender: "You", text: "I'm good! What's up?", time: "10:32 AM", isMe: true },
    { id: 3, sender: "Rohit Sharma", text: "Want to meet for coffee tomorrow?", time: "10:33 AM", isMe: false },
  ],
  2: [
    { id: 1, sender: "Jane Smith", text: "Hi! What's new?", time: "Yesterday", isMe: false },
    { id: 2, sender: "You", text: "Just learning React!", time: "Yesterday", isMe: true },
  ],
  3: [
    { id: 1, sender: "Alex Johnson", text: "Hey, need help with your project?", time: "Monday", isMe: false },
    { id: 2, sender: "You", text: "Sure! That would be great.", time: "Monday", isMe: true },
    { id: 3, sender: "Alex Johnson", text: "I can help you with the backend part", time: "Monday", isMe: false },
  ],
};

const Chat = () => {
  const { user } = useContext(AuthContext);
  const [selectedUser, setSelectedUser] = useState(dummyUsers[0]);
  const [messages, setMessages] = useState(dummyMessages[selectedUser.id]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;
    
    const newMsg = {
      id: messages.length + 1,
      sender: "You",
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    };
    
    setMessages([...messages, newMsg]);
    setNewMessage("");
  };

  const filteredUsers = dummyUsers.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    setMessages(dummyMessages[selectedUser.id]);
  }, [selectedUser]);

  return (
    <div className="chat-app">
      {/* Sidebar */}
      <div className="chat-sidebar">
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <h5>Messages</h5>
          <div className="header-actions">
            {showSearch ? (
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search contacts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <FontAwesomeIcon 
                  icon={faTimes} 
                  onClick={() => {
                    setShowSearch(false);
                    setSearchTerm("");
                  }} 
                />
              </div>
            ) : (
              <FontAwesomeIcon 
                icon={faSearch} 
                onClick={() => setShowSearch(true)}
              />
            )}
          </div>
        </div>

        {/* User List */}
        <div className="user-list">
          {filteredUsers.map((userItem) => (
            <div
              key={userItem.id}
              className={`user-item ${userItem.id === selectedUser.id ? "active" : ""}`}
              onClick={() => setSelectedUser(userItem)}
            >
              <div className="user-avatar">
                <img src={userItem.profilePic} alt={userItem.name} />
                {userItem.unread > 0 && <span className="unread-count">{userItem.unread}</span>}
              </div>
              <div className="user-info">
                <h6>{userItem.name}</h6>
                <p className="last-message">{userItem.lastMessage}</p>
              </div>
              <div className="message-time">{userItem.time}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="chat-area">
        {/* Chat Header */}
        <div className="chat-header">
          <div className="chat-user">
            <img src={selectedUser.profilePic} alt={selectedUser.name} />
            <h5>{selectedUser.name}</h5>
          </div>
          <div className="chat-actions">
            <FontAwesomeIcon icon={faEllipsisV} />
          </div>
        </div>

        {/* Messages */}
        <div className="messages-container">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`message ${message.isMe ? "sent" : "received"}`}
            >
              {!message.isMe && (
                <img 
                  src={selectedUser.profilePic} 
                  alt={message.sender} 
                  className="message-avatar"
                />
              )}
              <div className="message-content">
                <div className="message-text">{message.text}</div>
                <div className="message-time">{message.time}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="message-input">
          <input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button onClick={handleSendMessage}>
            <FontAwesomeIcon icon={faPaperPlane} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;