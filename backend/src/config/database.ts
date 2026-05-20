import mongoose from "mongoose";
import env from "./env";
import { logger } from "../logs";

/**
 * Connect to MongoDB database
 * @returns Connected Mongoose instance
 */
export const connectDB = async (): Promise<typeof mongoose> => {
  try {

    const conn = await mongoose.connect(env.mongoUri);
    logger.info("MongoDB connected", { host: conn.connection.host });
    
    return conn;
  } catch (error: any) {
    logger.error("MongoDB connection error", { message: error.message });
    throw error;
  }
};

export default connectDB;
