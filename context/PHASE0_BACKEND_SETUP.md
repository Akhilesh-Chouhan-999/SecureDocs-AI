# 🚀 PHASE 0: Backend Environment Setup

## Objective

Install dependencies, verify Node.js environment, and prepare the development environment.

**Duration:** 10 minutes  
**Status:** ⏳ Starting Point

---

## 📋 Prerequisites Checklist

- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm 9+ installed (`npm --version`)
- [ ] Git configured
- [ ] Code editor ready (VS Code, WebStorm, etc.)
- [ ] Terminal/PowerShell access
- [ ] Administrator access for package installation

---

## Step 1: Verify Node.js Installation

```bash
# Check Node.js version
node --version
# Should show: v18.x.x or higher

# Check npm version
npm --version
# Should show: 9.x.x or higher
```

If not installed, download from [nodejs.org](https://nodejs.org)

---

## Step 2: Clone & Navigate to Backend

```bash
# Navigate to project directory
cd "C:\Users\chouh\OneDrive\Desktop\SecureDocs AI"

# Navigate to backend folder
cd backend

# Verify structure
ls -la
# Should show: src/, package.json, etc.
```

---

## Step 3: Install Backend Dependencies

```bash
# Install all npm packages from package.json
npm install

# This installs:
# ✓ Express.js (REST API framework)
# ✓ MongoDB & Mongoose (Database)
# ✓ LangChain.js (AI orchestration)
# ✓ JWT & bcryptjs (Authentication)
# ✓ Tesseract.js (OCR)
# ✓ Bull & Redis (Job queue)
# ✓ Jest & Supertest (Testing)
# ✓ Nodemon (Development auto-reload)
# ... and more
```

**Expected output:**

```
added XXX packages in X.XXs
```

---

## Step 4: Create .env File

```bash
# Copy example env file
cp .env.example .env

# Edit .env and add your API keys
# See @file:context/API_KEYS_SETUP.md for details
```

### Minimal .env Configuration

```env
# === Core ===
NODE_ENV=development
PORT=5000

# === Database ===
MONGODB_URI=mongodb://localhost:27017/securedoc_ai

# === Authentication ===
JWT_SECRET=generate-with-node-crypto-randomBytes-32
JWT_EXPIRY=15m

# === LLM (Choose one) ===
OPENAI_API_KEY=sk-your-key-here

# === Redis ===
REDIS_URL=redis://localhost:6379

# === Logging ===
LOG_LEVEL=debug
```

**To generate JWT_SECRET:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Step 5: Verify Folder Structure

```
backend/
├── src/
│   ├── config/           # 🔧 Configuration & DI container
│   ├── core/             # 📦 Base classes, factories, interfaces
│   ├── domain/           # 🎯 Business logic (entities, use cases)
│   ├── infrastructure/   # 🔌 External services (DB, cache, AI)
│   ├── api/              # 🌐 REST API (routes, controllers)
│   ├── services/         # 🛠️ Business services
│   ├── utils/            # 🔨 Helpers & validators
│   └── scripts/          # 📜 Database migrations, seeding
├── package.json          # Dependencies
├── .env                  # Environment variables (DO NOT COMMIT!)
└── PHASE0_BACKEND_SETUP.md
```

---

## Step 6: Install External Services

### MongoDB (Local Development)

**Option A: Using Docker**

```bash
# Install Docker from https://www.docker.com/

# Run MongoDB container
docker run -d -p 27017:27017 --name mongodb mongo:7
```

**Option B: Local Installation**

```bash
# macOS
brew install mongodb-community
brew services start mongodb-community

# Windows
# Download from: https://www.mongodb.com/try/download/community
# Run installer & follow wizard

# Ubuntu/Linux
sudo apt-get install -y mongodb
sudo service mongod start
```

### Redis (Cache & Job Queue)

**Option A: Using Docker**

```bash
# Run Redis container
docker run -d -p 6379:6379 --name redis redis:7-alpine
```

**Option B: Local Installation**

```bash
# macOS
brew install redis
redis-server

# Windows (WSL2)
wsl
sudo apt-get install redis-server
redis-server

# Ubuntu/Linux
sudo apt-get install redis-server
redis-server
```

### Verify Services Running

```bash
# Check MongoDB
mongo --eval "db.version()"
# or
mongosh --eval "db.version()"

# Check Redis
redis-cli ping
# Response: PONG ✓
```

---

## Step 7: NPM Scripts Overview

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Lint code
npm run lint

# Format code
npm run format

# Database migrations
npm run migrate:up
npm run migrate:down

# Seed test data
npm run seed
```

---

## Step 8: Test Your Setup

### Health Check

```bash
# Start backend (in new terminal)
npm run dev

# In another terminal, test API
curl http://localhost:5000/health

# Expected response:
# {"status":"ok","timestamp":"2025-05-15T...","uptime":...}
```

---

## 📊 Folder Structure Explanation (SOLID Principles)

### 🔧 `config/`

**Purpose:** Configuration management & Dependency Injection

**SOLID:** Dependency Inversion Principle (DIP)

- Centralized DI container
- Environment variable management
- Service instantiation factory

```
config/
├── di.js           # Dependency Injection container
├── env.js          # Environment variables validator
├── database.js     # MongoDB connection
├── redis.js        # Redis connection
└── llm.js          # LangChain configuration
```

### 📦 `core/`

**Purpose:** Base classes, interfaces, factories (Framework foundation)

**SOLID:** Single Responsibility, Open/Closed

- Abstract base classes
- Interface definitions
- Factory Pattern implementations

```
core/
├── interfaces/
│   ├── IRepository.js      # Generic repository interface
│   ├── IService.js         # Generic service interface
│   └── IController.js      # Generic controller interface
├── factories/
│   ├── ServiceFactory.js   # Factory for creating services
│   ├── ControllerFactory.js
│   └── RepositoryFactory.js
└── di/
    └── Container.js        # DI container implementation
```

### 🎯 `domain/`

**Purpose:** Business logic (Clean Architecture core)

**SOLID:** Liskov Substitution, Interface Segregation

- Entities: Core business objects
- Repositories: Data access abstraction
- Use Cases: Business logic orchestration

```
domain/
├── entities/
│   ├── User.entity.js
│   ├── Document.entity.js
│   └── FraudReport.entity.js
├── repositories/
│   ├── IUserRepository.js
│   ├── IDocumentRepository.js
│   └── IFraudReportRepository.js
└── usecases/
    ├── auth/
    │   ├── RegisterUser.usecase.js
    │   └── LoginUser.usecase.js
    ├── documents/
    │   ├── UploadDocument.usecase.js
    │   └── GetDocument.usecase.js
    └── analysis/
        ├── AnalyzeDocument.usecase.js
        └── GenerateReport.usecase.js
```

### 🔌 `infrastructure/`

**Purpose:** External service implementations

**SOLID:** Dependency Inversion (Concrete implementations)

```
infrastructure/
├── database/
│   ├── models/          # Mongoose schemas
│   ├── repositories/    # Repository implementations
│   └── migrations/
├── cache/
│   ├── RedisClient.js
│   └── CacheService.js
├── queue/
│   ├── BullQueue.js
│   └── JobWorkers.js
├── ai/
│   ├── LangChainClient.js
│   ├── agents/
│   ├── tools/
│   └── prompts/
└── storage/
    └── FileStorage.js
```

### 🌐 `api/`

**Purpose:** HTTP API layer

**SOLID:** Single Responsibility (Each controller = one endpoint group)

```
api/
├── routes/
│   ├── auth.routes.js
│   ├── documents.routes.js
│   ├── analysis.routes.js
│   └── reports.routes.js
├── controllers/
│   ├── auth.controller.js
│   ├── documents.controller.js
│   ├── analysis.controller.js
│   └── reports.controller.js
├── middlewares/
│   ├── auth.middleware.js
│   ├── errorHandler.js
│   └── validation.js
└── validators/
    ├── auth.validator.js
    └── document.validator.js
```

### 🛠️ `services/`

**Purpose:** Business service layer

**SOLID:** Single Responsibility (Each service = one business domain)

```
services/
├── auth.service.js         # Auth logic
├── document.service.js     # Document management
├── analysis.service.js     # Analysis orchestration
├── report.service.js       # Report generation
└── ocr.service.js          # OCR processing
```

### 🔨 `utils/`

**Purpose:** Shared utilities & helpers

```
utils/
├── logger.js               # Winston logging
├── validators.js           # Input validation (Joi schemas)
├── errors.js               # Custom error classes
├── helpers.js              # Common helpers
└── constants.js            # App constants
```

---

## Step 9: Verify Everything Works

```bash
# 1. Start MongoDB (in Terminal 1)
mongod

# 2. Start Redis (in Terminal 2)
redis-server

# 3. Start Backend (in Terminal 3)
npm run dev

# 4. Test in Terminal 4
curl http://localhost:5000/health
```

**Expected output:**

```json
{
  "status": "ok",
  "timestamp": "2025-05-15T10:30:00.000Z",
  "uptime": 5.234
}
```

---

## 🚨 Troubleshooting

| Issue                        | Solution                            |
| ---------------------------- | ----------------------------------- |
| `npm: command not found`     | Install Node.js from nodejs.org     |
| `Port 5000 already in use`   | Change PORT in .env or kill process |
| `MongoDB connection refused` | Start mongod: `mongod`              |
| `Redis connection refused`   | Start redis: `redis-server`         |
| `Module not found`           | Run `npm install` again             |
| `Permission denied`          | Run with sudo or use Docker         |

---

## ✅ Phase 0 Completion Checklist

- [ ] Node.js 18+ verified
- [ ] npm 9+ verified
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file created & configured
- [ ] Folder structure verified
- [ ] MongoDB running locally
- [ ] Redis running locally
- [ ] Backend starts: `npm run dev`
- [ ] Health check responds: `curl http://localhost:5000/health`
- [ ] No console errors

---

## 📝 Next Steps

Once Phase 0 is complete, proceed to:

**PHASE 1: Core Architecture & SOLID Implementation**

- Setup Dependency Injection Container
- Create base classes & interfaces
- Implement Factory patterns
- Setup error handling

See: `PHASE1_CORE_ARCHITECTURE.md`

---

## 🔗 Related Documentation

- 📖 Full Setup: `@file:context/BACKEND_SETUP.md`
- 🔑 API Keys: `@file:context/API_KEYS_SETUP.md`
- 🧪 Testing: `@file:context/TESTING_QA.md`
- 📦 Dependencies: `package.json`
