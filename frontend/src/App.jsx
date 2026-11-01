
import { useState, useEffect } from "react";
import "./App.css";

import Login from "./Login";
import Signup from "./Signup";
import ForgotPassword from "./ForgotPassword";
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
  const [chartPeriod, setChartPeriod] = useState("weekly");

  // Register a new user.
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

  // Log in and save the JWT token.
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

  // Logout the current user.
  const handleLogout = () => {
    setAuthToken("");
    setUser(null);
    setDashboard(null);
    setAuthPage("login");
    setActivePage("Dashboard");
    setError("");
    setDashboardLoading(false);
  };

  // Load dashboard statistics.
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

  // Fetch dashboard data after login.
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

  // Update the header when profile is saved.
  const handleProfileUpdate = (updatedUser) => {
    setUser((currentUser) => ({
      ...currentUser,
      ...updatedUser,
    }));
  };

  // Show login, signup or forgot password before authentication.
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
            onShowForgotPassword={() => {
              setAuthPage("forgot");
              setError("");
            }}
          />
        ) : authPage === "signup" ? (
          <Signup
            onSignup={handleSignup}
            onShowLogin={() => {
              setAuthPage("login");
              setError("");
            }}
          />
        ) : (
          <ForgotPassword
            onBackToLogin={() => {
              setAuthPage("login");
              setError("");
            }}
            onSuccess={(message) => {
              setAuthPage("login");
              setError(message);
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

        const categories = [
          "Transport",
          "Electricity",
          "Food",
          "Waste Management",
          "Water",
          "Lifestyle",
        ];

        const chartData =
          chartPeriod === "weekly"
            ? dashboard?.weeklySummary || []
            : dashboard?.monthlySummary || [];

        const maxEmission = Math.max(
          ...chartData.map((item) => Number(item.emission || 0)),
          1
        );

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
                <p className="number">
                  {totalEmission.toFixed(2)} kg
                </p>
                <span>Total recorded emission</span>
              </div>

              {categories.map((category) => (
                <div className="card" key={category}>
                  <h3>{category}</h3>
                  <p className="number">
                    {getCategoryEmission(category)} kg
                  </p>
                  <span>CO₂ emission</span>
                </div>
              ))}
            </div>

            {/* Weekly and Monthly Emission Chart */}
            <section className="emission-chart-section">
              <div className="chart-header">
                <div>
                  <h2>Emission Statistics</h2>
                  <p>Track your carbon emissions over time.</p>
                </div>

                <div className="chart-toggle">
                  <button
                    className={chartPeriod === "weekly" ? "selected" : ""}
                    onClick={() => setChartPeriod("weekly")}
                  >
                    Weekly
                  </button>

                  <button
                    className={chartPeriod === "monthly" ? "selected" : ""}
                    onClick={() => setChartPeriod("monthly")}
                  >
                    Monthly
                  </button>
                </div>
              </div>

              <div className="chart-content">
                {chartData.length > 0 ? (
                  <>
                    <div className="chart-bars">
                      {chartData.map((item, index) => {
                        const emission = Number(item.emission || 0);

                        const barHeight =
                          emission > 0
                            ? Math.max(
                                (emission / maxEmission) * 100,
                                5
                              )
                            : 0;

                        return (
                          <div
                            className="chart-column"
                            key={`${chartPeriod}-${item.label}-${index}`}
                          >
                            <span className="chart-value">
                              {emission.toFixed(2)}
                            </span>

                            <div className="chart-bar-track">
                              <div
                                className="chart-bar"
                                style={{ height: `${barHeight}%` }}
                              />
                            </div>

                            <span className="chart-label">
                              {item.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <p className="chart-unit">
                      CO₂ Emission (kg)
                    </p>
                  </>
                ) : (
                  <p className="no-chart-data">
                    No emission data available for this period.
                  </p>
                )}
              </div>
            </section>

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

        <main className="main-content">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default App;
