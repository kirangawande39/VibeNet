import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import googleLogo from '../assets/img/google_logo.png';
import "../assets/css/Register.css";
import { handleError } from '../utils/errorHandler';
import { AuthContext } from "../context/AuthContext";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Redirect logged-in users away from Register page
  useEffect(() => {
    if (user) {
      navigate("/");  // Redirect to home if already logged in
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${backendUrl}/api/auth/register`, formData);

      toast.success("Registered Successfully");
      navigate("/login");
    } catch (err) {
      handleError(err);
    }
  };

  // const handleGoogleSignIn = () => {
  //   toast.info("Google Sign Up clicked!");
  // };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <ToastContainer position="top-center" autoClose={2000} theme="light" />
      <div className="card p-4 shadow-sm text-center" style={{ width: "350px" }}>

        <h1 className="text-primary logo fw-bold mb-3">VibeNet</h1>

        <h4 className="mb-3">Sign Up</h4>

        <form onSubmit={handleSubmit}>
          <div className="mb-2">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              className="form-control"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-2">
            <input
              type="text"
              name="username"
              placeholder="Username"
              className="form-control"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-2">
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-2">
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="form-control"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">Sign Up</button>
        </form>

        {/* <button
          onClick={handleGoogleSignIn}
          className="btn btn-light w-100 border d-flex align-items-center justify-content-center gap-2 mt-3 rounded-pill shadow-sm"
          style={{ fontWeight: "600" }}
        >
          <img
            src={googleLogo}
            alt="Google logo"
            style={{ width: "20px", height: "20px" }}
          />
          Sign up with Google
        </button> */}

        <p className="mt-2">
          Already have an account? <a href="/login" className="text-primary">Login</a>
        </p>
      </div>
    </div>
  );
};

export default Register;
