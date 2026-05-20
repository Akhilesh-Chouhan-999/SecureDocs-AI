# SecureDoc AI - Backend Architecture & Structure

## Project Overview

SecureDoc AI is a comprehensive document fraud detection and risk analysis platform using modern JavaScript/Node.js stack with LangChain.js for AI orchestration.

**Technology Stack:**

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Cache:** Redis (Bull for job queue)
- **AI/LLM:** LangChain.js + OpenAI/Gemini
- **OCR:** Tesseract.js
- **Vector DB:** ChromaDB
- **Authentication:** JWT (jsonwebtoken)
- **File Upload:** Multer

---

## Backend Architecture

### Modern Folder Structure (Flattened API Pattern)

```
backend/
├── src/
│   ├── index.js                          # Main application entry point
│   ├── config/
│   │   ├── index.js
│   │   ├── database.js                   # MongoDB connection
│   │   ├── env.js                        # Environment configuration
│   │   └── llm.js                        # LangChain setup
│   │
│   ├── controllers/                      # API request handlers (class-based)
│   │   ├── index.js
│   │   ├── auth.controller.js            # Authentication logic
│   │   ├── document.controller.js        # Document upload handling
│   │   ├── analysis.controller.js        # Document analysis
│   │   └── report.controller.js          # Report generation
│   │
│   ├── routes/                           # Express route definitions
│   │   ├── index.js
│   │   ├── auth.routes.js                # Authentication endpoints
│   │   ├── documents.routes.js           # Document upload/retrieval
│   │   ├── analysis.routes.js            # Analysis endpoints
│   │   └── reports.routes.js             # Report endpoints
│   │
│   ├── middleware/                       # Express middleware
│   │   ├── index.js
│   │   ├── auth.middleware.js            # JWT verification
│   │   └── upload.middleware.js          # File upload handling
│   │
│   ├── services/                         # Business logic layer
│   │   ├── index.js
│   │   ├── analysis.service.js           # OCR & anomaly detection
│   │   └── report.service.js             # Report generation logic
│   │
│   ├── infrastructure/
│   │   ├── database/
│   │   │   └── models/
│   │   │       ├── index.js
│   │   │       ├── User.js               # User model
│   │   │       ├── Document.js           # Document model
│   │   │       ├── FraudReport.js        # Fraud report model
│   │   │       └── HistoricalRecord.js   # Historical data model
│   │   ├── ai/
│   │   │   ├── agents/                   # LangChain agents
│   │   │   └── tools/                    # Custom tools for agents
│   │   ├── cache/                        # Redis caching
│   │   ├── queue/                        # Bull job queues
│   │   │   └── workers/                  # Job workers
│   │   └── storage/                      # File storage
│   │
│   ├── ai/                               # AI/ML services
│   │   ├── embeddings/                   # Embedding generation
│   │   ├── ingestion/                    # Document ingestion
│   │   ├── memory/                       # Memory management
│   │   ├── parsers/                      # Document parsers
│   │   ├── prompts/                      # Prompt templates
│   │   ├── rag/                          # RAG pipeline
│   │   ├── vector-db/                    # Vector database ops
│   │   └── workflows/                    # AI workflows
│   │
│   ├── domain/
│   │   ├── entities/                     # Domain entities
│   │   └── usecases/                     # Business use cases
│   │
│   ├── helpers/                          # Utility helper functions
│   ├── validators/                       # Input validation
│   ├── utils/                            # General utilities
│   ├── constants/                        # Application constants
│   ├── types/                            # TypeScript-like type definitions
│   ├── repositories/                     # Data access layer (DAL)
│   ├── services/                         # Service layer (already listed)
│   ├── events/                           # Event emitters
│   ├── listeners/                        # Event listeners
│   ├── jobs/                             # Job definitions
│   ├── schedulers/                       # Task schedulers
│   ├── sockets/                          # WebSocket handlers
│   ├── logs/                             # Logging utilities
│   ├── uploads/                          # Upload handling
│   ├── core/                             # Core functionality
│   ├── decorators/                       # Function decorators
│   └── docs/                             # Code documentation
│
├── tests/
│   ├── unit/                             # Unit tests
│   ├── integration/                      # Integration tests
│   └── e2e/                              # End-to-end tests
│
├── scripts/
│   ├── migrations/                       # Database migrations
│   └── seeds/                            # Database seeds
│
└── package.json                          # Dependencies
```

---

## API Endpoints

### Authentication (`/api/auth`)

- **POST** `/register` - Register new user
- **POST** `/login` - User login with JWT token

### Documents (`/api/documents`)

- **POST** `/upload` - Upload a document
- **GET** `/` - Get all user documents
- **GET** `/:id` - Get specific document

### Analysis (`/api/analysis`)

- **POST** `/ocr` - Perform OCR analysis on document
- **POST** `/anomalies` - Detect anomalies in document

### Reports (`/api/reports`)

- **POST** `/generate` - Generate fraud report
- **GET** `/:id` - Get specific report
- **GET** `/` - Get all user reports

---

## Class-Based Architecture

All controllers follow the class-based pattern:

```javascript
// Example: AnalysisController
class AnalysisController {
  static async analyzeDocument(req, res, next) {
    // Implementation
  }

  static async detectAnomaly(req, res, next) {
    // Implementation
  }
}

module.exports = AnalysisController;
```

**Benefits:**

- Clear separation of concerns
- Easy to test and maintain
- Static methods for clean API route mapping
- Consistent error handling with `next()` callback

---

## Authentication Flow

1. User registers with email and password
2. Password is hashed using bcryptjs (10 salt rounds)
3. JWT token generated on login
4. Token sent in `Authorization: Bearer <token>` header
5. Middleware verifies JWT on protected routes
6. User context added to request object

---

## Models & Database Schema

### User

- `email` - Unique email address
- `password` - Hashed password
- `organization` - User's organization
- `role` - Role (analyst, admin, manager)
- Timestamps (createdAt, updatedAt)

### Document

- `user` - Reference to User
- `fileName` - Original filename
- `filePath` - Path to stored file
- `fileSize` - File size in bytes
- `fileType` - MIME type
- `ocrText` - Extracted OCR text
- `status` - Processing status (pending, processing, completed, failed)

### FraudReport

- `document` - Reference to Document
- `analyst` - Reference to User (analyst)
- `riskScore` - Calculated risk score (0-100)
- `anomalies` - Array of detected anomalies
- `summary` - AI-generated summary
- `createdAt` - Report creation timestamp

### HistoricalRecord

- `key` - Unique identifier
- `value` - Stored data
- `source` - Data source
- `createdAt` - Record creation timestamp

---

## Services Layer

Services contain the business logic separate from HTTP handling:

### AnalysisService

- `performOCRAnalysis(filePath)` - Extract text using Tesseract
- `detectAnomalies(text)` - Identify potential fraud indicators

### ReportService

- `generateFraudReport(document, anomalies)` - Create comprehensive report
- `calculateRiskScore(anomalies)` - Compute risk level
- `generateSummary(anomalies, riskScore)` - Create text summary

---

## Middleware

### Authentication Middleware

Verifies JWT token and attaches user to request:

```javascript
router.get("/protected", authMiddleware, controller.method);
```

### Upload Middleware

Handles multipart file uploads with Multer:

```javascript
router.post("/upload", upload.single("document"), controller.upload);
```

---

## Error Handling

Global error handler in main `index.js`:

```javascript
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    error: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});
```

---

## Development Workflow

1. **Create Controller** - Define handler methods
2. **Create Service** - Implement business logic
3. **Create Routes** - Define API endpoints
4. **Add Middleware** - Apply validation/auth
5. **Update index.js** - Register routes with app
6. **Update progress** - Track in context/progress-tracker.md

---

## Next Phases

### Phase 2 - OCR Pipeline

- Integrate Tesseract.js for text extraction
- Build confidence validation
- Implement document parsing

### Phase 3 - LangChain Integration

- Setup LLM clients
- Create fraud detection agents
- Build report generation agents

### Phase 4 - RAG Pipeline

- ChromaDB integration
- Embedding generation
- Historical data retrieval

### Phase 5 - Anomaly Detection

- Financial pattern analysis
- Ownership mismatch detection
- Risk scoring algorithm

### Phase 6 - Job Queue

- Bull + Redis setup
- Background processing
- Job monitoring

### Phase 7 - Report Generation

- LLM-powered summaries
- PDF export functionality
- Downloadable reports

### Phase 8 - Frontend Integration

- React dashboard
- Real-time updates
- WebSocket integration

---

## Installation & Setup

### Prerequisites

- Node.js 18+
- MongoDB
- Redis
- API keys (OpenAI/Gemini)

### Install Dependencies

```bash
cd backend
npm install
```

### Environment Setup

```bash
cp .env.example .env
# Update .env with your configuration
```

### Run Server

```bash
npm run dev    # Development with nodemon
npm start      # Production
```

### API Health Check

```bash
curl http://localhost:5000/health
```

---

## Code Standards

### Naming Conventions

- **Controllers:** `PascalCase` ending in `Controller`
- **Services:** `PascalCase` ending in `Service`
- **Routes:** `camelCase` ending in `.routes.js`
- **Methods:** `camelCase`
- **Constants:** `UPPER_SNAKE_CASE`

### Import/Export Pattern

```javascript
// Use index.js for clean exports
const { UserModel, DocumentModel } = require("./models");

// Destructure on import
const { AnalysisService } = require("./services");
```

### Error Handling

```javascript
try {
  // Do work
} catch (error) {
  next(error); // Pass to global error handler
}
```

---

## Testing

Run tests:

```bash
npm test                 # All tests
npm run test:unit       # Unit tests
npm run test:integration # Integration tests
npm run test:e2e        # End-to-end tests
```

---

## Deployment

Deployment guides and CI/CD setup will be documented in `context/DEPLOYMENT.md`.

---

## Support & Documentation

For detailed information:

- Architecture: See `context/architecture-context.md`
- Setup: See `context/BACKEND_SETUP.md`
- Progress: See `context/progress-tracker.md`
- API Keys: See `context/API_KEYS_SETUP.md`
