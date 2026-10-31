
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

    // Calculate total CO2 emission.
    const totalEmission = entries.reduce(
      (total, entry) =>
        total + Number(entry.carbonEmission || 0),
      0
    );

    // Store emissions separately for all categories.
    const categorySummary = {
      Transport: 0,
      Electricity: 0,
      Food: 0,
      "Waste Management": 0,
      Water: 0,
      Lifestyle: 0,
    };

    // Calculate category-wise emissions.
    entries.forEach((entry) => {
      if (
        Object.prototype.hasOwnProperty.call(
          categorySummary,
          entry.category
        )
      ) {
        categorySummary[entry.category] += Number(
          entry.carbonEmission || 0
        );
      }
    });

    // Send dashboard statistics to frontend.
    return res.status(200).json({
      totalActivities: entries.length,
      totalEmission: Number(totalEmission.toFixed(2)),

      categorySummary: {
        Transport: Number(
          categorySummary.Transport.toFixed(2)
        ),
        Electricity: Number(
          categorySummary.Electricity.toFixed(2)
        ),
        Food: Number(
          categorySummary.Food.toFixed(2)
        ),
        "Waste Management": Number(
          categorySummary["Waste Management"].toFixed(2)
        ),
        Water: Number(
          categorySummary.Water.toFixed(2)
        ),
        Lifestyle: Number(
          categorySummary.Lifestyle.toFixed(2)
        ),
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch dashboard data",
    });
  }
});

module.exports = router;
