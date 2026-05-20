import { Router } from "express";
import { HistoryController } from "../controllers/index.js";
import { authMiddleware, validate } from "../middleware/index.js";
import { historyValidators } from "../validators/index.js";

const router = Router();

router.get("/", authMiddleware, validate(historyValidators.search, "query"), HistoryController.searchHistory);
router.get("/:email", authMiddleware, validate(historyValidators.email, "params"), HistoryController.getHistory);

export default router;
