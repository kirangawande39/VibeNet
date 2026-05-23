import { Link, useNavigate } from "react-router-dom";
import { useContext, useState, useEffect, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  FaHome,
  FaUser,
  FaCommentDots,
  FaSearch,
  FaSignOutAlt,
  FaCog,
} from "react-icons/fa";

import "../assets/css/SidebarNavbar.css";

import { toast } from "react-toastify";
import { handleError } from "../utils/errorHandler";
import API from "../services/api";

const SidebarNavbar = ({ isPrivateStatus }) => {
  const { user, logout } = useContext(AuthContext);

  const navigate = useNavigate();

  const [showSetting, setShowSetting] = useState(false);
  const [isPrivate, setIsPrivate] = useState(isPrivateStatus);

  const menuRef = useRef(null);

  // Sync privacy status
  useEffect(() => {
    setIsPrivate(isPrivateStatus);
  }, [isPrivateStatus]);

  // Close settings when clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowSetting(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Toggle privacy
  const handlePrivacyToggle = async () => {
    try {
      const newStatus = !isPrivate;

      setIsPrivate(newStatus);

      const res = await API.put("/api/users/privacy", {
        isPrivate: newStatus,
      });

      toast.success(res.data.message);

      setIsPrivate(res.data.isPrivate);
    } catch (error) {
      console.error("Error Updating Privacy:", error);

      // Rollback
      setIsPrivate(!isPrivate);

      toast.error("Failed to update privacy setting");
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      const res = await API.post("/api/auth/logout", {});

      toast.success(res.data.message);

      logout();

      navigate("/");
    } catch (err) {
      handleError(err);
    }
  };

  if (!user) return null;

  return (
    <div
      ref={menuRef}
      className="sidebar d-none d-md-flex flex-column p-3 shadow"
      style={{ height: "100vh" }}
    >
      {/* Logo */}
      <h4 className="vibenet-logo">VibeNet</h4>

     
      <div className="list  " >
        <Link
          to="/"
          className="nav-link mb-4 d-flex align-items-center  "
        >
          <FaHome className="me-2" />
          <span className="">Home</span>
        </Link>

        <Link
          to="/search"
          className="nav-link mb-4 d-flex align-items-center"
        >
          <FaSearch className="me-2" />
          <span>Search</span>
        </Link>

        <Link
          to={`/profile/${user.id}`}
          className="nav-link mb-4 d-flex align-items-center"
        >
          <FaUser className="me-2" />
          <span>Profile</span>
        </Link>

        <Link
          to={`/chat/${user.id}`}
          className="nav-link mb-4 d-flex align-items-center"
        >
          <FaCommentDots className="me-2" />
          <span>Chat</span>
        </Link>

       
        <button
          onClick={() => setShowSetting(!showSetting)}
          className="settings-btn d-flex align-items-center"
        >
          <FaCog className="me-2" />
          <span>Settings</span>
        </button>
      </div>

     
      {showSetting && (
        <div className="p-2 border-top mt-2">
          <label className="form-check-label d-flex justify-content-between align-items-center">
            <span>
              Account Privacy:{" "}
              <strong>
                {isPrivate ? "Private" : "Public"}
              </strong>
            </span>

            <div className="form-check form-switch m-0">
              <input
                className="form-check-input"
                type="checkbox"
                checked={isPrivate}
                onChange={handlePrivacyToggle}
              />
            </div>
          </label>

          <small className="text-muted d-block mt-1">
            {isPrivate
              ? "Only approved followers can see your posts."
              : "Everyone can see your posts."}
          </small>
        </div>
      )}

     
      <button
        onClick={handleLogout}
        className="btn btn-outline-danger mt-auto d-flex align-items-center"
      >
        <FaSignOutAlt className="me-2" />
        Logout
      </button>
    </div>
  );
};

export default SidebarNavbar;