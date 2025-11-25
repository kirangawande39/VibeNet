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
import { toast } from "react-toastify";
import GroupChat from "../components/GroupChat";

const Chat = () => {
  const { user, updateUser } = useContext(AuthContext);
  const token = user?.token || localStorage.getItem("token");
  const { allOnlineUsers } = useOnline();

  const [localUser, setLocalUser] = useState();
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const [messages, setMessages] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [chats, setChats] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(allOnlineUsers || []);
  const [lastSeen, setLastSeen] = useState({});
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);

  const [showGroupForm, setShowGroupForm] = useState(false);
  const [groupFormData, setGroupFormData] = useState({
    name: "",
    description: "",
    icon: "",
    privacy: "public",
  });

  const [groupImage, setGroupImage] = useState()

  const [groupsData, setGroupsData] = useState([]);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const { id } = useParams();

  const CHATBOT_ID = "684f268c7dad0bf1b1dfd4f8";

  // Dummy messages for demo
  const dummyMessages = {
    group1: [
      { id: 1, sender: "Admin", text: "Welcome to the group!" },
      { id: 2, sender: "You", text: "Hello everyone!" },
    ],
  };

  // Followers sorting logic
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

  // Update last message
  const handleLastMessageUpdate = (newMessage) => {
    if (selectedUser) {
      updateLastMessage(selectedUser._id, newMessage);
    }
  };

  const updateLastMessage = (chatId, newMessage) => {
    setChats((prev) =>
      prev.some((chat) => chat._id === chatId)
        ? prev.map((chat) =>
          chat._id === chatId ? { ...chat, lastMessage: newMessage } : chat
        )
        : [...prev, { _id: chatId, lastMessage: newMessage }]
    );
  };

  // Window resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch groups
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/groups`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setGroupsData(res.data.groups);
      } catch (err) {
        console.error("Failed fetch groups", err);
      }
    };
    fetchGroups();
  }, []);

  // Fetch user
  const fetchUserData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${backendUrl}/api/users/${id ? id : user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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

  // Fetch online status
  useEffect(() => {
    const fetchOnlineStatus = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/online-status`);
        setLastSeen(res.data.lastSeen || {});
        setOnlineUsers(res.data.onlineUsers || allOnlineUsers || []);
      } catch (err) {
        console.error("online status error:", err);
      } finally {
        setStatusLoading(false);
      }
    };
    fetchOnlineStatus();
    const interval = setInterval(fetchOnlineStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = (newMessage) => {
    if (selectedUser) {
      setMessages([...messages, { sender: user.username, text: newMessage }]);
      handleLastMessageUpdate(newMessage);
    }
  };

  const handleUserSelect = (follower) => {
    setSelectedGroup(null);
    setSelectedUser(follower);
    setMessages(dummyMessages[follower.username] || []);
  };

  const handleGroupSelect = (group) => {
    setSelectedUser(null);
    setSelectedGroup(group);
    // setMessages(dummyMessages[group.name] || []);

    // alert("your selected group")
  };

  const handleBack = () => {
    setSelectedUser(null);
    setSelectedGroup(null);
  };

  const handleChange = (e) => {
    setGroupFormData({ ...groupFormData, [e.target.name]: e.target.value });
  };

  const hanldeGroupImage = async (e) => {
    const groupIcon = e.target.files[0];

    if (groupIcon) {
      console.log("groupIcon::", groupIcon)
      setGroupImage(groupIcon)

    }

  }

  const handleGroupForm = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("groupIcon", groupImage);
    formData.append("name", groupFormData.name);
    formData.append("description", groupFormData.description);
    formData.append("privacy", groupFormData.privacy);

    try {
      const res = await axios.post(
        `${backendUrl}/api/groups`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`
          },
        }
      );

      toast.success(res.data.message);

      setGroupFormData({
        name: "",
        description: "",
        icon: "",
        privacy: "public",
      });

    } catch (err) {
      handleError(err);
    }
  };


  const formatLastSeen = (timestamp) => {
    if (!timestamp) return "Offline";
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
      <div className="d-flex justify-content-center align-items-center" style={{ height: "80vh" }}>
        <Spinner />
      </div>
    );
  }

  return (
    <div className="container chat-app mt-4">



      <div className="row gx-0">

        <div className={`col-md-4 border-end ${isMobile && (selectedUser || selectedGroup) ? "d-none" : ""}`} style={{ maxHeight: "78vh", overflowY: "auto" }}>

          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="px-3 mt-2 text-secondary">Groups</h5>
            <span className="bg-blue-500 text-white p-1 rounded-2xl mr-1 px-2 cursor-pointer" onClick={() => setShowGroupForm(true)}>
              Create Group
            </span>
          </div>
          <div className="list-group list-group-flush">

            {groupsData.length > 0 ? (
              groupsData.map((group, index) => (
                <button
                  key={index}
                  className={`list-group-item list-group-item-action d-flex align-items-center ${selectedGroup && selectedGroup._id === group._id ? "active" : ""}`}
                  onClick={() => handleGroupSelect(group)}
                >
                  <img
                    src={group?.icon.url || "https://cdn-icons-png.flaticon.com/512/615/615075.png"}
                    width={48}
                    height={48}
                    className="rounded-circle me-2"
                    style={{ objectFit: "cover" }}
                  />
                  <div className="ms-1">
                    <strong>{group.name}</strong>
                    <div className="text-muted small">{group.privacy === "public" ? "Public Group" : "Private Group"}</div>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-3 text-center text-muted">No Groups Found</div>
            )}

          </div>

          {/* FOLLOWERS LIST */}
          <h5 className="px-3 mt-4 text-secondary">Chats</h5>
          <div className="list-group list-group-flush">
            {localUser && localUser.followers?.length > 0 ? (
              sortedFollowers.map((follower, index) => {
                const isOnline = onlineUsers.includes(follower._id);
                const lastSeenTime = lastSeen[follower._id];
                const chatData = chats.find((c) => c._id === follower._id);
                const lastMsg = chatData?.lastMessage;

                return (
                  <button
                    key={follower._id || index}
                    className={`list-group-item list-group-item-action d-flex align-items-center ${selectedUser && follower._id === selectedUser._id ? "active" : ""}`}
                    onClick={() => handleUserSelect(follower)}
                  >
                    <img
                      src={follower.profilePic?.url || "https://via.placeholder.com/40"}
                      width={48}
                      height={48}
                      className="rounded-circle me-2"
                      style={{ objectFit: "cover" }}
                    />
                    <div>
                      <div className="fw-bold">{follower.username}</div>
                      <small className="text-muted">{lastMsg || "No messages yet"}</small>
                      <br />
                      <small className="text-muted">
                        {isOnline ? (
                          <span className="text-success">Active</span>
                        ) : lastSeenTime ? (
                          `Last seen ${formatLastSeen(lastSeenTime)}`
                        ) : (
                          "Offline"
                        )}
                      </small>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-3 text-center text-muted">No followers</div>
            )}
          </div>
        </div>

        <div className={`col-md-8 ${isMobile && !selectedUser && !selectedGroup ? "d-none" : ""}`} style={{ maxHeight: "78vh", padding: 0 }}>

          {selectedUser ? (
            <ChatBox
              messages={messages}
              onSendMessage={handleSendMessage}
              user={user}
              selectedUser={selectedUser}
              localUser={localUser}
              onLastMessageUpdate={handleLastMessageUpdate}
              onBack={handleBack}
              isMobile={isMobile}
            />
          ) : selectedGroup ? (
            <GroupChat selectedGroup={selectedGroup} user={user} onBack={handleBack} sortedFollowers={sortedFollowers} />
          ) : (
            <div className="h-100 d-flex align-items-center justify-content-center text-muted">
              Select a user or group to start chatting
            </div>
          )}

        </div>
      </div>


      {showGroupForm && (
        <div className="fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowGroupForm(false)} />
          <div className="flex items-center justify-center p-4" style={{ position: "fixed", inset: 0 }}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
              <button onClick={() => setShowGroupForm(false)} className="absolute top-3 right-3 text-gray-500 hover:text-black text-2xl font-bold">
                ×
              </button>

              <h2 className="text-2xl font-semibold text-gray-800 mb-3 text-center">Create Group</h2>

              <form className="space-y-4" onSubmit={handleGroupForm}>
                <div>
                  <label>Group Name</label>
                  <input type="text" name="name" required value={groupFormData.name} onChange={handleChange} className="form-control" />
                </div>

                <div>
                  <label>Description</label>
                  <textarea name="description" value={groupFormData.description} onChange={handleChange} className="form-control" />
                </div>

                <div>
                  <label>Group Icon</label>
                  <input type="file" accept="image/*" id="groupIcon" onChange={hanldeGroupImage} className="form-control" />
                </div>

                <div>
                  <label>Privacy</label>
                  <select name="privacy" value={groupFormData.privacy} onChange={handleChange} className="form-control">
                    <option value="public">Public Group</option>
                    <option value="private">Private Group</option>
                  </select>
                </div>

                <button type="submit" className="btn btn-primary w-100">Create Group</button>
              </form>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
