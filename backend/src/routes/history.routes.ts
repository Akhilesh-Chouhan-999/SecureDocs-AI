import { Router } from "express";
import { HistoryController } from "../controllers.js";
import { authMiddleware, validate } from "../middleware.js";
import { historyValidators } from "../validators.js";

const router = Router();

router.get("/", authMiddleware, validate(historyValidators.search, "query"), HistoryController.searchHistory);
router.get("/:email", authMiddleware, validate(historyValidators.email, "params"), HistoryController.getHistory);

export default router;
