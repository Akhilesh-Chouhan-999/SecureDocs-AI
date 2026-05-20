# SecureDoc AI - Complete Project Documentation

**Last Updated:** May 20, 2026  
**Status:** Architecture Documented | Implementation In Progress  
**Stack:** Node.js + React | Express + MongoDB | LangChain.js + ChromaDB

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Folder Structure](#folder-structure)
5. [API Reference](#api-reference)
6. [Setup Instructions](#setup-instructions)
7. [Development Guide](#development-guide)
8. [Implementation Status](#implementation-status)

---

## 🎯 Project Overview

### What is SecureDoc AI?

SecureDoc AI is an intelligent document verification and fraud detection platform for financial institutions. It automates document analysis, detects anomalies, and provides explainable AI-driven fraud risk assessments.

### Core Capabilities

- **Document Upload & Management** - Handle PDF and image uploads with validation
- **OCR Extraction** - Extract text from documents using Tesseract.js (client-side or server-side)
- **Document Parsing** - Structure extracted text into JSON with key fields
- **Historical Analysis** - Compare against previous ownership and financial records
- **Anomaly Detection** - Identify discrepancies, ownership mismatches, financial irregularities
- **Risk Scoring** - Calculate composite risk scores (Low/Medium/High/Critical)
- **Fraud Insights** - Generate AI-powered explanations using LangChain agents
- **Real-time Dashboard** - Monitor documents, view anomalies, track reports
- **Exportable Reports** - Generate and download detailed PDF reports

### Key Benefits

- **Reduce Fraud Risk** - Automated detection catches suspicious documents
- **Speed Up Underwriting** - AI handles verification in seconds
- **Improve Accuracy** - ML-powered anomaly detection reduces human error
- **Explainable AI** - Every fraud flag includes reasoning
- **Audit Trail** - Complete history of analysis and decisions

---

## 🏗️ System Architecture

### High-Level Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER (React)                         │
│  Dashboard | Upload Interface | Report Viewer                   │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS/REST APIs
┌──────────────────────────┴──────────────────────────────────────┐
│                    API LAYER (Express)                          │
│  Auth | File Upload | Database Ops | Queue Management           │
└──────────────────────────┬──────────────────────────────────────┘
           │               │               │              │
      Database        Queue/Events    AI Service      Storage
           │               │               │              │
      ┌────┴─────┐    ┌────┴─────┐   ┌──┴──────┐   ┌───┴────┐
      │ MongoDB   │    │ Redis    │   │LangChain│   │ File   │
      │           │    │ (Cache)  │   │ + LLM   │   │ System │
      └───────────┘    └──────────┘   └─────────┘   └────────┘
             │
       ┌─────┴──────┐
       │            │
   ┌───┴──┐    ┌───┴────┐
   │ Users│    │ Reports│
   └──────┘    └────────┘

                         AI Processing Pipeline
         ┌────────────────────────────────────────────────┐
         │                                                │
    PDF/Image                                    Risk Score
         │                                            │
         ├─→ OCR (Tesseract.js)                       │
         │                                            │
         ├─→ Text Parsing & Structuring               │
         │                                            │
         ├─→ Historical Record Lookup (RAG)           │
         │                                            │
         ├─→ Anomaly Detection                        │
         │                                            │
         ├─→ LLM Analysis (LangChain Agent)           │
         │                                            │
         └─→ Report Generation ──────────────────────┘
```

### Layered Architecture

#### 1. Presentation Layer (React Frontend)

- Dashboard with real-time analytics
- Document upload interface
- Report viewer and exporter
- User authentication UI
- Real-time notifications via WebSocket

#### 2. API Layer (Express Backend)

- RESTful API endpoints
- JWT authentication & authorization
- Business logic orchestration
- Request validation
- Error handling

#### 3. AI Processing Layer (Node.js)

- **OCR Service** - Tesseract.js text extraction
- **Document Parser** - Structured data extraction
- **RAG Pipeline** - ChromaDB semantic search
- **LangChain Agents** - LLM orchestration
- **Anomaly Detector** - Pattern and outlier detection
- **Risk Scorer** - Composite risk calculation

#### 4. Data Layer

- **MongoDB** - User data, documents, reports, historical records
- **ChromaDB** - Vector embeddings for RAG
- **Redis** - Cache and session storage
- **File Storage** - Uploaded PDFs and extracted data

---

## 💾 Technology Stack

| Layer            | Technology        | Purpose                          |
| ---------------- | ----------------- | -------------------------------- |
| **Frontend**     | React 18+         | UI Dashboard & Document Viewer   |
| **Backend**      | Node.js + Express | REST API & Business Logic        |
| **LLM**          | LangChain.js      | AI Agent Orchestration           |
| **LLM Provider** | OpenAI/Gemini     | Generative AI Models             |
| **OCR**          | Tesseract.js      | Text Extraction from PDFs/Images |
| **Vector DB**    | ChromaDB          | Embeddings & Semantic Search     |
| **Database**     | MongoDB           | Document & User Storage          |
| **Cache**        | Redis             | Session & Cache Management       |
| **Queue**        | Bull/Redis        | Async Job Processing             |
| **Auth**         | JWT + bcrypt      | Authentication & Security        |
| **File Upload**  | Multer            | Multipart Form Handling          |
| **Real-time**    | Socket.IO         | WebSocket Communication          |
| **Validation**   | Joi/Zod           | Input Schema Validation          |
| **Testing**      | Jest              | Unit & Integration Tests         |
| **Deployment**   | Docker            | Containerization                 |

### Why This Stack?

- **100% JavaScript** - No Python dependencies
- **Scalable** - All components can be horizontally scaled
- **Modern** - Latest stable versions of all libraries
- **Production-Ready** - Proven technologies in fintech
- **Open Source** - No vendor lock-in

---

## 📁 Folder Structure (Updated)

### Backend Structure

```
backend/
├── src/
│   ├── index.js                 # Entry point (exports server.js)
│   ├── app.js                   # Express app assembly
│   ├── server.js                # Server startup
│   │
│   ├── config/                  # Environment & DI Container
│   │   ├── env.js              # Environment variables
│   │   ├── database.js         # MongoDB connection
│   │   ├── container.js        # Dependency injection
│   │   └── llm.js              # LangChain setup
│   │
│   ├── constants/              # Enums & shared constants
│   │   ├── errors.js           # Error codes
│   │   ├── statuses.js         # Job/Report statuses
│   │   └── limits.js           # File size, rate limits
│   │
│   ├── types/                  # Type definitions
│   │   ├── routes.js           # Route groups
│   │   ├── documents.ts        # Document types
│   │   └── analysis.ts         # Analysis types
│   │
│   ├── interfaces/             # DI Token list
│   │   ├── IRepository.js      # Repository contract
│   │   ├── IService.js         # Service contract
│   │   └── IController.js      # Controller contract
│   │
│   ├── core/                   # Base classes & rules
│   │   ├── BaseError.js        # Error handling
│   │   ├── BaseRepository.js   # Repository base
│   │   └── BaseService.js      # Service base
│   │
│   ├── domain/                 # Business logic & rules
│   │   ├── entities/           # Data models
│   │   │   ├── User.js
│   │   │   ├── Document.js
│   │   │   └── FraudReport.js
│   │   └── usecases/           # Business rules
│   │       ├── riskScoring.js
│   │       ├── anomalyRules.js
│   │       └── fraudDetection.js
│   │
│   ├── infrastructure/         # Technical implementations
│   │   ├── database/
│   │   │   ├── models/         # Mongoose schemas
│   │   │   │   ├── User.js
│   │   │   │   ├── Document.js
│   │   │   │   ├── FraudReport.js
│   │   │   │   └── HistoricalRecord.js
│   │   │   └── migrations/     # Schema migrations
│   │   ├── ai/
│   │   │   ├── tools/          # LangChain tools
│   │   │   │   ├── historicalLookup.js
│   │   │   │   ├── financialAnalysis.js
│   │   │   │   └── anomalyDetector.js
│   │   │   └── agents/         # LangChain agents
│   │   │       ├── ocrAgent.js
│   │   │       ├── fraudDetectionAgent.js
│   │   │       └── reportAgent.js
│   │   ├── cache/              # Redis cache layer
│   │   │   ├── redis.js        # Connection
│   │   │   └── strategies/     # Cache patterns
│   │   ├── storage/            # File storage
│   │   │   └── fileStorage.js
│   │   └── queue/
│   │       ├── bull.js         # Queue setup
│   │       └── workers/        # Job workers
│   │           └── analysisWorker.js
│   │
│   ├── repositories/           # Persistence layer
│   │   ├── UserRepository.js
│   │   ├── DocumentRepository.js
│   │   ├── ReportRepository.js
│   │   └── HistoricalRepository.js
│   │
│   ├── services/               # Business workflows
│   │   ├── AuthService.js
│   │   ├── DocumentService.js
│   │   ├── AnalysisService.js
│   │   ├── ReportService.js
│   │   ├── OCRService.js       # Tesseract wrapper
│   │   ├── RAGService.js       # ChromaDB integration
│   │   ├── AnomalyService.js
│   │   └── RiskScoringService.js
│   │
│   ├── controllers/            # HTTP handlers
│   │   ├── AuthController.js
│   │   ├── DocumentController.js
│   │   ├── AnalysisController.js
│   │   ├── ReportController.js
│   │   └── SystemController.js
│   │
│   ├── routes/                 # Route definitions
│   │   ├── auth.routes.js
│   │   ├── documents.routes.js
│   │   ├── analysis.routes.js
│   │   ├── reports.routes.js
│   │   ├── jobs.routes.js
│   │   ├── history.routes.js
│   │   └── system.routes.js
│   │
│   ├── middleware/             # Request processing
│   │   ├── auth.middleware.js      # JWT verification
│   │   ├── errorHandler.js        # Error handling
│   │   ├── validation.middleware.js # Input validation
│   │   ├── upload.middleware.js    # File upload
│   │   └── cors.middleware.js      # CORS setup
│   │
│   ├── validators/             # Input validation schemas
│   │   ├── auth.validators.js
│   │   ├── document.validators.js
│   │   └── analysis.validators.js
│   │
│   ├── ai/                     # AI workflow helpers
│   │   ├── prompts/            # Prompt templates
│   │   │   ├── systemPrompt.js
│   │   │   ├── anomalyPrompt.js
│   │   │   └── reportPrompt.js
│   │   ├── parsers/            # Output parsing
│   │   ├── embeddings/         # Embedding utils
│   │   ├── ingestion/          # Document ingestion
│   │   ├── memory/             # Agent memory
│   │   ├── rag/                # RAG implementation
│   │   └── workflows/          # Orchestration
│   │
│   ├── events/                 # Event definitions
│   │   └── jobEvents.js        # Job lifecycle events
│   │
│   ├── listeners/              # Event handlers
│   │   └── jobListeners.js     # Job event handlers
│   │
│   ├── jobs/                   # Job builders
│   │   └── AnalysisJob.js
│   │
│   ├── helpers/                # Utility functions
│   │   ├── objectHelpers.js
│   │   ├── textHelpers.js
│   │   └── dateHelpers.js
│   │
│   ├── utils/                  # Response & token utils
│   │   ├── response.js         # API response format
│   │   ├── tokenUtils.js       # JWT generation
│   │   └── validators.js       # Input validation
│   │
│   ├── logs/                   # Logging
│   │   └── logger.js           # JSON logger
│   │
│   ├── uploads/                # Upload config
│   │   └── config.js           # Multer settings
│   │
│   ├── docs/                   # Documentation
│   │   └── index.js            # Route catalog (36 routes)
│   │
│   ├── sockets/                # WebSocket handlers
│   │   └── socket.js           # Socket.IO setup
│   │
│   └── schedulers/             # Scheduled tasks
│       └── registry.js         # Task definitions
│
├── .env.example                # Environment template
├── .gitignore
├── package.json
├── Dockerfile
├── docker-compose.yml
└── README.md
```

### Frontend Structure

```
frontend/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── common/             # Reusable components
│   │   │   ├── Header.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Loading.jsx
│   │   │   └── Button.jsx
│   │   ├── auth/               # Authentication UI
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── documents/          # Document management
│   │   │   ├── DocumentUpload.jsx
│   │   │   ├── DocumentList.jsx
│   │   │   └── DocumentViewer.jsx
│   │   ├── analysis/           # Analysis display
│   │   │   ├── FraudCard.jsx
│   │   │   ├── RiskIndicator.jsx
│   │   │   └── AnomalyList.jsx
│   │   ├── reports/            # Report display
│   │   │   ├── ReportViewer.jsx
│   │   │   ├── ReportDownload.jsx
│   │   │   └── ReportHistory.jsx
│   │   └── dashboard/          # Dashboard
│   │       ├── Dashboard.jsx
│   │       ├── AnomalySummary.jsx
│   │       └── Analytics.jsx
│   ├── pages/                  # Page components
│   │   ├── HomePage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── DocumentsPage.jsx
│   │   ├── ReportsPage.jsx
│   │   └── NotFound.jsx
│   ├── services/               # API clients
│   │   ├── api.js             # Axios instance
│   │   ├── authService.js
│   │   ├── documentService.js
│   │   ├── analysisService.js
│   │   └── reportService.js
│   ├── store/                  # State management (Zustand)
│   │   ├── authStore.js
│   │   ├── documentStore.js
│   │   └── analysisStore.js
│   ├── hooks/                  # Custom React hooks
│   │   ├── useAuth.js
│   │   ├── useDocument.js
│   │   └── useFetch.js
│   ├── utils/                  # Utilities
│   │   ├── constants.js
│   │   ├── helpers.js
│   │   └── validators.js
│   ├── styles/                 # CSS/Tailwind
│   │   ├── index.css
│   │   └── tailwind.css
│   ├── App.jsx
│   └── index.js
├── package.json
├── tailwind.config.js
├── .env.example
└── README.md
```

---

## 🔌 API Reference

### Authentication Endpoints

```
POST   /api/auth/register              # Register new user
POST   /api/auth/login                 # Login user
POST   /api/auth/refresh-token         # Rotate access token
POST   /api/auth/logout                # Logout user
GET    /api/auth/profile               # Get current user profile
```

### Document Endpoints

```
POST   /api/documents/upload           # Upload new document
GET    /api/documents                  # List user documents
GET    /api/documents/:id              # Get document details
DELETE /api/documents/:id              # Delete document
```

### Analysis Endpoints

```
POST   /api/analysis/analyze           # Full document analysis
POST   /api/analysis/ocr               # Extract OCR text only
POST   /api/analysis/anomalies         # Detect anomalies
POST   /api/analysis/risk-score        # Calculate risk score
GET    /api/analysis/status/:docId     # Get analysis progress
GET    /api/analysis/results/:docId    # Get analysis results
```

### Reports Endpoints

```
GET    /api/reports                    # List all reports
GET    /api/reports/:id                # Get report details
GET    /api/reports/:id/download       # Download PDF report
POST   /api/reports/:id/review         # Submit review
DELETE /api/reports/:id                # Delete report
```

### Jobs Endpoints

```
GET    /api/jobs                       # List all jobs
POST   /api/jobs/analysis              # Queue analysis job
GET    /api/jobs/:id/status            # Get job status
POST   /api/jobs/:id/retry             # Retry failed job
POST   /api/jobs/:id/cancel            # Cancel job
```

### History & Admin Endpoints

```
GET    /api/history/:email             # Lookup user history
GET    /api/history/search             # Admin search
GET    /api/system/health              # Health check
GET    /api/system/ready               # Readiness check
```

---

## ⚙️ Setup Instructions

### Prerequisites

- **Node.js** 18+ (with npm)
- **MongoDB** (local or Atlas)
- **Redis** (for caching & queue)
- **API Keys**:
  - OpenAI API key (for LLM)
  - Optional: Google Gemini API key

### Step 1: Clone & Install

```bash
git clone <repository-url>
cd backend
npm install

cd ../frontend
npm install
```

### Step 2: Configure Environment

**Backend (.env)**

```env
# Required
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/securedoc_ai
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secure-secret-key
OPENAI_API_KEY=sk-your-openai-key

# Optional
GEMINI_API_KEY=your-gemini-key
FILE_UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

# API Configuration
API_TIMEOUT=30000
API_MAX_REQUESTS=100
API_WINDOW_MS=900000
```

**Frontend (.env)**

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
```

### Step 3: Start Services

```bash
# Terminal 1: MongoDB
mongod

# Terminal 2: Redis
redis-server

# Terminal 3: Backend
cd backend
npm run dev

# Terminal 4: Frontend (in new terminal)
cd frontend
npm start
```

### Step 4: Verify Installation

```bash
# Health check
curl http://localhost:5000/health

# Should return:
# {"status":"ok","timestamp":"2025-05-20T10:30:00Z"}
```

---

## 👨‍💻 Development Guide

### Code Standards

**Naming Conventions:**

- Variables & Functions: `camelCase`
- Components: `PascalCase`
- Classes: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`

**Code Organization:**

- Controllers handle HTTP requests
- Services contain business logic
- Repositories handle data access
- Middleware processes requests
- Utils contain shared helpers

**Error Handling:**

```javascript
// Use custom errors
throw new ValidationError("Invalid input", { field: "email" });
throw new AuthError("Unauthorized");
throw new NotFoundError("Document not found");
```

**Async Operations:**

```javascript
// Always use async-await, never raw promises
async function processDocument(id) {
  try {
    const doc = await documentService.getById(id);
    const analysis = await analysisService.analyze(doc);
    return analysis;
  } catch (error) {
    logger.error("Analysis failed", { error, docId: id });
    throw error;
  }
}
```

### Testing

**Unit Tests**

```bash
npm test
npm test -- --coverage
```

**Integration Tests**

```bash
npm run test:integration
```

**E2E Tests**

```bash
npm run test:e2e
```

### Git Workflow

```
feat: add OCR pipeline
fix: resolve upload validation bug
refactor: improve anomaly service
docs: update API documentation
test: add unit tests for risk scoring
```

---

## 📊 Implementation Status

### ✅ Completed (Documentation Phase)

- [x] Architecture designed
- [x] Folder structure planned
- [x] API routes documented (36 routes)
- [x] Database schema designed
- [x] Technology stack finalized
- [x] Development environment documented
- [x] Security approach defined
- [x] Testing strategy outlined

### ⏳ In Progress

- [ ] Backend dependency installation
- [ ] MongoDB connection & models
- [ ] Express middleware setup
- [ ] JWT authentication
- [ ] File upload handlers

### 📋 Remaining Features

**Phase 0 - Environment Setup (10 min)**

- [ ] npm install all dependencies
- [ ] Create .env files
- [ ] Test database connections
- [ ] Verify API keys

**Phase 1 - Core Backend (3-4 hrs)**

- [ ] DI Container implementation
- [ ] Base classes (Repository, Service, Controller)
- [ ] User authentication (register, login)
- [ ] Database models for User, Document
- [ ] JWT token management

**Phase 2 - OCR Pipeline (2-3 hrs)**

- [ ] Tesseract.js setup
- [ ] OCR service wrapper
- [ ] Document text extraction
- [ ] Confidence scoring
- [ ] Error handling for low-quality images

**Phase 3 - LangChain Integration (2-3 hrs)**

- [ ] LangChain configuration
- [ ] OpenAI/Gemini client setup
- [ ] Prompt templates
- [ ] Basic LLM agent creation
- [ ] Tool definitions for agents

**Phase 4 - Historical Data & RAG (2-3 hrs)**

- [ ] ChromaDB setup
- [ ] Embedding generation
- [ ] Vector storage
- [ ] Semantic search implementation
- [ ] RAG chain for context retrieval

**Phase 5 - Anomaly Detection (2-3 hrs)**

- [ ] Ownership mismatch detection
- [ ] Financial anomaly detection
- [ ] Metadata validation
- [ ] Confidence scoring
- [ ] Risk level mapping

**Phase 6 - Job Queue (3-4 hrs)**

- [ ] Bull queue setup
- [ ] Analysis job processor
- [ ] Job status tracking
- [ ] Retry mechanism
- [ ] Error recovery

**Phase 7 - Reports (2-3 hrs)**

- [ ] PDF generation
- [ ] Report storage
- [ ] Report retrieval
- [ ] Download functionality
- [ ] Email integration

**Phase 8 - Real-time Features (2-3 hrs)**

- [ ] Socket.IO setup
- [ ] Job progress updates
- [ ] Notification system
- [ ] Live dashboard updates

**Phase 9 - Testing (2-3 hrs)**

- [ ] Unit tests (80% coverage)
- [ ] Integration tests
- [ ] E2E tests
- [ ] Performance testing

**Phase 10 - Frontend Implementation (4-5 hrs)**

- [ ] React setup & components
- [ ] Authentication UI
- [ ] Document upload interface
- [ ] Dashboard & analytics
- [ ] Report viewer

**Phase 11 - Deployment (3-4 hrs)**

- [ ] Docker containerization
- [ ] Kubernetes manifests
- [ ] CI/CD pipeline
- [ ] Cloud deployment (AWS/GCP/Azure)
- [ ] Monitoring & logging

**Total Remaining: 40-50 hours**

---

## 🚀 Quick Start Commands

```bash
# Clone & setup
git clone <repo-url>
cd backend && npm install && cd ../frontend && npm install

# Environment setup
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# Edit both .env files with your keys

# Start all services
npm run dev:all

# Or individually
npm run dev:backend
npm run dev:frontend

# Testing
npm run test

# Deployment
npm run build
docker-compose up -d
```

---

## 📞 Support & Troubleshooting

### Common Issues

| Issue                      | Solution                                             |
| -------------------------- | ---------------------------------------------------- |
| MongoDB connection refused | Ensure mongod is running: `mongod`                   |
| Redis connection refused   | Start Redis: `redis-server`                          |
| API key not recognized     | Verify .env file and API key validity                |
| Port 5000 already in use   | Change PORT in .env or kill process: `lsof -i :5000` |
| Tests failing              | Clear cache: `npm test -- --clearCache`              |

### Debug Mode

```bash
# Verbose logging
DEBUG=* npm run dev

# Watch mode
npm run dev:watch

# Inspect debugger
node --inspect src/server.js
```

---

## 📚 Additional Resources

- [API_KEYS_SETUP.md](./API_KEYS_SETUP.md) - How to obtain & configure API keys
- [BACKEND_FOLDER_STRUCTURE.md](./BACKEND_FOLDER_STRUCTURE.md) - Backend organization details
- [TESTING_QA.md](./TESTING_QA.md) - Testing strategies & examples
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Production deployment guide
- [code-standards.md](./code-standards.md) - Code quality standards
- [LANGCHAIN_AGENTS.md](./LANGCHAIN_AGENTS.md) - AI agent implementation

---

## 📝 License

SecureDoc AI - Proprietary Financial Technology Software

---

**Version:** 1.0.0 | **Last Updated:** May 20, 2026
