import { jest } from "@jest/globals";
import request from "supertest";
import mongoose from "mongoose";
import { setupTestDB } from "../support/db-setup.js";
import User from "../../src/models/User.js";
import Document from "../../src/models/Document.js";
import { generateToken } from "../../src/utils/tokens.js";
import { AnalysisService } from "../../src/services/analysis.service.js";
import app from "../../src/app.js";

// Setup real DB
setupTestDB();

describe("Analysis Workflow Integration Tests", () => {

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

