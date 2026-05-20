export const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;

export const SUPPORTED_DOCUMENT_MIME_TYPES = Object.freeze([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/tiff",
  "image/webp",
]);

export const ROUTE_GROUPS = Object.freeze([
  "auth",
  "documents",
  "analysis",
  "history",
  "reports",
  "jobs",
  "system",
]);
