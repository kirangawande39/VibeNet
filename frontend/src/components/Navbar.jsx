import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import { FaHome, FaUser, FaCommentDots, FaSignInAlt, FaSearch, FaSignOutAlt, FaUserPlus } from "react-icons/fa";
import "../assets/css/Navbar.css";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const closeNavbar = () => {
    const navbar = document.getElementById("navbarNav");
    if (navbar.classList.contains("show")) {
      navbar.classList.remove("show");
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm px-3">
      <div className="container-fluid">
        {/* App Logo */}
        <Link className="navbar-brand fw-bold fs-4" to="/">
          SocialApp
        </Link>

        {/* Mobile Menu Toggle */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navbar Links */}
        <div className="collapse navbar-collapse justify-content-center" id="navbarNav">
          <ul className="navbar-nav">
            <li className="nav-item mx-2">
              <Link className="nav-link d-flex align-items-center" to="/" onClick={closeNavbar}>
                <FaHome className="me-1" /> Home
              </Link>
            </li>
            {user && (
              <li className="nav-item mx-2">
                <Link className="nav-link d-flex align-items-center" to="/profile" onClick={closeNavbar}>
                  <FaUser className="me-1" /> Profile
                </Link>
              </li>
            )}
            {user && (
              <li className="nav-item mx-2">
                <Link className="nav-link d-flex align-items-center" to="/chat" onClick={closeNavbar}>
                  <FaCommentDots className="me-1" /> Chat
                </Link>
              </li>
            )}
          </ul>
        </div>

        {/* Search & Auth Buttons */}
        <div className="d-flex align-items-center">
          <div className="input-group search-bar me-3">
            <span className="input-group-text bg-light">
              <FaSearch />
            </span>
            <input type="text" className="form-control" placeholder="Search..." />
          </div>

          {user ? (
            <button className="btn btn-outline-danger logout-btn" onClick={handleLogout}>
              <FaSignOutAlt /> Logout
            </button>
          ) : (
            <>
              <Link className="btn btn-outline-primary me-2" to="/login">
                <FaSignInAlt /> Login
              </Link>
              <Link className="btn btn-outline-success" to="/register">
                <FaUserPlus /> Signup
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
