import { APP_NAME } from "../constants";
import { ROUTE_GROUPS } from "../types";
import { getUploadSummary } from "../uploads";
import { scheduledTasks } from "../schedulers";

export const routeCatalog = [
  { method: "GET", path: "/", group: "system", auth: false, purpose: "API landing payload" },
  { method: "GET", path: "/health", group: "system", auth: false, purpose: "Liveness check" },
  { method: "GET", path: "/ready", group: "system", auth: false, purpose: "Readiness check" },
  { method: "GET", path: "/api", group: "system", auth: false, purpose: "API overview" },
  { method: "GET", path: "/api/system/info", group: "system", auth: false, purpose: "Backend metadata" },
  { method: "GET", path: "/api/system/routes", group: "system", auth: false, purpose: "Route catalog" },
  { method: "GET", path: "/api/system/modules", group: "system", auth: false, purpose: "Folder usage summary" },
  { method: "POST", path: "/api/auth/register", group: "auth", auth: false, purpose: "Create analyst account" },
  { method: "POST", path: "/api/auth/login", group: "auth", auth: false, purpose: "Authenticate user" },
  { method: "POST", path: "/api/auth/refresh-token", group: "auth", auth: false, purpose: "Rotate access token" },
  { method: "POST", path: "/api/auth/logout", group: "auth", auth: true, purpose: "Invalidate current session client-side" },
  { method: "GET", path: "/api/auth/profile", group: "auth", auth: true, purpose: "Fetch current user profile" },
  { method: "POST", path: "/api/documents/upload", group: "documents", auth: true, purpose: "Upload PDF or image" },
  { method: "GET", path: "/api/documents", group: "documents", auth: true, purpose: "List user documents" },
  { method: "GET", path: "/api/documents/:id", group: "documents", auth: true, purpose: "Fetch one document" },
  { method: "DELETE", path: "/api/documents/:id", group: "documents", auth: true, purpose: "Delete one document" },
  { method: "POST", path: "/api/analysis/analyze", group: "analysis", auth: true, purpose: "Run OCR and fraud checks" },
  { method: "POST", path: "/api/analysis/ocr", group: "analysis", auth: true, purpose: "Run OCR only" },
  { method: "POST", path: "/api/analysis/anomalies", group: "analysis", auth: true, purpose: "Detect anomalies from stored OCR" },
  { method: "POST", path: "/api/analysis/risk-score", group: "analysis", auth: true, purpose: "Calculate document risk score" },
  { method: "GET", path: "/api/analysis/status/:documentId", group: "analysis", auth: true, purpose: "Get analysis status by document" },
  { method: "GET", path: "/api/analysis/results/:documentId", group: "analysis", auth: true, purpose: "Get analysis results by document" },
  { method: "GET", path: "/api/history", group: "history", auth: true, purpose: "Search historical context records" },
  { method: "GET", path: "/api/history/:email", group: "history", auth: true, purpose: "Fetch historical context by email" },
  { method: "POST", path: "/api/reports/generate", group: "reports", auth: true, purpose: "Generate fraud report" },
  { method: "GET", path: "/api/reports", group: "reports", auth: true, purpose: "List current user reports" },
  { method: "GET", path: "/api/reports/user/:userId", group: "reports", auth: true, purpose: "List reports for a user" },
  { method: "GET", path: "/api/reports/:reportId/download", group: "reports", auth: true, purpose: "Download PDF report" },
  { method: "GET", path: "/api/reports/:reportId", group: "reports", auth: true, purpose: "Fetch report details" },
  { method: "POST", path: "/api/reports/:reportId/review", group: "reports", auth: true, purpose: "Review and decide on a fraud report" },
  { method: "DELETE", path: "/api/reports/:reportId", group: "reports", auth: true, purpose: "Delete report" },
  { method: "GET", path: "/api/jobs", group: "jobs", auth: true, purpose: "List current user jobs" },
  { method: "POST", path: "/api/jobs/analysis", group: "jobs", auth: true, purpose: "Queue analysis work" },
  { method: "GET", path: "/api/jobs/:jobId/status", group: "jobs", auth: true, purpose: "Get queued job status" },
  { method: "POST", path: "/api/jobs/:jobId/cancel", group: "jobs", auth: true, purpose: "Cancel queued analysis work" },
  { method: "POST", path: "/api/jobs/:jobId/retry", group: "jobs", auth: true, purpose: "Retry a failed or canceled job" },
];

export const folderUsage = {
  config: "Environment, database, DI container, and LLM provider summary.",
  controllers: "Thin HTTP layer for auth, documents, analysis, reports, and jobs.",
  services: "Business logic for auth, document lifecycle, analysis, reporting, and jobs.",
  repositories: "Mongoose-backed persistence helpers.",
  middleware: "Auth, validation, upload handling, and global errors.",
  errors: "Custom operational errors including AppError, AuthError, NotFoundError, and ValidationError.",
  domain: "Pure business helpers for entity shaping and risk decisions.",
  ai: "Small OCR, parsing, memory, retrieval, and workflow helpers powering the analysis flow.",
  infrastructure: "Storage, queue worker helpers, AI tools, database models, and cache glue.",
  jobs: "Job record creation and status updates.",
  events: "Domain event names for job lifecycle notifications.",
  listeners: "EventEmitter listeners for audit-style job logging.",
  sockets: "Socket.IO bootstrap for future live job updates.",
  uploads: "Upload configuration summary used by docs and middleware.",
  docs: "Route catalog and module summary endpoints.",
  schedulers: "Future scheduled task registry, documented but not active yet.",
  logs: "Centralized JSON logger wrapper.",
  constants: "Shared app constants and enums.",
  helpers: "Small object/text utilities.",
  types: "Regex and mime-type definitions.",
  core: "Base repository contract.",
  interfaces: "Container token list for the active dependency graph.",
};

/**
 * Build consolidated system health/upload parameters API overview object
 */
export const getApiOverview = () => ({
  name: APP_NAME,
  routeGroups: ROUTE_GROUPS,
  totalRoutes: routeCatalog.length,
  upload: getUploadSummary(),
  schedulers: scheduledTasks,
});

export default {
  routeCatalog,
  folderUsage,
  getApiOverview,
};
