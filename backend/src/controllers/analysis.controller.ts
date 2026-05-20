import { container } from "../config.js";
import { success } from "../utils/apiResponse.js";

/**
 * Controller exposing document analysis, OCR, anomaly detection, risk scoring endpoints
 */
class AnalysisController {
  static async analyzeDocument(req, res, next) {
    try {
      const result = await container.get("analysisService").analyzeDocument(req.body.documentId, req.user._id);
      return success(res, result);
    } catch (error) { return next(error); }
  }

  static async extractOcr(req, res, next) {
    try {
      const result = await container.get("analysisService").extractOcr(req.body.documentId, req.user._id);
      return success(res, result);
    } catch (error) { return next(error); }
  }

  static async detectAnomaly(req, res, next) {
    try {
      const anomalies = await container.get("analysisService").detectAnomaly(req.body.documentId, req.user._id);
      return success(res, { anomalies });
    } catch (error) { return next(error); }
  }

  static async calculateRiskScore(req, res, next) {
    try {
      const result = await container.get("analysisService").calculateRiskScore(req.body.documentId, req.user._id);
      return success(res, result);
    } catch (error) { return next(error); }
  }

  static async getStatus(req, res, next) {
    try {
      const result = await container.get("analysisService").getStatus(req.params.documentId, req.user._id);
      return success(res, result);
    } catch (error) { return next(error); }
  }

  static async getResults(req, res, next) {
    try {
      const result = await container.get("analysisService").getResults(req.params.documentId, req.user._id);
      return success(res, result);
    } catch (error) { return next(error); }
  }
}

export { AnalysisController  };
export const default = AnalysisController;
