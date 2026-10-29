
const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const authMiddleware = require("./middleware/authMiddleware");
const carbonRoutes = require("./routes/carbonRoutes");
const goalRoutes = require("./routes/goalRoutes");
const challengeRoutes = require("./routes/challengeRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const emissionRoutes = require("./routes/emissionRoutes");

const app = express();
const cors = require("cors");
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/carbon", carbonRoutes);
app.use("/api/goals", goalRoutes);

app.use("/api/challenges", challengeRoutes);
app.use("/api/dashboard", dashboardRoutes);
const profileRoutes = require("./routes/profileRoutes");
app.use("/api/profile", profileRoutes);
app.use("/api/emission-factors", emissionRoutes);


app.get("/", (req, res) => {
  res.send("Welcome to EcoTrack!");
});
 
app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({
    message: "You are authenticated!",
    user: req.user,
  });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");

    app.listen(process.env.PORT || 5000, () => {
      console.log("EcoTrack server is running");
    });
  })
  .catch((error) => {
    console.log("MongoDB connection error:", error.message);
  });
