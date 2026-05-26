import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { handleError } from "../utils/errorHandler";
import API from "../services/api";
import LoadingDots from '../components/common/LoadingDots';


const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetPassStatus, setResetPassStatus] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  const handleReset = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!passwordsMatch) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    try {
      setResetPassStatus(true);
      await API.post(`/api/auth/reset-password`, {
        token,
        newPassword: password,
      });
      setResetPassStatus(false);
      toast.success("Password reset successful");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setResetPassStatus(false);
      handleError(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-[28px] border border-slate-700 bg-slate-900/95 p-8 shadow-2xl shadow-slate-950/50 backdrop-blur-md">
        <div className="mb-6 text-center">
          <p className="text-sm uppercase tracking-[0.28em] text-cyan-400">Reset Password</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">Choose a new password</h2>
          <p className="mt-2 text-sm text-slate-400">Type your new password and confirm it below.</p>
        </div>

        <form onSubmit={handleReset} className="space-y-5">
          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-300">
              New Password
            </label>
            <input
              id="password"
              type="password"
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-slate-300">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {errorMessage ? (
            <div className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {errorMessage}
            </div>
          ) : password && confirmPassword && !passwordsMatch ? (
            <div className="rounded-2xl bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
              Passwords must match.
            </div>
          ) : null}

          <button
            type="submit"
            disabled={resetPassStatus}
            className="inline-flex w-full items-center justify-center rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-slate-600"
          >
            {resetPassStatus ? <LoadingDots test="Resetting" /> : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
