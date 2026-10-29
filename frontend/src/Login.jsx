
import { useState } from "react";
import "./Login.css";

function Login({ onLogin, onShowSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Validate the form and send login details to the parent component.
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    if (!onLogin) {
      setError("Login connection is not set up yet.");
      return;
    }

    setLoading(true);

    try {
      // Wait for the backend login request to finish.
      await onLogin({
        email: email.trim(),
        password,
      });
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
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

        <label htmlFor="login-email">Email Address</label>
        <input
          id="login-email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />

        <label htmlFor="login-password">Password</label>
        <input
          id="login-password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
        />

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
            disabled={loading}
          >
            Sign Up
          </button>
        </p>
      </form>
    </div>
  );
}

export default Login;
