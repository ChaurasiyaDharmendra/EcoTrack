
import { useState } from "react";
import "./Login.css";

function Login({ onLogin, onShowSignup, onShowForgotPassword }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter email and password.");
      return;
    }

    setLoading(true);

    try {
      await onLogin({
        email: email.trim(),
        password,
      });
    } catch (err) {
      setError(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>EcoTrack</h1>
        <p className="auth-subtitle">Login to your account</p>

        {error && <p className="auth-error">{error}</p>}

        <label>Email</label>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <label>Password</label>
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        <div className="forgot-password-link">
          <button
            type="button"
            className="auth-link"
            onClick={onShowForgotPassword}
          >
            Forgot Password?
          </button>
        </div>

        <button
          type="submit"
          className="auth-submit"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="auth-switch">
          Don't have an account?{" "}
          <button
            type="button"
            className="auth-link"
            onClick={onShowSignup}
          >
            Sign Up
          </button>
        </p>
      </form>
    </div>
  );
}

export default Login;
