
const express = require("express");
const mongoose = require("mongoose");

const Goal = require("../models/Goal");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Create a new goal for the logged-in user.
// POST /api/goals
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, targetReduction, startDate, endDate } = req.body;

    // Validate the goal details received from the frontend.
    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof targetReduction !== "number" ||
      !Number.isFinite(targetReduction) ||
      targetReduction <= 0 ||
      !endDate ||
      Number.isNaN(Date.parse(endDate))
    ) {
      return res.status(400).json({
        message: "Please provide valid goal details",
      });
    }

    // Make sure the end date is not earlier than the start date.
    if (
      startDate &&
      (!Number.isFinite(Date.parse(startDate)) ||
        Date.parse(endDate) < Date.parse(startDate))
    ) {
      return res.status(400).json({
        message: "End date must be on or after the start date",
      });
    }

    // Save the goal in MongoDB under the logged-in user's ID.
    const goal = await Goal.create({
      user: req.user.id,
      title: title.trim(),
      targetReduction,
      startDate: startDate || new Date(),
      endDate: new Date(endDate),
      status: "Active",
    });

    return res.status(201).json({
      message: "Goal created successfully",
      goal,
    });
  } catch (error) {
    console.error("Create goal error:", error.message);

    return res.status(500).json({
      message: "Failed to create goal",
    });
  }
});

// Get all goals belonging to the logged-in user.
// GET /api/goals
router.get("/", authMiddleware, async (req, res) => {
  try {
    const goals = await Goal.find({
      user: req.user.id,
    }).sort({ endDate: 1 });

    return res.status(200).json(goals);
  } catch (error) {
    console.error("Fetch goals error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch goals",
    });
  }
});

// Update a goal owned by the logged-in user.
// PUT /api/goals/:id
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    // Reject invalid MongoDB IDs.
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid goal ID",
      });
    }

    // Only allow these fields to be updated.
    const allowedFields = [
      "title",
      "targetReduction",
      "startDate",
      "endDate",
      "status",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    // Validate title if it was provided.
    if (
      updates.title !== undefined &&
      (typeof updates.title !== "string" || !updates.title.trim())
    ) {
      return res.status(400).json({
        message: "Please provide a valid goal title",
      });
    }

    if (updates.title !== undefined) {
      updates.title = updates.title.trim();
    }

    // Validate target reduction if it was provided.
    if (
      updates.targetReduction !== undefined &&
      (typeof updates.targetReduction !== "number" ||
        !Number.isFinite(updates.targetReduction) ||
        updates.targetReduction <= 0)
    ) {
      return res.status(400).json({
        message: "Target reduction must be greater than zero",
      });
    }

    // Validate date fields if they were provided.
    for (const field of ["startDate", "endDate"]) {
      if (
        updates[field] !== undefined &&
        (!updates[field] || Number.isNaN(Date.parse(updates[field])))
      ) {
        return res.status(400).json({
          message: `Please provide a valid ${field}`,
        });
      }
    }

    // Validate status if it was provided.
    if (
      updates.status !== undefined &&
      !["Active", "Completed", "Cancelled"].includes(updates.status)
    ) {
      return res.status(400).json({
        message: "Invalid goal status",
      });
    }

    // Find and update only this user's goal.
    const goal = await Goal.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.id,
      },
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!goal) {
      return res.status(404).json({
        message: "Goal not found",
      });
    }

    return res.status(200).json({
      message: "Goal updated successfully",
      goal,
    });
  } catch (error) {
    console.error("Update goal error:", error.message);

    return res.status(500).json({
      message: "Failed to update goal",
    });
  }
});

// Delete a goal owned by the logged-in user.
// DELETE /api/goals/:id
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    // Reject invalid MongoDB IDs.
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid goal ID",
      });
    }

    const goal = await Goal.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!goal) {
      return res.status(404).json({
        message: "Goal not found",
      });
    }

    return res.status(200).json({
      message: "Goal deleted successfully",
    });
  } catch (error) {
    console.error("Delete goal error:", error.message);

    return res.status(500).json({
      message: "Failed to delete goal",
    });
  }
});

module.exports = router;
