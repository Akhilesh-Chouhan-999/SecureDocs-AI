import { jest } from "@jest/globals";
import request from "supertest";
import type { Express, Request, Response, NextFunction } from "express";

describe("Historical Data & Context Integration Tests", () => {
  let app: Express;
  const testUserId = "user-123";
  const testToken = "valid-jwt-token";
  const testEmail = "customer@example.com";

  const mockHistoryService = {
    getHistoricalContext: jest.fn() as any,
    searchHistory: jest.fn() as any,
  };

  const mockAuthMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    (req as any).user = {
      id: testUserId,
      email: "analyst@example.com",
      role: (req.headers["x-test-role"] as string) || "analyst",
    };
    next();
  };

  beforeAll(() => {
    jest.resetModules();

    jest.mock("../../src/middleware/auth.middleware", () => ({ __esModule: true, default: (req: any, res: any, next: any) => { req.user = { id: "user-123", email: "testuser@example.com", role: "analyst" }; next(); } }));

    

    

    

    jest.mock("../../src/config/container", () => ({
      __esModule: true,
      default: { get: (name: string) => {
        try { return eval("mock" + name.charAt(0).toUpperCase() + name.slice(1)); } catch (e) { return null; }
      } },
      container: { get: (name: string) => {
        try { return eval("mock" + name.charAt(0).toUpperCase() + name.slice(1)); } catch (e) { return null; }
      } }
    }));

    

    

    

    app = require("../../src/app").default || require("../../src/app");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/history/:email", () => {
    it("should retrieve historical context by email", async () => {
      mockHistoryService.getHistoricalContext.mockResolvedValueOnce({
        email: testEmail,
        previousApplications: [
          {
            id: "app-1",
            amount: 250000,
            date: "2024-01-15",
            status: "approved",
          },
          {
            id: "app-2",
            amount: 300000,
            date: "2024-03-20",
            status: "rejected",
          },
        ],
        legalRecords: [
          {
            type: "bankruptcy",
            date: "2023-06-01",
            status: "discharged",
          },
        ],
        riskFactors: [
          {
            factor: "multiple_applications",
            severity: "medium",
            frequency: 2,
          },
        ],
      });

      const response = await request(app)
        .get(`/api/history/${testEmail}`)
        .set("Authorization", `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(testEmail);
      expect(response.body.data.previousApplications).toHaveLength(2);
      expect(response.body.data.legalRecords).toHaveLength(1);
      expect(mockHistoryService.getHistoricalContext).toHaveBeenCalledWith(
        testEmail,
      );
    });

    it("should include previous applications in history", async () => {
      mockHistoryService.getHistoricalContext.mockResolvedValueOnce({
        email: testEmail,
        previousApplications: [
          {
            id: "app-1",
            loanAmount: 250000,
            applicationDate: "2024-01-15",
            status: "approved",
            lender: "Bank A",
          },
          {
            id: "app-2",
            loanAmount: 300000,
            applicationDate: "2024-03-20",
            status: "rejected",
            reason: "Low credit score",
          },
        ],
        legalRecords: [],
        riskFactors: [],
      });

      const response = await request(app)
        .get(`/api/history/${testEmail}`)
        .set("Authorization", `Bearer ${testToken}`);

      expect(response.body.data.previousApplications).toHaveLength(2);
      expect(response.body.data.previousApplications[0].status).toBe(
        "approved",
      );
      expect(response.body.data.previousApplications[1].status).toBe(
        "rejected",
      );
    });

    it("should include legal records if present", async () => {
      mockHistoryService.getHistoricalContext.mockResolvedValueOnce({
        email: testEmail,
        previousApplications: [],
        legalRecords: [
          {
            type: "bankruptcy",
            date: "2023-06-01",
            status: "discharged",
          },
          {
            type: "lien",
            date: "2023-09-15",
            amount: 50000,
            status: "active",
          },
          {
            type: "judgment",
            date: "2024-01-10",
            amount: 25000,
            plaintiff: "Creditor Inc",
          },
        ],
        riskFactors: [],
      });

      const response = await request(app)
        .get(`/api/history/${testEmail}`)
        .set("Authorization", `Bearer ${testToken}`);

      expect(response.body.data.legalRecords).toHaveLength(3);
      expect(response.body.data.legalRecords[0].type).toBe("bankruptcy");
    });

    it("should include identified risk factors", async () => {
      mockHistoryService.getHistoricalContext.mockResolvedValueOnce({
        email: testEmail,
        previousApplications: [],
        legalRecords: [],
        riskFactors: [
          {
            factor: "multiple_recent_applications",
            severity: "high",
            frequency: 4,
            timeframe: "30_days",
          },
          {
            factor: "address_changes",
            severity: "medium",
            frequency: 3,
            timeframe: "6_months",
          },
          {
            factor: "income_inconsistency",
            severity: "medium",
            variance: "45%",
          },
        ],
      });

      const response = await request(app)
        .get(`/api/history/${testEmail}`)
        .set("Authorization", `Bearer ${testToken}`);

      expect(response.body.data.riskFactors).toHaveLength(3);
      expect(response.body.data.riskFactors[0].factor).toBe(
        "multiple_recent_applications",
      );
      expect(response.body.data.riskFactors[0].severity).toBe("high");
    });

    it("should return empty history for new customer", async () => {
      mockHistoryService.getHistoricalContext.mockResolvedValueOnce({
        email: "newcustomer@example.com",
        previousApplications: [],
        legalRecords: [],
        riskFactors: [],
      });

      const response = await request(app)
        .get(`/api/history/newcustomer@example.com`)
        .set("Authorization", `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.previousApplications).toHaveLength(0);
      expect(response.body.data.legalRecords).toHaveLength(0);
      expect(response.body.data.riskFactors).toHaveLength(0);
    });

    it("should require authentication", async () => {
      const response = await request(app).get(`/api/history/${testEmail}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should handle invalid email format", async () => {
      const response = await request(app)
        .get(`/api/history/invalid-email`)
        .set("Authorization", `Bearer ${testToken}`);

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe("GET /api/history (Admin Search)", () => {
    it("should allow admin to search all historical records", async () => {
      mockHistoryService.searchHistory.mockResolvedValueOnce({
        records: [
          {
            id: "history-1",
            key: testEmail,
            source: "application",
            createdAt: new Date(),
          },
          {
            id: "history-2",
            key: "another@example.com",
            source: "fraud_report",
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
        .get("/api/history")
        .set("Authorization", `Bearer ${testToken}`)
        .set("x-test-role", "admin");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.records).toHaveLength(2);
    });

    it("should support search filtering", async () => {
      mockHistoryService.searchHistory.mockResolvedValueOnce({
        records: [
          {
            id: "history-1",
            key: testEmail,
            source: "application",
          },
        ],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      });

      const response = await request(app)
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
        pagination: {
          page: 2,
          limit: 5,
          total: 20,
          totalPages: 4,
        },
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
        new Error("Forbidden"),
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
            id: "history-1",
            key: testEmail,
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

      expect(response.body.data.records[0].source).toBe("fraud_report");
    });

    it("should support date range filtering", async () => {
      mockHistoryService.searchHistory.mockResolvedValueOnce({
        records: [
          {
            id: "history-1",
            key: testEmail,
            createdAt: "2024-05-15",
          },
        ],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
      });

      const response = await request(app)
        .get("/api/history")
        .query({ startDate: "2024-05-01", endDate: "2024-05-31" })
        .set("Authorization", `Bearer ${testToken}`)
        .set("x-test-role", "admin");

      expect(response.status).toBe(200);
      expect(response.body.data.records).toBeDefined();
    });
  });

  describe("Historical Context for Fraud Detection", () => {
    it("should retrieve context for risk assessment", async () => {
      mockHistoryService.getHistoricalContext.mockResolvedValueOnce({
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

      expect(response.body.data.riskFactors).toContainEqual(
        expect.objectContaining({
          factor: "fraud_history",
          severity: "critical",
        }),
      );
    });

    it("should include frequency data for pattern detection", async () => {
      mockHistoryService.getHistoricalContext.mockResolvedValueOnce({
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
            factor: "rapid_reapplication",
            frequency: 3,
            timeframe: "8_days",
          },
        ],
      });

      const response = await request(app)
        .get(`/api/history/${testEmail}`)
        .set("Authorization", `Bearer ${testToken}`);

      expect(response.body.data.riskFactors[0].frequency).toBe(3);
      expect(response.body.data.riskFactors[0].timeframe).toBe("8_days");
    });

    it("should track application status over time", async () => {
      mockHistoryService.getHistoricalContext.mockResolvedValueOnce({
        email: testEmail,
        previousApplications: [
          {
            id: "app-1",
            date: "2023-01-01",
            status: "approved",
            loanAmount: 100000,
          },
          {
            id: "app-2",
            date: "2023-06-01",
            status: "approved",
            loanAmount: 150000,
          },
          {
            id: "app-3",
            date: "2024-01-01",
            status: "rejected",
            loanAmount: 500000,
            reason: "income_mismatch",
          },
        ],
        legalRecords: [],
        riskFactors: [
          {
            factor: "sudden_large_amount_request",
            severity: "high",
          },
        ],
      });

      const response = await request(app)
        .get(`/api/history/${testEmail}`)
        .set("Authorization", `Bearer ${testToken}`);

      const applications = response.body.data.previousApplications;
      expect(applications[0].loanAmount).toBe(100000);
      expect(applications[2].loanAmount).toBe(500000);
    });
  });

  describe("Data Quality & Completeness", () => {
    it("should include timestamps for all records", async () => {
      mockHistoryService.getHistoricalContext.mockResolvedValueOnce({
        email: testEmail,
        previousApplications: [
          {
            id: "app-1",
            date: "2024-01-15",
            createdAt: new Date("2024-01-15T10:30:00Z"),
          },
        ],
        legalRecords: [
          {
            type: "bankruptcy",
            date: "2023-06-01",
            createdAt: new Date("2023-06-01T14:20:00Z"),
          },
        ],
        riskFactors: [],
      });

      const response = await request(app)
        .get(`/api/history/${testEmail}`)
        .set("Authorization", `Bearer ${testToken}`);

      expect(
        response.body.data.previousApplications[0].createdAt,
      ).toBeDefined();
      expect(response.body.data.legalRecords[0].createdAt).toBeDefined();
    });

    it("should return consistent data structure", async () => {
      mockHistoryService.getHistoricalContext.mockResolvedValueOnce({
        email: testEmail,
        previousApplications: [],
        legalRecords: [],
        riskFactors: [],
      });

      const response = await request(app)
        .get(`/api/history/${testEmail}`)
        .set("Authorization", `Bearer ${testToken}`);

      expect(response.body.data).toHaveProperty("email");
      expect(response.body.data).toHaveProperty("previousApplications");
      expect(response.body.data).toHaveProperty("legalRecords");
      expect(response.body.data).toHaveProperty("riskFactors");
    });
  });
});

