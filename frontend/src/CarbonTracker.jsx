
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

  // All available categories and activities.
  const activityOptions = {
    Electricity: [
      { name: "Grid electricity", unit: "kWh" },
      { name: "Solar electricity", unit: "kWh" },
    ],

    Transport: [
      { name: "Petrol car", unit: "km" },
      { name: "Diesel car", unit: "km" },
      { name: "CNG car", unit: "km" },
      { name: "Motorcycle", unit: "km" },
      { name: "Petrol scooter", unit: "km" },
      { name: "Auto rickshaw (CNG)", unit: "km" },
      { name: "Bus", unit: "km" },
      { name: "City bus", unit: "passenger-km" },
      { name: "Domestic flight", unit: "passenger-km" },
    ],

    Food: [
      { name: "Vegetarian meal", unit: "meal" },
      { name: "Non-vegetarian meal", unit: "meal" },
      { name: "Chicken", unit: "kg" },
      { name: "Mutton", unit: "kg" },
      { name: "Milk", unit: "litre" },
    ],

    "Waste Management": [
      { name: "Plastic waste", unit: "kg" },
      { name: "Paper waste", unit: "kg" },
      { name: "Food waste", unit: "kg" },
      { name: "Recycled waste", unit: "kg" },
    ],

    Water: [
      { name: "Water consumption", unit: "litre" },
      { name: "Hot water usage", unit: "litre" },
    ],

    Lifestyle: [
      { name: "LPG cooking", unit: "kg" },
      { name: "Clothing purchase", unit: "item" },
      { name: "General shopping", unit: "item" },
    ],
  };

  const selectedActivity = activityOptions[category].find(
    (item) => item.name === activity
  );

  // Load activities from MongoDB.
  useEffect(() => {
    let cancelled = false;

    async function loadEntries() {
      setLoading(true);
      setError("");

      try {
        const data = await getCarbonEntries();
        const records = Array.isArray(data)
          ? data
          : data.entries || [];

        if (!cancelled) {
          setEntries(records);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message || "Could not load activity records."
          );
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

  // Change activity when category changes.
  const handleCategoryChange = (event) => {
    const newCategory = event.target.value;

    setCategory(newCategory);
    setActivity(activityOptions[newCategory][0].name);
    setQuantity("");
  };

  // Add a new activity.
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (
      !selectedActivity ||
      !quantity ||
      Number(quantity) <= 0 ||
      !date
    ) {
      setError(
        "Please enter a valid activity, quantity and date."
      );
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

      if (onDataChange) {
        await onDataChange();
      }
    } catch (err) {
      setError(err.message || "Could not save activity.");
    } finally {
      setLoading(false);
    }
  };

  // Delete an activity.
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
        <label htmlFor="activity-category">
          Category
        </label>

        <select
          id="activity-category"
          value={category}
          onChange={handleCategoryChange}
        >
          {Object.keys(activityOptions).map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <label htmlFor="activity-name">
          Activity
        </label>

        <select
          id="activity-name"
          value={activity}
          onChange={(event) =>
            setActivity(event.target.value)
          }
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
          onChange={(event) =>
            setQuantity(event.target.value)
          }
          required
        />

        <label htmlFor="activity-date">
          Date
        </label>

        <input
          id="activity-date"
          type="date"
          value={date}
          onChange={(event) =>
            setDate(event.target.value)
          }
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Please wait..." : "Add Activity"}
        </button>
      </form>

      <h2 className="entries-title">
        Activity Records
      </h2>

      {loading && entries.length === 0 ? (
        <p className="empty-message">
          Loading activities...
        </p>
      ) : entries.length === 0 ? (
        <p className="empty-message">
          No activities added yet.
        </p>
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
                  Date:{" "}
                  {entry.date
                    ? String(entry.date).slice(0, 10)
                    : ""}
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
                  {deletingId === id
                    ? "Deleting..."
                    : "Delete"}
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
