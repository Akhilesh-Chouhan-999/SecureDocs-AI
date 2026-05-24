import { container } from "../config/index.js";
import { success } from "../utils/apiResponse.js";

/**
 * Controller exposing document analysis, OCR, anomaly detection, risk scoring endpoints
 */
export class AnalysisController {
  
  static async analyzeDocument(req: any, res: any, next: any) {
    try {
      const result = await container.get("analysisService").analyzeDocument(req.body.documentId, req.user._id);
      return success(res, result);
    } catch (error) { return next(error); }
  }

  static async extractOcr(req: any, res: any, next: any) {
    try {
      const result = await container.get("analysisService").extractOcr(req.body.documentId, req.user._id);
      return success(res, result);
    } catch (error) { return next(error); }
  }

  static async batchExtractOcr(req: any, res: any, next: any) {
    try {
      const { documentIds } = req.body;
      const analysisService = container.get("analysisService");
      
      const results = await Promise.all(
        documentIds.map((documentId: string) => 
          analysisService.extractOcr(documentId, req.user._id)
            .catch((error: Error) => ({ documentId, error: error.message }))
        )
      );

      return success(res, { results });
    } catch (error) { return next(error); }
  }

  static async detectAnomaly(req: any, res: any, next: any) {
    try {
      const result = await container.get("analysisService").detectAnomaly(req.body.documentId, req.user._id);
      return success(res, result);
    } catch (error) { return next(error); }
  }

  static async calculateRiskScore(req: any, res: any, next: any) {
    try {
      const result = await container.get("analysisService").calculateRiskScore(req.body.documentId, req.user._id);
      return success(res, result);
    } catch (error) { return next(error); }
  }

  static async getStatus(req: any, res: any, next: any) {
    try {
      const result = await container.get("analysisService").getStatus(req.params.documentId, req.user._id);
      return success(res, result);
    } catch (error) { return next(error); }
  }

  static async getResults(req: any, res: any, next: any) {
    try {
      const result = await container.get("analysisService").getResults(req.params.documentId, req.user._id);
      return success(res, result);
    } catch (error) { return next(error); }
  }

  static async startAnalysis(req: any, res: any, next: any) {
    try {
      const { documentId } = req.body;
      const userId = req.user._id;

      // Instead of direct DB query we can use the document service
      const document = await container.get("documentService").getOwnedDocument(documentId, userId);

      const { analysisQueue } = await import("../jobs/analysisQueue.js");
      
      const job = await analysisQueue.add(
        {
          documentId,
          userId,
          documentData: document.toObject(),
        },
        { attempts: 3, backoff: { type: "exponential", delay: 2000 } }
      );

      return success(res, {
        jobId: job.id,
        status: "queued",
        estimatedTime: "30 seconds",
      });
    } catch (error) {
      return next(error);
    }
  }

  static async getAnalysisStatus(req: any, res: any, next: any) {
    try {
      const { jobId } = req.params;
      const { analysisQueue } = await import("../jobs/analysisQueue.js");

      const job = await analysisQueue.getJob(jobId);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }

      const state = await job.getState();
      const progress = job.progress();

      return success(res, {
        jobId,
        status: state,
        progress,
        data: job.data,
      });
    } catch (error) {
      return next(error);
    }
  }
}
