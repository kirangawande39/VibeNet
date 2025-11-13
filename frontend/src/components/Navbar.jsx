import { Link, useNavigate } from "react-router-dom";
import { useContext, useState, useRef, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  FaHome,
  FaUser,
  FaCommentDots,
  FaSearch,
  FaSignOutAlt,
  FaSignInAlt,
  FaUserPlus,
  FaCog,
} from "react-icons/fa";
import { useLocation } from "react-router-dom";
import "../assets/css/Navbar.css";
import axios from "axios";
import { ToastContainer, toast, Slide } from "react-toastify";
const Navbar = ({ totalUnseenCount, isPrivateStatus  }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const token = user?.token || localStorage.getItem("token");

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();

  const [showSetting, setShowSetting] = useState(false);
  const [isPrivate, setIsPrivate] = useState(isPrivateStatus);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;



  useEffect(() => {
    setIsPrivate(isPrivateStatus);
  }, [isPrivateStatus]);

  const location = useLocation();
  const hideBottomNav = location.pathname.startsWith("/chat");

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
        setShowSetting(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handlePrivacyToggle = async () => {
    try {
      const newStatus = !isPrivate;
      setIsPrivate(newStatus);

      const res = await axios.put(`${backendUrl}/api/users/privacy`,
        { isPrivate: newStatus },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(res.data.message)
      setIsPrivate(res.data.isPrivate)
      // console.log(res.data.isPrivate)

    }
    catch (error) {
      console.error("Error Updating Privacy", error)
      toast.error("failed to update privacy setting")
    }
  }

  return (
    <>
      {/* Top Navbar for Mobile */}
      <nav className="main-navbar shadow-sm d-md-none">
        <div className="container-fluid d-flex justify-content-between align-items-center px-3 py-2">
          <Link to="/" className="logo text-primary fw-bold fs-4">
            VibeNet
          </Link>

          <div className="search-box d-none d-sm-flex">
            <FaSearch className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search..."
            />
          </div>

          <div
            className="d-flex align-items-center position-relative"
            ref={menuRef}
          >
            {user ? (
              <>
                <img
                  src={`https://ui-avatars.com/api/?name=${user.username}`}
                  alt="avatar"
                  className="rounded-circle me-2"
                  width={32}
                  height={32}
                  onClick={() => setMenuOpen(!menuOpen)}
                  style={{ cursor: "pointer" }}
                />

                {menuOpen && (
                  <div className="dropdown-menu-custom">
                    <Link
                      to={`/profile/${user.id}`}
                      className="dropdown-item d-flex align-items-center"
                      onClick={() => setMenuOpen(false)}
                    >
                      <FaUser className="me-2" /> Profile
                    </Link>

                    <Link
                      to={`/chat/${user.id}`}
                      className="dropdown-item d-flex align-items-center"
                      onClick={() => setMenuOpen(false)}
                    >
                      <FaCommentDots className="me-2" /> Chat
                    </Link>

                    <Link
                      to={`/search`}
                      className="dropdown-item d-flex align-items-center"
                      onClick={() => setMenuOpen(false)}
                    >
                      <FaSearch className="me-2" /> Search
                    </Link>

                    {/* Setting Toggle */}
                    <button
                      onClick={() => setShowSetting(!showSetting)}
                      className="dropdown-item d-flex align-items-center"
                    >
                      <FaCog className="me-2" /> Setting
                    </button>

                    {showSetting && (
                      <div className="p-2 border-top">
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
                      onClick={() => {
                        handleLogout();
                        setMenuOpen(false);
                      }}
                      className="dropdown-item d-flex align-items-center text-danger"
                    >
                      <FaSignOutAlt className="me-2" /> Logout
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="btn btn-outline-primary btn-sm me-2"
                >
                  <FaSignInAlt className="me-1" /> Login
                </Link>
                <Link
                  to="/register"
                  className="btn btn-outline-success btn-sm"
                >
                  <FaUserPlus className="me-1" /> Signup
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Bottom Navigation for Mobile */}
      {!hideBottomNav && (
        <div className="bottom-nav d-md-none shadow-sm">
          {user && (
            <>
              <Link to="/" className="bottom-icon">
                <FaHome />
              </Link>
              <Link to="/search" className="bottom-icon">
                <FaSearch />
              </Link>
              <div className="chat-icon-wrapper">
                <Link to={`/chat/${user.id}`} className="bottom-icon">
                  <FaCommentDots size={24} />
                  {totalUnseenCount > 0 && (
                    <span className="unseen-badge">{totalUnseenCount}</span>
                  )}
                </Link>
              </div>
              <Link to={`/profile/${user.id}`} className="bottom-icon">
                <FaUser />
              </Link>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default Navbar;
