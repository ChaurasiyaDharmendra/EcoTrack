
const express = require("express");
const mongoose = require("mongoose");

const CarbonEntry = require("../models/CarbonEntry");
const EmissionFactor = require("../models/EmissionFactor");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Add a new carbon activity.
// POST /api/carbon
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { category, activity, quantity, unit, date } = req.body;

    // Validate the activity details received from the frontend.
    if (
      !category ||
      !activity ||
      typeof quantity !== "number" ||
      !Number.isFinite(quantity) ||
      quantity <= 0 ||
      !unit ||
      !date ||
      Number.isNaN(Date.parse(date))
    ) {
      return res.status(400).json({
        message: "Please provide valid activity details",
      });
    }

    // Find the emission factor for the selected activity.
    const factor = await EmissionFactor.findOne({
      category,
      activityType: activity,
      unit,
    });

    if (!factor) {
      return res.status(404).json({
        message: "Emission factor not found for this activity",
      });
    }

    // Calculate CO2 emissions on the backend.
    const carbonEmission = quantity * factor.factorKgCO2;

    // Save the activity in MongoDB for the logged-in user.
    const entry = await CarbonEntry.create({
      user: req.user.id,
      category,
      activity,
      quantity,
      unit,
      carbonEmission,
      date: new Date(date),
    });

    return res.status(201).json({
      message: "Activity added successfully",
      entry,
    });
  } catch (error) {
    console.error("Add carbon activity error:", error.message);

    return res.status(500).json({
      message: "Failed to add activity",
    });
  }
});

// Get activities belonging to the logged-in user.
// GET /api/carbon
router.get("/", authMiddleware, async (req, res) => {
  try {
    const entries = await CarbonEntry.find({
      user: req.user.id,
    }).sort({ date: -1 });

    return res.status(200).json(entries);
  } catch (error) {
    console.error("Fetch carbon activities error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch activities",
    });
  }
});

// Update an existing activity.
// PUT /api/carbon/:id
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { category, activity, quantity, unit, date } = req.body;

    // Check that the activity ID is a valid MongoDB ID.
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid activity ID",
      });
    }

    // Validate the updated activity details.
    if (
      !category ||
      !activity ||
      typeof quantity !== "number" ||
      !Number.isFinite(quantity) ||
      quantity <= 0 ||
      !unit ||
      !date ||
      Number.isNaN(Date.parse(date))
    ) {
      return res.status(400).json({
        message: "Please provide valid activity details",
      });
    }

    // Get the correct emission factor for the updated activity.
    const factor = await EmissionFactor.findOne({
      category,
      activityType: activity,
      unit,
    });

    if (!factor) {
      return res.status(404).json({
        message: "Emission factor not found for this activity",
      });
    }

    // Update only a record owned by the logged-in user.
    const entry = await CarbonEntry.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.id,
      },
      {
        category,
        activity,
        quantity,
        unit,
        carbonEmission: quantity * factor.factorKgCO2,
        date: new Date(date),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!entry) {
      return res.status(404).json({
        message: "Activity not found",
      });
    }

    return res.status(200).json({
      message: "Activity updated successfully",
      entry,
    });
  } catch (error) {
    console.error("Update carbon activity error:", error.message);

    return res.status(500).json({
      message: "Failed to update activity",
    });
  }
});

// Delete an activity owned by the logged-in user.
// DELETE /api/carbon/:id
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    // Reject invalid MongoDB IDs.
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid activity ID",
      });
    }

    // Delete only the current user's activity.
    const entry = await CarbonEntry.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!entry) {
      return res.status(404).json({
        message: "Activity not found",
      });
    }

    return res.status(200).json({
      message: "Activity deleted successfully",
    });
  } catch (error) {
    console.error("Delete carbon activity error:", error.message);

    return res.status(500).json({
      message: "Failed to delete activity",
    });
  }
});

module.exports = router;
