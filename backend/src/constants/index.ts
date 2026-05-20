export const APP_NAME = "SecureDocs AI";
export const APP_SLUG = "securedocs-ai";
export const API_PREFIX = "/api";

export const DOCUMENT_STATUSES = Object.freeze({
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
} as const);

export const JOB_TYPES = Object.freeze({
  ANALYSIS: "analysis",
} as const);

export const JOB_STATUSES = Object.freeze({
  QUEUED: "queued",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
  CANCELED: "canceled",
} as const);

export const RISK_LEVELS = Object.freeze(["low", "medium", "high", "critical"] as const);
export const REVIEW_DECISIONS = Object.freeze([
  "pending",
  "approved",
  "rejected",
  "manual_review",
] as const);

export const constants = {
  APP_NAME,
  APP_SLUG,
  API_PREFIX,
  DOCUMENT_STATUSES,
  JOB_TYPES,
  JOB_STATUSES,
  RISK_LEVELS,
  REVIEW_DECISIONS,
};

export default constants;
