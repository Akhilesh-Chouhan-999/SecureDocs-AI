import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { env } from "./config/index.js";
import { authRoutes, documentRoutes, analysisRoutes, historyRoutes, reportRoutes, jobRoutes, systemRoutes } from "./routes/index.js";
import { errorMiddleware } from "./middleware/index.js";
import { getApiOverview, routeCatalog } from "./docs/index.js";

const app = express();

app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "SecureDocs AI backend is running.",
    api: "/api",
    routes: routeCatalog.length,
  });
});

app.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: "securedoc-ai-backend",
  });
});

app.get("/ready", (req, res) => {
  const isReady = mongoose.connection.readyState === 1;

  res.status(isReady ? 200 : 503).json({
    success: isReady,
    status: isReady ? "ready" : "degraded",
    databaseState: mongoose.connection.readyState,
  });
});

app.get("/api", (req, res) => {
  res.json({
    success: true,
    ...getApiOverview(),
  });
});

app.use("/api/system", systemRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/analysis", analysisRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/jobs", jobRoutes);

app.use(errorMiddleware);

export default app;
