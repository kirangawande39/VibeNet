import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../services/api";
import LoadingDots from "../components/common/LoadingDots";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import "../assets/css/Login.css";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const passwordError =
    password && password.length < 6
      ? "Password must be at least 6 characters"
      : "";

  const matchError =
    confirmPassword && password !== confirmPassword
      ? "Passwords do not match"
      : "";

  const handleReset = async (e) => {
    e.preventDefault();

    if (password.length < 6 || password !== confirmPassword) return;

    try {
      setLoading(true);

      await API.post("/api/auth/reset-password", {
        token,
        newPassword: password,
      });

      toast.success("Password reset successful");

      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container d-flex align-items-center justify-content-center vh-100 px-3">

      <div className="login-box shadow-lg p-4 rounded bg-white text-center w-100" style={{ maxWidth: "420px" }}>

        <h1 className="text-primary logo fw-bold mb-3">VibeNet</h1>

        <h4 className="mb-1">Reset Password</h4>
        <p className="text-muted mb-3" style={{ fontSize: "0.9rem" }}>
          Enter new password for your account
        </p>

        <form onSubmit={handleReset}>

          <div className="mb-2 position-relative">
            <input
              type={showPass ? "text" : "password"}
              className="form-control rounded-pill pe-5"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <span
              onClick={() => setShowPass(!showPass)}
              style={{
                position: "absolute",
                right: "15px",
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                color: "#6c757d",
              }}
            >
              {showPass ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {passwordError && (
            <div className="text-danger mb-2" style={{ fontSize: "0.85rem" }}>
              {passwordError}
            </div>
          )}

          <div className="mb-2 position-relative">
            <input
              type={showConfirm ? "text" : "password"}
              className="form-control rounded-pill pe-5"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <span
              onClick={() => setShowConfirm(!showConfirm)}
              style={{
                position: "absolute",
                right: "15px",
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                color: "#6c757d",
              }}
            >
              {showConfirm ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {matchError && (
            <div className="text-warning mb-2" style={{ fontSize: "0.85rem" }}>
              {matchError}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary w-100 rounded-pill"
            disabled={loading || passwordError || matchError}
          >
            {loading ? (
              <LoadingDots text="Resetting Password" />
            ) : (
              "Reset Password"
            )}
          </button>
        </form>

       

      </div>
    </div>
  );
};

export default ResetPassword;