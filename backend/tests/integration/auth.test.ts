import { jest } from "@jest/globals";
import request from "supertest";
import { setupDB, teardownDB, clearDB } from "../support/db-setup.js";
import User from "../../src/models/User.js";

let app: any;

beforeAll(async () => {
  await setupDB();
  const module = await import("../../src/app.js");
  app = module.default;
}, 60000);

afterEach(async () => {
  await clearDB();
});

afterAll(async () => {
  await teardownDB();
});

describe("Authentication Flow Integration Tests", () => {
  let authToken: string;
  let refreshToken: string;

  const testUser = {
    email: "testuser@example.com",
    password: "SecurePassword123!",
    organization: "Test Bank Inc",
  };

  describe("POST /api/auth/register", () => {
    it("should register user with valid credentials", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send(testUser);

      if (!response.body.success) {
        console.error("Register Failed:", response.body);
      }

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.user.email).toBe(testUser.email);
      expect(response.body.user.role).toBe("analyst");

      const dbUser = await User.findOne({ email: testUser.email });
      expect(dbUser).not.toBeNull();
      expect(dbUser?.organization).toBe(testUser.organization);
    });

    it("should reject registration with duplicate email", async () => {
      await request(app).post("/api/auth/register").send(testUser);

      const response = await request(app)
        .post("/api/auth/register")
        .send(testUser);

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
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      await request(app).post("/api/auth/register").send(testUser);
    });

    it("should login with correct credentials", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: testUser.email,
        password: testUser.password,
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();
      expect(response.body.user.email).toBe(testUser.email);

      authToken = response.body.token;
      refreshToken = response.body.refreshToken;
    });

    it("should reject login with wrong password", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: testUser.email,
        password: "wrongpassword",
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/auth/profile", () => {
    beforeEach(async () => {
      await request(app).post("/api/auth/register").send(testUser);
      const loginRes = await request(app).post("/api/auth/login").send({
        email: testUser.email,
        password: testUser.password,
      });
      authToken = loginRes.body.token;
    });

    it("should return user profile with valid token", async () => {
      const response = await request(app)
        .get("/api/auth/profile")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.user.email).toBe(testUser.email);
    });

    it("should reject profile request without token", async () => {
      const response = await request(app).get("/api/auth/profile");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/auth/logout", () => {
    beforeEach(async () => {
      await request(app).post("/api/auth/register").send(testUser);
      const loginRes = await request(app).post("/api/auth/login").send({
        email: testUser.email,
        password: testUser.password,
      });
      authToken = loginRes.body.token;
    });

    it("should logout successfully", async () => {
      const response = await request(app)
        .post("/api/auth/logout")
        .set("Authorization", `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
