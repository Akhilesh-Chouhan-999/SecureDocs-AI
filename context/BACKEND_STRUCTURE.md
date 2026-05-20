# Backend Folder Structure - Clean & Flat Design

## 📁 Recommended Folder Structure

```
backend/
├── src/
│   ├── config/              # Configuration & DI Container
│   │   └── container.js     # Dependency injection (factory pattern in code)
│   │
│   ├── core/                # Foundational interfaces & base classes (SOLID principles)
│   │   ├── IRepository.js   # Base repository interface
│   │   ├── IService.js      # Base service interface
│   │   ├── IController.js   # Base controller interface
│   │   └── BaseError.js     # Error handling
│   │
│   ├── domain/              # Business logic (entities & use cases)
│   │   ├── entities/        # Data models
│   │   │   ├── User.js
│   │   │   ├── Document.js
│   │   │   └── Analysis.js
│   │   └── usecases/        # Business logic workflows
│   │       ├── RegisterUser.usecase.js
│   │       ├── AnalyzeDocument.usecase.js
│   │       └── GenerateReport.usecase.js
│   │
│   ├── repositories/        # Data access layer (Repository pattern in code)
│   │   ├── UserRepository.js
│   │   ├── DocumentRepository.js
│   │   └── AnalysisRepository.js
│   │
│   ├── services/            # Business services (orchestration)
│   │   ├── UserService.js
│   │   ├── DocumentService.js
│   │   ├── AnalysisService.js
│   │   ├── OCRService.js    # Tesseract.js wrapper
│   │   ├── AIService.js     # LangChain wrapper
│   │   └── ReportService.js
│   │
│   ├── controllers/         # HTTP request handlers
│   │   ├── AuthController.js
│   │   ├── DocumentController.js
│   │   ├── AnalysisController.js
│   │   └── ReportController.js
│   │
│   ├── routes/              # Express route definitions
│   │   ├── auth.routes.js
│   │   ├── document.routes.js
│   │   ├── analysis.routes.js
│   │   ├── report.routes.js
│   │   └── index.js         # Combine all routes
│   │
│   ├── middleware/          # Express middleware
│   │   ├── auth.middleware.js
│   │   ├── errorHandler.middleware.js
│   │   ├── logger.middleware.js
│   │   └── validation.middleware.js
│   │
│   ├── validators/          # Input validation schemas
│   │   ├── auth.validators.js
│   │   ├── document.validators.js
│   │   ├── analysis.validators.js
│   │   └── common.validators.js
│   │
│   ├── infrastructure/      # External services (DB, cache, AI, storage)
│   │   ├── database/        # MongoDB
│   │   │   ├── models/      # Mongoose schemas
│   │   │   │   ├── UserModel.js
│   │   │   │   ├── DocumentModel.js
│   │   │   │   └── AnalysisModel.js
│   │   │   └── connection.js
│   │   ├── cache/           # Redis
│   │   │   └── RedisClient.js
│   │   ├── queue/           # Bull + Redis
│   │   │   ├── AnalysisQueue.js
│   │   │   ├── ReportQueue.js
│   │   │   └── workers/     # Job workers
│   │   ├── ai/              # LangChain.js
│   │   │   ├── LLMClient.js
│   │   │   ├── tools/       # LLM tools
│   │   │   └── agents/      # LLM agents
│   │   └── storage/         # File storage
│   │       └── FileStorage.js
│   │
│   ├── utils/               # Shared utilities
│   │   ├── logger.js        # Winston logger
│   │   ├── helpers.js       # Common functions
│   │   ├── constants.js     # App constants
│   │   └── errors.js        # Custom error classes
│   │
│   ├── index.js             # Application entry point
│   └── app.js               # Express app setup
│
├── scripts/                 # Database migrations & seeds
│   ├── migrations/
│   └── seeds/
│
├── tests/                   # Test files (mirror src structure)
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .env.example             # Environment template
├── .gitignore
├── package.json
└── package-lock.json
```

---

## 🎯 Why This Structure?

### ✅ Flat & Clean

- **All folders at similar level** - easy to navigate
- **No redundant nesting** - no `api/controllers/`, just `controllers/`
- **Clear responsibilities** - each folder has one purpose

### ✅ Design Patterns in Code, Not Folders

- **Factory Pattern** → Implemented in `config/container.js` (DI logic)
- **Repository Pattern** → Classes in `repositories/` folder
- **Strategy Pattern** → Implemented inside `services/` or `infrastructure/ai/`
- **Patterns are CODE, not STRUCTURE**

### ✅ SOLID Principles

- **SRP** - Each file has one responsibility
- **OCP** - Extensible via interfaces in `core/`
- **LSP** - All repositories implement same interface
- **ISP** - Specific interfaces for each service type
- **DIP** - `config/container.js` manages dependencies

### ✅ Logical Organization

| Folder            | Purpose                               | SOLID Principle    |
| ----------------- | ------------------------------------- | ------------------ |
| `config/`         | DI container (factories created here) | DIP                |
| `core/`           | Base interfaces & classes             | ISP, OCP           |
| `domain/`         | Business logic                        | SRP                |
| `repositories/`   | Data access layer                     | Repository pattern |
| `services/`       | Business orchestration                | SRP                |
| `controllers/`    | HTTP handlers                         | SRP                |
| `routes/`         | Endpoint mapping                      | SRP                |
| `middleware/`     | Cross-cutting concerns                | SRP                |
| `validators/`     | Input validation                      | SRP                |
| `infrastructure/` | External service integrations         | DIP                |
| `utils/`          | Shared code                           | DRY                |

---

## 🏭 Factory Pattern Implementation

**NOT a `factories/` folder!** Instead:

### ✅ Correct Approach

```javascript
// config/container.js - DI Container with factory logic inside
class DIContainer {
  createUserService() {
    const repository = new UserRepository(this.db);
    return new UserService(repository);
  }

  createAnalysisService() {
    const docRepo = new DocumentRepository(this.db);
    const analysisRepo = new AnalysisRepository(this.db);
    const aiService = new AIService(this.llm);
    return new AnalysisService(docRepo, analysisRepo, aiService);
  }
}
```

### ❌ Wrong Approach

```
❌ backend/src/factories/          # DON'T DO THIS
   ├── UserServiceFactory.js
   ├── AnalysisServiceFactory.js
   └── ...
```

---

## 📦 Service Layer Example

```javascript
// services/AnalysisService.js - Demonstrates all principles

class AnalysisService {
  constructor(documentRepo, analysisRepo, aiService) {
    // Dependency Injection (DIP)
    this.documentRepo = documentRepo;
    this.analysisRepo = analysisRepo;
    this.aiService = aiService;
  }

  // Single Responsibility - only handles analysis
  async analyzeDocument(docId) {
    const doc = await this.documentRepo.findById(docId);
    const analysis = await this.aiService.analyze(doc);
    return await this.analysisRepo.save(analysis);
  }
}

// controllers/AnalysisController.js - SRP: only handles HTTP
class AnalysisController {
  constructor(analysisService) {
    this.analysisService = analysisService; // Injected
  }

  async analyze(req, res) {
    try {
      const result = await this.analysisService.analyzeDocument(req.body.docId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}
```

---

## 🔄 Data Flow Example

```
User Request
    ↓
routes/analysis.routes.js (maps POST /analyze)
    ↓
controllers/AnalysisController (handles HTTP)
    ↓
services/AnalysisService (business logic)
    ↓
repositories/AnalysisRepository (data access)
    ↓
infrastructure/database/AnalysisModel (MongoDB)
    ↓
Response back to user
```

---

## 💡 Key Principles

1. **Flat Structure** - Everything at `src/` level
2. **No `api/` folder** - Too generic, not needed
3. **No `factories/` folder** - Patterns in code, not structure
4. **No `di/` folder** - Put in `config/` as `container.js`
5. **Patterns = Implementation** - Not folder hierarchy
6. **Clear Separation** - Each folder has distinct responsibility

---

## ✅ Migration Checklist

- [ ] Delete unnecessary folders (`api/`, `di/`, `factories/`)
- [ ] Reorganize to flat structure
- [ ] Move DI logic to `config/container.js`
- [ ] Update imports in all files
- [ ] Implement Factory pattern in code (container)
- [ ] Test all routes still work
- [ ] Update documentation

---

## 📝 Naming Conventions

- **Services**: `*Service.js` (e.g., `UserService.js`)
- **Controllers**: `*Controller.js` (e.g., `AuthController.js`)
- **Repositories**: `*Repository.js` (e.g., `UserRepository.js`)
- **Models**: `*Model.js` (e.g., `UserModel.js`)
- **Use Cases**: `*.usecase.js` (e.g., `RegisterUser.usecase.js`)
- **Middleware**: `*.middleware.js` (e.g., `auth.middleware.js`)
- **Validators**: `*.validators.js` (e.g., `auth.validators.js`)
- **Interfaces**: `I*.js` (e.g., `IRepository.js`, `IService.js`)

---

## 🎯 Benefits

✅ **Easier Navigation** - Flat, predictable structure  
✅ **Clear Responsibilities** - No confusion about where code goes  
✅ **Scalable** - Works for small and large projects  
✅ **SOLID Compliant** - Principles in implementation, not folders  
✅ **Industry Standard** - Matches Clean Architecture  
✅ **Team Friendly** - New developers understand immediately

---

**This is the recommended structure for SecureDoc AI backend!**
