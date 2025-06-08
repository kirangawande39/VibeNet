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
  FaEllipsisV,
} from "react-icons/fa";

import "../assets/css/Navbar.css";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      {/* Top Navbar */}
      <nav className="main-navbar shadow-sm">
        <div className="container-fluid d-flex justify-content-between align-items-center px-3 py-2">
          {/* Logo */}
          <Link to="/" className="logo text-primary fw-bold fs-4">
            VibeNet
          </Link>

          {/* Center Search */}
          <div className="search-box d-none d-md-flex">
            <FaSearch className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search..."
            />
          </div>

          {/* Right Side */}
          <div
            className="d-flex align-items-center position-relative"
            ref={menuRef}
          >
            {user ? (
              <>
                <FaEllipsisV
                  className="fs-4"
                  onClick={() => setMenuOpen(!menuOpen)}
                  style={{ cursor: "pointer" }}
                />
                {menuOpen && (
                  <div className="dropdown-menu-custom">
                    <Link
                      to={`/users/${user.id}`}
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
                <Link to="/login" className="btn btn-outline-primary btn-sm me-2">
                  <FaSignInAlt className="me-1" /> Login
                </Link>
                <Link to="/register" className="btn btn-outline-success btn-sm">
                  <FaUserPlus className="me-1" /> Signup
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Bottom Navigation for Mobile */}
      <div className="bottom-nav d-md-none shadow-sm">
        <Link to="/" className="bottom-icon">
          <FaHome />
        </Link>

        <Link to="/search" className="bottom-icon">
          <FaSearch />
        </Link>

        {user && (
          <>
            <Link to={`/chat/${user.id}`} className="bottom-icon">
              <FaCommentDots />
            </Link>
            <Link to={`/users/${user.id}`} className="bottom-icon">
              <FaUser />
            </Link>
          </>
        )}
      </div>
    </>
  );
};

export default Navbar;
