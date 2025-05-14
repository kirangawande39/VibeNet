import { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { AuthContext } from "../context/AuthContext";
import "../assets/css/Login.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // ✅ Ensure this is included once

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(AuthContext); // ✅ AuthContext

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", { email, password });

      // ✅ Save token and user info
      localStorage.setItem("token", res.data.token);
      login(res.data.user);// sets context

     console.log("User:",res.data.user)

      toast.success(res.data.message || "Login successful");

      setTimeout(() => {
        navigate("/"); // redirect to home
      }, 1000);

    } catch (error) {
      console.error("Login Failed:", error.response?.data || error.message);
      toast.error(
        error.response?.data?.message || "Login failed. Please check your credentials."
      );
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
