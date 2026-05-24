import fs from "fs";
import path from "path";
import env from "../../config/env.js";
import { SUPPORTED_DOCUMENT_MIME_TYPES } from "../../types/index.js";

/**
 * Resolve absolute directory path where uploads are saved
 */
export const resolveUploadDirectory = () =>
  path.resolve(process.cwd(), env.uploadDir);

/**
 * Ensure target upload directory exists, creating recursively if not present
 */
export const ensureUploadDirectory = () => {
  const uploadDirectory = resolveUploadDirectory();

  if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, { recursive: true });
  }

  return uploadDirectory;
};

/**
 * Retrieve storage upload configurations
 */
export const getStorageConfiguration = () => ({
  uploadDirectory: ensureUploadDirectory(),
  maxFileSize: env.maxFileSize,
  allowedMimeTypes: Array.from(SUPPORTED_DOCUMENT_MIME_TYPES),
});

export const storage = {
  ensureUploadDirectory,
  resolveUploadDirectory,
  getStorageConfiguration,
};
