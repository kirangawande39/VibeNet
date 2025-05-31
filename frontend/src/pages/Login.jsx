import { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { AuthContext } from "../context/AuthContext";
import "../assets/css/Login.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import { FaGoogle } from "react-icons/fa";
import googleLogo from '../assets/img/google_logo.png';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${backendUrl}/api/auth/login`, {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      login(res.data.user);

      toast.success(res.data.message || "Login successful");

      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (error) {
      console.error("Login Failed:", error.response?.data || error.message);
      toast.error(
        error.response?.data?.message ||
        "Login failed. Please check your credentials."
      );
    }
  };

  // Dummy Google sign in handler (replace with real logic later)
  const handleGoogleSignIn = () => {
    toast.info("Google Sign in clicked!");
  };

  return (
    <div className="login-container d-flex align-items-center justify-content-center vh-100">
      <div className="login-box shadow-lg p-4 rounded bg-white text-center">
        <ToastContainer />

        {/* VibeNet heading with Segoe UI font */}
        <h1 className="text-primary logo fw-bold mb-4">
          VibeNet
        </h1>

        <h4 className="mb-3">Login to your account</h4>

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <input
              type="email"
              className="form-control rounded-pill"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <input
              type="password"
              className="form-control rounded-pill"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100 rounded-pill">
            Login
          </button>
        </form>

        {/* Google Sign in Button */}
        <button
          onClick={handleGoogleSignIn}
          className="btn btn-light w-100 border d-flex align-items-center justify-content-center gap-2 mt-3 rounded-pill shadow-sm"
          style={{ fontWeight: "600" }}
        >
          <img
            src={googleLogo}
            alt="Google logo"
            style={{ width: "20px", height: "20px" }}
          />
          Sign in with Google
        </button>

        <p className="mt-3">
          Don't have an account?{" "}
          <a href="/register" className="text-primary">
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
