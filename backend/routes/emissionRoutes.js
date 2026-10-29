
const express = require("express");
const EmissionFactor = require("../models/EmissionFactor");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

// GET /api/emission-factors
// Fetch emission factors for the authenticated user.
router.get("/", authMiddleware, async (req, res) => {
  try {
    // Get all emission factors from MongoDB.
    const factors = await EmissionFactor.find().sort({
      category: 1,
      activityType: 1,
    });

    return res.status(200).json(factors);
  } catch (error) {
    console.error("Fetch emission factors error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch emission factors",
    });
  }
});

// POST /api/emission-factors
// Only an admin can add a new emission factor.
router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { category, activityType, unit, factorKgCO2, source } = req.body;

    // Check that required text fields are provided.
    if (
      typeof category !== "string" ||
      !category.trim() ||
      typeof activityType !== "string" ||
      !activityType.trim() ||
      typeof unit !== "string" ||
      !unit.trim()
    ) {
      return res.status(400).json({
        message: "Category, activity type and unit are required",
      });
    }

    // Check that the emission factor is a valid non-negative number.
    const factor = Number(factorKgCO2);

    if (
      factorKgCO2 === undefined ||
      factorKgCO2 === null ||
      factorKgCO2 === "" ||
      !Number.isFinite(factor) ||
      factor < 0
    ) {
      return res.status(400).json({
        message: "Please provide a valid emission factor",
      });
    }

    // Prevent duplicate category, activity and unit combinations.
    const existingFactor = await EmissionFactor.findOne({
      category: category.trim(),
      activityType: activityType.trim(),
      unit: unit.trim(),
    });

    if (existingFactor) {
      return res.status(409).json({
        message: "This emission factor already exists",
      });
    }

    // Save the new emission factor in MongoDB.
    const newFactor = await EmissionFactor.create({
      category: category.trim(),
      activityType: activityType.trim(),
      unit: unit.trim(),
      factorKgCO2: factor,
      source:
        typeof source === "string" && source.trim()
          ? source.trim()
          : "Not specified",
    });

    return res.status(201).json({
      message: "Emission factor added successfully",
      factor: newFactor,
    });
  } catch (error) {
    console.error("Add emission factor error:", error.message);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "This emission factor already exists",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Invalid emission factor data",
      });
    }

    return res.status(500).json({
      message: "Failed to add emission factor",
    });
  }
});

module.exports = router;
