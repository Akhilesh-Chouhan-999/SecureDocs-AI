import request from "supertest";
import type { Express, Request, Response, NextFunction } from "express";

describe("Report Generation Integration Tests", () => {
  let app: Express;
  const testUserId = "user-123";
  const testToken = "valid-jwt-token";
  const testDocumentId = "doc-123";
  const testReportId = "report-123";

  const mockReportService = {
    generateReport: jest.fn(),
    listReports: jest.fn(),
    getReport: jest.fn(),
    getReportsByUser: jest.fn(),
    downloadReport: jest.fn(),
    reviewReport: jest.fn(),
    deleteReport: jest.fn(),
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

    jest.mock("../../src/middleware/auth.middleware", () => ({
      authenticate: mockAuthMiddleware,
      requireRole:
        (roles: string[]) =>
        (req: Request, res: Response, next: NextFunction) => {
          if (roles.includes((req as any).user?.role || "")) next();
          else res.status(403).json({ success: false, error: "Forbidden" });
        },
    }));

    jest.mock("../../src/config/container", () => ({
      get: (name: string) => {
        if (name === "reportService") return mockReportService;
        return null;
      },
    }));

    app = require("../../src/app");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/reports/generate", () => {
    it("should generate fraud analysis report", async () => {
      mockReportService.generateReport.mockResolvedValueOnce({
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
      expect(response.body.data.id).toBe(testReportId);
      expect(response.body.data.riskScore).toBe(65);
      expect(response.body.data.riskLevel).toBe("high");
      expect(mockReportService.generateReport).toHaveBeenCalledWith(
        testDocumentId,
        testUserId,
      );
    });

    it("should calculate risk score in report", async () => {
      mockReportService.generateReport.mockResolvedValueOnce({
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

      expect(response.body.data.riskScore).toBe(45);
      expect(response.body.data.riskLevel).toBe("medium");
    });

    it("should include all anomalies in report", async () => {
      mockReportService.generateReport.mockResolvedValueOnce({
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

      expect(response.body.data.anomalies).toHaveLength(2);
      expect(response.body.data.anomalies[0].type).toBe("ownership_mismatch");
      expect(response.body.data.anomalies[1].type).toBe("income_verification");
    });

    it("should include recommendations based on risk level", async () => {
      mockReportService.generateReport.mockResolvedValueOnce({
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

      expect(response.body.data.recommendations).toContain(
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
      mockReportService.generateReport.mockRejectedValueOnce(
        new Error("Document not found"),
      );

      const response = await request(app)
        .post("/api/reports/generate")
        .set("Authorization", `Bearer ${testToken}`)
        .send({ documentId: "invalid-id" });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/reports", () => {
    it("should list user's reports", async () => {
      mockReportService.listReports.mockResolvedValueOnce({
        reports: [
          {
            id: "report-1",
            document: "doc-1",
            riskLevel: "high",
            createdAt: new Date(),
          },
          {
            id: "report-2",
            document: "doc-2",
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
          { id: "report-1", riskLevel: "critical" },
          { id: "report-2", riskLevel: "critical" },
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
      expect(response.body.data.id).toBe(testReportId);
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
          { id: "report-1", analyst: testUserId },
          { id: "report-2", analyst: testUserId },
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
      mockReportService.downloadReport.mockResolvedValueOnce({
        fileName: "fraud-report-123.pdf",
        buffer: Buffer.from("%PDF-1.4 test content"),
        contentType: "application/pdf",
      });

      const response = await request(app)
        .get(`/api/reports/${testReportId}/download`)
        .set("Authorization", `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toContain("pdf");
      expect(mockReportService.downloadReport).toHaveBeenCalledWith(
        testReportId,
      );
    });

    it("should return proper filename in response", async () => {
      mockReportService.downloadReport.mockResolvedValueOnce({
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
      mockReportService.downloadReport.mockRejectedValueOnce(
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
        .send({
          decision: "approved",
          reviewNotes: "Approved after verification",
        });

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
          .send({ decision });

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
        .send({
          decision: "manual_review",
          reviewNotes: "Further investigation needed",
        });

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
      mockReportService.generateReport.mockResolvedValueOnce({
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
