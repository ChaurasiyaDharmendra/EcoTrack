
const express = require("express");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// GET /api/profile
// Fetch the logged-in user's profile.
router.get("/", authMiddleware, async (req, res) => {
  try {
    // Find the user using the ID from the verified login token.
    // Never send the password to the frontend.
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Send the profile details to the React frontend.
    return res.status(200).json(user);
  } catch (error) {
    console.error("Fetch profile error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch profile",
    });
  }
});

// PUT /api/profile
// Update the logged-in user's name and email.
router.put("/", authMiddleware, async (req, res) => {
  try {
    const { name, email } = req.body;

    // Validate the profile details received from the frontend.
    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !email.trim()
    ) {
      return res.status(400).json({
        message: "Please provide a valid name and email",
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    // Check whether another user already uses this email.
    const existingUser = await User.findOne({
      email: cleanEmail,
      _id: { $ne: req.user.id },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "This email is already registered",
      });
    }

    // Update only the authenticated user's own profile.
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        name: cleanName,
        email: cleanEmail,
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Return the updated profile without the password.
    return res.status(200).json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update profile error:", error.message);

    // Handle duplicate email errors from MongoDB.
    if (error.code === 11000) {
      return res.status(409).json({
        message: "This email is already registered",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Please provide valid profile details",
      });
    }

    return res.status(500).json({
      message: "Failed to update profile",
    });
  }
});

module.exports = router;
