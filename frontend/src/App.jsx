import { useEffect, useContext } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";

import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Chat from "./pages/Chat";
import EditProfile from "./pages/EditProfile";
import Navbar from "./components/Navbar";
import NotFound from "./pages/NotFound";
import Search from "./pages/Search";

import { AuthProvider, AuthContext } from "./context/AuthContext";
import ResetPassword from "./pages/ResetPassword";

function AppWrapper() {
  // This wrapper is outside AuthProvider
  // We just return AuthProvider wrapping App, to avoid hooks outside provider issues
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}

function App() {
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const username = params.get("username");
    const email = params.get("email");
    const id = params.get("id");

    const currentPath = window.location.pathname;

    // ⛔ Don't redirect if on reset-password page
    if (currentPath.startsWith("/reset-password")) return;

    if (token && username) {
      localStorage.setItem("token", token);
      login({ username, email, id });
      navigate("/", { replace: true });
    } else if (!user && currentPath !== "/register" && currentPath !== "/login") {
      navigate("/login", { replace: true });
    }
  }, [login, navigate, user]);



  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/users/:id" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/chat/:id" element={<Chat />} />
        <Route path="/users/:id/edit_profile" element={<EditProfile />} />
        <Route path="/search" element={<Search />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default AppWrapper;
