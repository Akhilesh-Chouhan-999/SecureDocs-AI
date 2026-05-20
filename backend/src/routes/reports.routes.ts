import { Router } from "express";
import { ReportController } from "../controllers/index.js";
import { authMiddleware, validate } from "../middleware/index.js";
import { reportValidators } from "../validators/index.js";

const router = Router();

router.post("/generate", authMiddleware, validate(reportValidators.generate), ReportController.generateReport);
router.get("/", authMiddleware, validate(reportValidators.list, "query"), ReportController.getUserReports);
router.get("/user/:userId", authMiddleware, validate(reportValidators.userId, "params"), validate(reportValidators.list, "query"), ReportController.getUserReports);
router.get("/:reportId/download", authMiddleware, validate(reportValidators.reportId, "params"), ReportController.downloadReport);
router.get("/:reportId", authMiddleware, validate(reportValidators.reportId, "params"), ReportController.getReport);
router.delete("/:reportId", authMiddleware, validate(reportValidators.reportId, "params"), ReportController.deleteReport);
router.post("/:reportId/review", authMiddleware, validate(reportValidators.reportId, "params"), validate(reportValidators.review), ReportController.reviewReport);

export default router;
