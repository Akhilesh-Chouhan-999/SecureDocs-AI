import { Router } from "express";
import { DocumentController } from "../controllers";
import { authMiddleware, uploadMiddleware, validate } from "../middleware";
import { documentValidators } from "../validators";

const router = Router();

router.post(
  "/upload",
  authMiddleware,
  uploadMiddleware.single("document"),
  DocumentController.upload,
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
