import type { Response, NextFunction } from "express";
import { container } from "../config";
import { success } from "../utils/apiResponse";

/**
 * Controller exposing document scanning and heuristics evaluation endpoints
 */
export class AnalysisController {
  /**
   * Run full OCR and fraud workflow heuristics synchronously on a document
   * @param req Express request containing documentId in body
   * @param res Express response
   * @param next Next middleware function
   */
  public static async analyzeDocument(req: any, res: Response, next: NextFunction): Promise<any> {
    try {
      const analysis = await container
        .get("analysisService")
        .analyzeDocument(req.body.documentId, req.user._id);

      return success(res, {
        message: "Analysis completed",
        analysis,
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Execute heuristics anomaly detection scan on a analyzed document
   * @param req Express request containing documentId in body
   * @param res Express response
   * @param next Next middleware function
   */
  public static async detectAnomaly(req: any, res: Response, next: NextFunction): Promise<any> {
    try {
      const anomalies = await container
        .get("analysisService")
        .detectAnomaly(req.body.documentId, req.user._id);

      return success(res, { anomalies });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Run OCR text extraction pass synchronously on document file path
   * @param req Express request containing documentId in body
   * @param res Express response
   * @param next Next middleware function
   */
  public static async extractOcr(req: any, res: Response, next: NextFunction): Promise<any> {
    try {
      const result = await container
        .get("analysisService")
        .extractOcr(req.body.documentId, req.user._id);

      return success(res, {
        message: "OCR extraction completed",
        ...result,
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Get current analysis queue/execution processing status of a document
   * @param req Express request containing documentId path param
   * @param res Express response
   * @param next Next middleware function
   */
  public static async getStatus(req: any, res: Response, next: NextFunction): Promise<any> {
    try {
      const status = await container
        .get("analysisService")
        .getStatus(req.params.documentId, req.user._id);
      return success(res, { status });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Fetch extracted text results of a document
   * @param req Express request containing documentId path param
   * @param res Express response
   * @param next Next middleware function
   */
  public static async getResults(req: any, res: Response, next: NextFunction): Promise<any> {
    try {
      const results = await container
        .get("analysisService")
        .getResults(req.params.documentId, req.user._id);
      return success(res, { results });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Query final computed risk score and severity level of a document
   * @param req Express request containing documentId in body
   * @param res Express response
   * @param next Next middleware function
   */
  public static async calculateRiskScore(req: any, res: Response, next: NextFunction): Promise<any> {
    try {
      const risk = await container
        .get("analysisService")
        .calculateRiskScore(req.body.documentId, req.user._id);

      return success(res, {
        message: "Risk score calculated",
        risk,
      });
    } catch (error) {
      return next(error);
    }
  }
}

export default AnalysisController;
