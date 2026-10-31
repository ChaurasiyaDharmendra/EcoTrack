
const express = require("express");
const CarbonEntry = require("../models/CarbonEntry");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const entries = await CarbonEntry.find({
      user: req.user.id,
    });

    // Total emission
    const totalEmission = entries.reduce(
      (total, entry) =>
        total + Number(entry.carbonEmission || 0),
      0
    );

    // Category-wise emission
    const categorySummary = {
      Transport: 0,
      Electricity: 0,
      Food: 0,
      "Waste Management": 0,
      Water: 0,
      Lifestyle: 0,
    };

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

    // Weekly summary (last 7 days)
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);

    const weeklySummary = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const emission = entries
        .filter((entry) => {
          const entryDate = new Date(entry.date);
          return entryDate >= date && entryDate < nextDate;
        })
        .reduce(
          (total, entry) =>
            total + Number(entry.carbonEmission || 0),
          0
        );

      weeklySummary.push({
        label: date.toLocaleDateString("en-US", {
          weekday: "short",
        }),
        emission: Number(emission.toFixed(2)),
      });
    }

    // Monthly summary (last 6 months)
    const monthlySummary = [];

    for (let i = 5; i >= 0; i--) {
      const startDate = new Date(
        today.getFullYear(),
        today.getMonth() - i,
        1
      );

      const endDate = new Date(
        today.getFullYear(),
        today.getMonth() - i + 1,
        1
      );

      const emission = entries
        .filter((entry) => {
          const entryDate = new Date(entry.date);
          return entryDate >= startDate && entryDate < endDate;
        })
        .reduce(
          (total, entry) =>
            total + Number(entry.carbonEmission || 0),
          0
        );

      monthlySummary.push({
        label: startDate.toLocaleDateString("en-US", {
          month: "short",
        }),
        emission: Number(emission.toFixed(2)),
      });
    }

    // Send dashboard data
    return res.status(200).json({
      totalActivities: entries.length,
      totalEmission: Number(totalEmission.toFixed(2)),

      categorySummary: {
        Transport: Number(categorySummary.Transport.toFixed(2)),
        Electricity: Number(categorySummary.Electricity.toFixed(2)),
        Food: Number(categorySummary.Food.toFixed(2)),
        "Waste Management": Number(
          categorySummary["Waste Management"].toFixed(2)
        ),
        Water: Number(categorySummary.Water.toFixed(2)),
        Lifestyle: Number(categorySummary.Lifestyle.toFixed(2)),
      },

      weeklySummary,
      monthlySummary,
    });
  } catch (error) {
    console.error("Dashboard error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch dashboard data",
    });
  }
});

module.exports = router;
