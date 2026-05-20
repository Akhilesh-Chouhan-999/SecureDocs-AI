import multer from "multer";
import path from "path";
import env from "../config/env.js";
import { ValidationError } from "../errors/index.js";
import { getStorageConfiguration } from "../infrastructure/storage/index.js";

const { uploadDirectory, allowedMimeTypes } = getStorageConfiguration();

const diskStorage = multer.diskStorage({
  destination: function (_req: any, _file: any, cb: any) {
    cb(null, uploadDirectory);
  },
  filename: function (_req: any, file: any, cb: any) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`,
    );
  },
});

/**
 * Multer middleware instance configured for secure local document storage.
 * Restricts uploads by size limit and whitelisted MIME types.
 */
const uploadMiddleware = multer({
  storage: diskStorage,
  limits: { fileSize: env.maxFileSize },
  fileFilter: (_req: any, file: any, cb: any) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(
        new ValidationError("Unsupported file type", {
          allowedMimeTypes,
          received: file.mimetype,
        }),
      );
    }

    return cb(null, true);
  },
});

export default uploadMiddleware;
