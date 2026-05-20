# SecureDocs AI - Agent Customization Guide

**Last Updated:** May 17, 2026  
**Project:** SecureDocs AI - Fraud Detection & Document Analysis Platform  
**Tech Stack:** Node.js + TypeScript, Express, MongoDB, LangChain.js, OpenAI/Gemini

---

## 🎯 Project Overview

SecureDocs AI is a document-centric fraud detection platform that combines OCR, AI analysis, and risk scoring. The backend is fully modular with clear separation between controllers, services, repositories, and infrastructure layers.

**Current Status:**

- ✅ Phase 1 (Backend Foundation) - **COMPLETED** (36 REST routes across 7 categories)
- 🔄 Phase 2 (OCR Pipeline) - **IN SCOPE** (Tesseract.js integration)
- 📋 Phase 3+ (LangChain Agents, LLM Integration) - **PLANNED**

---

## 📋 Backend TODO Items (Priority Order)

### **Priority 1: Make OCR Pipeline Real** 🔴 URGENT

**Status:** Mocked OCR in `src/services/analysis.service.ts`  
**Location:** [backend/src/services/analysis.service.ts](backend/src/services/analysis.service.ts)  
**Task:** Replace mock `{ text: "Mocked OCR output..." }` with actual Tesseract.js integration

**What needs to happen:**

1. Import `Tesseract` from `tesseract.js` (already in `package.json`)
2. Create OCR worker in `src/infrastructure/ocr/`
3. Add confidence threshold validation
4. Parse document text into structured segments
5. Write integration tests in `tests/integration/ocr.test.ts`

**Acceptance Criteria:**

- OCR returns `{ text, confidence, language }` struct
- Rejects documents with confidence < 80%
- Handles PDF, PNG, JPEG uploads
- Logs OCR timing and errors to Winston

**Estimated Time:** 2-3 hours

---

### **Priority 2: Add Integration Tests** 🟠 HIGH

**Status:** Minimal test coverage. Only route-surface tests exist.  
**Location:** [backend/tests/integration/](backend/tests/integration/)  
**Task:** Build comprehensive integration test suite

**What needs coverage:**

1. **Auth flow:** Register → Login → Refresh → Logout → Profile
   - Location: `tests/integration/auth.test.ts`
   - Verify JWT tokens, role assignment, password hashing
2. **Document lifecycle:** Upload → List → Analyze → Delete
   - Location: `tests/integration/documents.test.ts`
   - Test file upload, ownership checks, cleanup
3. **Analysis workflows:** OCR → Anomaly detection → Risk scoring
   - Location: `tests/integration/analysis.test.ts`
   - Mock Tesseract, verify service pipeline
4. **Report generation:** Create → Review → Download PDF
   - Location: `tests/integration/reports.test.ts`
   - Test PDF generation, risk scoring, email notifications

**Test Patterns:**

- Use `supertest` for HTTP testing
- Mock services via `jest.mock()` and `container.get()`
- Inject test user via `x-user-role` header (Auth middleware mocks it)
- See existing example: [backend/tests/integration/route-surface.test.js](backend/tests/integration/route-surface.test.js)

**Estimated Time:** 3-4 hours

---

### **Priority 3: Activate Job Queue (Bull + Redis)** 🟡 MEDIUM

**Status:** Job infrastructure ready, but in-memory only. Redis/Bull not active.  
**Location:** [backend/src/infrastructure/queue/](backend/src/infrastructure/queue/)  
**Task:** Wire Redis connection and migrate job processing to Bull

**What needs to happen:**

1. Ensure Redis is running locally or via Docker
2. Create `src/infrastructure/queue/bull-queue.ts` with job definitions
3. Migrate `src/infrastructure/jobs/` handlers to Bull processors
4. Add job monitoring dashboard (optional: Bull UI on `localhost:3000/admin/queues`)
5. Test job retry, failure, and completion flows

**Jobs to activate:**

- Document processing (upload → OCR → analysis)
- Report PDF generation
- Fraud detection workflows
- Email notifications

**Estimated Time:** 2-3 hours

---

### **Priority 4: Persistence-Backed Analysis History** 🟢 LOW

**Status:** History endpoints work, but in-memory only. No MongoDB persistence.  
**Location:** [backend/src/repositories/historical.repository.ts](backend/src/repositories/historical.repository.ts)  
**Task:** Add MongoDB schema and queryable history

**What needs to happen:**

1. Define `HistoricalRecord` Mongoose schema in `src/infrastructure/database/schemas/`
2. Implement MongoDB queries in `HistoricalRepository`
3. Add analysis hooks to persist each result
4. Build admin search with filters: date, risk level, status, document type

**Estimated Time:** 1-2 hours

---

## 🏗️ Backend Architecture Quick Reference

### **Folder Structure (Flat, No Deep Nesting)**

```
backend/src/
├── config/           # DI Container, DB, LLM, Env setup
├── core/             # Base interfaces (IRepository, IService)
├── domain/           # Business entities (User, Document, FraudReport)
├── repositories/     # Data access layer (BaseRepository + specifics)
├── services/         # Business logic (Auth, Document, Analysis)
├── controllers/      # HTTP handlers (static class methods)
├── routes/           # Express route definitions
├── middleware/       # Auth, error handling, file upload
├── infrastructure/   # DB models, AI agents, queues, storage
├── validators/       # Input validation (Joi schemas)
├── utils/            # Helpers (API response, logging)
├── errors/           # Custom error classes
├── ai/               # LangChain agents, tools, embeddings, RAG
├── docs/             # Route catalog
├── app.ts            # Express app factory
├── server.ts         # Bootstrap & port listen
└── index.ts          # Entry point
```

### **Design Patterns Used**

| Pattern                  | Location                  | Purpose                              |
| ------------------------ | ------------------------- | ------------------------------------ |
| **Dependency Injection** | `src/config/container.ts` | Service singleton wiring             |
| **Repository**           | `src/repositories/`       | Data access abstraction              |
| **Service Layer**        | `src/services/`           | Isolated business logic              |
| **Custom Errors**        | `src/errors/`             | Type-safe error handling             |
| **Middleware Stack**     | `src/middleware/`         | Auth, validation, error catch        |
| **Controller Methods**   | `src/controllers/`        | Static class methods (not functions) |

### **Key Service Connections**

```
Controller → Service → Repository → MongoDB
     ↓
  Middleware (Auth, Validation)
     ↓
  Error Middleware (catches all)
```

---

## 🔑 Code Standards & Conventions

### **Variable Naming**

- **Variables/Functions:** `camelCase` (e.g., `riskScore`, `getUserById()`)
- **Classes/Interfaces:** `PascalCase` (e.g., `AuthService`, `IRepository`)
- **Constants:** `UPPER_SNAKE_CASE` (e.g., `MAX_FILE_SIZE`, `JWT_EXPIRY`)

### **Git Commits**

- Conventional format: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`
- Example: `feat: add OCR confidence validation`
- See: [context/code-standards.md](context/code-standards.md)

### **TypeScript Rules**

- Target: ES2022
- Module: Node16
- Strict mode: **DISABLED** (allows more flexibility for legacy code)
- No unused variables or missing return types in new code

### **API Response Format**

All endpoints return consistent structure:

```typescript
// Success (200)
{ success: true, data: {...}, message: "Operation completed" }

// Created (201)
{ success: true, data: {...}, statusCode: 201 }

// Error (4xx/5xx)
{ success: false, error: "Error message", statusCode: 400 }
```

**Usage in Controllers:**

```typescript
apiResponse.success(res, userData, "User retrieved");
apiResponse.created(res, newDocument, "Document uploaded");
apiResponse.error(res, "Invalid input", 400);
```

---

## 🧪 Testing Setup & Commands

### **Available Commands**

```bash
npm test              # Jest with coverage & open handle detection
npm run test:watch   # Watch mode
npm run lint         # ESLint auto-fix
npm run format       # Prettier formatting
npm run build        # TypeScript compilation to dist/
npm run typecheck    # Type validation without emit
npm run dev          # Development server (hot reload)
npm run start        # Production server
```

### **Test Organization**

| Location             | Purpose                            | Status       |
| -------------------- | ---------------------------------- | ------------ |
| `tests/unit/`        | Utility functions, helpers         | ✅ Running   |
| `tests/integration/` | Route testing, workflow validation | ⏳ Expanding |
| `tests/e2e/`         | Full system flows                  | ❌ Not yet   |
| `tests/support/`     | Jest transformer, test helpers     | ✅ Ready     |

### **Test Pattern (from route-surface.test.js)**

```typescript
// 1. Mock Auth Middleware
jest.mock("../src/middleware/auth.middleware");
const mockAuthMiddleware = require("../src/middleware/auth.middleware");
mockAuthMiddleware.authenticate = jest.fn((req, res, next) => {
  req.user = { id: "test-user", role: req.get("x-user-role") || "user" };
  next();
});

// 2. Make HTTP request with role
const response = await request(app)
  .post("/api/documents/analyze")
  .set("x-user-role", "admin")
  .send({ documentId: "..." });

// 3. Assert
expect(response.status).toBe(200);
expect(response.body.success).toBe(true);
```

---

## 🚀 Build & Run Instructions

### **Local Development**

```bash
# Install dependencies
npm install

# Run migrations
npm run migrate:up

# Seed test data
npm run seed

# Start dev server (hot reload on src/ changes)
npm run dev

# In another terminal, run tests
npm test
```

### **Production Build**

```bash
npm run build        # Compiles src/ → dist/
npm run start        # Runs dist/server.js
```

### **Environment Setup**

- Copy `.env.example` to `.env`
- Set: `MONGODB_URI`, `JWT_SECRET`, `OPENAI_API_KEY`, `REDIS_URL`
- See: [context/API_KEYS_SETUP.md](context/API_KEYS_SETUP.md)

---

## 📚 Important Documentation Links

- **[BACKEND_STATUS.md](context/BACKEND_STATUS.md)** - Current state, what works, what's mocked
- **[BACKEND_PHASES.md](context/BACKEND_PHASES.md)** - Phase-by-phase roadmap
- **[BACKEND_STRUCTURE.md](context/BACKEND_STRUCTURE.md)** - Folder rationale & patterns
- **[BACKEND_SETUP.md](context/BACKEND_SETUP.md)** - Environment & dependency setup
- **[code-standards.md](context/code-standards.md)** - Naming, git, formatting rules
- **[SYSTEM_DESIGN.md](context/SYSTEM_DESIGN.md)** - High-level architecture

---

## 🛠️ Common Development Tasks

### **Add a New Route**

1. Create controller method in `src/controllers/`
2. Define route in `src/routes/`
3. Wire service in DI container `src/config/container.ts`
4. Add validation in `src/validators/`
5. Add test in `tests/integration/`

### **Create a New Service**

1. Define interface in `src/core/interfaces/`
2. Implement class in `src/services/`
3. Register in `src/config/container.ts` as singleton
4. Inject via `container.get('ServiceName')`

### **Add Database Model**

1. Create Mongoose schema in `src/infrastructure/database/schemas/`
2. Create repository in `src/repositories/` extending `BaseRepository`
3. Register in container
4. Use in services

### **Handle Errors Properly**

```typescript
import { ValidationError, AuthError, NotFoundError } from "../errors";

// In service:
if (!user) throw new NotFoundError("User not found");
if (user.role !== "admin") throw new AuthError("Unauthorized");

// Error middleware catches all and sends consistent response
```

---

## 🤖 For AI Agents: Quick Commands

**When asked to implement a feature:**

1. Check `BACKEND_STATUS.md` to see if it's mocked or planned
2. Look for existing patterns in completed code
3. Run `npm test` before and after to validate changes
4. Follow naming conventions (camelCase functions, PascalCase classes)
5. Always add tests in `tests/integration/` for new routes

**When debugging issues:**

1. Check Winston logs in `logs/` directory
2. Look at error stack in `src/errors/` custom error classes
3. Verify Auth middleware is not blocking: `x-user-role` header in tests
4. Check service container wiring in `src/config/container.ts`

**When performance is slow:**

1. Check MongoDB indexes in `src/infrastructure/database/schemas/`
2. Verify Bull/Redis queue is active for long-running jobs
3. Look at Tesseract.js OCR timing (usually 5-10s per document)
4. Check LangChain agent calls (OpenAI API delays)

---

## 📞 Quick Reference: Route Categories

- **System (7 routes):** API overview, health check, module listing
- **Auth (5 routes):** Register, login, refresh, logout, profile
- **Documents (4 routes):** Upload, list, details, delete
- **Analysis (6 routes):** OCR, full analysis, anomaly detection, risk score
- **History (2 routes):** User lookup, admin search
- **Reports (7 routes):** Create, list, details, review, PDF download
- **Jobs (5 routes):** Create, list, retry, cancel, status

**View complete route catalog:** [backend/src/docs/index.ts](backend/src/docs/index.ts)

---

## ✨ Next Steps for Agents

1. **Start with Priority 1:** Implement real OCR in `src/services/analysis.service.ts`
2. **Then Priority 2:** Write integration tests for auth, documents, analysis
3. **Then Priority 3:** Activate Bull queue for async jobs
4. **Finally Priority 4:** Add persistence-backed history

Each task has tests to verify correctness. Run `npm test` frequently!
