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

  static async detectAnomaly(req: any, res: any, next: any) {
    try {
      const anomalies = await container.get("analysisService").detectAnomaly(req.body.documentId, req.user._id);
      return success(res, { anomalies });
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
}
