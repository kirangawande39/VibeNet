import React, { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import emailjs from "@emailjs/browser";
import "bootstrap/dist/css/bootstrap.min.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../assets/css/Register.css";
import { handleError } from "../utils/errorHandler";
import { AuthContext } from "../context/AuthContext";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });

  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState(null);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const sendOtp = () => {
    if (!formData.email) return toast.error("Please enter email first");

    const otpValue = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
    setGeneratedOtp(otpValue);
    setOtpSent(true);

    // Define expiryTime as current time + 15 minutes
    const expiryDate = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes later
    const expiryTime = expiryDate.toLocaleTimeString();

    const templateParams = {
      to_name: formData.name || "User",
      to_email: formData.email,
      passcode: otpValue,
      time: expiryTime,
      website_link: "https://vibe-net-two.vercel.app",
    };

    emailjs
      .send(
        "service_bwg8gxb",
        "template_kljw62h",
        templateParams,
        "QUqAW37G4MkhEeuIQ"
      )
      .then(() => {
        toast.success("OTP Sent Successfully");
      })
      .catch((err) => {
        toast.error("Failed to send OTP");
        console.error("EmailJS error:", err);
      });
  };

  const verifyOtp = () => {
    if (parseInt(otp) === generatedOtp) {
      toast.success("Email verified successfully");
      setIsEmailVerified(true);
    } else {
      toast.error("Invalid OTP");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isEmailVerified) return toast.error("Please verify your email first");

    try {
      const res = await API.post(`/api/auth/register`, formData);
      
      toast.success(res.data.message);
      navigate("/login");
    } catch (err) {
      if (err.response && err.response.status === 429) {
        // Handle rate limit exceeded
        toast.error(err.response.data.message || "Too many requests. Try again later.");
      } else {
        handleError(err);
      }
    }
  };


  


  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100 bg-light">


      <div
        className="card p-4 px-4 shadow rounded-4 border-0"
        style={{ width: "100%", maxWidth: "340px", backgroundColor: "#ffffff" }}
      >
        <h2 className="text-center text-primary fw-bold mb-2" style={{ fontFamily: "Segoe UI" }}>
          VibeNet
        </h2>
        <p className="text-center text-muted mb-3">Create your account</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group mb-3">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              className="form-control rounded-3"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group mb-3">
            <input
              type="text"
              name="username"
              placeholder="Username"
              className="form-control rounded-3"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group mb-3 d-flex">
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="form-control rounded-start-3"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isEmailVerified}
            />
            <button
              type="button"
              className="btn btn-outline-primary rounded-end-3"
              onClick={sendOtp}
              disabled={isEmailVerified}
              style={{ fontSize: '0.50rem' }}
            >
              Send OTP
            </button>
          </div>

          {otpSent && !isEmailVerified && (
            <div className="form-group mb-3">
              
              <input
                type="text"
                placeholder="Enter OTP"
                className="form-control rounded-3 mb-2"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
              <button
                type="button"
                className="btn btn-success w-100 rounded-3"
                onClick={verifyOtp}
              >
                Verify OTP
              </button>
            </div>
          )}

          <div className="form-group mb-4">
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="form-control rounded-3"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 rounded-3 fw-semibold"
            disabled={!isEmailVerified}
          >
            Sign Up
          </button>
        </form>

        <p className="mt-3 text-center text-muted" style={{ fontSize: "0.9rem" }}>
          Already have an account?{" "}
          <Link to="/login" className="text-primary text-decoration-none fw-semibold">
            Login
          </Link>
        </p>
      </div>
    </div>
  );

};

export default Register;
