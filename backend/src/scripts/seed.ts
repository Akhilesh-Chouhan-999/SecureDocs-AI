import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import env from "../config/env.js";
import UserModel from "../models/User.js";
import HistoricalRecordModel from "../models/HistoricalRecord.js";
import { logger } from "../logs/index.js";

const seedDatabase = async () => {
  try {
    logger.info("Connecting to database for seeding...");
    await mongoose.connect(env.mongoUri);
    logger.info("Database connected successfully.");

    // Clear existing users and records if desired
    logger.info("Clearing existing users and historical records...");
    await UserModel.deleteMany({});
    await HistoricalRecordModel.deleteMany({});

    const adminUser = new UserModel({
      email: "admin@securedocs.ai",
      password: "SecureAdmin123!",
      organization: "SecureDocs AI",
      role: "admin",
      isActive: true,
    });

    await adminUser.save();
    logger.info("Admin user created: admin@securedocs.ai / SecureAdmin123!");

    // Create Sample Historical Record
    const historicalRecord = new HistoricalRecordModel({
      documentId: new mongoose.Types.ObjectId(),
      userId: adminUser._id,
      key: "companyNameMismatch",
      value: "Mismatched names indicate potential spoofing",
      source: "Manual Seed",
    });

    await historicalRecord.save();
    logger.info("Sample historical record created.");

    logger.info("Database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    logger.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
