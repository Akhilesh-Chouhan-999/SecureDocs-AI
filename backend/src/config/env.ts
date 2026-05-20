import dotenv from "dotenv";

dotenv.config();

/**
 * Parsed and structured environment configuration settings
 */
const env = {
  nodeEnv:            process.env.NODE_ENV || "development",
  port:               Number(process.env.PORT) || 5000,
  host:               process.env.HOST || "localhost",
  mongoUri:           process.env.MONGODB_URI || "mongodb://localhost:27017/securedoc_ai",
  jwtSecret:          process.env.JWT_SECRET || "development_jwt_secret_change_me",
  jwtExpiry:          process.env.JWT_EXPIRY || "15m",
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET ||
                      process.env.JWT_SECRET ||
                      "development_refresh_secret_change_me",
  refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || "7d",
  uploadDir:          process.env.UPLOAD_DIR || "./uploads",
  maxFileSize:        Number(process.env.MAX_FILE_SIZE) || 52428800,
  frontendUrl:        process.env.FRONTEND_URL || "http://localhost:3000",
  redisUrl:           process.env.REDIS_URL || "",
  jobQueueName:       process.env.JOB_QUEUE_NAME || "securedocs-analysis",
  openAiApiKey:       process.env.OPENAI_API_KEY || "",
  geminiApiKey:       process.env.GEMINI_API_KEY || "",
  enableJobQueue:     process.env.ENABLE_JOB_QUEUE !== "false",
  enableOcr:          process.env.ENABLE_OCR !== "false",
  enableRag:          process.env.ENABLE_RAG !== "false",
};

export default env;
export { env };
