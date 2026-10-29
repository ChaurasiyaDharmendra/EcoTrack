
import { useState, useEffect } from "react";
import "./App.css";

import Login from "./Login";
import Signup from "./Signup";
import CarbonTracker from "./CarbonTracker";
import Goals from "./Goals";
import Challenges from "./Challenges";
import Profile from "./Profile";

import {
  loginUser,
  signupUser,
  setAuthToken,
  getDashboard,
} from "./api";

function App() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [authPage, setAuthPage] = useState("login");
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [dashboard, setDashboard] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);

  // Register a new user through the backend.
  const handleSignup = async (userData) => {
    setError("");

    try {
      await signupUser(userData);
      setAuthPage("login");
      setError("Account created successfully. Please login.");
    } catch (err) {
      setError(err.message || "Signup failed.");
      throw err;
    }
  };

  // Log in and save the JWT token for protected API requests.
  const handleLogin = async (credentials) => {
    setError("");

    try {
      const data = await loginUser(credentials);

      if (!data.token || !data.user) {
        throw new Error("Login response is missing user or token data.");
      }

      setAuthToken(data.token);
      setUser(data.user);
      setDashboard(null);
      setActivePage("Dashboard");
      setError("");
    } catch (err) {
      setError(err.message || "Login failed.");
      throw err;
    }
  };

  // Clear the login token and user information on logout.
  const handleLogout = () => {
    setAuthToken("");
    setUser(null);
    setDashboard(null);
    setAuthPage("login");
    setActivePage("Dashboard");
    setError("");
    setDashboardLoading(false);
  };

  // Load dashboard information from the backend.
  const refreshDashboard = async () => {
    if (!user) return;

    setDashboardLoading(true);
    setError("");

    try {
      const data = await getDashboard();
      setDashboard(data);
    } catch (err) {
      setError(err.message || "Could not load dashboard data.");
    } finally {
      setDashboardLoading(false);
    }
  };

  // Fetch dashboard data when a user logs in.
  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    async function loadDashboard() {
      setDashboardLoading(true);

      try {
        const data = await getDashboard();

        if (!cancelled) {
          setDashboard(data);
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Could not load dashboard data.");
        }
      } finally {
        if (!cancelled) {
          setDashboardLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [user]);

  // Update the header when the profile is saved.
  const handleProfileUpdate = (updatedUser) => {
    setUser((currentUser) => ({
      ...currentUser,
      ...updatedUser,
    }));
  };

  // Show login or signup before authentication.
  if (!user) {
    return (
      <div>
        {authPage === "login" ? (
          <Login
            onLogin={handleLogin}
            onShowSignup={() => {
              setAuthPage("signup");
              setError("");
            }}
          />
        ) : (
          <Signup
            onSignup={handleSignup}
            onShowLogin={() => {
              setAuthPage("login");
              setError("");
            }}
          />
        )}

        {error && (
          <div className="auth-feedback">
            <p>{error}</p>
          </div>
        )}
      </div>
    );
  }

  const pages = [
    "Dashboard",
    "Carbon Tracker",
    "Goals",
    "Challenges",
    "Profile",
  ];

  // Display the selected page.
  const renderPage = () => {
    switch (activePage) {
      case "Carbon Tracker":
        return <CarbonTracker onDataChange={refreshDashboard} />;

      case "Goals":
        return <Goals />;

      case "Challenges":
        return <Challenges />;

      case "Profile":
        return <Profile onProfileUpdate={handleProfileUpdate} />;

      default: {
        const totalEmission = Number(dashboard?.totalEmission ?? 0);
        const categorySummary = dashboard?.categorySummary || {};

        const getCategoryEmission = (category) =>
          Number(categorySummary[category] || 0).toFixed(2);

        return (
          <>
            <h2>Welcome to EcoTrack, {user.name}!</h2>

            <p>
              Track your carbon emissions and help protect the environment.
            </p>

            <h2 className="section-title">Dashboard Overview</h2>

            {dashboardLoading && (
              <p className="loading-message">
                Loading dashboard data...
              </p>
            )}

            {error && (
              <div className="auth-feedback">
                <p>{error}</p>
              </div>
            )}

            <div className="dashboard-cards">
              <div className="card total-card">
                <h3>Total CO₂ Emission</h3>
                <p className="number">{totalEmission.toFixed(2)} kg</p>
                <span>Total recorded emission</span>
              </div>

              <div className="card">
                <h3>Transport</h3>
                <p className="number">
                  {getCategoryEmission("Transport")} kg
                </p>
                <span>CO₂ emission</span>
              </div>

              <div className="card">
                <h3>Electricity</h3>
                <p className="number">
                  {getCategoryEmission("Electricity")} kg
                </p>
                <span>CO₂ emission</span>
              </div>

              <div className="card">
                <h3>Lifestyle</h3>
                <p className="number">
                  {getCategoryEmission("Lifestyle")} kg
                </p>
                <span>CO₂ emission</span>
              </div>
            </div>

            <section className="info-section">
              <h2>About EcoTrack</h2>
              <p>
                EcoTrack helps you understand your carbon footprint,
                track daily activities, and set goals to reduce emissions.
              </p>
            </section>
          </>
        );
      }
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>EcoTrack</h1>
          <p>Smart Carbon Footprint Tracking Platform</p>
        </div>

        <div className="user-header">
          <span>{user.name}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <div className="layout">
        <aside className="sidebar">
          <h2>Menu</h2>

          <nav>
            {pages.map((page) => (
              <button
                key={page}
                className={activePage === page ? "active" : ""}
                onClick={() => {
                  setActivePage(page);
                  setError("");

                  if (page === "Dashboard") {
                    refreshDashboard();
                  }
                }}
              >
                {page}
              </button>
            ))}
          </nav>
        </aside>

        <main className="main-content">{renderPage()}</main>
      </div>
    </div>
  );
}

export default App;
