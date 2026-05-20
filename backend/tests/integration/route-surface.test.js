const request = require("supertest");

const mockGet = jest.fn();

jest.mock("../../src/middleware/auth.middleware", () => (req, res, next) => {
  req.user = {
    _id: "user-1",
    email: "user@example.com",
    role: req.headers["x-test-role"] || "analyst",
  };
  next();
});

jest.mock("../../src/config", () => ({
  env: {
    frontendUrl: "http://localhost:3000",
  },
  container: {
    get: mockGet,
  },
}));

const app = require("../../src/app");

describe("route surface", () => {
  const services = {
    documentService: {
      listForUser: jest.fn().mockResolvedValue({
        documents: [],
        pagination: { page: 2, limit: 5, total: 0, totalPages: 1 },
        filters: { status: "completed", search: "mortgage" },
      }),
    },
    historyService: {
      searchHistory: jest.fn().mockResolvedValue({
        records: [{ id: "history-1", key: "user@example.com", source: "seed" }],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
        filters: { search: "user" },
      }),
    },
    reportService: {
      reviewReport: jest.fn().mockResolvedValue({
        _id: "a".repeat(24),
        decision: "approved",
      }),
      buildDownload: jest.fn().mockResolvedValue({
        fileName: "fraud-report.pdf",
        buffer: Buffer.from("%PDF-1.4 test"),
      }),
    },
    jobService: {
      retryJob: jest.fn().mockResolvedValue({
        id: "job-1",
        status: "queued",
      }),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockImplementation((name) => services[name]);
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
    const response = await request(app)
      .get(`/api/reports/${"a".repeat(24)}/download`);

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
    const response = await request(app)
      .post("/api/jobs/job-1/retry");

    expect(response.status).toBe(200);
    expect(response.body.job.status).toBe("queued");
    expect(services.jobService.retryJob).toHaveBeenCalledWith("job-1", "user-1");
  });
});
