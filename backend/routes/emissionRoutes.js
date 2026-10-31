
const express = require("express");
const CarbonEntry = require("../models/CarbonEntry");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const entries = await CarbonEntry.find({
      user: req.user.id,
    }).sort({ date: 1 });

    const totalEmission = entries.reduce(
      (total, entry) =>
        total + Number(entry.carbonEmission || 0),
      0
    );

    const categories = [
      "Transport",
      "Electricity",
      "Food",
      "Waste Management",
      "Water",
      "Lifestyle",
    ];

    const categorySummary = {};

    categories.forEach((category) => {
      categorySummary[category] = 0;
    });

    entries.forEach((entry) => {
      if (categorySummary[entry.category] !== undefined) {
        categorySummary[entry.category] += Number(
          entry.carbonEmission || 0
        );
      }
    });

    // Weekly emission: last 7 days
    const weeklySummary = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - i);

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
        label: date.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
        }),
        emission: Number(emission.toFixed(2)),
      });
    }

    // Monthly emission: last 6 months
    const monthlySummary = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setDate(1);
      date.setHours(0, 0, 0, 0);
      date.setMonth(date.getMonth() - i);

      const nextDate = new Date(date);
      nextDate.setMonth(nextDate.getMonth() + 1);

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

      monthlySummary.push({
        label: date.toLocaleDateString("en-IN", {
          month: "short",
          year: "2-digit",
        }),
        emission: Number(emission.toFixed(2)),
      });
    }

    return res.status(200).json({
      totalActivities: entries.length,
      totalEmission: Number(totalEmission.toFixed(2)),

      categorySummary: Object.fromEntries(
        Object.entries(categorySummary).map(([key, value]) => [
          key,
          Number(value.toFixed(2)),
        ])
      ),

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
