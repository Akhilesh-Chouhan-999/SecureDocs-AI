import mongoose from "mongoose";
import env from "./env.js";
import { logger } from "../logs/index.js";

/**
 * Connect to MongoDB database
 * @returns Connected Mongoose instance
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.mongoUri);
    logger.info("MongoDB connected", { host: conn.connection.host });
    return conn;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error("MongoDB connection error", { message });
    throw error;
  }
};

export default connectDB;
export { connectDB };
