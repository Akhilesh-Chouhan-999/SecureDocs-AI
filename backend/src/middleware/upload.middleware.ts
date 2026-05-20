import multer from "multer";
import path from "path";
import env from "../config/env";
import { ValidationError } from "../errors";
import { getStorageConfiguration } from "../infrastructure/storage";

const { uploadDirectory, allowedMimeTypes } = getStorageConfiguration();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDirectory);
  },
  filename: function (req, file, cb) {
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
export const upload = multer({
  storage,
  limits: { fileSize: env.maxFileSize },
  fileFilter: (req, file, cb) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(
        new ValidationError("Unsupported file type", {
          allowedMimeTypes,
          received: file.mimetype,
        }) as any,
      );
    }

    return cb(null, true);
  },
});

export default upload;
