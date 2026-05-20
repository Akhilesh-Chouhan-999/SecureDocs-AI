# Testing & QA Guide

## Testing Strategy

SecureDoc AI follows a comprehensive testing strategy: Unit → Integration → E2E

---

## 1. Unit Testing (Backend)

### Setup Jest

```bash
npm install --save-dev jest @types/jest
npx jest --init
```

Configure `jest.config.js`:

```javascript
module.exports = {
  testEnvironment: "node",
  coveragePathIgnorePatterns: ["/node_modules/"],
  testMatch: ["**/__tests__/**/*.test.js"],
  collectCoverageFrom: ["src/**/*.js", "!src/index.js", "!src/config/**"],
};
```

### Write Unit Tests

Create `src/services/__tests__/auth.service.test.js`:

```javascript
const AuthService = require("../auth.service");
const User = require("../../api/models/User");

jest.mock("../../api/models/User");

describe("AuthService", () => {
  describe("register", () => {
    it("should create new user", async () => {
      const userData = {
        email: "test@test.com",
        password: "pass123",
      };

      User.create.mockResolvedValue({ ...userData, _id: "123" });

      const result = await AuthService.register(userData);
      expect(result._id).toBe("123");
      expect(User.create).toHaveBeenCalledWith(userData);
    });

    it("should throw if user exists", async () => {
      User.findOne.mockResolvedValue({ email: "existing@test.com" });

      await expect(
        AuthService.register({
          email: "existing@test.com",
          password: "pass123",
        }),
      ).rejects.toThrow("User already exists");
    });
  });
});
```

Run tests:

```bash
npm test

# With coverage
npm test -- --coverage
```

---

## 2. Unit Testing (Frontend)

### Setup React Testing Library

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom
```

Create `src/components/__tests__/FraudCard.test.js`:

```javascript
import { render, screen } from "@testing-library/react";
import FraudCard from "../analysis/FraudCard";

describe("FraudCard", () => {
  const mockReport = {
    _id: "1",
    documentId: "doc123",
    riskLevel: "High",
    riskScore: 75,
    createdAt: "2025-05-15",
  };

  it("renders fraud card with risk level", () => {
    render(<FraudCard report={mockReport} />);

    expect(screen.getByText("doc123")).toBeInTheDocument();
    expect(screen.getByText("High")).toBeInTheDocument();
    expect(screen.getByText("75%")).toBeInTheDocument();
  });

  it("displays correct risk color", () => {
    render(<FraudCard report={mockReport} />);
    const riskBadge = screen.getByText("High");
    expect(riskBadge).toHaveClass("bg-orange-50");
  });
});
```

---

## 3. Integration Testing (API)

### Setup Supertest

```bash
npm install --save-dev supertest
```

Create `src/api/__tests__/auth.api.test.js`:

```javascript
const request = require("supertest");
const app = require("../../index");
const User = require("../models/User");

describe("Auth API", () => {
  beforeAll(async () => {
    // Connect to test database
  });

  afterAll(async () => {
    await User.deleteMany({});
  });

  describe("POST /api/auth/register", () => {
    it("should register new user", async () => {
      const response = await request(app).post("/api/auth/register").send({
        email: "test@test.com",
        password: "pass123",
        organization: "TestBank",
      });

      expect(response.status).toBe(201);
      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe("test@test.com");
    });

    it("should reject duplicate email", async () => {
      await User.create({
        email: "existing@test.com",
        password: "hashedpass",
      });

      const response = await request(app).post("/api/auth/register").send({
        email: "existing@test.com",
        password: "pass123",
      });

      expect(response.status).toBe(400);
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login user and return token", async () => {
      await request(app).post("/api/auth/register").send({
        email: "user@test.com",
        password: "pass123",
      });

      const response = await request(app).post("/api/auth/login").send({
        email: "user@test.com",
        password: "pass123",
      });

      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined();
    });
  });
});
```

Run:

```bash
npm test auth.api.test.js
```

---

## 4. End-to-End Testing

### Setup Playwright

```bash
npm install --save-dev @playwright/test
npx playwright install
```

Create `tests/e2e/auth.spec.js`:

```javascript
const { test, expect } = require("@playwright/test");

test.describe("Authentication Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000");
  });

  test("should register new user", async ({ page }) => {
    await page.click("text=Sign Up");

    await page.fill('[placeholder="Email"]', "newuser@test.com");
    await page.fill('[placeholder="Password"]', "SecurePass123!");
    await page.fill('[placeholder="Organization"]', "TestBank");

    await page.click('button:has-text("Register")');

    await expect(page).toHaveURL("/dashboard");
    await expect(page.locator("text=Welcome")).toBeVisible();
  });

  test("should login existing user", async ({ page }) => {
    await page.fill('[placeholder="Email"]', "test@test.com");
    await page.fill('[placeholder="Password"]', "pass123");

    await page.click('button:has-text("Sign in")');

    await expect(page).toHaveURL("/dashboard");
  });
});
```

Run:

```bash
npx playwright test
```

---

## 5. Performance Testing

### Load Testing with k6

```bash
npm install --save-dev k6
```

Create `tests/performance/load.js`:

```javascript
import http from "k6/http";
import { check } from "k6";

export let options = {
  stages: [
    { duration: "30s", target: 20 }, // Ramp up
    { duration: "1m30s", target: 20 }, // Stay at 20 VUs
    { duration: "30s", target: 0 }, // Ramp down
  ],
};

export default function () {
  let response = http.get("http://localhost:5000/api/documents");

  check(response, {
    "status is 200": (r) => r.status === 200,
    "response time < 500ms": (r) => r.timings.duration < 500,
  });
}
```

Run:

```bash
k6 run tests/performance/load.js
```

---

## 6. Security Testing

### OWASP Dependency Check

```bash
npm audit
npm audit fix
```

### Snyk Scanning

```bash
npm install -g snyk
snyk test
snyk monitor
```

### Static Analysis

```bash
npm install --save-dev eslint @typescript-eslint/eslint-plugin
npx eslint src/
```

---

## 7. Test Coverage Goals

| Layer       | Target      | Tool       |
| ----------- | ----------- | ---------- |
| Unit        | 80%+        | Jest       |
| Integration | 70%+        | Supertest  |
| E2E         | Key flows   | Playwright |
| Performance | <500ms      | k6         |
| Security    | 0 high-risk | npm audit  |

Check coverage:

```bash
npm test -- --coverage

# Output example:
# ─────────────────────────────────────────────────────────────────
# File      | % Stmts | % Branch | % Funcs | % Lines |
# ─────────────────────────────────────────────────────────────────
# All files |   85.2  |   82.1   |   88.3  |   85.6  |
```

---

## 8. Continuous Testing (CI/CD)

GitHub Actions workflow (`.github/workflows/test.yml`):

```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      mongodb:
        image: mongo:7
        options: >-
          --health-cmd mongosh
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 27017:27017

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "npm"

      - name: Install dependencies
        run: cd backend && npm ci

      - name: Run tests
        run: cd backend && npm test -- --coverage
        env:
          NODE_ENV: test
          MONGODB_URI: mongodb://localhost:27017/securedoc_test

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./backend/coverage/lcov.info
```

---

## 9. Manual Testing Checklist

### Authentication

- [ ] User can register with valid email/password
- [ ] User can login with correct credentials
- [ ] User cannot login with wrong credentials
- [ ] User can logout
- [ ] Session persists on page reload

### Document Upload

- [ ] Can upload PDF document
- [ ] Can upload JPG image
- [ ] Cannot upload unsupported file type
- [ ] File size limit enforced (50MB)
- [ ] Upload progress shown

### Fraud Detection

- [ ] Analysis starts after upload
- [ ] Real-time status updates
- [ ] Results display correctly
- [ ] Risk score calculated accurately
- [ ] Anomalies highlighted

### Report

- [ ] Report generated for high-risk documents
- [ ] Report can be downloaded
- [ ] Report content is accurate
- [ ] PDF formatting correct

### Dashboard

- [ ] Shows all submitted documents
- [ ] Risk summary calculated correctly
- [ ] Search/filter works
- [ ] Export functionality works

---

## 10. Bug Reporting Template

```markdown
## Bug Report

**Title:** [Brief description]

**Environment:**

- OS: Windows/macOS/Linux
- Browser: Chrome/Firefox/Safari
- Node.js: 18.x

**Steps to Reproduce:**

1. Go to...
2. Click...
3. Observe...

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Screenshots:**
[If applicable]

**Logs:**
```

[Error output]

```

```

---

## 11. Performance Benchmarks

Target metrics:

| Metric         | Target | Tool             |
| -------------- | ------ | ---------------- |
| Page Load      | <3s    | Lighthouse       |
| API Response   | <500ms | k6               |
| OCR Processing | <30s   | Jest             |
| LLM Response   | <60s   | k6               |
| Database Query | <200ms | MongoDB Profiler |

---

## 12. Test Execution Commands

```bash
# Run all tests
npm test

# Run specific test file
npm test auth.service.test.js

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm test -- --watch

# Run E2E tests
npx playwright test

# Run performance tests
k6 run tests/performance/load.js

# Run security audit
npm audit
snyk test

# Run linting
npm run lint
```
