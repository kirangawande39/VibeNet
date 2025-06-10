import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${backendUrl}/api/auth/reset-password`, {
        token,
        newPassword: password,
      });
      toast.success("Password reset successful");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Reset failed");
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "400px" }}>
      <ToastContainer />
      <h3 className="mb-4 text-center">Reset Your Password</h3>
      <form onSubmit={handleReset}>
        <input
          type="password"
          className="form-control mb-3"
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="btn btn-primary w-100">Reset Password</button>
      </form>
    </div>
  );
};

export default ResetPassword;
