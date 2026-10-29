const mongoose = require("mongoose");
require("dotenv").config();

const User = require("./models/User");
const EmissionFactor = require("./models/EmissionFactor");
const Challenge = require("./models/Challenge");
const CarbonEntry = require("./models/CarbonEntry");
const Goal = require("./models/Goal");

const emissionFactors = [
  {
    category: "Electricity",
    activityType: "Grid electricity",
    unit: "kWh",
    factorKgCO2: 0.779,
    source: "CEA CO2 Baseline Database Version 22.0",
  },
  {
    category: "Transport",
    activityType: "Petrol car",
    unit: "km",
    factorKgCO2: 0.192,
    source: "Estimated project reference value",
  },
  {
    category: "Transport",
    activityType: "Bus",
    unit: "km",
    factorKgCO2: 0.105,
    source: "Estimated project reference value",
  },
  {
    category: "Transport",
    activityType: "Motorcycle",
    unit: "km",
    factorKgCO2: 0.045,
    source: "Estimated project reference value",
  },
];

const challenges = [
  {
    title: "Save Electricity",
    description: "Reduce electricity usage at home.",
    durationDays: 7,
    category: "Electricity",
    status: "Active",
  },
  {
    title: "Use Public Transport",
    description: "Use a bus instead of a personal vehicle.",
    durationDays: 7,
    category: "Transport",
    status: "Active",
  },
  {
    title: "Reduce Plastic Use",
    description: "Use reusable bags and bottles.",
    durationDays: 14,
    category: "Lifestyle",
    status: "Active",
  },
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    // Add only emission factors that do not already exist
    for (const factor of emissionFactors) {
      await EmissionFactor.updateOne(
        {
          category: factor.category,
          activityType: factor.activityType,
          unit: factor.unit,
        },
        { $setOnInsert: factor },
        { upsert: true }
      );
    }

    // Avoid adding duplicate sample challenges
    for (const challenge of challenges) {
      await Challenge.updateOne(
        { title: challenge.title },
        { $setOnInsert: challenge },
        { upsert: true }
      );
    }

    // Link sample entries and goals to the first existing user
    const user = await User.findOne();

    if (!user) {
      console.log(
        "No user found. Emission factors and challenges added; entries and goals skipped."
      );
      return;
    }

    const sampleEntries = [
      {
        user: user._id,
        category: "Electricity",
        activity: "Grid electricity",
        quantity: 5,
        unit: "kWh",
        carbonEmission: 5 * 0.779,
        date: new Date(),
      },
      {
        user: user._id,
        category: "Transport",
        activity: "Petrol car",
        quantity: 10,
        unit: "km",
        carbonEmission: 10 * 0.192,
        date: new Date(),
      },
      {
        user: user._id,
        category: "Transport",
        activity: "Bus",
        quantity: 8,
        unit: "km",
        carbonEmission: 8 * 0.105,
        date: new Date(),
      },
    ];

    for (const entry of sampleEntries) {
      await CarbonEntry.updateOne(
        {
          user: user._id,
          activity: entry.activity,
          date: entry.date,
          quantity: entry.quantity,
        },
        { $setOnInsert: entry },
        { upsert: true }
      );
    }

    await Goal.updateOne(
      { user: user._id, title: "Reduce Carbon Emissions" },
      {
        $setOnInsert: {
          user: user._id,
          title: "Reduce Carbon Emissions",
          targetReduction: 10,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: "Active",
        },
      },
      { upsert: true }
    );

    console.log("EcoTrack sample data added successfully!");
  } catch (error) {
    console.log("Seed error:", error.message);
  } finally {
    await mongoose.disconnect();
  }
};

seedData();