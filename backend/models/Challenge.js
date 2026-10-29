
const mongoose = require("mongoose");

const challengeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    durationDays: {
      type: Number,
      required: true,
      min: 1,
    },
    category: {
      type: String,
      enum: ["Transport", "Electricity", "Lifestyle"],
      required: true,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Challenge", challengeSchema);
