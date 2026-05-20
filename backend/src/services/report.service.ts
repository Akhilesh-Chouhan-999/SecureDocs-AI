import { ForbiddenError, NotFoundError } from "../errors/index.js";
import { REVIEW_DECISIONS } from "../constants/index.js";
import { buildRiskAssessment } from "../domain/usecases/index.js";
import { toReportSummary } from "../domain/entities/index.js";
import { parsePagination, buildPagination } from "../utils/pagination.js";
import { buildReportPdf } from "../utils/reportPdf.js";

/**
 * Service managing fraud detection reports (lifecycle generation, search, review/audit decision, PDF render download)
 */
export class ReportService {
  private documentService: any;
  private reportRepository: any;

  constructor(documentService: any, reportRepository: any) {
    this.documentService = documentService;
    this.reportRepository = reportRepository;
  }

  /**
   * Run heuristics on a verified uploaded document and write the generated fraud report
   * @param documentId Target Document ObjectId string
   * @param userId Creator Analyst User ObjectId string
   * @param anomalies Flagged anomalies list context
   */
  async generateFraudReport(documentId: any, userId: any, anomalies: any[] = []) {
    const document = await this.documentService.getOwnedDocument(documentId, userId);
    const assessment = buildRiskAssessment(anomalies);

    return this.reportRepository.create({
      document: document._id,
      analyst: userId,
      riskScore: assessment.riskScore,
      riskLevel: assessment.riskLevel,
      anomalies,
      summary: assessment.summary,
      recommendations: assessment.recommendations,
    });
  }

  /**
   * Look up report by ID populating internal entity associations
   * @param reportId Report ObjectId string
   */
  async getReport(reportId: any) {
    const report = await this.reportRepository.findDetailedById(reportId);

    if (!report) {
      throw new NotFoundError("Report");
    }

    return report;
  }

  /**
   * Search, filter, and list fraud reports
   * @param userId Creator Analyst User ObjectId string (null for all)
   * @param query Request query filters mapping
   */
  async listReports(userId: any, query: Record<string, any> = {}) {
    const { page, limit, skip } = parsePagination(query);
    const filters = {
      riskLevel: query.riskLevel,
      decision: query.decision,
      search: query.search,
      minRiskScore: query.minRiskScore !== undefined ? Number(query.minRiskScore) : undefined,
      maxRiskScore: query.maxRiskScore !== undefined ? Number(query.maxRiskScore) : undefined,
    };

    const [reports, total] = await Promise.all([
      this.reportRepository.searchByAnalyst(userId, filters, { page, limit, skip }),
      this.reportRepository.countByAnalyst(userId, filters),
    ]);

    return {
      reports: reports.map(toReportSummary),
      pagination: buildPagination({ page, limit, total }),
      filters,
    };
  }

  /**
   * Delete fraud report checking ownership constraints
   * @param reportId Report ObjectId string
   * @param userId Creator Analyst User ObjectId string
   */
  async deleteReport(reportId: any, userId: any) {
    const report = await this.reportRepository.findOne({ _id: reportId, analyst: userId });

    if (!report) {
      throw new NotFoundError("Report");
    }

    await this.reportRepository.deleteById(report._id);
    return report;
  }

  /**
   * Sign off on a fraud report, setting review decision notes
   * Restricts operation to admin and manager roles
   * @param reportId Report ObjectId string
   * @param reviewer Reviewer User document context
   * @param payload Decision and comments fields
   */
  async reviewReport(reportId: any, reviewer: any, payload: Record<string, any> = {}) {
    if (!["admin", "manager"].includes(reviewer.role)) {
      throw new ForbiddenError("Only admin or manager users can review reports");
    }

    if (!REVIEW_DECISIONS.includes(payload.decision)) {
      throw new ForbiddenError("Unsupported review decision");
    }

    const report = await this.getReport(reportId);
    report.decision = payload.decision;
    report.reviewNotes = payload.notes || "";
    report.reviewedBy = reviewer._id;
    report.reviewedAt = new Date();
    await report.save();
    return report;
  }

  /**
   * Build basic PDF file content layout representing fraud report
   * @param reportId Report ObjectId string
   */
  async buildDownload(reportId: any) {
    const report = await this.getReport(reportId);

    return {
      fileName: `fraud-report-${report._id}.pdf`,
      buffer: buildReportPdf(report),
    };
  }
}
