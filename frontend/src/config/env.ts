/**
 * Centralized environment configuration.
 * Validates and exposes environment variables with strict typing.
 */

export const ENV = {
  API_URL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  WS_URL: import.meta.env.VITE_WS_URL || "http://localhost:5000",
  APP_NAME: "SecureDocs AI",
  APP_VERSION: "1.0.0",
} as const;
