import analysisQueue from "./analysisQueue.js";
import notificationQueue from "./notificationQueue.js";
import FraudDetectionAgent from "../ai/agents/fraudDetectionAgent.js";
import ReportGenerationAgent from "../ai/agents/reportGenerationAgent.js";
import FraudReport from "../models/FraudReport.js";
import User from "../models/User.js";
import { emitJobUpdate } from "../sockets/index.js";
import { NotificationService } from "../services/notification.service.js";
import { logger } from "../logs/index.js";

const notificationService = new NotificationService();

analysisQueue.process(async (job: any) => {
  try {
    logger.info(`Processing job ${job.id}`);
    emitJobUpdate({ jobId: job.id, status: "processing", progress: 0 });

    const { documentId, userId, documentData } = job.data;

    // Step 1: Run fraud detection
    job.progress(25);
    emitJobUpdate({
      jobId: job.id,
      status: "processing",
      progress: 25,
      stage: "Fraud Detection",
    });
    const fraudAnalysis =
      await FraudDetectionAgent.analyzeDocument(documentData);

    // Step 2: Generate report
    job.progress(50);
    emitJobUpdate({
      jobId: job.id,
      status: "processing",
      progress: 50,
      stage: "Report Generation",
    });
    const reportData = await ReportGenerationAgent.generateReport(
      fraudAnalysis,
      documentData,
    );

    // Step 3: Save to database
    job.progress(75);
    emitJobUpdate({
      jobId: job.id,
      status: "processing",
      progress: 75,
      stage: "Saving Results",
    });
    const report = await FraudReport.create({
      document: documentId, // Note: Schema uses 'document' not 'documentId'
      analyst: userId, // Note: Schema uses 'analyst' not 'userId'
      riskScore: fraudAnalysis.riskScore,
      riskLevel: fraudAnalysis.riskLevel,
      anomalies: fraudAnalysis.anomalies,
      summary: reportData.reportText,
      status: "completed",
    });

    job.progress(100);
    emitJobUpdate({ jobId: job.id, status: "completed", progress: 100 });

    // Dispatch Email Notification asynchronously
    notificationQueue.add({
      type: "analysis_complete",
      documentId,
      userId,
      riskLevel: fraudAnalysis.riskLevel,
      riskScore: fraudAnalysis.riskScore,
    });

    return report;
  } catch (error: any) {
    logger.error(`Job ${job.id} failed:`, error);
    emitJobUpdate({ jobId: job.id, status: "failed", error: error.message });
    throw error;
  }
});

analysisQueue.on("completed", (job: any) => {
  logger.info(`Job ${job.id} completed successfully`);
});

analysisQueue.on("failed", (job: any, err: any) => {
  logger.error(`Job ${job.id} failed:`, err.message);
});

// Setup Notification Queue Worker
notificationQueue.process(async (job: any) => {
  try {
    const { type, documentId, userId, riskLevel, riskScore } = job.data;

    // In a real scenario, fetch the user to get their email:
    const user = await User.findById(userId);
    if (!user || !user.email) {
      logger.warn(
        `Could not send notification: User ${userId} not found or has no email.`,
      );
      return;
    }

    if (type === "analysis_complete") {
      await notificationService.sendAnalysisCompleteEmail(
        user.email,
        documentId,
        riskLevel,
      );

      if (riskLevel === "critical") {
        await notificationService.sendCriticalFraudAlert(
          user.email,
          documentId,
          riskScore,
        );
      }
    }

    return { success: true };
  } catch (error: any) {
    logger.error(`Notification Job ${job.id} failed:`, error);
    throw error;
  }
});
