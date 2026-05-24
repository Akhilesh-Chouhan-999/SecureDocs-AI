import { Router } from "express";
import { DocumentController } from "../controllers/index.js";
import {
  authMiddleware,
  uploadMiddleware,
  validate,
} from "../middleware/index.js";
import { documentValidators } from "../validators/index.js";

const router = Router();

router.post(
  "/upload",
  authMiddleware,
  uploadMiddleware.single("document"),
  DocumentController.uploadDocument,
);
router.get(
  "/",
  authMiddleware,
  validate(documentValidators.list, "query"),
  DocumentController.getDocuments,
);
router.get(
  "/:id",
  authMiddleware,
  validate(documentValidators.documentId, "params"),
  DocumentController.getDocument,
);
router.delete(
  "/:id",
  authMiddleware,
  validate(documentValidators.documentId, "params"),
  DocumentController.deleteDocument,
);

export default router;
