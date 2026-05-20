# 🏗️ PHASE 1: Core Architecture & SOLID Implementation

## Objective

Establish foundational architecture with SOLID principles, Design Patterns (Factory, DI), and clean code structure.

**Duration:** 3-4 hours  
**Prerequisites:** Complete PHASE 0

---

## 📚 SOLID Principles in SecureDoc AI

### 1️⃣ **S**ingle Responsibility Principle (SRP)

Each class/module has **ONE reason to change**.

```
✓ UserService handles only user business logic
✓ UserRepository handles only data access
✓ AuthController handles only HTTP requests
✗ NOT: UserService that does auth + emails + logging
```

### 2️⃣ **O**pen/Closed Principle (OCP)

Classes **open for extension, closed for modification**.

```
✓ Use interfaces to define contracts
✓ Extend base classes instead of modifying them
✓ Use inheritance & polymorphism
✗ NOT: Modifying existing code to add features
```

### 3️⃣ **L**iskov Substitution Principle (LSP)

Derived classes must be **substitutable** for base classes.

```
✓ All repositories implement IRepository interface
✓ Can swap MongoRepository with PostgreRepository
✓ No runtime errors due to type differences
✗ NOT: Derived class that breaks base class behavior
```

### 4️⃣ **I**nterface Segregation Principle (ISP)

Interfaces should be **specific to client needs**.

```
✓ IUserRepository with just user methods
✓ IAuthService with just auth methods
✗ NOT: IAllServices with 50 methods (clients don't need all)
```

### 5️⃣ **D**ependency Inversion Principle (DIP)

Depend on **abstractions, not concretions**.

```
✓ AuthController depends on IUserRepository (interface)
✓ Pass dependencies via constructor injection
✓ DI Container manages instantiation
✗ NOT: AuthController directly instantiates UserRepository
```

---

## 🏭 Design Patterns Used

### Factory Pattern

**Purpose:** Create objects without specifying concrete classes.

```javascript
// ✓ GOOD: Factory pattern
const serviceFactory = new ServiceFactory(container);
const userService = serviceFactory.createUserService();

// ✗ BAD: Direct instantiation
const userService = new UserService(userRepository, emailService);
```

### Dependency Injection (DI)

**Purpose:** Inject dependencies from outside, not create internally.

```javascript
// ✓ GOOD: Constructor injection
class AuthController {
  constructor(userService, authService) {
    this.userService = userService;
    this.authService = authService;
  }
}

// ✗ BAD: Services creating their own dependencies
class AuthController {
  constructor() {
    this.userService = new UserService(); // Tight coupling!
  }
}
```

### Repository Pattern

**Purpose:** Abstract data access logic.

```javascript
// ✓ GOOD: Repository abstraction
class AuthController {
  constructor(userRepository) {
    // Depends on interface
    this.userRepository = userRepository;
  }
}

// ✗ BAD: Direct database access
class AuthController {
  constructor() {
    this.db = mongoose; // Tight coupling!
  }
}
```

---

## 📁 Folder Structure with SOLID

```
src/
├── core/                          # 📦 Architectural Foundation
│   ├── interfaces/                # Interface definitions
│   │   ├── IRepository.js         # Generic repository interface
│   │   ├── IService.js            # Generic service interface
│   │   ├── IUseCase.js            # Generic use case interface
│   │   └── IController.js         # Generic controller interface
│   ├── factories/                 # Factory implementations
│   │   ├── ServiceFactory.js      # Creates services
│   │   ├── ControllerFactory.js   # Creates controllers
│   │   ├── RepositoryFactory.js   # Creates repositories
│   │   └── AgentFactory.js        # Creates LLM agents
│   └── di/
│       └── Container.js           # DI container
│
├── domain/                        # 🎯 Business Logic (Clean Arch)
│   ├── entities/                  # Business objects
│   │   ├── User.entity.js
│   │   ├── Document.entity.js
│   │   └── FraudReport.entity.js
│   ├── repositories/              # Data access interfaces
│   │   ├── IUserRepository.js
│   │   ├── IDocumentRepository.js
│   │   └── IFraudReportRepository.js
│   └── usecases/                  # Business use cases (orchestrators)
│       ├── auth/
│       │   ├── RegisterUser.usecase.js
│       │   ├── LoginUser.usecase.js
│       │   └── LogoutUser.usecase.js
│       ├── documents/
│       │   ├── UploadDocument.usecase.js
│       │   ├── GetDocument.usecase.js
│       │   └── DeleteDocument.usecase.js
│       └── analysis/
│           ├── AnalyzeDocument.usecase.js
│           ├── GetAnalysisStatus.usecase.js
│           └── GenerateReport.usecase.js
│
├── infrastructure/                # 🔌 External Services
│   ├── database/
│   │   ├── models/                # Mongoose schemas
│   │   │   ├── User.model.js
│   │   │   ├── Document.model.js
│   │   │   └── FraudReport.model.js
│   │   ├── repositories/          # Repository implementations
│   │   │   ├── UserRepository.js
│   │   │   ├── DocumentRepository.js
│   │   │   └── FraudReportRepository.js
│   │   └── migrations/            # Database migrations
│   │       └── Migration.js
│   ├── cache/
│   │   ├── RedisClient.js         # Redis wrapper
│   │   └── CacheService.js        # Cache business logic
│   ├── queue/
│   │   ├── BullQueue.js           # Queue setup
│   │   ├── AnalysisWorker.js      # Queue worker
│   │   └── jobs/
│   │       └── AnalysisJob.js
│   ├── ai/
│   │   ├── LLMFactory.js          # LLM creation factory
│   │   ├── agents/
│   │   │   ├── FraudDetectionAgent.js
│   │   │   ├── OcrAgent.js
│   │   │   └── ReportAgent.js
│   │   ├── tools/
│   │   │   ├── HistoricalLookup.tool.js
│   │   │   ├── FinancialAnalysis.tool.js
│   │   │   └── DocumentValidation.tool.js
│   │   └── prompts/
│   │       ├── fraud-detection.prompt.js
│   │       ├── report-generation.prompt.js
│   │       └── ocr-parsing.prompt.js
│   └── storage/
│       └── FileStorage.js         # File handling
│
├── api/                           # 🌐 HTTP Layer
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── documents.routes.js
│   │   ├── analysis.routes.js
│   │   └── reports.routes.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── documents.controller.js
│   │   ├── analysis.controller.js
│   │   └── reports.controller.js
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   ├── errorHandler.js
│   │   ├── validation.js
│   │   └── logging.js
│   └── validators/
│       ├── auth.validator.js
│       ├── document.validator.js
│       └── analysis.validator.js
│
├── services/                      # 🛠️ Business Services
│   ├── auth.service.js            # Auth business logic
│   ├── document.service.js        # Document management
│   ├── analysis.service.js        # Analysis orchestration
│   ├── report.service.js          # Report generation
│   └── ocr.service.js             # OCR processing
│
├── utils/                         # 🔨 Helpers
│   ├── logger.js                  # Winston logger
│   ├── validators.js              # Joi schemas
│   ├── errors.js                  # Custom errors
│   ├── constants.js               # App constants
│   └── helpers.js                 # Utility functions
│
└── config/                        # 🔧 Configuration
    ├── di.js                      # DI container setup
    ├── env.js                     # Environment validation
    ├── database.js                # MongoDB connection
    ├── redis.js                   # Redis connection
    ├── llm.js                     # LLM configuration
    └── logger.js                  # Logger configuration
```

---

## 🔧 Implementation: Core Interfaces

### File: `src/core/interfaces/IRepository.js`

```javascript
/**
 * Generic Repository Interface
 * Defines contract for all repository implementations
 * LSP: All repositories implement this interface
 * DIP: Depend on this interface, not concrete repositories
 */
class IRepository {
  async findById(id) {
    throw new Error("findById() must be implemented");
  }

  async findAll(filter = {}) {
    throw new Error("findAll() must be implemented");
  }

  async create(data) {
    throw new Error("create() must be implemented");
  }

  async update(id, data) {
    throw new Error("update() must be implemented");
  }

  async delete(id) {
    throw new Error("delete() must be implemented");
  }

  async findOne(filter) {
    throw new Error("findOne() must be implemented");
  }
}

module.exports = IRepository;
```

### File: `src/core/interfaces/IService.js`

```javascript
/**
 * Generic Service Interface
 * Defines contract for business services
 * SRP: Each service handles one domain
 */
class IService {
  constructor(repository) {
    if (!repository) {
      throw new Error("Repository is required (DIP)");
    }
    this.repository = repository;
  }

  async execute(input) {
    throw new Error("execute() must be implemented");
  }
}

module.exports = IService;
```

### File: `src/core/factories/ServiceFactory.js`

```javascript
/**
 * Service Factory
 * OCP: Can add new services without modifying existing code
 * DIP: Creates services with their dependencies
 */
class ServiceFactory {
  constructor(container) {
    this.container = container;
  }

  createUserService() {
    const userRepository = this.container.get("userRepository");
    const emailService = this.container.get("emailService");
    return new UserService(userRepository, emailService);
  }

  createAuthService() {
    const userRepository = this.container.get("userRepository");
    return new AuthService(userRepository);
  }

  createDocumentService() {
    const documentRepository = this.container.get("documentRepository");
    const storageService = this.container.get("storageService");
    return new DocumentService(documentRepository, storageService);
  }

  createAnalysisService() {
    const analysisRepository = this.container.get("analysisRepository");
    const llmClient = this.container.get("llmClient");
    const ocrService = this.container.get("ocrService");
    return new AnalysisService(analysisRepository, llmClient, ocrService);
  }
}

module.exports = ServiceFactory;
```

### File: `src/config/di.js`

```javascript
/**
 * Dependency Injection Container
 * Centralized dependency management
 * DIP: All dependencies registered here
 */
class DIContainer {
  constructor() {
    this.services = new Map();
    this.singletons = new Map();
  }

  register(name, factory, isSingleton = false) {
    this.services.set(name, { factory, isSingleton });
  }

  get(name) {
    if (!this.services.has(name)) {
      throw new Error(`Service '${name}' not registered in DI container`);
    }

    const { factory, isSingleton } = this.services.get(name);

    if (isSingleton) {
      if (!this.singletons.has(name)) {
        this.singletons.set(name, factory());
      }
      return this.singletons.get(name);
    }

    return factory();
  }
}

module.exports = DIContainer;
```

---

## 🎯 Implementing Use Cases (Business Logic)

### File: `src/domain/usecases/auth/RegisterUser.usecase.js`

```javascript
/**
 * RegisterUser Use Case
 * SRP: Only handles user registration logic
 * DIP: Depends on IUserRepository (injected)
 */
class RegisterUserUseCase {
  constructor(userRepository, hashService) {
    this.userRepository = userRepository;
    this.hashService = hashService;
  }

  async execute(input) {
    const { email, password, organization } = input;

    // Validate input
    if (!email || !password) {
      throw new Error("Email and password required");
    }

    // Check if user exists (LSP: Repository can be any type)
    const existingUser = await this.userRepository.findOne({ email });
    if (existingUser) {
      throw new Error("User already exists");
    }

    // Hash password
    const hashedPassword = await this.hashService.hash(password);

    // Create user (SRP: Repository only handles data access)
    const user = await this.userRepository.create({
      email,
      password: hashedPassword,
      organization,
    });

    return {
      success: true,
      user: this.sanitizeUser(user),
    };
  }

  sanitizeUser(user) {
    const { _id, email, organization, role, createdAt } = user;
    return { _id, email, organization, role, createdAt };
  }
}

module.exports = RegisterUserUseCase;
```

---

## 🌐 HTTP Controller (API Layer)

### File: `src/api/controllers/auth.controller.js`

```javascript
/**
 * Auth Controller
 * SRP: Only handles HTTP request/response
 * DIP: Depends on use cases (injected), not business logic
 */
class AuthController {
  constructor(registerUserUseCase, loginUserUseCase) {
    this.registerUserUseCase = registerUserUseCase;
    this.loginUserUseCase = loginUserUseCase;
  }

  async register(req, res, next) {
    try {
      const result = await this.registerUserUseCase.execute(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const result = await this.loginUserUseCase.execute(req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
```

---

## 📦 Repository Pattern (Data Access)

### File: `src/domain/repositories/IUserRepository.js`

```javascript
/**
 * User Repository Interface
 * ISP: Only user-related methods
 */
const IRepository = require("../../core/interfaces/IRepository");

class IUserRepository extends IRepository {
  async findByEmail(email) {
    throw new Error("findByEmail() must be implemented");
  }

  async updatePassword(userId, newPassword) {
    throw new Error("updatePassword() must be implemented");
  }
}

module.exports = IUserRepository;
```

### File: `src/infrastructure/database/repositories/UserRepository.js`

```javascript
/**
 * User Repository Implementation
 * LSP: Implements IUserRepository
 * OCP: Can be extended without modification
 */
const IUserRepository = require("../../../domain/repositories/IUserRepository");
const UserModel = require("../models/User.model");

class UserRepository extends IUserRepository {
  async findById(id) {
    return await UserModel.findById(id);
  }

  async findOne(filter) {
    return await UserModel.findOne(filter);
  }

  async findByEmail(email) {
    return await UserModel.findOne({ email });
  }

  async create(data) {
    const user = new UserModel(data);
    return await user.save();
  }

  async update(id, data) {
    return await UserModel.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id) {
    return await UserModel.findByIdAndDelete(id);
  }
}

module.exports = UserRepository;
```

---

## 🚀 Setup Instructions

### Step 1: Create Core Files

```bash
# Navigate to backend
cd backend

# Create DI Container
touch src/config/di.js

# Create Interfaces
touch src/core/interfaces/IRepository.js
touch src/core/interfaces/IService.js
touch src/core/interfaces/IUseCase.js
touch src/core/interfaces/IController.js

# Create Factories
touch src/core/factories/ServiceFactory.js
touch src/core/factories/RepositoryFactory.js
```

### Step 2: Implement Core Architecture

Copy the provided code files above into their respective locations.

### Step 3: Create Use Cases

```bash
# Auth use cases
mkdir -p src/domain/usecases/auth
touch src/domain/usecases/auth/RegisterUser.usecase.js
touch src/domain/usecases/auth/LoginUser.usecase.js

# Document use cases
mkdir -p src/domain/usecases/documents
touch src/domain/usecases/documents/UploadDocument.usecase.js
```

### Step 4: Create Repositories

```bash
# Repository interfaces
touch src/domain/repositories/IUserRepository.js
touch src/domain/repositories/IDocumentRepository.js

# Repository implementations
touch src/infrastructure/database/repositories/UserRepository.js
touch src/infrastructure/database/repositories/DocumentRepository.js
```

---

## ✅ SOLID Principles Checklist

- [ ] Each class has ONE responsibility
- [ ] Classes can be extended without modification (factories used)
- [ ] Derived classes can substitute base classes (interfaces implemented)
- [ ] Interfaces are specific (ISP followed)
- [ ] Dependencies injected, not created internally (DI used)

---

## 🔗 Next Phase

**PHASE 2: Database Layer & Models**

- Create Mongoose models
- Implement repositories
- Setup database migrations
- Create seeds for testing

See: `PHASE2_DATABASE_LAYER.md`

---

## 📚 Further Reading

- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [Factory Pattern](https://refactoring.guru/design-patterns/factory-method)
- [Dependency Injection](https://www.typescriptlang.org/docs/handbook/dependency-injection.html)
- [Repository Pattern](https://docs.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/infrastructure-persistence-layer-design)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
