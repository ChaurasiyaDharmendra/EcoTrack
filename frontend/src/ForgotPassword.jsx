
import { useState } from "react";
import "./Login.css";

import {
  forgotPassword,
  verifyOTP,
  resetPassword,
} from "./api";

function ForgotPassword({ onBackToLogin, onSuccess }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Send OTP to email.
  const handleSendOTP = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    setLoading(true);

    try {
      const data = await forgotPassword(email.trim());
      setMessage(data.message || "OTP sent to your email.");
      setStep(2);
    } catch (err) {
      setError(err.message || "Could not send OTP.");
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP.
  const handleVerifyOTP = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!otp.trim()) {
      setError("Please enter OTP.");
      return;
    }

    setLoading(true);

    try {
      const data = await verifyOTP(email.trim(), otp.trim());
      setMessage(data.message || "OTP verified successfully.");
      setStep(3);
    } catch (err) {
      setError(err.message || "Invalid OTP.");
    } finally {
      setLoading(false);
    }
  };

  // Reset password.
  const handleResetPassword = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const data = await resetPassword(email.trim(), newPassword);

      onSuccess(
        data.message || "Password changed successfully. Please login."
      );
    } catch (err) {
      setError(err.message || "Could not reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>EcoTrack</h1>
        <p className="auth-subtitle">Forgot Password</p>

        {error && <p className="auth-error">{error}</p>}
        {message && <p className="auth-success">{message}</p>}

        {step === 1 && (
          <form onSubmit={handleSendOTP}>
            <p>Enter your registered email address.</p>

            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOTP}>
            <p>Enter the 6-digit OTP sent to your email.</p>

            <label>OTP</label>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(event) => setOtp(event.target.value)}
              maxLength={6}
              required
            />

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <p className="auth-switch">
              <button
                type="button"
                className="auth-link"
                onClick={() => {
                  setStep(1);
                  setOtp("");
                  setError("");
                  setMessage("");
                }}
              >
                Change Email
              </button>
            </p>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword}>
            <p>Enter your new password.</p>

            <label>New Password</label>
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              required
            />

            <label>Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
            />

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading ? "Updating..." : "Reset Password"}
            </button>
          </form>
        )}

        <p className="auth-switch">
          <button
            type="button"
            className="auth-link"
            onClick={onBackToLogin}
          >
            Back to Login
          </button>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
