import { Link, useNavigate,useParams } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import {
  FaHome,
  FaUser,
  FaCommentDots,
  FaSearch,
  FaSignOutAlt,
  FaSignInAlt,
  FaUserPlus,
} from "react-icons/fa";
import "../assets/css/Navbar.css";

const Navbar = () => {
  const { user,updateUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();


  const handleLogout = () => {
    logout();
    navigate("/");
  };

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
          <div className="d-flex align-items-center">
            {user ? (
              <>
                <Link to={`/users/${user.id}`} className="me-2">
                  <img
                    src={
                      user.profilePic ||
                      "https://cdn-icons-png.flaticon.com/512/149/149071.png"  || 
                      updateUser.profilePic
                    }
                    alt="Avatar"
                    className="avatar"
                  />
                </Link>
                <Link to="/chat" className="me-2">
                  <FaCommentDots className="chat-icon" />
                </Link>
                <button onClick={handleLogout} className="btn btn-sm btn-outline-danger">
                  <FaSignOutAlt className="me-1" />
                  <span className="d-none d-md-inline">Logout</span>
                </button>
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
        {user && (
          <>
            <Link to="/chat" className="bottom-icon">
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
