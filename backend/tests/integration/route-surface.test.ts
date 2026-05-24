import request from "supertest";
import { jest } from "@jest/globals";

const mockGet = jest.fn();

await jest.unstable_mockModule(
  "../../src/middleware/auth.middleware.js",
  () => ({
    default: (req: any, res: any, next: any) => {
      req.user = {
        _id: "user-1",
        email: "user@example.com",
        role: req.headers["x-test-role"] || "analyst",
      };
      next();
    },
  }),
);

await jest.unstable_mockModule("../../src/config/index.js", () => ({
  env: {
    frontendUrl: "http://localhost:3000",
  },
  container: {
    get: mockGet,
  },
}));

let app: any;

describe("route surface", () => {
  const services: any = {
    documentService: {
      listForUser: jest.fn<any>().mockResolvedValue({
        documents: [],
        pagination: { page: 2, limit: 5, total: 0, totalPages: 1 },
        filters: { status: "completed", search: "mortgage" },
      }),
    },
    historyService: {
      searchHistory: jest.fn<any>().mockResolvedValue({
        records: [{ id: "history-1", key: "user@example.com", source: "seed" }],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
        filters: { search: "user" },
      }),
    },
    reportService: {
      reviewReport: jest.fn<any>().mockResolvedValue({
        _id: "a".repeat(24),
        decision: "approved",
      }),
      buildDownload: jest.fn<any>().mockResolvedValue({
        fileName: "fraud-report.pdf",
        buffer: Buffer.from("%PDF-1.4 test"),
      }),
    },
    jobService: {
      retryJob: jest.fn<any>().mockResolvedValue({
        id: "job-1",
        status: "queued",
      }),
    },
  };

  beforeAll(async () => {
    app =
      ((await import("../../src/app.js")).default as any) ||
      (await import("../../src/app.js"));
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockImplementation((name: any) => services[name]);
  });

  it("supports document list filters and pagination", async () => {
    const response = await request(app)
      .get("/api/documents")
      .query({ status: "completed", search: "mortgage", page: 2, limit: 5 });

    expect(response.status).toBe(200);
    expect(response.body.pagination.page).toBe(2);
    expect(services.documentService.listForUser).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({
        status: "completed",
        search: "mortgage",
        page: 2,
        limit: 5,
      }),
    );
  });

  it("supports admin history search", async () => {
    const response = await request(app)
      .get("/api/history")
      .set("x-test-role", "admin")
      .query({ search: "user" });

    expect(response.status).toBe(200);
    expect(response.body.records).toHaveLength(1);
    expect(services.historyService.searchHistory).toHaveBeenCalledWith(
      expect.objectContaining({ search: "user" }),
      expect.objectContaining({ role: "admin" }),
    );
  });

  it("downloads reports as pdf", async () => {
    const response = await request(app).get(
      `/api/reports/${"a".repeat(24)}/download`,
    );

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toContain("application/pdf");
    expect(services.reportService.buildDownload).toHaveBeenCalled();
  });

  it("supports report review decisions", async () => {
    const response = await request(app)
      .post(`/api/reports/${"a".repeat(24)}/review`)
      .set("x-test-role", "admin")
      .send({ decision: "approved", notes: "Looks good" });

    expect(response.status).toBe(200);
    expect(response.body.report.decision).toBe("approved");
    expect(services.reportService.reviewReport).toHaveBeenCalledWith(
      "a".repeat(24),
      expect.objectContaining({ role: "admin" }),
      expect.objectContaining({ decision: "approved", notes: "Looks good" }),
    );
  });

  it("supports retrying jobs", async () => {
    const response = await request(app).post("/api/jobs/job-1/retry");

    expect(response.status).toBe(200);
    expect(response.body.job.status).toBe("queued");
    expect(services.jobService.retryJob).toHaveBeenCalledWith(
      "job-1",
      "user-1",
    );
  });
});
