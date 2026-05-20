import type { HydratedDocument, Types } from "mongoose";

/** Role permissions available to users */
export type UserRole = "analyst" | "admin" | "manager";

/** Current processing status of a document */
export type DocumentStatus = "pending" | "processing" | "completed" | "failed";

/** Current lifecycle status of an async job */
export type JobStatus =
  | "queued"
  | "processing"
  | "completed"
  | "failed"
  | "canceled";

/** Type of async job */
export type JobType = "analysis";

/** Level of risk determined during analysis */
export type RiskLevel = "low" | "medium" | "high" | "critical";

/** Allowed decisions when reviewing a fraud report */
export type ReviewDecision =
  | "pending"
  | "approved"
  | "rejected"
  | "manual_review";

/** Extracted key value segments from document */
export interface StructuredDocumentData {
  borrowerName: string | null;
  documentDate: string | null;
  declaredIncome: number | null;
  [key: string]: unknown;
}

/** User entity representing an auditor or analyst */
export interface UserEntity {
  email: string;
  password: string;
  organization: string;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
}

/** Document record database model */
export interface DocumentEntity {
  _id?: Types.ObjectId | string;
  user: Types.ObjectId | string;
  fileName: string;
  filePath: string;
  fileSize: number;
  fileType: string;
  ocrText?: string;
  ocrConfidence?: number;
  structuredData?: StructuredDocumentData;
  status: DocumentStatus;
  statusMessage?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/** Individual fraud indicator flagged during analysis */
export interface FraudAnomaly {
  type: string;
  severity: RiskLevel;
  description: string;
  affectedField: string;
  confidence: number;
  suggestedAction: string;
}

/** Assessment of risk score, level, and flagged anomalies */
export interface RiskAssessment {
  riskScore: number;
  riskLevel: RiskLevel;
  summary: string;
  recommendations: string[];
}

/** Central Fraud Report entity */
export interface FraudReportEntity {
  document: Types.ObjectId | string;
  analyst: Types.ObjectId | string;
  riskScore: number;
  riskLevel: RiskLevel;
  anomalies: FraudAnomaly[];
  summary: string;
  recommendations: string[];
  decision?: ReviewDecision;
  reviewNotes?: string;
  reviewedBy?: Types.ObjectId | string;
  reviewedAt?: Date;
  createdAt?: Date;
}

/** MongoDB historical record for context cross-checks */
export interface HistoricalRecordEntity {
  key: string;
  value: Record<string, unknown> | string | number | boolean | null;
  source?: string;
  createdAt?: Date;
}

/** Safe user details returned in API payloads */
export interface SanitizedUser {
  id: unknown;
  email: string;
  organization: string;
  role: UserRole;
}

/** Summarized document info returned in paginated lists */
export interface DocumentSummary {
  id: unknown;
  fileName: string;
  fileType: string;
  fileSize: number;
  status: DocumentStatus;
  createdAt?: Date;
  updatedAt?: Date;
  ocrConfidence: number | null;
}

/** Summarized report details returned in lists */
export interface ReportSummary {
  id: unknown;
  riskScore: number;
  riskLevel: RiskLevel;
  anomalyCount: number;
  decision: ReviewDecision;
  createdAt?: Date;
}

/** Struct representing current memory state of document */
export interface AnalysisMemory {
  documentId: string;
  fileName: string;
  status: DocumentStatus;
  preview: string;
}

/** Match found in historical records database */
export interface HistoricalMatch {
  key: string;
  source: string;
  score: number;
}

/** Result struct returned by the OCR worker */
export interface OCRResult {
  text: string;
  confidence: number;
  warning: string | null;
  words: string[];
  structuredData: StructuredDocumentData;
}

/** In-memory trackable job record */
export interface JobRecord {
  id: string;
  type: JobType;
  status: JobStatus;
  documentId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
  failedAt?: string;
  canceledAt?: string;
  retriedAt?: string;
  retryCount?: number;
  error?: {
    message: string;
  };
  result?: unknown;
}

/** Helper interface for parsing requests pagination query */
export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

/** Standard paginated result metadata payload */
export interface PaginationResult {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Allowed query filtering params */
export interface ListFilters {
  status?: string;
  search?: string;
  email?: string;
  key?: string;
  source?: string;
  riskLevel?: string;
  decision?: string;
  minRiskScore?: number;
  maxRiskScore?: number;
}

export type UserDocument = HydratedDocument<UserEntity>;
export type DocumentDocument = HydratedDocument<DocumentEntity>;
export type FraudReportDocument = HydratedDocument<FraudReportEntity>;
export type HistoricalRecordDocument = HydratedDocument<HistoricalRecordEntity>;
