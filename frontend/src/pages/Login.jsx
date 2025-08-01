import { useState, useContext, useEffect, useMemo } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { AuthContext } from "../context/AuthContext";
import "../assets/css/Login.css";
import { ToastContainer, toast, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import googleLogo from "../assets/img/google_logo.png";
import { handleError } from "../utils/errorHandler";
import emailjs from "@emailjs/browser";

// Regex to validate email format
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Debounce function to avoid frequent API hits
function debounce(func, delay = 2000) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
}

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [emailCheckStatus, setEmailCheckStatus] = useState(null);
  const [emailChecking, setEmailChecking] = useState(false);

  const navigate = useNavigate();
  const { login, user } = useContext(AuthContext);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${backendUrl}/api/auth/login`, { email, password });
      localStorage.setItem("token", res.data.token);
      login(res.data.user);
      toast.success(res.data.message || "Login successful");
      setTimeout(() => navigate("/"), 1000);
    } catch (err) {
      if (err.response && err.response.status === 429) {
        toast.error(err.response.data || "Too many requests, try again later.");
      } else {
        handleError(err);
      }
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = `${backendUrl}/api/auth/google`;
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${backendUrl}/api/auth/forgot-password`, { email: forgotEmail });
      const { token, name } = res.data;
      await emailjs.send(
        "service_ishxb1z",
        "template_jmfwewd",
        {
          to_email: forgotEmail,
          reset_link: `https://vibe-net-two.vercel.app/reset-password/${token}`,
          user_name: name,
        },
        "oP6BKanobJVx_qqDN"
      );
      // console.log("forgotPass ",res.data);
      // console.log(forgotEmail)
      toast.success(`Reset link sent to this ${forgotEmail} `);
      setShowForgotModal(false);
      setForgotEmail("");
      setEmailCheckStatus(null);
    } catch (err) {
      if (err.response && err.response.status === 429) {
        toast.error(err.response.data || "Too many requests, try again later.");
      } else {
        handleError(err); 
      }
    }
  };
  

  const checkEmailExists = async (emailToCheck) => {
    setEmailChecking(true);
    setEmailCheckStatus(null);
    try {
      await axios.post(`${backendUrl}/api/auth/check-email`, { email: emailToCheck });
      setEmailCheckStatus({ exists: true, message: "Email exists. You can reset your password." });
    } catch {
      setEmailCheckStatus({ exists: false, message: "This email is not registered." });
    } finally {
      setEmailChecking(false);
    }
  };

  const debounceCheckEmail = useMemo(
    () => debounce(checkEmailExists, 2000),
    []
  );

  return (
    <div className="login-container d-flex align-items-center justify-content-center vh-100">
      <div className="login-box shadow-lg p-4 rounded bg-white text-center">

        <h1 className="text-primary logo fw-bold mb-4">VibeNet</h1>
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
          <div className="mb-1">
            <input
              type="password"
              className="form-control rounded-pill"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="text-end mb-3">
            <span
              style={{ fontSize: "0.9rem", color: "#0d6efd", cursor: "pointer" }}
              onClick={() => setShowForgotModal(true)}
            >
              Forgot Password?
            </span>
          </div>

          <button type="submit" className="btn btn-primary w-100 rounded-pill">
            Login
          </button>
        </form>

        <button
          onClick={handleGoogleSignIn}
          className="btn btn-light w-100 border d-flex align-items-center justify-content-center gap-2 mt-3 rounded-pill shadow-sm"
          style={{ fontWeight: "600" }}
        >
          <img src={googleLogo} alt="Google logo" style={{ width: "20px", height: "20px" }} />
          Sign in with Google
        </button>


        <p className="mt-3">
          Don't have an account?{" "}
          <Link to="/register" className="text-primary">
            Sign Up
          </Link>
        </p>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex justify-content-center align-items-center"
          style={{ zIndex: 1050 }}
        >
          <div className="bg-white p-4 rounded shadow" style={{ width: "90%", maxWidth: "400px" }}>
            <h5 className="mb-3">Reset Password</h5>
            <form onSubmit={handleForgotSubmit}>
              <input
                type="email"
                className="form-control mb-2"
                placeholder="Enter your registered email"
                value={forgotEmail}
                onChange={(e) => {
                  const val = e.target.value;
                  setForgotEmail(val);
                  if (EMAIL_REGEX.test(val)) {
                    debounceCheckEmail(val);
                  } else {
                    setEmailCheckStatus(null);
                  }
                }}
                required
              />

              {emailChecking ? (
                <div className="text-secondary mb-2" style={{ fontSize: "0.9rem" }}>
                  Checking...
                </div>
              ) : emailCheckStatus ? (
                <p
                  className={`text-${emailCheckStatus.exists ? "success" : "danger"} mb-2`}
                  style={{ fontSize: "0.9rem" }}
                >
                  {emailCheckStatus.message}
                </p>
              ) : null}

              <div className="d-flex justify-content-end gap-2 mt-2">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotEmail("");
                    setEmailCheckStatus(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!emailCheckStatus?.exists || emailChecking}
                >
                  Send Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;


