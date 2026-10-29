
import { useState } from "react";
import "./Signup.css";

function Signup({ onSignup, onShowLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Validate the form and send registration details to the backend.
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (!onSignup) {
      setError("Signup connection is not set up yet.");
      return;
    }

    setLoading(true);

    try {
      // Wait for the backend registration request to finish.
      await onSignup({
        name: name.trim(),
        email: email.trim(),
        password,
      });
    } catch (err) {
      setError(err.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>EcoTrack</h1>
        <p className="auth-subtitle">Create your account</p>

        {error && <p className="auth-error">{error}</p>}

        <label htmlFor="signup-name">Full Name</label>
        <input
          id="signup-name"
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoComplete="name"
          required
        />

        <label htmlFor="signup-email">Email Address</label>
        <input
          id="signup-email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />

        <label htmlFor="signup-password">Password</label>
        <input
          id="signup-password"
          type="password"
          placeholder="At least 6 characters"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="new-password"
          minLength={6}
          required
        />

        <button
          type="submit"
          className="auth-submit"
          disabled={loading}
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>

        <p className="auth-switch">
          Already have an account?{" "}
          <button
            type="button"
            className="auth-link"
            onClick={onShowLogin}
            disabled={loading}
          >
            Login
          </button>
        </p>
      </form>
    </div>
  );
}

export default Signup;
