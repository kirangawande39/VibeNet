import { Link, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import {
  FaHome, FaUser, FaCommentDots, FaSearch,
  FaSignOutAlt, FaSignInAlt, FaUserPlus, FaMoon, FaSun
} from "react-icons/fa";
import "../assets/css/SidebarNavbar.css";

const SidebarNavbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { darkMode, setDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();




 

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className={`sidebar d-none d-md-flex flex-column p-3 shadow ${darkMode ? "dark" : ""}`} style={{ height: "100vh" }}>

      <h4 className={`mb-4 fw-bold ${darkMode ? "text-light" : "text-primary"}`}>
        VibeNet
      </h4>
      {/* <img className="h-15 w-20" src="https://res.cloudinary.com/dsp5goxh0/image/upload/v1760445324/viibenet_logo_qa6flg.png" alt="" /> */}



      <button
        onClick={() => setDarkMode((prev) => !prev)}
        className={`btn btn-sm mb-4 d-flex align-items-center ${darkMode ? "btn-light" : "btn-dark"}`}
      >
        {darkMode ? <FaSun className="me-2" /> : <FaMoon className="me-2" />}
        {darkMode ? "Light Mode" : "Dark Mode"}
      </button>

      {user ? (
        <>
          <Link to="/" className="nav-link mb-3">
            <FaHome className="me-2" /> Home
          </Link>
          <Link to="/search" className="nav-link mb-3">
            <FaSearch className="me-2" /> Search
          </Link>
          <Link to={`/profile/${user.id}`} className="nav-link mb-3">
            <FaUser className="me-2" /> Profile
          </Link>
          <Link to={`/chat/${user.id}`} className="nav-link mb-3">
            <FaCommentDots className="me-2" /> Chat
          </Link>
         


          <button onClick={handleLogout} className="btn btn-outline-danger mt-auto">
            <FaSignOutAlt className="me-2" /> Logout
          </button>
        </>
      ) : (
        <>
          <Link to="/login" className="btn btn-outline-primary mb-2 d-flex align-items-center">
            <FaSignInAlt className="me-2" /> Login
          </Link>
          <Link to="/register" className="btn btn-outline-success d-flex align-items-center">
            <FaUserPlus className="me-2" /> Signup
          </Link>
        </>
      )}
    </div>
  );
};

export default SidebarNavbar;
