import { Router } from "express";
import { AnalysisController } from "../controllers";
import { authMiddleware, validate } from "../middleware";
import { analysisValidators } from "../validators";

const router = Router();

router.post(
  "/analyze",
  authMiddleware,
  validate(analysisValidators.analyze),
  AnalysisController.analyzeDocument,
);
router.post(
  "/ocr",
  authMiddleware,
  validate(analysisValidators.analyze),
  AnalysisController.extractOcr,
);
router.post(
  "/anomalies",
  authMiddleware,
  validate(analysisValidators.analyze),
  AnalysisController.detectAnomaly,
);
router.post(
  "/risk-score",
  authMiddleware,
  validate(analysisValidators.riskScore),
  AnalysisController.calculateRiskScore,
);
router.get(
  "/status/:documentId",
  authMiddleware,
  validate(analysisValidators.documentId, "params"),
  AnalysisController.getStatus,
);
router.get(
  "/results/:documentId",
  authMiddleware,
  validate(analysisValidators.documentId, "params"),
  AnalysisController.getResults,
);

export default router;
