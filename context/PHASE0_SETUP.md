# ⏳ PHASE 0: Backend Environment Setup

**Duration:** 10 minutes  
**Objective:** Setup local development environment with all dependencies

---

## Prerequisites

- **Node.js:** 18.0.0 or higher
- **npm:** 9.0.0 or higher
- **MongoDB:** 5.0 or higher (local or Docker)
- **Redis:** 6.0 or higher (local or Docker)

---

## Step 1: Verify Node.js & npm

```bash
node --version  # Should be v18.0.0+
npm --version   # Should be 9.0.0+

# If not installed, download from https://nodejs.org
```

---

## Step 2: Navigate to Backend

```bash
cd backend
ls -la  # Verify folder structure exists
```

---

## Step 3: Install Dependencies

```bash
npm install

# This installs:
# - Express.js (web framework)
# - Mongoose (MongoDB ODM)
# - Redis client
# - Bull (job queue)
# - LangChain.js (AI framework)
# - Tesseract.js (OCR)
# - JWT & bcryptjs (auth)
# - And 15+ more dependencies
```

**Expected output:** `added XXX packages in X minutes`

---

## Step 4: Create Environment File

```bash
# Copy example .env
cp .env.example .env

# Edit .env with your values
# nano .env  (Linux/Mac)
# notepad .env  (Windows)
```

**Required Variables:**

```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/securedocs
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key-here-change-in-production
OPENAI_API_KEY=sk-... (get from OpenAI)
GOOGLE_GEMINI_KEY=... (optional)
```

---

## Step 5: Start MongoDB

### Option A: Docker (Recommended)

```bash
# Create MongoDB container
docker run -d --name mongodb -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=password mongo:7

# Verify it's running
docker ps | grep mongodb
```

### Option B: Local Installation

```bash
# macOS
brew services start mongodb-community

# Ubuntu/Debian
sudo systemctl start mongod

# Windows
# Start from Services app or: mongod.exe (from installation directory)
```

**Test connection:**

```bash
mongosh  # Or: mongo
```

---

## Step 6: Start Redis

### Option A: Docker (Recommended)

```bash
# Create Redis container
docker run -d --name redis -p 6379:6379 redis:7-alpine

# Verify it's running
docker ps | grep redis
```

### Option B: Local Installation

```bash
# macOS
brew services start redis

# Ubuntu/Debian
sudo systemctl start redis-server

# Windows
# Use WSL or: redis-server.exe (from installation directory)
```

**Test connection:**

```bash
redis-cli ping  # Should return: PONG
```

---

## Step 7: Verify Services

```bash
# MongoDB
mongosh --eval "db.version()" > /dev/null && echo "✓ MongoDB OK" || echo "✗ MongoDB Failed"

# Redis
redis-cli ping | grep PONG > /dev/null && echo "✓ Redis OK" || echo "✗ Redis Failed"

# Node modules
test -d node_modules && echo "✓ Dependencies OK" || echo "✗ Dependencies Failed"

# .env file
test -f .env && echo "✓ .env OK" || echo "✗ .env Failed"
```

---

## Step 8: Start Development Server

```bash
npm run dev

# Expected output:
# ✓ Server running on http://localhost:5000
# ✓ MongoDB connected
# ✓ Redis connected
```

---

## Step 9: Test Health Endpoint

In a new terminal:

```bash
curl http://localhost:5000/health

# Expected response:
# {
#   "status": "ok",
#   "timestamp": "2024-01-15T10:30:00Z",
#   "uptime": 5
# }
```

---

## Troubleshooting

### Port 5000 Already in Use

```bash
# Change PORT in .env
PORT=5001
npm run dev
```

### MongoDB Connection Error

```bash
# Check if mongod is running
ps aux | grep mongod

# Or check Docker
docker ps | grep mongodb

# Start MongoDB if not running
docker run -d --name mongodb -p 27017:27017 mongo:7
```

### Redis Connection Error

```bash
# Check if Redis is running
redis-cli ping

# Or check Docker
docker ps | grep redis

# Start Redis if not running
docker run -d --name redis -p 6379:6379 redis:7-alpine
```

### Module Not Found Error

```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

### dotenv Error

```bash
# Ensure .env file exists and is readable
test -f .env && echo "File exists" || echo "Create .env"
cat .env | head -5  # Check content
```

---

## Folder Structure Overview

After setup, your `backend/` should have:

```
backend/
├── src/
│   ├── config/           # DI Container (factories created here)
│   ├── core/             # Base classes & interfaces (SOLID)
│   ├── domain/           # Business logic (entities, use cases)
│   ├── repositories/     # Data access layer
│   ├── services/         # Business services
│   ├── controllers/      # HTTP handlers
│   ├── routes/           # Route definitions
│   ├── middleware/       # Express middleware
│   ├── validators/       # Input validation
│   ├── infrastructure/   # DB, Cache, AI, Storage
│   ├── utils/            # Shared utilities
│   ├── app.js            # Express setup
│   └── index.js          # Entry point
├── scripts/              # Migrations & seeds
├── tests/                # Test files
├── node_modules/         # Dependencies (created after npm install)
├── .env                  # Environment variables (created)
├── package.json          # Dependencies list
└── README.md             # Development guide
```

---

## NPM Scripts Available

```bash
# Development
npm run dev              # Start with auto-reload (nodemon)
npm start                # Production mode

# Testing
npm test                 # Run all tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Coverage report

# Code Quality
npm run lint             # Check code with ESLint
npm run format           # Format with Prettier

# Database
npm run migrate:up       # Run migrations
npm run migrate:down     # Rollback migrations
npm run seed             # Populate test data
```

---

## ✅ Completion Checklist

- [x] Node.js 18+ installed
- [x] npm install completed
- [x] .env file created
- [x] MongoDB running
- [x] Redis running
- [x] `npm run dev` working
- [x] Health endpoint responding
- [x] All services verified

**Status:** ✅ PHASE 0 Complete!

---

## Next Steps

👉 Move to **PHASE 1: Core Architecture**

This will establish:

- Dependency Injection container (`config/container.js`)
- Base interfaces and classes (`core/`)
- Error handling system
- First service implementation example

**Duration:** 3-4 hours
