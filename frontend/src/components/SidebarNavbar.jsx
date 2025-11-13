import { Link, useNavigate } from "react-router-dom";
import { useContext, useState, useEffect, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import {
  FaHome, FaUser, FaCommentDots, FaSearch,
  FaSignOutAlt, FaSignInAlt, FaUserPlus, FaMoon, FaSun, FaCog
} from "react-icons/fa";
import "../assets/css/SidebarNavbar.css";
import { ToastContainer, toast, Slide } from "react-toastify";
import axios from "axios";

const SidebarNavbar = ({ isPrivateStatus }) => {
  const { user, logout } = useContext(AuthContext);
  const token = user?.token || localStorage.getItem("token");
  const navigate = useNavigate();


  const [showSetting, setShowSetting] = useState(false);
  const [isPrivate, setIsPrivate] = useState(isPrivateStatus);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const menuRef = useRef();


  useEffect(() => {
    setIsPrivate(isPrivateStatus);
  }, [isPrivateStatus]);

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

  // console.log("Is Private :: ",isPrivate)

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className={`sidebar d-none d-md-flex flex-column p-3 shadow `} style={{ height: "100vh" }}>

      <h4 className={`vibenet-logo`}>
        VibeNet
      </h4>

      {/* <img className="h-15 w-20" src="https://res.cloudinary.com/dsp5goxh0/image/upload/v1760445324/viibenet_logo_qa6flg.png" alt="" /> */}





      {user ? (
        <>
         <div className="list">
          <Link to="/" className="nav-link mb-4 d-flex align-items-center ">
            <FaHome className="me-2" />
            <span>Home</span>
          </Link>
          <Link to="/search" className="nav-link mb-4  d-flex align-items-center">
            <FaSearch className="me-2" /> Search
          </Link>
          <Link to={`/profile/${user.id}`} className="nav-link mb-4  d-flex align-items-center">
            <FaUser className="me-2" /> Profile
          </Link>
          <Link to={`/chat/${user.id}`} className="nav-link mb-4  d-flex align-items-center">
            <FaCommentDots className="me-2" /> Chat
          </Link>
          <button
            onClick={() => setShowSetting(!showSetting)}
            className=" d-flex align-items-center"
          >
            <FaCog className="me-2" /> Setting
          </button>
         </div>


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

          



          <button onClick={handleLogout} className="btn btn-outline-danger mt-auto  d-flex items-center">
            <FaSignOutAlt className="me-2" /> Logout
          </button>
        </>
      ) : (
        <>
          <Link to="/login" className="btn btn-outline-primary mb-3 d-flex align-items-center">
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
