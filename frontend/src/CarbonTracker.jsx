
import { useState, useEffect } from "react";
import "./CarbonTracker.css";

import {
  getCarbonEntries,
  addCarbonEntry,
  deleteCarbonEntry,
} from "./api";

function CarbonTracker({ onDataChange }) {
  const [category, setCategory] = useState("Electricity");
  const [activity, setActivity] = useState("Grid electricity");
  const [quantity, setQuantity] = useState("");
  const [date, setDate] = useState("");
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");

  // Available activities and their units.
  // Reusable products is excluded until a matching backend factor exists.
  const activityOptions = {
    Electricity: [{ name: "Grid electricity", unit: "kWh" }],
    Transport: [
      { name: "Petrol car", unit: "km" },
      { name: "Bus", unit: "km" },
      { name: "Motorcycle", unit: "km" },
    ],
  };

  const selectedActivity = activityOptions[category].find(
    (item) => item.name === activity
  );

  // Load saved activities from the backend when this page opens.
  useEffect(() => {
    let cancelled = false;

    async function loadEntries() {
      setLoading(true);
      setError("");

      try {
        const data = await getCarbonEntries();
        const records = Array.isArray(data) ? data : data.entries || [];

        if (!cancelled) {
          setEntries(records);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Could not load activity records.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadEntries();

    return () => {
      cancelled = true;
    };
  }, []);

  // Change the available activities when the category changes.
  const handleCategoryChange = (event) => {
    const newCategory = event.target.value;
    setCategory(newCategory);
    setActivity(activityOptions[newCategory][0].name);
  };

  // Save a new activity in MongoDB through the backend.
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!selectedActivity || !quantity || Number(quantity) <= 0 || !date) {
      setError("Please enter a valid activity, quantity and date.");
      return;
    }

    setLoading(true);

    try {
      const savedData = await addCarbonEntry({
        category,
        activity,
        quantity: Number(quantity),
        unit: selectedActivity.unit,
        date,
      });

      const savedEntry = savedData.entry || savedData;

      setEntries((previousEntries) => [
        savedEntry,
        ...previousEntries,
      ]);

      setQuantity("");

      // Tell App.jsx to refresh dashboard statistics.
      if (onDataChange) {
        await onDataChange();
      }
    } catch (err) {
      setError(err.message || "Could not save activity.");
    } finally {
      setLoading(false);
    }
  };

  // Delete an activity from the backend and update the dashboard.
  const handleDelete = async (id) => {
    setError("");
    setDeletingId(id);

    try {
      await deleteCarbonEntry(id);

      setEntries((previousEntries) =>
        previousEntries.filter(
          (entry) => (entry._id || entry.id) !== id
        )
      );

      if (onDataChange) {
        await onDataChange();
      }
    } catch (err) {
      setError(err.message || "Could not delete activity.");
    } finally {
      setDeletingId("");
    }
  };

  return (
    <div className="tracker-page">
      <h1>Carbon Tracker</h1>

      <p className="tracker-description">
        Record your daily activities and estimate your carbon emissions.
      </p>

      {error && <p className="auth-error">{error}</p>}

      <form className="tracker-form" onSubmit={handleSubmit}>
        <label htmlFor="activity-category">Category</label>
        <select
          id="activity-category"
          value={category}
          onChange={handleCategoryChange}
        >
          <option value="Electricity">Electricity</option>
          <option value="Transport">Transport</option>
        </select>

        <label htmlFor="activity-name">Activity</label>
        <select
          id="activity-name"
          value={activity}
          onChange={(event) => setActivity(event.target.value)}
        >
          {activityOptions[category].map((item) => (
            <option key={item.name} value={item.name}>
              {item.name}
            </option>
          ))}
        </select>

        <label htmlFor="activity-quantity">
          Quantity ({selectedActivity.unit})
        </label>
        <input
          id="activity-quantity"
          type="number"
          min="0.01"
          step="any"
          placeholder="Enter quantity"
          value={quantity}
          onChange={(event) => setQuantity(event.target.value)}
          required
        />

        <label htmlFor="activity-date">Date</label>
        <input
          id="activity-date"
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Please wait..." : "Add Activity"}
        </button>
      </form>

      <h2 className="entries-title">Activity Records</h2>

      {loading && entries.length === 0 ? (
        <p className="empty-message">Loading activities...</p>
      ) : entries.length === 0 ? (
        <p className="empty-message">No activities added yet.</p>
      ) : (
        <div className="entries-list">
          {entries.map((entry) => {
            const id = entry._id || entry.id;

            return (
              <div className="entry-card" key={id}>
                <h3>{entry.activity}</h3>
                <p>Category: {entry.category}</p>
                <p>
                  Quantity: {entry.quantity} {entry.unit}
                </p>
                <p>
                  Date: {entry.date ? String(entry.date).slice(0, 10) : ""}
                </p>
                <p>
                  Estimated CO₂:{" "}
                  {Number(
                    entry.carbonEmission ?? entry.emission ?? 0
                  ).toFixed(2)}{" "}
                  kg
                </p>

                <button
                  type="button"
                  onClick={() => handleDelete(id)}
                  disabled={deletingId === id}
                >
                  {deletingId === id ? "Deleting..." : "Delete"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default CarbonTracker;
