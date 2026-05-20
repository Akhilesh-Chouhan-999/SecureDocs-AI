/**
 * Centralized Type Hub & Runtime Constants
 * @module types
 */

export const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;

export const SUPPORTED_DOCUMENT_MIME_TYPES = Object.freeze([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/tiff",
  "image/webp",
] as const);

export const ROUTE_GROUPS = Object.freeze([
  "auth",
  "documents",
  "analysis",
  "history",
  "reports",
  "jobs",
  "system",
] as const);

export * from "./domain";
export * from "./http";
export * from "./container";
