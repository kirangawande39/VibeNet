import { useState, useContext } from "react"; // Add `useContext` import
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { AuthContext } from "../context/AuthContext"; // AuthContext import
import "../assets/css/Login.css";

import { ToastContainer,toast } from "react-toastify";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);  // Use useContext to get login function

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);  // Store token in localStorage
      // console.log("res data:", res.data.message); // Log response message
      
      // alert(res.data.message)

      toast.success(res.data.message)
      
      setTimeout(() => {
        login(res.data.user);
        navigate("/");
      }, 1000);
    } catch (error) {
      console.error("Login Failed:", error);
      toast.error("Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="login-container d-flex align-items-center justify-content-center vh-100">
      <div className="login-box shadow-lg p-4 rounded bg-white">
      <ToastContainer />
        <h2 className="text-center mb-4">Login</h2>
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
        <p className="text-center mt-3">
          Don't have an account? <a href="/register" className="text-primary">Sign Up</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
