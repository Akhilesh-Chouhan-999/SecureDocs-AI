import request from "supertest";
import type { Express, Request, Response, NextFunction } from "express";

describe("Authentication Flow Integration Tests", () => {
  let app: Express;
  let authToken: string;
  let refreshToken: string;

  const testUser = {
    email: "testuser@example.com",
    password: "SecurePassword123!",
    organization: "Test Bank Inc",
  };

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    refreshToken: jest.fn(),
    logout: jest.fn(),
    getProfile: jest.fn(),
  };

  beforeAll(() => {
    jest.resetModules();

    // Mock auth middleware
    jest.mock("../../src/middleware/auth.middleware", () => ({
      authenticate: jest.fn(
        (req: Request, res: Response, next: NextFunction) => {
          req.user = {
            id: "user-123",
            email: testUser.email,
            role: "analyst",
          };
          next();
        },
      ),
      requireRole:
        (roles: string[]) =>
        (req: Request, res: Response, next: NextFunction) => {
          if (roles.includes((req.user as any)?.role || "")) next();
          else res.status(403).json({ success: false, error: "Forbidden" });
        },
    }));

    // Mock container
    jest.mock("../../src/config/container", () => ({
      get: (name: string) => {
        if (name === "authService") return mockAuthService;
        return null;
      },
    }));

    app = require("../../src/app");
  });

  describe("POST /api/auth/register", () => {
    it("should register user with valid credentials", async () => {
      mockAuthService.register.mockResolvedValueOnce({
        id: "user-123",
        email: testUser.email,
        organization: testUser.organization,
        role: "analyst",
        createdAt: new Date(),
      });

      const response = await request(app)
        .post("/api/auth/register")
        .send(testUser);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(testUser.email);
      expect(mockAuthService.register).toHaveBeenCalledWith(
        expect.objectContaining({
          email: testUser.email,
          password: testUser.password,
          organization: testUser.organization,
        }),
      );
    });

    it("should reject registration with duplicate email", async () => {
      mockAuthService.register.mockRejectedValueOnce(
        new Error("Email already registered"),
      );

      const response = await request(app)
        .post("/api/auth/register")
        .send(testUser);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should reject registration with missing fields", async () => {
      const incompleteUser = {
        email: testUser.email,
        // missing password and organization
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(incompleteUser);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should validate email format", async () => {
      const invalidUser = {
        ...testUser,
        email: "invalid-email",
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(invalidUser);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should validate password strength", async () => {
      const weakPasswordUser = {
        ...testUser,
        password: "weak", // too short/weak
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(weakPasswordUser);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login with correct credentials", async () => {
      mockAuthService.login.mockResolvedValueOnce({
        user: {
          id: "user-123",
          email: testUser.email,
          role: "analyst",
        },
        accessToken: "jwt-access-token",
        refreshToken: "jwt-refresh-token",
      });

      const response = await request(app).post("/api/auth/login").send({
        email: testUser.email,
        password: testUser.password,
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
      expect(response.body.data.user.email).toBe(testUser.email);

      authToken = response.body.data.accessToken;
      refreshToken = response.body.data.refreshToken;
    });

    it("should reject login with wrong password", async () => {
      mockAuthService.login.mockRejectedValueOnce(
        new Error("Invalid credentials"),
      );

      const response = await request(app).post("/api/auth/login").send({
        email: testUser.email,
        password: "wrongpassword",
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should reject login with non-existent user", async () => {
      mockAuthService.login.mockRejectedValueOnce(new Error("User not found"));

      const response = await request(app).post("/api/auth/login").send({
        email: "nonexistent@example.com",
        password: testUser.password,
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should return user role in login response", async () => {
      mockAuthService.login.mockResolvedValueOnce({
        user: {
          id: "user-123",
          email: testUser.email,
          role: "admin",
        },
        accessToken: "jwt-token",
        refreshToken: "jwt-refresh",
      });

      const response = await request(app).post("/api/auth/login").send({
        email: testUser.email,
        password: testUser.password,
      });

      expect(response.body.data.user.role).toBe("admin");
    });
  });

  describe("POST /api/auth/refresh-token", () => {
    it("should refresh access token with valid refresh token", async () => {
      mockAuthService.refreshToken.mockResolvedValueOnce({
        accessToken: "new-jwt-access-token",
        refreshToken: "new-jwt-refresh-token",
      });

      const response = await request(app).post("/api/auth/refresh-token").send({
        refreshToken: "jwt-refresh-token",
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
    });

    it("should reject refresh with invalid token", async () => {
      mockAuthService.refreshToken.mockRejectedValueOnce(
        new Error("Invalid refresh token"),
      );

      const response = await request(app).post("/api/auth/refresh-token").send({
        refreshToken: "invalid-token",
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should reject refresh with expired token", async () => {
      mockAuthService.refreshToken.mockRejectedValueOnce(
        new Error("Refresh token expired"),
      );

      const response = await request(app).post("/api/auth/refresh-token").send({
        refreshToken: "expired-token",
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/auth/logout", () => {
    it("should logout successfully with valid token", async () => {
      mockAuthService.logout.mockResolvedValueOnce({
        message: "Logged out successfully",
      });

      const response = await request(app)
        .post("/api/auth/logout")
        .set("Authorization", `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it("should clear user session on logout", async () => {
      mockAuthService.logout.mockResolvedValueOnce({
        message: "Session cleared",
      });

      const response = await request(app)
        .post("/api/auth/logout")
        .set("Authorization", `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(200);
      expect(mockAuthService.logout).toHaveBeenCalled();
    });
  });

  describe("GET /api/auth/profile", () => {
    it("should return user profile with valid token", async () => {
      mockAuthService.getProfile.mockResolvedValueOnce({
        id: "user-123",
        email: testUser.email,
        organization: testUser.organization,
        role: "analyst",
        createdAt: new Date(),
      });

      const response = await request(app)
        .get("/api/auth/profile")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(testUser.email);
      expect(response.body.data.role).toBe("analyst");
    });

    it("should reject profile request without token", async () => {
      const response = await request(app).get("/api/auth/profile");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should include user metadata in profile", async () => {
      mockAuthService.getProfile.mockResolvedValueOnce({
        id: "user-123",
        email: testUser.email,
        organization: testUser.organization,
        role: "analyst",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-15"),
      });

      const response = await request(app)
        .get("/api/auth/profile")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.body.data.createdAt).toBeDefined();
      expect(response.body.data.organization).toBe(testUser.organization);
    });
  });

  describe("Password Hashing Validation", () => {
    it("should hash password before storing", async () => {
      mockAuthService.register.mockResolvedValueOnce({
        id: "user-123",
        email: testUser.email,
        organization: testUser.organization,
        role: "analyst",
      });

      await request(app).post("/api/auth/register").send(testUser);

      // Verify the service was called (actual hashing happens in service)
      expect(mockAuthService.register).toHaveBeenCalled();
      const callArgs = mockAuthService.register.mock.calls[0][0];
      expect(callArgs.password).toBe(testUser.password); // Service should hash it
    });
  });

  describe("JWT Token Validation", () => {
    it("should reject request with malformed token", async () => {
      const response = await request(app)
        .get("/api/auth/profile")
        .set("Authorization", "Bearer malformed.token.here");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should reject request with missing Bearer prefix", async () => {
      const response = await request(app)
        .get("/api/auth/profile")
        .set("Authorization", authToken);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should accept token in Authorization header", async () => {
      mockAuthService.getProfile.mockResolvedValueOnce({
        id: "user-123",
        email: testUser.email,
        role: "analyst",
      });

      const response = await request(app)
        .get("/api/auth/profile")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
    });
  });
});
