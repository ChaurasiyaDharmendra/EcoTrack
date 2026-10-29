const mongoose = require("mongoose");

const emissionFactorSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: ["Transport", "Electricity", "Lifestyle"],
      required: true,
    },
    activityType: {
      type: String,
      required: true,
    },
    unit: {
      type: String,
      required: true,
    },
    factorKgCO2: {
      type: Number,
      required: true,
      min: 0,
    },
    source: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("EmissionFactor", emissionFactorSchema);