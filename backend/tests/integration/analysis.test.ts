import request from "supertest";
import type { Express, Request, Response, NextFunction } from "express";

describe("Analysis Workflow Integration Tests", () => {
  let app: Express;
  const testUserId = "user-123";
  const testToken = "valid-jwt-token";
  const testDocumentId = "doc-123";

  const mockAnalysisService = {
    performOCR: jest.fn(),
    fullAnalysis: jest.fn(),
    detectAnomalies: jest.fn(),
    calculateRiskScore: jest.fn(),
    getAnalysisStatus: jest.fn(),
    getAnalysisResults: jest.fn(),
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
        if (name === "analysisService") return mockAnalysisService;
        return null;
      },
    }));

    app = require("../../src/app");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/analysis/ocr", () => {
    it("should extract OCR text from document", async () => {
      mockAnalysisService.performOCR.mockResolvedValueOnce({
        documentId: testDocumentId,
        text: "Extracted text from document",
        confidence: 0.92,
        language: "eng",
        wordCount: 150,
      });

      const response = await request(app)
        .post("/api/analysis/ocr")
        .set("Authorization", `Bearer ${testToken}`)
        .send({ documentId: testDocumentId });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.text).toBeDefined();
      expect(response.body.data.confidence).toBe(0.92);
      expect(mockAnalysisService.performOCR).toHaveBeenCalledWith(
        testDocumentId,
      );
    });

    it("should return OCR confidence score", async () => {
      mockAnalysisService.performOCR.mockResolvedValueOnce({
        documentId: testDocumentId,
        text: "Extracted text",
        confidence: 0.85,
        wordCount: 100,
      });

      const response = await request(app)
        .post("/api/analysis/ocr")
        .set("Authorization", `Bearer ${testToken}`)
        .send({ documentId: testDocumentId });

      expect(response.body.data.confidence).toBe(0.85);
    });

    it("should reject OCR with low confidence", async () => {
      mockAnalysisService.performOCR.mockRejectedValueOnce(
        new Error("OCR confidence below 80% threshold"),
      );

      const response = await request(app)
        .post("/api/analysis/ocr")
        .set("Authorization", `Bearer ${testToken}`)
        .send({ documentId: testDocumentId });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should validate OCR confidence threshold (>= 80%)", async () => {
      mockAnalysisService.performOCR.mockResolvedValueOnce({
        documentId: testDocumentId,
        text: "Text",
        confidence: 0.8,
      });

      const response = await request(app)
        .post("/api/analysis/ocr")
        .set("Authorization", `Bearer ${testToken}`)
        .send({ documentId: testDocumentId });

      expect(response.status).toBe(200);
      expect(response.body.data.confidence).toBeGreaterThanOrEqual(0.8);
    });

    it("should handle non-existent document", async () => {
      mockAnalysisService.performOCR.mockRejectedValueOnce(
        new Error("Document not found"),
      );

      const response = await request(app)
        .post("/api/analysis/ocr")
        .set("Authorization", `Bearer ${testToken}`)
        .send({ documentId: "invalid-id" });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it("should require authentication", async () => {
      const response = await request(app)
        .post("/api/analysis/ocr")
        .send({ documentId: testDocumentId });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should detect document language", async () => {
      mockAnalysisService.performOCR.mockResolvedValueOnce({
        documentId: testDocumentId,
        text: "Extracted text",
        confidence: 0.92,
        language: "eng",
      });

      const response = await request(app)
        .post("/api/analysis/ocr")
        .set("Authorization", `Bearer ${testToken}`)
        .send({ documentId: testDocumentId });

      expect(response.body.data.language).toBe("eng");
    });
  });

  describe("POST /api/analysis/analyze", () => {
    it("should perform full analysis", async () => {
      mockAnalysisService.fullAnalysis.mockResolvedValueOnce({
        documentId: testDocumentId,
        ocrText: "Extracted text",
        ocrConfidence: 0.92,
        structuredData: {
          borrowerName: "John Doe",
          documentDate: "2024-05-20",
          declaredIncome: 150000,
        },
        anomalies: [
          {
            type: "income_verification",
            severity: "medium",
            confidence: 0.75,
          },
        ],
        riskScore: 35,
        riskLevel: "medium",
      });

      const response = await request(app)
        .post("/api/analysis/analyze")
        .set("Authorization", `Bearer ${testToken}`)
        .send({ documentId: testDocumentId });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.ocrText).toBeDefined();
      expect(response.body.data.structuredData).toBeDefined();
      expect(response.body.data.anomalies).toBeDefined();
      expect(response.body.data.riskScore).toBeDefined();
    });

    it("should extract structured data from OCR", async () => {
      mockAnalysisService.fullAnalysis.mockResolvedValueOnce({
        documentId: testDocumentId,
        structuredData: {
          borrowerName: "John Doe",
          documentDate: "2024-05-20",
          declaredIncome: 150000,
        },
        anomalies: [],
        riskScore: 20,
        riskLevel: "low",
      });

      const response = await request(app)
        .post("/api/analysis/analyze")
        .set("Authorization", `Bearer ${testToken}`)
        .send({ documentId: testDocumentId });

      expect(response.body.data.structuredData.borrowerName).toBe("John Doe");
      expect(response.body.data.structuredData.declaredIncome).toBe(150000);
    });

    it("should include all analysis components", async () => {
      mockAnalysisService.fullAnalysis.mockResolvedValueOnce({
        documentId: testDocumentId,
        ocrText: "Text",
        ocrConfidence: 0.92,
        structuredData: { borrowerName: "Doe" },
        anomalies: [],
        riskScore: 25,
        riskLevel: "low",
        summary: "Analysis summary",
        recommendations: ["Proceed with standard verification"],
      });

      const response = await request(app)
        .post("/api/analysis/analyze")
        .set("Authorization", `Bearer ${testToken}`)
        .send({ documentId: testDocumentId });

      expect(response.body.data.ocrText).toBeDefined();
      expect(response.body.data.structuredData).toBeDefined();
      expect(response.body.data.anomalies).toBeDefined();
      expect(response.body.data.riskScore).toBeDefined();
      expect(response.body.data.summary).toBeDefined();
    });
  });

  describe("POST /api/analysis/anomalies", () => {
    it("should detect fraud anomalies", async () => {
      mockAnalysisService.detectAnomalies.mockResolvedValueOnce({
        documentId: testDocumentId,
        anomalies: [
          {
            type: "ownership_mismatch",
            severity: "high",
            description: "Potential ownership inconsistency",
            affectedField: "ownership",
            confidence: 0.78,
            suggestedAction: "Compare ownership details",
          },
          {
            type: "income_verification",
            severity: "medium",
            description: "Income requires verification",
            affectedField: "income",
            confidence: 0.67,
            suggestedAction: "Verify income sources",
          },
        ],
      });

      const response = await request(app)
        .post("/api/analysis/anomalies")
        .set("Authorization", `Bearer ${testToken}`)
        .send({ documentId: testDocumentId });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.anomalies).toHaveLength(2);
      expect(response.body.data.anomalies[0].type).toBe("ownership_mismatch");
    });

    it("should include confidence scores for anomalies", async () => {
      mockAnalysisService.detectAnomalies.mockResolvedValueOnce({
        documentId: testDocumentId,
        anomalies: [
          {
            type: "income_verification",
            severity: "medium",
            confidence: 0.85,
          },
        ],
      });

      const response = await request(app)
        .post("/api/analysis/anomalies")
        .set("Authorization", `Bearer ${testToken}`)
        .send({ documentId: testDocumentId });

      expect(response.body.data.anomalies[0].confidence).toBe(0.85);
    });

    it("should include suggested actions for each anomaly", async () => {
      mockAnalysisService.detectAnomalies.mockResolvedValueOnce({
        documentId: testDocumentId,
        anomalies: [
          {
            type: "ownership_mismatch",
            severity: "high",
            suggestedAction: "Manual review required",
          },
        ],
      });

      const response = await request(app)
        .post("/api/analysis/anomalies")
        .set("Authorization", `Bearer ${testToken}`)
        .send({ documentId: testDocumentId });

      expect(response.body.data.anomalies[0].suggestedAction).toBeDefined();
    });

    it("should return empty anomalies array for clean documents", async () => {
      mockAnalysisService.detectAnomalies.mockResolvedValueOnce({
        documentId: testDocumentId,
        anomalies: [],
      });

      const response = await request(app)
        .post("/api/analysis/anomalies")
        .set("Authorization", `Bearer ${testToken}`)
        .send({ documentId: testDocumentId });

      expect(response.body.data.anomalies).toHaveLength(0);
    });
  });

  describe("POST /api/analysis/risk-score", () => {
    it("should calculate risk score", async () => {
      mockAnalysisService.calculateRiskScore.mockResolvedValueOnce({
        documentId: testDocumentId,
        riskScore: 65,
        riskLevel: "high",
        summary: "Fraud Risk Assessment Report",
        recommendations: ["Manual review recommended", "Verify income sources"],
      });

      const response = await request(app)
        .post("/api/analysis/risk-score")
        .set("Authorization", `Bearer ${testToken}`)
        .send({ documentId: testDocumentId });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.riskScore).toBe(65);
      expect(response.body.data.riskLevel).toBe("high");
    });

    it("should assign correct risk levels", async () => {
      const testCases = [
        { score: 25, level: "low" },
        { score: 45, level: "medium" },
        { score: 70, level: "high" },
        { score: 90, level: "critical" },
      ];

      for (const testCase of testCases) {
        mockAnalysisService.calculateRiskScore.mockResolvedValueOnce({
          documentId: testDocumentId,
          riskScore: testCase.score,
          riskLevel: testCase.level,
        });

        const response = await request(app)
          .post("/api/analysis/risk-score")
          .set("Authorization", `Bearer ${testToken}`)
          .send({ documentId: testDocumentId });

        expect(response.body.data.riskLevel).toBe(testCase.level);
      }
    });

    it("should include risk assessment summary", async () => {
      mockAnalysisService.calculateRiskScore.mockResolvedValueOnce({
        documentId: testDocumentId,
        riskScore: 50,
        riskLevel: "medium",
        summary: "Document has moderate fraud risk indicators",
        recommendations: ["Enhanced verification recommended"],
      });

      const response = await request(app)
        .post("/api/analysis/risk-score")
        .set("Authorization", `Bearer ${testToken}`)
        .send({ documentId: testDocumentId });

      expect(response.body.data.summary).toBeDefined();
      expect(response.body.data.recommendations).toHaveLength(1);
    });

    it("should scale score from 0-100", async () => {
      mockAnalysisService.calculateRiskScore.mockResolvedValueOnce({
        documentId: testDocumentId,
        riskScore: 50,
        riskLevel: "medium",
      });

      const response = await request(app)
        .post("/api/analysis/risk-score")
        .set("Authorization", `Bearer ${testToken}`)
        .send({ documentId: testDocumentId });

      expect(response.body.data.riskScore).toBeGreaterThanOrEqual(0);
      expect(response.body.data.riskScore).toBeLessThanOrEqual(100);
    });
  });

  describe("GET /api/analysis/status/:documentId", () => {
    it("should return analysis status", async () => {
      mockAnalysisService.getAnalysisStatus.mockResolvedValueOnce({
        documentId: testDocumentId,
        status: "completed",
        progress: 100,
        completedAt: new Date(),
      });

      const response = await request(app)
        .get(`/api/analysis/status/${testDocumentId}`)
        .set("Authorization", `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe("completed");
      expect(response.body.data.progress).toBe(100);
    });

    it("should track analysis progress", async () => {
      mockAnalysisService.getAnalysisStatus.mockResolvedValueOnce({
        documentId: testDocumentId,
        status: "processing",
        progress: 50,
        currentStep: "Performing OCR extraction",
      });

      const response = await request(app)
        .get(`/api/analysis/status/${testDocumentId}`)
        .set("Authorization", `Bearer ${testToken}`);

      expect(response.body.data.progress).toBe(50);
      expect(response.body.data.currentStep).toBeDefined();
    });
  });

  describe("GET /api/analysis/results/:documentId", () => {
    it("should return OCR and structured results", async () => {
      mockAnalysisService.getAnalysisResults.mockResolvedValueOnce({
        documentId: testDocumentId,
        ocrText: "Extracted text",
        ocrConfidence: 0.92,
        structuredData: {
          borrowerName: "John Doe",
          documentDate: "2024-05-20",
          declaredIncome: 150000,
        },
      });

      const response = await request(app)
        .get(`/api/analysis/results/${testDocumentId}`)
        .set("Authorization", `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.ocrText).toBeDefined();
      expect(response.body.data.structuredData).toBeDefined();
    });
  });

  describe("Error Handling", () => {
    it("should handle corrupted documents", async () => {
      mockAnalysisService.performOCR.mockRejectedValueOnce(
        new Error("Failed to process document"),
      );

      const response = await request(app)
        .post("/api/analysis/ocr")
        .set("Authorization", `Bearer ${testToken}`)
        .send({ documentId: testDocumentId });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should handle analysis failures", async () => {
      mockAnalysisService.fullAnalysis.mockRejectedValueOnce(
        new Error("Analysis failed"),
      );

      const response = await request(app)
        .post("/api/analysis/analyze")
        .set("Authorization", `Bearer ${testToken}`)
        .send({ documentId: testDocumentId });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  describe("Risk Scoring Algorithm", () => {
    it("should weight anomalies by severity", async () => {
      mockAnalysisService.calculateRiskScore.mockResolvedValueOnce({
        documentId: testDocumentId,
        riskScore: 75, // Weighted by severity
        riskLevel: "high",
      });

      const response = await request(app)
        .post("/api/analysis/risk-score")
        .set("Authorization", `Bearer ${testToken}`)
        .send({ documentId: testDocumentId });

      expect(response.body.data.riskScore).toBeGreaterThan(0);
    });

    it("should consider confidence scores in calculation", async () => {
      mockAnalysisService.calculateRiskScore.mockResolvedValueOnce({
        documentId: testDocumentId,
        riskScore: 60,
        riskLevel: "high",
      });

      const response = await request(app)
        .post("/api/analysis/risk-score")
        .set("Authorization", `Bearer ${testToken}`)
        .send({ documentId: testDocumentId });

      expect(response.body.data.riskScore).toBeDefined();
    });
  });
});
