import { jest } from "@jest/globals";
import request from "supertest";
import path from "path";
import fs from "fs";
import { setupDB, teardownDB, clearDB } from "../support/db-setup.js";
import User from "../../src/models/User.js";
import Document from "../../src/models/Document.js";

// No mock needed

let app: any;

beforeAll(async () => {
  await setupDB();
  const module = await import("../../src/app.js");
  app = module.default || module;
}, 60000);

afterEach(async () => {
  await clearDB();
});

afterAll(async () => {
  await teardownDB();
});

describe("Document Processing Integration Pipeline", () => {
  const testUser = {
    email: "docuploader@example.com",
    password: "SecurePassword123!",
    firstName: "Doc",
    lastName: "Uploader",
    organization: "Docs Inc",
  };

  let authToken: string;

  beforeEach(async () => {
    // Register and login user to get token
    await request(app).post("/api/auth/register").send(testUser);
    const loginRes = await request(app).post("/api/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    });
    console.log("Login Res:", loginRes.body);
    authToken = loginRes.body.token;
  });

  it("should upload a document and save it to the database", async () => {
    // Create a dummy PDF file
    const dummyPdfPath = path.join(process.cwd(), "dummy.pdf");
    fs.writeFileSync(dummyPdfPath, "dummy pdf content");

    const response = await request(app)
      .post("/api/documents/upload")
      .set("Authorization", `Bearer ${authToken}`)
      .attach("document", dummyPdfPath);

    // Clean up dummy file
    if (fs.existsSync(dummyPdfPath)) {
      fs.unlinkSync(dummyPdfPath);
    }

    if (response.status !== 201) {
      console.error("Upload failed:", response.status, response.body);
    }

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.document).toBeDefined();

    const docId = response.body.document.id || response.body.document._id;

    // Verify it exists in DB
    const dbDoc = await Document.findById(docId);
    expect(dbDoc).not.toBeNull();
    expect(dbDoc?.fileName).toBe("dummy.pdf");
    expect(dbDoc?.status).toBe("pending");
  });

  it("should list uploaded documents for the user", async () => {
    // Create a dummy PDF file
    const dummyPdfPath = path.join(process.cwd(), "dummy.pdf");
    fs.writeFileSync(dummyPdfPath, "dummy pdf content");

    await request(app)
      .post("/api/documents/upload")
      .set("Authorization", `Bearer ${authToken}`)
      .attach("document", dummyPdfPath);

    if (fs.existsSync(dummyPdfPath)) {
      fs.unlinkSync(dummyPdfPath);
    }

    const response = await request(app)
      .get("/api/documents")
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.documents)).toBe(true);
    const docs = response.body.documents;
    expect(docs.length).toBeGreaterThanOrEqual(1);
    expect(docs[0].fileName).toBe("dummy.pdf");
  });
});
