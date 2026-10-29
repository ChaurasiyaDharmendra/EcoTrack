
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// POST /api/auth/signup
// Register a new user from the React frontend.
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check that all required fields are provided.
    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      !password
    ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    // Check basic email format.
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(cleanEmail)) {
      return res.status(400).json({
        message: "Please enter a valid email address",
      });
    }

    // Require at least six characters in the password.
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
      });
    }

    // Prevent duplicate accounts with the same email.
    const existingUser = await User.findOne({
      email: cleanEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already registered",
      });
    }

    // Hash the password before saving it to MongoDB.
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      password: hashedPassword,
    });

    // Return safe user details without the password.
    return res.status(201).json({
      message: "Signup successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Signup error:", error.message);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "Email already registered",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Please provide valid signup details",
      });
    }

    return res.status(500).json({
      message: "Signup failed",
    });
  }
});

// POST /api/auth/login
// Verify credentials and return a JWT token.
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate the login fields.
    if (
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      !password
    ) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Find the account using the normalized email.
    const user = await User.findOne({
      email: cleanEmail,
    });

    // Keep the error message the same for incorrect credentials.
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Make sure the JWT secret is configured on the backend.
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing from backend/.env");

      return res.status(500).json({
        message: "Server authentication configuration error",
      });
    }

    // Create a token used by protected backend routes.
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Send the token and safe user details to React.
    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      message: "Login failed",
    });
  }
});

module.exports = router;
