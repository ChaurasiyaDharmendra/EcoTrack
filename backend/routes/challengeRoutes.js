
const express = require("express");
const mongoose = require("mongoose");

const Challenge = require("../models/Challenge");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

// Get all active challenges for logged-in users.
// GET /api/challenges
router.get("/", authMiddleware, async (req, res) => {
  try {
    // Fetch only active challenges from MongoDB.
    const challenges = await Challenge.find({
      status: "Active",
    }).sort({ createdAt: -1 });

    return res.status(200).json(challenges);
  } catch (error) {
    console.error("Fetch challenges error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch challenges",
    });
  }
});

// Create a challenge. Only admins can access this route.
// POST /api/challenges
router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { title, description, durationDays, category, status } = req.body;

    // Validate the required challenge details.
    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof description !== "string" ||
      !description.trim() ||
      typeof durationDays !== "number" ||
      !Number.isFinite(durationDays) ||
      durationDays <= 0 ||
      !category ||
      (status !== undefined && !["Active", "Inactive"].includes(status))
    ) {
      return res.status(400).json({
        message: "Please provide valid challenge details",
      });
    }

    // Save the new challenge in MongoDB.
    const challenge = await Challenge.create({
      title: title.trim(),
      description: description.trim(),
      durationDays,
      category,
      status: status || "Active",
    });

    return res.status(201).json({
      message: "Challenge created successfully",
      challenge,
    });
  } catch (error) {
    console.error("Create challenge error:", error.message);

    return res.status(400).json({
      message: "Invalid challenge data",
    });
  }
});

// Update a challenge. Only admins can access this route.
// PUT /api/challenges/:id
router.put("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // Check that the supplied ID is a valid MongoDB ID.
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid challenge ID",
      });
    }

    // Allow only supported fields to be updated.
    const allowedFields = [
      "title",
      "description",
      "durationDays",
      "category",
      "status",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    // Validate supplied fields before updating the database.
    if (
      updates.title !== undefined &&
      (typeof updates.title !== "string" || !updates.title.trim())
    ) {
      return res.status(400).json({
        message: "Please provide a valid title",
      });
    }

    if (updates.title !== undefined) {
      updates.title = updates.title.trim();
    }

    if (
      updates.description !== undefined &&
      (typeof updates.description !== "string" ||
        !updates.description.trim())
    ) {
      return res.status(400).json({
        message: "Please provide a valid description",
      });
    }

    if (updates.description !== undefined) {
      updates.description = updates.description.trim();
    }

    if (
      updates.durationDays !== undefined &&
      (typeof updates.durationDays !== "number" ||
        !Number.isFinite(updates.durationDays) ||
        updates.durationDays <= 0)
    ) {
      return res.status(400).json({
        message: "Duration must be greater than zero",
      });
    }

    if (
      updates.status !== undefined &&
      !["Active", "Inactive"].includes(updates.status)
    ) {
      return res.status(400).json({
        message: "Status must be Active or Inactive",
      });
    }

    // Update the challenge in MongoDB.
    const challenge = await Challenge.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!challenge) {
      return res.status(404).json({
        message: "Challenge not found",
      });
    }

    return res.status(200).json({
      message: "Challenge updated successfully",
      challenge,
    });
  } catch (error) {
    console.error("Update challenge error:", error.message);

    return res.status(400).json({
      message: "Invalid challenge data",
    });
  }
});

// Delete a challenge. Only admins can access this route.
// DELETE /api/challenges/:id
router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // Reject invalid MongoDB IDs.
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid challenge ID",
      });
    }

    // Delete the selected challenge from MongoDB.
    const challenge = await Challenge.findByIdAndDelete(req.params.id);

    if (!challenge) {
      return res.status(404).json({
        message: "Challenge not found",
      });
    }

    return res.status(200).json({
      message: "Challenge deleted successfully",
    });
  } catch (error) {
    console.error("Delete challenge error:", error.message);

    return res.status(500).json({
      message: "Failed to delete challenge",
    });
  }
});

module.exports = router;
