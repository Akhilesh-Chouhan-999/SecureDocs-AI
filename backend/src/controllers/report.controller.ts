import type { Response, NextFunction } from "express";
import { container } from "../config";
import { created, success } from "../utils/apiResponse";

/**
 * Controller exposing endpoints for creating, listing, checking detailed results, downloading PDFs, and signing off on reviews of fraud reports
 */
export class ReportController {
  /**
   * Instantiate a new fraud report from document anomalies
   * @param req Express request
   * @param res Express response
   * @param next Next middleware function
   */
  public static async generateReport(req: any, res: Response, next: NextFunction): Promise<any> {
    try {
      const { documentId, anomalies } = req.body;
      const report = await container
        .get("reportService")
        .generateFraudReport(documentId, req.user._id, anomalies || []);

      return created(res, {
        message: "Report generated successfully",
        report,
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Look up report by its ID
   * @param req Express request containing reportId path param
   * @param res Express response
   * @param next Next middleware function
   */
  public static async getReport(req: any, res: Response, next: NextFunction): Promise<any> {
    try {
      const report = await container
        .get("reportService")
        .getReport(req.params.reportId);

      return success(res, { report });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Fetch list of fraud reports filtered by analyst user
   * @param req Express request
   * @param res Express response
   * @param next Next middleware function
   */
  public static async getUserReports(req: any, res: Response, next: NextFunction): Promise<any> {
    try {
      const result = await container
        .get("reportService")
        .listReports(req.params.userId || req.user._id, req.query);

      return success(res, result);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Download a rendered PDF representation of the fraud report
   * @param req Express request containing reportId path param
   * @param res Express response
   * @param next Next middleware function
   */
  public static async downloadReport(req: any, res: Response, next: NextFunction): Promise<any> {
    try {
      const download = await container
        .get("reportService")
        .buildDownload(req.params.reportId);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${download.fileName}`,
      );
      return res.send(download.buffer);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Review and sign off (Approve/Reject) on a generated fraud report
   * @param req Express request
   * @param res Express response
   * @param next Next middleware function
   */
  public static async reviewReport(req: any, res: Response, next: NextFunction): Promise<any> {
    try {
      const report = await container
        .get("reportService")
        .reviewReport(req.params.reportId, req.user, req.body);

      return success(res, {
        message: "Report reviewed successfully",
        report,
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Delete an owned fraud report
   * @param req Express request
   * @param res Express response
   * @param next Next middleware function
   */
  public static async deleteReport(req: any, res: Response, next: NextFunction): Promise<any> {
    try {
      const report = await container
        .get("reportService")
        .deleteReport(req.params.reportId, req.user._id);

      return success(res, {
        message: "Report deleted successfully",
        reportId: report._id,
      });
    } catch (error) {
      return next(error);
    }
  }
}

export default ReportController;
