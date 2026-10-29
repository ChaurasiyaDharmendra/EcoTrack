
const express = require("express");
const CarbonEntry = require("../models/CarbonEntry");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// GET /api/dashboard
// Fetch dashboard statistics for the logged-in user.
router.get("/", authMiddleware, async (req, res) => {
  try {
    // Get only the carbon activities belonging to this user.
    const entries = await CarbonEntry.find({
      user: req.user.id,
    });

    // Calculate the total CO2 emission from all activities.
    const totalEmission = entries.reduce(
      (total, entry) => total + Number(entry.carbonEmission || 0),
      0
    );

    // Store emissions separately for each category.
    const categorySummary = {
      Transport: 0,
      Electricity: 0,
      Lifestyle: 0,
    };

    // Add each activity's emission to its category.
    entries.forEach((entry) => {
      if (Object.prototype.hasOwnProperty.call(
        categorySummary,
        entry.category
      )) {
        categorySummary[entry.category] += Number(
          entry.carbonEmission || 0
        );
      }
    });

    // Send dashboard statistics back to the React frontend.
    return res.status(200).json({
      totalActivities: entries.length,
      totalEmission: Number(totalEmission.toFixed(2)),
      categorySummary: {
        Transport: Number(categorySummary.Transport.toFixed(2)),
        Electricity: Number(categorySummary.Electricity.toFixed(2)),
        Lifestyle: Number(categorySummary.Lifestyle.toFixed(2)),
      },
    });
  } catch (error) {
    // Return an error response if fetching dashboard data fails.
    console.error("Dashboard error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch dashboard data",
    });
  }
});

module.exports = router;
