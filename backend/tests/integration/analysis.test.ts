import { jest } from "@jest/globals";
import request from "supertest";
import mongoose from "mongoose";
import { setupDB, teardownDB, clearDB } from "../support/db-setup.js";
import { signAccessToken } from "../../src/utils/tokens.js";
import User from "../../src/models/User.js";
import Document from "../../src/models/Document.js";
import { AnalysisService } from "../../src/services/analysis.service.js";

let app: any;

describe("Analysis Workflow Integration Tests", () => {
  let authToken: string;
  let testUser: any;
  let testDocument: any;

  beforeAll(async () => {
    await setupDB();
    const appModule = await import("../../src/app.js");
    app = appModule.default || appModule;
  });

  afterAll(async () => {
    await teardownDB();
  });

  beforeEach(async () => {
    await clearDB();

    // Create a real user
    testUser = await User.create({
      email: "analysis-tester@example.com",
      password: "Password123!",
      firstName: "Analysis",
      lastName: "Tester",
      role: "analyst",
      organization: "TestOrg",
    });
    authToken = signAccessToken(testUser);

    // Create a real document
    testDocument = await Document.create({
      user: testUser._id,
      fileName: "test-doc.pdf",
      filePath: "/fake/path/test-doc.pdf",
      fileSize: 1024,
      fileType: "application/pdf",
      status: "pending",
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("POST /api/analysis/ocr", () => {
    it("should extract OCR text from document", async () => {
      const ocrSpy = jest
        .spyOn(AnalysisService.prototype, "performOCRAnalysis")
        .mockResolvedValueOnce({
          text: "Mocked OCR text",
          confidence: 0.95,
          warning: null,
          words: [],
          structuredData: {},
        });

      const response = await request(app)
        .post("/api/analysis/ocr")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ documentId: testDocument._id.toString() });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.ocr.text).toBe("Mocked OCR text");
      expect(response.body.ocr.confidence).toBe(0.95);

      expect(ocrSpy).toHaveBeenCalledWith("/fake/path/test-doc.pdf");

      // Verify DB was updated
      const updatedDoc = await Document.findById(testDocument._id);
      expect(updatedDoc?.ocrText).toBe("Mocked OCR text");
    });
  });

  describe("POST /api/analysis/analyze", () => {
    it("should perform full analysis", async () => {
      jest
        .spyOn(AnalysisService.prototype, "performOCRAnalysis")
        .mockResolvedValueOnce({
          text: "Mocked OCR text for analysis",
          confidence: 0.98,
          warning: null,
          words: [],
          structuredData: {},
        });

      jest
        .spyOn(AnalysisService.prototype, "runWorkflow")
        .mockResolvedValueOnce({
          structuredData: { name: "John Doe" },
          anomalies: [{ type: "fraud", severity: "high", confidence: 0.9 }],
          riskScore: 85,
          riskLevel: "high",
          memory: {},
          historicalContext: [],
        } as any);

      const response = await request(app)
        .post("/api/analysis/analyze")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ documentId: testDocument._id.toString() });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.ocr.text).toBe("Mocked OCR text for analysis");
      expect(response.body.anomalies.length).toBe(1);

      // Verify DB was updated
      const updatedDoc = await Document.findById(testDocument._id);
      expect(updatedDoc?.status).toBe("completed");
    });
  });

  describe("POST /api/analysis/anomalies", () => {
    it("should detect anomalies for a document", async () => {
      // Set existing OCR text to avoid OCR trigger
      testDocument.ocrText = "Pre-existing text";
      await testDocument.save();

      jest
        .spyOn(AnalysisService.prototype, "runWorkflow")
        .mockResolvedValueOnce({
          structuredData: {},
          anomalies: [
            { type: "date_mismatch", severity: "medium", confidence: 0.8 },
          ],
          riskScore: 50,
          riskLevel: "medium",
          memory: {},
          historicalContext: [],
        } as any);

      const response = await request(app)
        .post("/api/analysis/anomalies")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ documentId: testDocument._id.toString() });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.anomalies[0].type).toBe("date_mismatch");
    });
  });

  describe("GET /api/analysis/status/:documentId", () => {
    it("should get analysis status of document", async () => {
      testDocument.status = "processing";
      testDocument.statusMessage = "Extracting text";
      await testDocument.save();

      const response = await request(app)
        .get(`/api/analysis/status/${testDocument._id}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.status).toBe("processing");
      expect(response.body.statusMessage).toBe("Extracting text");
    });
  });
});
