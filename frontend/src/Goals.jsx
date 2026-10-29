
import { useState, useEffect } from "react";
import "./Goals.css";

import {
  getGoals,
  addGoal,
  deleteGoal as deleteGoalRequest,
} from "./api";

// Return today's date in local YYYY-MM-DD format.
function getTodayDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function Goals() {
  const [title, setTitle] = useState("");
  const [targetReduction, setTargetReduction] = useState("");
  const [endDate, setEndDate] = useState("");
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");

  const today = getTodayDate();

  // Load the logged-in user's goals from the backend.
  useEffect(() => {
    let cancelled = false;

    async function loadGoals() {
      setLoading(true);
      setError("");

      try {
        const data = await getGoals();
        const records = Array.isArray(data) ? data : data.goals || [];

        if (!cancelled) {
          setGoals(records);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Could not load goals.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadGoals();

    return () => {
      cancelled = true;
    };
  }, []);

  // Save a new goal in MongoDB through the backend.
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (
      !title.trim() ||
      !targetReduction ||
      !Number.isFinite(Number(targetReduction)) ||
      Number(targetReduction) < 1 ||
      !endDate ||
      endDate < today
    ) {
      setError(
        "Enter a goal title, a target of at least 1 kg, and a current or future end date."
      );
      return;
    }

    setSaving(true);

    try {
      const savedData = await addGoal({
        title: title.trim(),
        targetReduction: Number(targetReduction),
        startDate: today,
        endDate,
        status: "Active",
      });

      const savedGoal = savedData.goal || savedData;

      setGoals((previousGoals) => [
        savedGoal,
        ...previousGoals,
      ]);

      setTitle("");
      setTargetReduction("");
      setEndDate("");
    } catch (err) {
      setError(err.message || "Could not create goal.");
    } finally {
      setSaving(false);
    }
  };

  // Delete a goal from the backend.
  const handleDelete = async (id) => {
    setError("");
    setDeletingId(id);

    try {
      await deleteGoalRequest(id);

      setGoals((previousGoals) =>
        previousGoals.filter((goal) => (goal._id || goal.id) !== id)
      );
    } catch (err) {
      setError(err.message || "Could not delete goal.");
    } finally {
      setDeletingId("");
    }
  };

  return (
    <div className="goals-page">
      <h1>My Goals</h1>

      <p className="goals-description">
        Set targets and take small steps to reduce your carbon footprint.
      </p>

      {error && <p className="auth-error">{error}</p>}

      <form className="goals-form" onSubmit={handleSubmit}>
        <label htmlFor="goal-title">Goal Title</label>
        <input
          id="goal-title"
          type="text"
          placeholder="e.g. Reduce carbon emissions"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
        />

        <label htmlFor="target-reduction">
          Target Reduction (kg CO₂)
        </label>
        <input
          id="target-reduction"
          type="number"
          min="1"
          step="any"
          placeholder="Enter target in kg"
          value={targetReduction}
          onChange={(event) => setTargetReduction(event.target.value)}
          required
        />

        <label htmlFor="goal-date">Target End Date</label>
        <input
          id="goal-date"
          type="date"
          min={today}
          value={endDate}
          onChange={(event) => setEndDate(event.target.value)}
          required
        />

        <button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Create Goal"}
        </button>
      </form>

      <h2 className="goals-list-title">My Goals List</h2>

      {loading ? (
        <p className="empty-goals">Loading goals...</p>
      ) : goals.length === 0 ? (
        <p className="empty-goals">No goals created yet.</p>
      ) : (
        <div className="goals-list">
          {goals.map((goal) => {
            const id = goal._id || goal.id;

            return (
              <div className="goal-card" key={id}>
                <div className="goal-card-header">
                  <h3>{goal.title}</h3>
                  <span className="goal-status">{goal.status}</span>
                </div>

                <p>
                  Target reduction: {goal.targetReduction} kg CO₂
                </p>

                <p>
                  End date:{" "}
                  {goal.endDate ? String(goal.endDate).slice(0, 10) : ""}
                </p>

                <button
                  type="button"
                  className="delete-goal-button"
                  onClick={() => handleDelete(id)}
                  disabled={deletingId === id}
                >
                  {deletingId === id ? "Deleting..." : "Delete Goal"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Goals;
