import { Router } from "express";
import { HistoryController } from "../controllers";
import { authMiddleware, validate } from "../middleware";
import { historyValidators } from "../validators";

const router = Router();

router.get(
  "/",
  authMiddleware,
  validate(historyValidators.search, "query"),
  HistoryController.searchHistory,
);

router.get(
  "/:email",
  authMiddleware,
  validate(historyValidators.email, "params"),
  HistoryController.getHistory,
);

export default router;
