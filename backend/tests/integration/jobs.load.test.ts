import { jest } from "@jest/globals";
import request from "supertest";
import { setupDB, teardownDB, clearDB } from "../support/db-setup.js";
import { signAccessToken } from "../../src/utils/tokens.js";
import User from "../../src/models/User.js";
import Document from "../../src/models/Document.js";
import { AnalysisService } from "../../src/services/analysis.service.js";

let app: any;

describe("Jobs Load Testing Workflow", () => {
  let authToken: string;
  let testUser: any;
  let documentIds: string[] = [];

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

    testUser = await User.create({
      email: "load-tester@example.com",
      password: "Password123!",
      firstName: "Load",
      lastName: "Tester",
      role: "admin",
      organization: "LoadTestOrg",
    });
    authToken = signAccessToken(testUser);

    // Create some initial documents to run jobs against
    documentIds = [];
    const docsToCreate = 100;

    const docs = [];
    for (let i = 0; i < docsToCreate; i++) {
      docs.push({
        user: testUser._id,
        fileName: `load-doc-${i}.pdf`,
        filePath: `/fake/path/load-doc-${i}.pdf`,
        fileSize: 1024,
        fileType: "application/pdf",
        status: "pending",
      });
    }

    const insertedDocs = await Document.insertMany(docs);
    documentIds = insertedDocs.map((d) => d._id.toString());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should handle pushing multiple analysis jobs concurrently", async () => {
    // Mock the external service calls so they resolve quickly
    jest
      .spyOn(AnalysisService.prototype, "performOCRAnalysis")
      .mockResolvedValue({
        text: "Mocked OCR text",
        confidence: 0.99,
        warning: null,
        words: [],
        structuredData: {},
      });

    const promises = [];

    // Simulate pushing concurrent analysis jobs
    for (const docId of documentIds) {
      promises.push(
        request(app)
          .post("/api/analysis/ocr")
          .set("Authorization", `Bearer ${authToken}`)
          .send({ documentId: docId }),
      );
    }

    const responses = await Promise.all(promises);

    // Verify all requests succeeded
    const successful = responses.filter(
      (r) => r.status === 200 && r.body.success === true,
    );
    if (successful.length !== documentIds.length) {
      const failed = responses.find(
        (r) => r.status !== 200 || r.body.success !== true,
      );
      console.log("Failed response:", failed?.status, failed?.body);
    }
    expect(successful.length).toBe(documentIds.length);
  }, 30000);
});
