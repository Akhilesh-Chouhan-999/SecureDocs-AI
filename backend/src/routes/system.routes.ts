import { Router } from "express";
import mongoose from "mongoose";
import { APP_NAME } from "../constants";
import { withMeta } from "../decorators";
import { folderUsage, getApiOverview, routeCatalog } from "../docs";
import { SERVICE_TOKENS } from "../interfaces";

const router = Router();

router.get("/info", (req, res) => {
  res.json(
    withMeta({
      success: true,
      name: APP_NAME,
      ...getApiOverview(),
      databaseState: mongoose.connection.readyState,
      dependencyTokens: SERVICE_TOKENS,
    }),
  );
});

router.get("/routes", (req, res) => {
  res.json(
    withMeta({
      success: true,
      total: routeCatalog.length,
      routes: routeCatalog,
    }),
  );
});

router.get("/modules", (req, res) => {
  res.json(
    withMeta({
      success: true,
      modules: folderUsage,
    }),
  );
});

export default router;
