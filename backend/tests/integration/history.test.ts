import { jest } from "@jest/globals";
import request from "supertest";
import type { Express } from "express";

const mockHistoryService = {
  getHistoryByEmail: jest.fn() as any,
  searchHistory: jest.fn() as any,
};

const services: Record<string, any> = {
  historyService: mockHistoryService,
};

const mockGet = jest.fn((name: string) => services[name] || null);

await jest.unstable_mockModule(
  "../../src/middleware/auth.middleware.js",
  () => ({
    __esModule: true,
    default: (req: any, res: any, next: any) => {
      if (!req.headers.authorization) {
        return res.status(401).json({ success: false });
      }
      req.user = {
        id: "user-123",
        email: "testuser@example.com",
        role: req.headers["x-test-role"] || "analyst",
      };
      next();
    },
  }),
);

await jest.unstable_mockModule("../../src/config/container.js", () => ({
  __esModule: true,
  default: { get: mockGet },
  container: { get: mockGet },
}));

describe("Historical Data & Context Integration Tests", () => {
  let app: Express;
  const testUserId = "user-123";
  const testToken = "valid-jwt-token";
  const testEmail = "customer@example.com";

  beforeAll(async () => {
    const appModule = await import("../../src/app.js");
    app = appModule.default || appModule;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/history/:email", () => {
    it("should retrieve historical context by email", async () => {
      mockHistoryService.getHistoryByEmail.mockResolvedValueOnce({
        email: testEmail,
        previousApplications: [
          {
            id: "app-1",
            date: "2024-01-15T10:00:00Z",
            status: "approved",
            loanAmount: 250000,
          },
          {
            id: "app-2",
            date: "2023-06-20T14:30:00Z",
            status: "rejected",
            reason: "insufficient_income",
          },
        ],
        legalRecords: [
          {
            type: "bankruptcy",
            date: "2018-03-12",
            status: "discharged",
          },
        ],
        riskFactors: [
          {
            factor: "multiple_recent_applications",
            severity: "medium",
          },
        ],
      });

      const response = await request(app)
        .get(`/api/history/${testEmail}`)
        .set("Authorization", `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.email).toBe(testEmail);
      expect(response.body.previousApplications).toHaveLength(2);
    });

    it("should include previous applications in history", async () => {
      mockHistoryService.getHistoryByEmail.mockResolvedValueOnce({
        email: testEmail,
        previousApplications: [
          {
            id: "app-1",
            date: "2024-01-15T10:00:00Z",
            status: "approved",
            loanAmount: 250000,
          },
          {
            id: "app-2",
            date: "2023-06-20T14:30:00Z",
            status: "rejected",
            reason: "insufficient_income",
          },
        ],
        legalRecords: [],
        riskFactors: [],
      });

      const response = await request(app)
        .get(`/api/history/${testEmail}`)
        .set("Authorization", `Bearer ${testToken}`);

      expect(response.body.previousApplications).toHaveLength(2);
      expect(response.body.previousApplications[0].status).toBe("approved");
      expect(response.body.previousApplications[1].reason).toBe(
        "insufficient_income",
      );
    });

    it("should include legal records if present", async () => {
      mockHistoryService.getHistoryByEmail.mockResolvedValueOnce({
        email: testEmail,
        previousApplications: [],
        legalRecords: [
          {
            type: "bankruptcy",
            date: "2018-03-12",
            status: "discharged",
          },
          {
            type: "civil_judgment",
            date: "2020-11-05",
            status: "satisfied",
            amount: 15000,
          },
          {
            type: "tax_lien",
            date: "2022-02-18",
            status: "active",
            amount: 8500,
          },
        ],
        riskFactors: [],
      });

      const response = await request(app)
        .get(`/api/history/${testEmail}`)
        .set("Authorization", `Bearer ${testToken}`);

      expect(response.body.legalRecords).toHaveLength(3);
      expect(response.body.legalRecords[0].type).toBe("bankruptcy");
    });

    it("should include identified risk factors", async () => {
      mockHistoryService.getHistoryByEmail.mockResolvedValueOnce({
        email: testEmail,
        previousApplications: [],
        legalRecords: [],
        riskFactors: [
          {
            factor: "multiple_recent_applications",
            severity: "medium",
          },
          {
            factor: "high_debt_to_income",
            severity: "high",
          },
          {
            factor: "recent_delinquency",
            severity: "high",
          },
        ],
      });

      const response = await request(app)
        .get(`/api/history/${testEmail}`)
        .set("Authorization", `Bearer ${testToken}`);

      expect(response.body.riskFactors).toHaveLength(3);
      expect(response.body.riskFactors[0].factor).toBe(
        "multiple_recent_applications",
      );
      expect(response.body.riskFactors[1].severity).toBe("high");
    });

    it("should return empty history for new customer", async () => {
      mockHistoryService.getHistoryByEmail.mockResolvedValueOnce({
        email: testEmail,
        previousApplications: [],
        legalRecords: [],
        riskFactors: [],
      });

      const response = await request(app)
        .get(`/api/history/${testEmail}`)
        .set("Authorization", `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body.previousApplications).toHaveLength(0);
      expect(response.body.legalRecords).toHaveLength(0);
      expect(response.body.riskFactors).toHaveLength(0);
    });

    it("should require authentication", async () => {
      const response = await request(app).get(`/api/history/${testEmail}`);
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should handle invalid email format", async () => {
      const response = await request(app)
        .get("/api/history/invalid-email")
        .set("Authorization", `Bearer ${testToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/history (Admin Search)", () => {
    it("should allow admin to search all historical records", async () => {
      mockHistoryService.searchHistory.mockResolvedValueOnce({
        records: [
          {
            id: "hist-1",
            key: "customer@example.com",
            source: "fraud_report",
          },
          {
            id: "hist-2",
            key: "other@example.com",
            source: "manual_entry",
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
        .get("/api/history")
        .set("Authorization", `Bearer ${testToken}`)
        .set("x-test-role", "admin");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.records).toHaveLength(2);
    });

    it("should support search filtering", async () => {
      mockHistoryService.searchHistory.mockResolvedValueOnce({
        records: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      });

      await request(app)
        .get("/api/history")
        .query({ search: testEmail })
        .set("Authorization", `Bearer ${testToken}`)
        .set("x-test-role", "admin");

      expect(mockHistoryService.searchHistory).toHaveBeenCalledWith(
        expect.objectContaining({ search: testEmail }),
        expect.any(Object),
      );
    });

    it("should support pagination for search results", async () => {
      mockHistoryService.searchHistory.mockResolvedValueOnce({
        records: [],
        pagination: { page: 2, limit: 5, total: 20, totalPages: 4 },
      });

      const response = await request(app)
        .get("/api/history")
        .query({ page: 2, limit: 5 })
        .set("Authorization", `Bearer ${testToken}`)
        .set("x-test-role", "admin");

      expect(response.body.pagination.page).toBe(2);
      expect(response.body.pagination.totalPages).toBe(4);
    });

    it("should restrict admin search to admin role", async () => {
      mockHistoryService.searchHistory.mockRejectedValueOnce(
        Object.assign(new Error("Forbidden"), { status: 403 }),
      );
      const response = await request(app)
        .get("/api/history")
        .set("Authorization", `Bearer ${testToken}`)
        .set("x-test-role", "analyst"); // Non-admin

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it("should support filtering by source", async () => {
      mockHistoryService.searchHistory.mockResolvedValueOnce({
        records: [
          {
            id: "hist-1",
            key: "customer@example.com",
            source: "fraud_report",
          },
        ],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      });

      const response = await request(app)
        .get("/api/history")
        .query({ source: "fraud_report" })
        .set("Authorization", `Bearer ${testToken}`)
        .set("x-test-role", "admin");

      expect(response.body.records[0].source).toBe("fraud_report");
    });

    it("should support date range filtering", async () => {
      mockHistoryService.searchHistory.mockResolvedValueOnce({
        records: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      });

      const response = await request(app)
        .get("/api/history")
        .query({
          startDate: "2024-01-01",
          endDate: "2024-01-31",
        })
        .set("Authorization", `Bearer ${testToken}`)
        .set("x-test-role", "admin");

      expect(response.status).toBe(200);
      expect(response.body.records).toBeDefined();
    });
  });

  describe("Historical Context for Fraud Detection", () => {
    it("should retrieve context for risk assessment", async () => {
      mockHistoryService.getHistoryByEmail.mockResolvedValueOnce({
        email: testEmail,
        previousApplications: [
          {
            id: "app-1",
            status: "rejected",
            reason: "documentation_fraud",
          },
        ],
        legalRecords: [
          {
            type: "bankruptcy",
            status: "discharged",
          },
        ],
        riskFactors: [
          {
            factor: "fraud_history",
            severity: "critical",
          },
        ],
      });

      const response = await request(app)
        .get(`/api/history/${testEmail}`)
        .set("Authorization", `Bearer ${testToken}`);

      expect(response.body.riskFactors).toContainEqual(
        expect.objectContaining({
          factor: "fraud_history",
          severity: "critical",
        }),
      );
    });

    it("should include frequency data for pattern detection", async () => {
      mockHistoryService.getHistoryByEmail.mockResolvedValueOnce({
        email: testEmail,
        previousApplications: [
          {
            id: "app-1",
            date: "2024-01-10",
          },
          {
            id: "app-2",
            date: "2024-01-15",
          },
          {
            id: "app-3",
            date: "2024-01-18",
          },
        ],
        legalRecords: [],
        riskFactors: [
          {
            factor: "high_velocity",
            severity: "high",
            frequency: 3,
            timeframe: "8_days",
          },
        ],
      });

      const response = await request(app)
        .get(`/api/history/${testEmail}`)
        .set("Authorization", `Bearer ${testToken}`);

      expect(response.body.riskFactors[0].frequency).toBe(3);
      expect(response.body.riskFactors[0].timeframe).toBe("8_days");
    });

    it("should track application status over time", async () => {
      mockHistoryService.getHistoryByEmail.mockResolvedValueOnce({
        email: testEmail,
        previousApplications: [
          {
            id: "app-1",
            date: "2023-01-15",
            status: "approved",
            loanAmount: 100000,
          },
          {
            id: "app-2",
            date: "2023-06-20",
            status: "rejected",
            loanAmount: 500000,
            reason: "debt_to_income",
          },
          {
            id: "app-3",
            date: "2024-01-10",
            status: "pending",
            loanAmount: 500000,
          },
        ],
        legalRecords: [],
        riskFactors: [],
      });

      const response = await request(app)
        .get(`/api/history/${testEmail}`)
        .set("Authorization", `Bearer ${testToken}`);

      const applications = response.body.previousApplications;
      expect(applications[0].loanAmount).toBe(100000);
      expect(applications[2].loanAmount).toBe(500000);
    });
  });

  describe("Data Quality & Completeness", () => {
    it("should include timestamps for all records", async () => {
      mockHistoryService.getHistoryByEmail.mockResolvedValueOnce({
        email: testEmail,
        previousApplications: [
          {
            id: "app-1",
            createdAt: "2024-01-15T10:00:00Z",
          },
        ],
        legalRecords: [
          {
            id: "legal-1",
            createdAt: "2023-11-20T14:30:00Z",
          },
        ],
        riskFactors: [],
      });

      const response = await request(app)
        .get(`/api/history/${testEmail}`)
        .set("Authorization", `Bearer ${testToken}`);

      expect(response.body.previousApplications[0].createdAt).toBeDefined();
      expect(response.body.legalRecords[0].createdAt).toBeDefined();
    });

    it("should return consistent data structure", async () => {
      mockHistoryService.getHistoryByEmail.mockResolvedValueOnce({
        email: testEmail,
        previousApplications: [],
        legalRecords: [],
        riskFactors: [],
      });

      const response = await request(app)
        .get(`/api/history/${testEmail}`)
        .set("Authorization", `Bearer ${testToken}`);

      expect(response.body).toHaveProperty("email");
      expect(response.body).toHaveProperty("previousApplications");
      expect(response.body).toHaveProperty("legalRecords");
      expect(response.body).toHaveProperty("riskFactors");
    });
  });
});
