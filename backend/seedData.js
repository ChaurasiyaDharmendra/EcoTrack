
const mongoose = require("mongoose");
require("dotenv").config();

const User = require("./models/User");
const EmissionFactor = require("./models/EmissionFactor");
const Challenge = require("./models/Challenge");
const CarbonEntry = require("./models/CarbonEntry");
const Goal = require("./models/Goal");

const emissionFactors = [
  // ELECTRICITY
  {
    category: "Electricity",
    activityType: "Grid electricity",
    unit: "kWh",
    factorKgCO2: 0.779,
    source: "CEA CO2 Baseline Database Version 22.0",
  },
  {
    category: "Electricity",
    activityType: "Solar electricity",
    unit: "kWh",
    factorKgCO2: 0.05,
    source: "Project estimate",
  },

  // TRANSPORT - EXISTING ACTIVITIES
  {
    category: "Transport",
    activityType: "Petrol car",
    unit: "km",
    factorKgCO2: 0.192,
    source: "Existing project reference value",
  },
  {
    category: "Transport",
    activityType: "Bus",
    unit: "km",
    factorKgCO2: 0.105,
    source: "Existing project reference value",
  },
  {
    category: "Transport",
    activityType: "Motorcycle",
    unit: "km",
    factorKgCO2: 0.045,
    source: "Existing project reference value",
  },

  // TRANSPORT - ADDITIONAL ACTIVITIES
  {
    category: "Transport",
    activityType: "Diesel car",
    unit: "km",
    factorKgCO2: 0.141,
    source: "Project reference estimate",
  },
  {
    category: "Transport",
    activityType: "CNG car",
    unit: "km",
    factorKgCO2: 0.068,
    source: "Project reference estimate",
  },
  {
    category: "Transport",
    activityType: "Petrol scooter",
    unit: "km",
    factorKgCO2: 0.032,
    source: "Project reference estimate",
  },
  {
    category: "Transport",
    activityType: "Auto rickshaw (CNG)",
    unit: "km",
    factorKgCO2: 0.108,
    source: "Project reference estimate",
  },
  {
    category: "Transport",
    activityType: "City bus",
    unit: "passenger-km",
    factorKgCO2: 0.015,
    source: "Project reference estimate",
  },
  {
    category: "Transport",
    activityType: "Domestic flight",
    unit: "passenger-km",
    factorKgCO2: 0.229,
    source: "Project reference estimate",
  },

  // FOOD
  {
    category: "Food",
    activityType: "Vegetarian meal",
    unit: "meal",
    factorKgCO2: 0.5,
    source: "Project estimate",
  },
  {
    category: "Food",
    activityType: "Non-vegetarian meal",
    unit: "meal",
    factorKgCO2: 1.5,
    source: "Project estimate",
  },
  {
    category: "Food",
    activityType: "Chicken",
    unit: "kg",
    factorKgCO2: 6.0,
    source: "Project estimate",
  },
  {
    category: "Food",
    activityType: "Mutton",
    unit: "kg",
    factorKgCO2: 24.0,
    source: "Project estimate",
  },
  {
    category: "Food",
    activityType: "Milk",
    unit: "litre",
    factorKgCO2: 1.3,
    source: "Project estimate",
  },

  // WASTE MANAGEMENT
  {
    category: "Waste Management",
    activityType: "Plastic waste",
    unit: "kg",
    factorKgCO2: 2.5,
    source: "Project estimate",
  },
  {
    category: "Waste Management",
    activityType: "Paper waste",
    unit: "kg",
    factorKgCO2: 1.0,
    source: "Project estimate",
  },
  {
    category: "Waste Management",
    activityType: "Food waste",
    unit: "kg",
    factorKgCO2: 0.5,
    source: "Project estimate",
  },
  {
    category: "Waste Management",
    activityType: "Recycled waste",
    unit: "kg",
    factorKgCO2: 0.1,
    source: "Project estimate",
  },

  // WATER
  {
    category: "Water",
    activityType: "Water consumption",
    unit: "litre",
    factorKgCO2: 0.0003,
    source: "Project estimate",
  },
  {
    category: "Water",
    activityType: "Hot water usage",
    unit: "litre",
    factorKgCO2: 0.036,
    source: "Project estimate",
  },

  // LIFESTYLE
  {
    category: "Lifestyle",
    activityType: "LPG cooking",
    unit: "kg",
    factorKgCO2: 3.0,
    source: "Project estimate",
  },
  {
    category: "Lifestyle",
    activityType: "Clothing purchase",
    unit: "item",
    factorKgCO2: 20.0,
    source: "Project estimate",
  },
  {
    category: "Lifestyle",
    activityType: "General shopping",
    unit: "item",
    factorKgCO2: 5.0,
    source: "Project estimate",
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
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from .env file");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    // Insert only missing emission factors.
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

    console.log("Emission factors added successfully");

    // Insert only missing challenges.
    for (const challenge of challenges) {
      await Challenge.updateOne(
        { title: challenge.title },
        { $setOnInsert: challenge },
        { upsert: true }
      );
    }

    console.log("Challenges checked successfully");

    // Find the first existing user.
    const user = await User.findOne();

    if (!user) {
      console.log(
        "No user found. Sample entries and goals skipped."
      );
      return;
    }

    // Use today's date for sample entries.
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sampleEntries = [
      {
        user: user._id,
        category: "Electricity",
        activity: "Grid electricity",
        quantity: 5,
        unit: "kWh",
        carbonEmission: 5 * 0.779,
        date: today,
      },
      {
        user: user._id,
        category: "Transport",
        activity: "Petrol car",
        quantity: 10,
        unit: "km",
        carbonEmission: 10 * 0.192,
        date: today,
      },
      {
        user: user._id,
        category: "Transport",
        activity: "Bus",
        quantity: 8,
        unit: "km",
        carbonEmission: 8 * 0.105,
        date: today,
      },
    ];

    for (const entry of sampleEntries) {
      await CarbonEntry.updateOne(
        {
          user: user._id,
          activity: entry.activity,
          date: today,
          quantity: entry.quantity,
        },
        { $setOnInsert: entry },
        { upsert: true }
      );
    }

    // Add a sample goal only if it does not exist.
    await Goal.updateOne(
      {
        user: user._id,
        title: "Reduce Carbon Emissions",
      },
      {
        $setOnInsert: {
          user: user._id,
          title: "Reduce Carbon Emissions",
          targetReduction: 10,
          startDate: today,
          endDate: new Date(
            today.getTime() + 30 * 24 * 60 * 60 * 1000
          ),
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
