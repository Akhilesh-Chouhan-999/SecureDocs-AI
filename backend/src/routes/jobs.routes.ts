import { Router } from "express";
import { JobController } from "../controllers.js";
import { authMiddleware, validate } from "../middleware.js";
import { jobValidators } from "../validators.js";

const router = Router();

router.get("/", authMiddleware, validate(jobValidators.listJobs, "query"), JobController.listJobs);
router.post("/analysis", authMiddleware, validate(jobValidators.createAnalysisJob), JobController.createAnalysisJob);
router.get("/:jobId/status", authMiddleware, validate(jobValidators.jobId, "params"), JobController.getJobStatus);
router.post("/:jobId/cancel", authMiddleware, validate(jobValidators.jobId, "params"), JobController.cancelJob);
router.post("/:jobId/retry", authMiddleware, validate(jobValidators.jobId, "params"), JobController.retryJob);

export default router;
