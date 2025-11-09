import { useEffect, useCallback, useState, useContext } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import axios from "axios";
import socket from "./socket";

import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Chat from "./pages/Chat";
import EditProfile from "./pages/EditProfile";
import Navbar from "./components/Navbar";
import NotFound from "./pages/NotFound";
import Search from "./pages/Search";
import ResetPassword from "./pages/ResetPassword";
import SidebarNavbar from "./components/SidebarNavbar";

import { requestForToken, onMessageListener } from "./firebase/firebase-messaging";
import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { OnlineProvider } from "./context/OnlineStatusContext";
import { AuthProvider, AuthContext } from "./context/AuthContext";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

function AppWrapper() {
  // Wrap App inside Auth and Online providers
  return (
    <AuthProvider>
      <OnlineProvider>
        <App />
      </OnlineProvider>
    </AuthProvider>
  );
}

function App() {
  const { login, user } = useContext(AuthContext);
  const [unseenCounts, setUnseenCounts] = useState([]);
  const [isPrivateStatus, setIsPrivateStatus] = useState();

  const navigate = useNavigate();

  // Handle login redirect from OAuth or query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const username = params.get("username");
    const email = params.get("email");
    const id = params.get("id");
    const currentPath = window.location.pathname;

    // Skip reset password route
    if (currentPath.startsWith("/reset-password")) return;

    if (token && username) {
      localStorage.setItem("token", token);
      login({ username, email, id });
      navigate("/", { replace: true });
    } else if (!user && currentPath !== "/register" && currentPath !== "/login") {
      navigate("/login", { replace: true });
    }
  }, []); 

  // Fetch unseen message counts + privacy status
  const fetchUnseenCounts = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await axios.get(`${backendUrl}/api/messages/unseen-counts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsPrivateStatus(res.data.privacyStatus);
      setUnseenCounts(res.data.data);
    } catch (err) {
      console.error("❌ Error fetching unseen counts:", err);
    }
  }, []); // Stable reference

  // Attach socket listeners (run once)
  useEffect(() => {
    fetchUnseenCounts(); // initial fetch

    socket.on("message-seen", fetchUnseenCounts);
    socket.on("receive-message", fetchUnseenCounts);

    return () => {
      socket.off("message-seen", fetchUnseenCounts);
      socket.off("receive-message", fetchUnseenCounts);
    };
  }, [fetchUnseenCounts]);

  // Firebase Notifications
  useEffect(() => {
    const authToken = localStorage.getItem("token");
    if (authToken && user) {
      requestForToken(authToken);
    }

    const unsubscribe = onMessageListener()
      .then((payload) => {
        console.log("Firebase Payload:", payload);
        const sender = payload.data?.sender || "Unknown";
        const site = payload.data?.siteName || "VibeNet";
        const message = payload.notification?.body || "";
        alert(`New Message from ${sender} on ${site}:\n${message}`);
      })
      .catch((err) => console.error("FCM listener error:", err));

    return () => unsubscribe;
  }, [user]);

 
  console.log("Privacy Status:", isPrivateStatus);

  const totalUnseenCount = unseenCounts.reduce(
    (total, item) => total + item.unseenCount,
    0
  );

  return (
    <>
      
      <Navbar totalUnseenCount={totalUnseenCount} isPrivateStatus={isPrivateStatus} />

      <SidebarNavbar />

      {/* Routes */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/chat/:id" element={<Chat />} />
        <Route path="/profile/:id/edit_profile" element={<EditProfile />} />
        <Route path="/search" element={<Search />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Toast Notification */}
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar
        closeButton={false}
        newestOnTop
        draggable={false}
        transition={Slide}
        toastClassName="custom-toast"
        bodyClassName="custom-toast-body"
      />
    </>
  );
}

export default AppWrapper;
