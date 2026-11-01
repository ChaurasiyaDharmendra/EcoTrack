
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { Resend } = require("resend");
const User = require("../models/User");

const router = express.Router();

// Resend email service
const resend = new Resend(process.env.RESEND_API_KEY);

// POST /api/auth/signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

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

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(cleanEmail)) {
      return res.status(400).json({
        message: "Please enter a valid email address",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
      });
    }

    const existingUser = await User.findOne({
      email: cleanEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      password: hashedPassword,
    });

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

    return res.status(500).json({
      message: "Signup failed",
    });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

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

    const user = await User.findOne({
      email: cleanEmail,
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        message: "Server authentication configuration error",
      });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

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

// POST /api/auth/forgot-password
// Generate and send OTP
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (typeof email !== "string" || !email.trim()) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    if (!process.env.RESEND_API_KEY) {
      return res.status(500).json({
        message: "Email service is not configured",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: cleanEmail,
    });

    // Same response whether account exists or not
    if (!user) {
      return res.status(200).json({
        message: "If your email is registered, an OTP will be sent.",
      });
    }

    // Generate a six-digit OTP
    const otp = crypto.randomInt(100000, 1000000).toString();

    // Store hashed OTP in database
    const hashedOTP = crypto
      .createHash("sha256")
      .update(otp)
      .digest("hex");

    user.resetOTP = hashedOTP;
    user.resetOTPExpiry = new Date(Date.now() + 5 * 60 * 1000);
    user.resetOTPVerified = false;

    await user.save();

    // Send OTP through Resend
    const { error } = await resend.emails.send({
      from: process.env.FROM_EMAIL || "EcoTrack <onboarding@resend.dev>",
      to: [cleanEmail],
      subject: "EcoTrack Password Reset OTP",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>EcoTrack Password Reset</h2>
          <p>Hello ${user.name},</p>
          <p>Your password reset OTP is:</p>
          <h1 style="letter-spacing: 8px;">${otp}</h1>
          <p>This OTP is valid for 5 minutes.</p>
          <p>If you did not request this, please ignore this email.</p>
        </div>
      `,
    });

    if (error) {
      user.resetOTP = null;
      user.resetOTPExpiry = null;
      user.resetOTPVerified = false;
      await user.save();

      console.error("Resend error:", error);

      return res.status(500).json({
        message: "Unable to send OTP email",
      });
    }

    return res.status(200).json({
      message: "OTP sent successfully to your email",
    });
  } catch (error) {
    console.error("Forgot password error:", error.message);

    return res.status(500).json({
      message: "Failed to send OTP",
    });
  }
});

// POST /api/auth/verify-otp
// Verify OTP
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (
      typeof email !== "string" ||
      typeof otp !== "string" ||
      !email.trim() ||
      !otp.trim()
    ) {
      return res.status(400).json({
        message: "Email and OTP are required",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: cleanEmail,
    });

    if (!user || !user.resetOTP || !user.resetOTPExpiry) {
      return res.status(400).json({
        message: "Invalid or expired OTP",
      });
    }

    if (user.resetOTPExpiry.getTime() < Date.now()) {
      user.resetOTP = null;
      user.resetOTPExpiry = null;
      user.resetOTPVerified = false;
      await user.save();

      return res.status(400).json({
        message: "OTP has expired. Please request a new OTP.",
      });
    }

    const hashedOTP = crypto
      .createHash("sha256")
      .update(otp.trim())
      .digest("hex");

    if (hashedOTP !== user.resetOTP) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    user.resetOTPVerified = true;
    await user.save();

    return res.status(200).json({
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("OTP verification error:", error.message);

    return res.status(500).json({
      message: "OTP verification failed",
    });
  }
});

// POST /api/auth/reset-password
// Set new password after OTP verification
router.post("/reset-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (
      typeof email !== "string" ||
      typeof newPassword !== "string" ||
      !email.trim() ||
      !newPassword
    ) {
      return res.status(400).json({
        message: "Email and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: cleanEmail,
    });

    if (
      !user ||
      !user.resetOTPVerified ||
      !user.resetOTPExpiry ||
      user.resetOTPExpiry.getTime() < Date.now()
    ) {
      return res.status(400).json({
        message: "Please verify a valid OTP first",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;

    // Clear OTP data after successful password reset
    user.resetOTP = null;
    user.resetOTPExpiry = null;
    user.resetOTPVerified = false;

    await user.save();

    return res.status(200).json({
      message: "Password reset successfully. Please login.",
    });
  } catch (error) {
    console.error("Reset password error:", error.message);

    return res.status(500).json({
      message: "Password reset failed",
    });
  }
});

module.exports = router;
