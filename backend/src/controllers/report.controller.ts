import { container } from "../config/index.js";
import { created, success } from "../utils/apiResponse.js";

/**
 * Controller exposing endpoints for creating, listing, checking detailed results,
 * downloading PDFs, and signing off on reviews of fraud reports
 */
export class ReportController {

  static async generateReport(req: any, res: any, next: any) {
    try {
      const { documentId, anomalies } = req.body;
      const report = await container
        .get("reportService")
        .generateFraudReport(documentId, req.user._id, anomalies || []);
      return created(res, { message: "Report generated successfully", report });
    } catch (error) {
      return next(error);
    }
  }

  static async getReport(req: any, res: any, next: any) {
    try {
      const report = await container
        .get("reportService")
        .getReport(req.params.reportId);
      return success(res, { report });
    } catch (error) {
      return next(error);
    }
  }

  static async getUserReports(req: any, res: any, next: any) {
    try {
      const result = await container
        .get("reportService")
        .listReports(req.params.userId || req.user._id, req.query);
      return success(res, result);
    } catch (error) {
      return next(error);
    }
  }

  static async downloadReport(req: any, res: any, next: any) {
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

  static async downloadCsvReport(req: any, res: any, next: any) {
    try {
      const exportData = await container
        .get("reportService")
        .buildCsvExport(req.params.reportId);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${exportData.fileName}`,
      );
      return res.send(exportData.content);
    } catch (error) {
      return next(error);
    }
  }

  static async reviewReport(req: any, res: any, next: any) {
    try {
      const report = await container
        .get("reportService")
        .reviewReport(req.params.reportId, req.user, req.body);
      return success(res, { message: "Report reviewed successfully", report });
    } catch (error) {
      return next(error);
    }
  }

  static async deleteReport(req: any, res: any, next: any) {
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
