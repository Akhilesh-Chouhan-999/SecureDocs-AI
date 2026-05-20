import { ForbiddenError, NotFoundError } from "../errors";
import { REVIEW_DECISIONS } from "../constants";
import { buildRiskAssessment } from "../domain/usecases";
import { toReportSummary } from "../domain/entities";
import { parsePagination, buildPagination } from "../utils/pagination";
import { buildReportPdf } from "../utils/reportPdf";
import type { DocumentService } from "./document.service";
import type { FraudReportRepository } from "../repositories/fraud-report.repository";
import type { FraudReportDocument, FraudAnomaly } from "../types/domain";

/**
 * Service managing fraud detection reports (lifecycle generation, search, review/audit decision, PDF render download)
 */
export class ReportService {
  private documentService: DocumentService;
  private reportRepository: FraudReportRepository;

  constructor(documentService: DocumentService, reportRepository: FraudReportRepository) {
    this.documentService = documentService;
    this.reportRepository = reportRepository;
  }

  /**
   * Run heuristics on a verified uploaded document and write the generated fraud report
   * @param documentId Target Document ObjectId string
   * @param userId Creator Analyst User ObjectId string
   * @param anomalies Flagged anomalies list context
   */
  public async generateFraudReport(
    documentId: string,
    userId: string,
    anomalies: FraudAnomaly[] = [],
  ): Promise<FraudReportDocument> {
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
  public async getReport(reportId: string): Promise<FraudReportDocument> {
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
  public async listReports(userId: string | null, query: Record<string, unknown> = {}): Promise<any> {
    const { page, limit, skip } = parsePagination(query);
    const filters = {
      riskLevel: query.riskLevel as string | undefined,
      decision: query.decision as string | undefined,
      search: query.search as string | undefined,
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
  public async deleteReport(reportId: string, userId: string): Promise<FraudReportDocument> {
    const report = await this.reportRepository.findOne({
      _id: reportId,
      analyst: userId,
    });

    if (!report) {
      throw new NotFoundError("Report");
    }

    await this.reportRepository.deleteById(report._id as string);
    return report;
  }

  /**
   * Sign off on a fraud report, setting review decision notes
   * Restricts operation to admin and manager roles
   * @param reportId Report ObjectId string
   * @param reviewer Reviewer User document context
   * @param payload Decision and comments fields
   */
  public async reviewReport(reportId: string, reviewer: any, payload: Record<string, unknown> = {}): Promise<FraudReportDocument> {
    if (!["admin", "manager"].includes(reviewer.role)) {
      throw new ForbiddenError("Only admin or manager users can review reports");
    }

    if (!REVIEW_DECISIONS.includes(payload.decision as any)) {
      throw new ForbiddenError("Unsupported review decision");
    }

    const report = await this.getReport(reportId);
    report.decision = payload.decision as any;
    report.reviewNotes = (payload.notes as string) || "";
    report.reviewedBy = reviewer._id;
    report.reviewedAt = new Date();
    await report.save();
    return report;
  }

  /**
   * Build basic PDF file content layout representing fraud report
   * @param reportId Report ObjectId string
   */
  public async buildDownload(reportId: string): Promise<{ fileName: string; buffer: Buffer }> {
    const report = await this.getReport(reportId);

    return {
      fileName: `fraud-report-${report._id}.pdf`,
      buffer: buildReportPdf(report),
    };
  }
}

export default ReportService;
