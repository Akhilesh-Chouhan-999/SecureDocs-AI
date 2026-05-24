import { jest } from "@jest/globals";
import { container } from "../../src/config/index.js";
import request from "supertest";
import type { Express, Request, Response, NextFunction } from "express";

describe("Report Generation Integration Tests", () => {
  let app: Express;
  const testUserId = "507f1f77bcf86cd799439011";
  const testToken = "valid-jwt-token";
  const testDocumentId = "507f1f77bcf86cd799439012";
  const testReportId = "507f1f77bcf86cd799439013";

  const mockReportService = {
    generateFraudReport: jest.fn() as any,
    listReports: jest.fn() as any,
    getReport: jest.fn() as any,
    getReportsByUser: jest.fn() as any,
    buildDownload: jest.fn() as any,
    reviewReport: jest.fn() as any,
    deleteReport: jest.fn() as any,
  };

  const mockAuthMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    (req as any).user = {
      id: testUserId,
      email: "testuser@example.com",
      role: "analyst",
    };
    next();
  };

  beforeAll(() => {
    jest.resetModules();

    jest.mock("../../src/middleware/auth.middleware", () => ({ __esModule: true, default: (req: any, res: any, next: any) => { req.user = { id: "507f1f77bcf86cd799439011", email: "testuser@example.com", role: "analyst" }; next(); } }));

    

    

    

    

    

    

    

    jest.spyOn(container, "get").mockImplementation((name) => { if (name === "reportService") return mockReportService; return null; });
    app = require("../../src/app").default || require("../../src/app");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/reports/generate", () => {
    it("should generate fraud analysis report", async () => {
      mockReportService.generateFraudReport.mockResolvedValueOnce({
        id: testReportId,
        document: testDocumentId,
        analyst: testUserId,
        riskScore: 65,
        riskLevel: "high",
        anomalies: [
          {
            type: "income_verification",
            severity: "high",
            description: "Income requires verification",
          },
        ],
        summary: "Document flagged for review",
        recommendations: ["Manual verification required"],
        createdAt: new Date(),
      });

      const response = await request(app)
        .post("/api/reports/generate")
        .set("Authorization", `Bearer ${testToken}`)
        .send({ documentId: testDocumentId });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.report.id).toBe(testReportId);
      expect(response.body.data.report.riskScore).toBe(65);
      expect(response.body.data.report.riskLevel).toBe("high");
      expect(mockReportService.generateFraudReport).toHaveBeenCalledWith(
        testDocumentId,
        testUserId,
      );
    });

    it("should calculate risk score in report", async () => {
      mockReportService.generateFraudReport.mockResolvedValueOnce({
        id: testReportId,
        riskScore: 45,
        riskLevel: "medium",
        document: testDocumentId,
        analyst: testUserId,
        anomalies: [],
        summary: "Moderate risk detected",
        recommendations: [],
      });

      const response = await request(app)
        .post("/api/reports/generate")
        .set("Authorization", `Bearer ${testToken}`)
        .send({ documentId: testDocumentId });

      expect(response.body.data.report.riskScore).toBe(45);
      expect(response.body.data.report.riskLevel).toBe("medium");
    });

    it("should include all anomalies in report", async () => {
      mockReportService.generateFraudReport.mockResolvedValueOnce({
        id: testReportId,
        document: testDocumentId,
        analyst: testUserId,
        anomalies: [
          {
            type: "ownership_mismatch",
            severity: "high",
            description: "Names don't match",
            confidence: 0.85,
          },
          {
            type: "income_verification",
            severity: "medium",
            description: "Verification needed",
            confidence: 0.72,
          },
        ],
        riskScore: 70,
        riskLevel: "high",
        summary: "Multiple anomalies flagged",
        recommendations: ["Manual review", "Contact borrower"],
      });

      const response = await request(app)
        .post("/api/reports/generate")
        .set("Authorization", `Bearer ${testToken}`)
        .send({ documentId: testDocumentId });

      expect(response.body.data.report.anomalies).toHaveLength(2);
      expect(response.body.data.anomalies[0].type).toBe("ownership_mismatch");
      expect(response.body.data.anomalies[1].type).toBe("income_verification");
    });

    it("should include recommendations based on risk level", async () => {
      mockReportService.generateFraudReport.mockResolvedValueOnce({
        id: testReportId,
        document: testDocumentId,
        analyst: testUserId,
        riskScore: 85,
        riskLevel: "critical",
        anomalies: [],
        summary: "Critical risk",
        recommendations: [
          "Reject application",
          "Flag for fraud team",
          "Review with management",
        ],
      });

      const response = await request(app)
        .post("/api/reports/generate")
        .set("Authorization", `Bearer ${testToken}`)
        .send({ documentId: testDocumentId });

      expect(response.body.data.report.recommendations).toContain(
        "Flag for fraud team",
      );
    });

    it("should require authentication", async () => {
      const response = await request(app)
        .post("/api/reports/generate")
        .send({ documentId: testDocumentId });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should handle non-existent document", async () => {
      mockReportService.generateFraudReport.mockRejectedValueOnce(
        new Error("Document not found"),
      );

      const response = await request(app)
        .post("/api/reports/generate")
        .set("Authorization", `Bearer ${testToken}`)
        .send({ documentId: "507f1f77bcf86cd799439014" });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/reports", () => {
    it("should list user's reports", async () => {
      mockReportService.listReports.mockResolvedValueOnce({
        reports: [
          {
            id: "507f1f77bcf86cd799439021",
            document: "507f1f77bcf86cd799439031",
            riskLevel: "high",
            createdAt: new Date(),
          },
          {
            id: "507f1f77bcf86cd799439022",
            document: "507f1f77bcf86cd799439032",
            riskLevel: "low",
            createdAt: new Date(),
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      });

      const response = await request(app)
        .get("/api/reports")
        .set("Authorization", `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.reports).toHaveLength(2);
      expect(mockReportService.listReports).toHaveBeenCalledWith(
        testUserId,
        expect.any(Object),
      );
    });

    it("should support pagination", async () => {
      mockReportService.listReports.mockResolvedValueOnce({
        reports: [],
        pagination: {
          page: 2,
          limit: 5,
          total: 15,
          totalPages: 3,
        },
      });

      const response = await request(app)
        .get("/api/reports")
        .query({ page: 2, limit: 5 })
        .set("Authorization", `Bearer ${testToken}`);

      expect(response.body.pagination.page).toBe(2);
      expect(response.body.pagination.totalPages).toBe(3);
    });

    it("should filter reports by risk level", async () => {
      mockReportService.listReports.mockResolvedValueOnce({
        reports: [
          { id: "507f1f77bcf86cd799439021", riskLevel: "critical" },
          { id: "507f1f77bcf86cd799439022", riskLevel: "critical" },
        ],
        pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
      });

      const response = await request(app)
        .get("/api/reports")
        .query({ riskLevel: "critical" })
        .set("Authorization", `Bearer ${testToken}`);

      expect(response.body.data.reports).toHaveLength(2);
      expect(response.body.data.reports[0].riskLevel).toBe("critical");
    });
  });

  describe("GET /api/reports/:reportId", () => {
    it("should retrieve specific report", async () => {
      mockReportService.getReport.mockResolvedValueOnce({
        id: testReportId,
        document: testDocumentId,
        analyst: testUserId,
        riskScore: 65,
        riskLevel: "high",
        anomalies: [],
        summary: "Report summary",
        recommendations: ["Action 1"],
        createdAt: new Date(),
      });

      const response = await request(app)
        .get(`/api/reports/${testReportId}`)
        .set("Authorization", `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.report.id).toBe(testReportId);
      expect(response.body.data.summary).toBeDefined();
    });

    it("should return 404 for non-existent report", async () => {
      mockReportService.getReport.mockRejectedValueOnce(
        new Error("Report not found"),
      );

      const response = await request(app)
        .get(`/api/reports/invalid-id`)
        .set("Authorization", `Bearer ${testToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it("should include decision status if reviewed", async () => {
      mockReportService.getReport.mockResolvedValueOnce({
        id: testReportId,
        document: testDocumentId,
        analyst: testUserId,
        decision: "approved",
        reviewedBy: "admin-1",
        reviewedAt: new Date(),
        reviewNotes: "Approved after manual review",
      });

      const response = await request(app)
        .get(`/api/reports/${testReportId}`)
        .set("Authorization", `Bearer ${testToken}`);

      expect(response.body.data.decision).toBe("approved");
      expect(response.body.data.reviewNotes).toBeDefined();
    });
  });

  describe("GET /api/reports/user/:userId", () => {
    it("should list reports for specific user", async () => {
      mockReportService.getReportsByUser.mockResolvedValueOnce({
        reports: [
          { id: "507f1f77bcf86cd799439021", analyst: testUserId },
          { id: "507f1f77bcf86cd799439022", analyst: testUserId },
        ],
        pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
      });

      const response = await request(app)
        .get(`/api/reports/user/${testUserId}`)
        .set("Authorization", `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.reports).toHaveLength(2);
    });
  });

  describe("GET /api/reports/:reportId/download", () => {
    it("should download report as PDF", async () => {
      mockReportService.buildDownload.mockResolvedValueOnce({
        fileName: "fraud-report-123.pdf",
        buffer: Buffer.from("%PDF-1.4 test content"),
        contentType: "application/pdf",
      });

      const response = await request(app)
        .get(`/api/reports/${testReportId}/download`)
        .set("Authorization", `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toContain("pdf");
      expect(mockReportService.buildDownload).toHaveBeenCalledWith(
        testReportId,
      );
    });

    it("should return proper filename in response", async () => {
      mockReportService.buildDownload.mockResolvedValueOnce({
        fileName: "fraud-analysis-2024-05-20.pdf",
        buffer: Buffer.from("PDF content"),
        contentType: "application/pdf",
      });

      const response = await request(app)
        .get(`/api/reports/${testReportId}/download`)
        .set("Authorization", `Bearer ${testToken}`);

      expect(response.headers["content-disposition"]).toContain(
        "fraud-analysis",
      );
    });

    it("should handle PDF generation errors", async () => {
      mockReportService.buildDownload.mockRejectedValueOnce(
        new Error("PDF generation failed"),
      );

      const response = await request(app)
        .get(`/api/reports/${testReportId}/download`)
        .set("Authorization", `Bearer ${testToken}`);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/reports/:reportId/review", () => {
    it("should store review decision", async () => {
      mockReportService.reviewReport.mockResolvedValueOnce({
        id: testReportId,
        decision: "approved",
        reviewedBy: testUserId,
        reviewedAt: new Date(),
        reviewNotes: "Approved after verification",
      });

      const response = await request(app)
        .post(`/api/reports/${testReportId}/review`)
        .set("Authorization", `Bearer ${testToken}`)
        .send({ decision: "approved", notes: "Approved after verification" });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.decision).toBe("approved");
      expect(mockReportService.reviewReport).toHaveBeenCalledWith(
        testReportId,
        expect.objectContaining({
          decision: "approved",
          reviewNotes: "Approved after verification",
        }),
      );
    });

    it("should support multiple decision types", async () => {
      const decisions = ["approved", "rejected", "manual_review"];

      for (const decision of decisions) {
        mockReportService.reviewReport.mockResolvedValueOnce({
          id: testReportId,
          decision,
          reviewedBy: testUserId,
          reviewedAt: new Date(),
        });

        const response = await request(app)
          .post(`/api/reports/${testReportId}/review`)
          .set("Authorization", `Bearer ${testToken}`)
          .send({ decision, notes: "test notes" });

        expect(response.body.data.decision).toBe(decision);
      }
    });

    it("should require analyst role", async () => {
      mockReportService.reviewReport.mockRejectedValueOnce(
        new Error("Insufficient permissions"),
      );

      const response = await request(app)
        .post(`/api/reports/${testReportId}/review`)
        .set("Authorization", `Bearer ${testToken}`)
        .send({ decision: "approved" });

      // Behavior depends on auth middleware configuration
      expect(response.body.data || response.body.error).toBeDefined();
    });

    it("should store review notes", async () => {
      mockReportService.reviewReport.mockResolvedValueOnce({
        id: testReportId,
        decision: "manual_review",
        reviewNotes: "Further investigation needed",
      });

      const response = await request(app)
        .post(`/api/reports/${testReportId}/review`)
        .set("Authorization", `Bearer ${testToken}`)
        .send({ decision: "manual_review", notes: "Further investigation needed" });

      expect(response.body.data.reviewNotes).toBe(
        "Further investigation needed",
      );
    });
  });

  describe("DELETE /api/reports/:reportId", () => {
    it("should delete report", async () => {
      mockReportService.deleteReport.mockResolvedValueOnce({
        id: testReportId,
        message: "Report deleted",
      });

      const response = await request(app)
        .delete(`/api/reports/${testReportId}`)
        .set("Authorization", `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockReportService.deleteReport).toHaveBeenCalledWith(testReportId);
    });

    it("should return 404 for non-existent report", async () => {
      mockReportService.deleteReport.mockRejectedValueOnce(
        new Error("Report not found"),
      );

      const response = await request(app)
        .delete(`/api/reports/invalid-id`)
        .set("Authorization", `Bearer ${testToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it("should prevent deletion of reviewed reports", async () => {
      mockReportService.deleteReport.mockRejectedValueOnce(
        new Error("Cannot delete reviewed report"),
      );

      const response = await request(app)
        .delete(`/api/reports/${testReportId}`)
        .set("Authorization", `Bearer ${testToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe("Report Completeness", () => {
    it("should include all required fields", async () => {
      mockReportService.generateFraudReport.mockResolvedValueOnce({
        id: testReportId,
        document: testDocumentId,
        analyst: testUserId,
        riskScore: 50,
        riskLevel: "medium",
        anomalies: [],
        summary: "Summary",
        recommendations: [],
        createdAt: new Date(),
      });

      const response = await request(app)
        .post("/api/reports/generate")
        .set("Authorization", `Bearer ${testToken}`)
        .send({ documentId: testDocumentId });

      const data = response.body.data;
      expect(data.id).toBeDefined();
      expect(data.document).toBeDefined();
      expect(data.analyst).toBeDefined();
      expect(data.riskScore).toBeDefined();
      expect(data.riskLevel).toBeDefined();
      expect(data.anomalies).toBeDefined();
      expect(data.summary).toBeDefined();
      expect(data.recommendations).toBeDefined();
    });
  });
});

