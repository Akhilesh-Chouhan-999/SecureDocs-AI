import type { SanitizedUser, DocumentSummary, ReportSummary } from "../../types/domain";

/**
 * Sanitize user entity for safe external API outputs
 * @param user User model object from Mongoose/DB
 */
export const sanitizeUser = (user: any): SanitizedUser => ({
  id: user._id,
  email: user.email,
  organization: user.organization,
  role: user.role,
});

/**
 * Format document db entity into metadata summary response
 * @param document Document model object
 */
export const toDocumentSummary = (document: any): DocumentSummary => ({
  id: document._id,
  fileName: document.fileName,
  fileType: document.fileType,
  fileSize: document.fileSize,
  status: document.status,
  createdAt: document.createdAt,
  updatedAt: document.updatedAt,
  ocrConfidence: document.ocrConfidence || null,
});

/**
 * Format fraud report db entity into summary response metadata
 * @param report Fraud report model object
 */
export const toReportSummary = (report: any): ReportSummary => ({
  id: report._id,
  riskScore: report.riskScore,
  riskLevel: report.riskLevel,
  anomalyCount: report.anomalies?.length || 0,
  decision: report.decision || "pending",
  createdAt: report.createdAt,
});

export const entities = {
  sanitizeUser,
  toDocumentSummary,
  toReportSummary,
};

export default entities;
