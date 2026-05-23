import React, { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { handleError } from "../utils/errorHandler";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";

const Register = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState("");

  const [timer, setTimer] = useState(0);
  const [canResend, setCanResend] = useState(true);

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  useEffect(() => {
    let interval;

    interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval)

  }, [timer]);

  // INPUT CHANGE
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // only if user changes verified email manually
    if (name === "email" && verifiedEmail && value !== verifiedEmail) {
      setIsEmailVerified(false);
      setVerifiedEmail("");
      setOtpSent(false);
      setOtp("");
    }
  };

  // SEND OTP
  const sendOtp = async () => {
    if (!formData.email.trim()) {
      return toast.error("Please enter email first");
    }

    try {
      const res = await API.post("/api/auth/send-otp", {
        email: formData.email,
      });

      if (res.data.success) {
        setOtpSent(true);
        toast.success(res.data.message);
        setTimer(60);
        setCanResend(false);
      }
    } catch (err) {
      handleError(err);
    }
  };

  // VERIFY OTP
  const verifyOtp = async () => {
    if (!otp.trim()) {
      return toast.error("Please enter OTP");
    }

    try {
      const res = await API.post("/api/auth/verify-otp", {
        email: formData.email,
        otp,
      });

      if (res.data.success) {
        setIsEmailVerified(true);
        setVerifiedEmail(formData.email);
        toast.success(res.data.message);
      }
    } catch (err) {
      handleError(err);
    }
  };

  // REGISTER
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isEmailVerified || verifiedEmail !== formData.email) {
      return toast.error("Please verify email first");
    }

    try {

      const res = await API.post("/api/auth/register", formData);

      if (res.data.success) {
        toast.success(res.data.message);
        navigate("/login");
      }
    } catch (err) {
      handleError(err);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div
        className="card p-4 shadow rounded-4 border-0"
        style={{ width: "100%", maxWidth: "360px" }}
      >
       <h1 className="text-primary text-center logo fw-bold mb-4">VibeNet</h1>
        <p className="text-center  mb-3 font-bold text-black ">Create your account</p>

        <form onSubmit={handleSubmit}>
          {/* NAME */}
          <div className="mb-3">
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

          {/* USERNAME */}
          <div className="mb-3">
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

          {/* EMAIL + OTP */}
          <div className="mb-3 d-flex">
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="form-control rounded-start"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isEmailVerified}
            />

            <button
              type="button"
              className="btn btn-outline-primary rounded-end"
              onClick={sendOtp}
              disabled={!canResend || isEmailVerified}
              style={{ minWidth: "95px", fontSize: "12px" }}
            >
              {isEmailVerified
                ? "Verified"
                : timer > 0
                  ? `${timer}s`
                  : "Send OTP"}
            </button>
          </div>

          {/* OTP BOX */}
          {otpSent && !isEmailVerified && (
            <div className="mb-3">
              <input
                type="text"
                placeholder="Enter OTP"
                className="form-control mb-2"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />

              <button
                type="button"
                className="btn btn-success w-100"
                onClick={verifyOtp}
              >
                Verify OTP
              </button>
            </div>
          )}

          {/* PASSWORD */}
          <div className="mb-4">
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

          {/* SIGNUP */}
          <button
            type="submit"
            className="btn btn-primary w-100 fw-semibold"
          >
            Sign Up
          </button>
        </form>

        <p className="mt-3 text-center text-muted">
          Already have an account?{" "}
          <Link to="/login" className="text-decoration-none fw-semibold">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;