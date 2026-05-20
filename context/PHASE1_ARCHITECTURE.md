# 🏗️ PHASE 1: Core Architecture & SOLID Implementation

**Duration:** 3-4 hours  
**Prerequisite:** PHASE 0 complete  
**Objective:** Establish foundational SOLID architecture with design patterns

---

## Overview

This phase creates the foundation for all future development:

- Implement all 5 SOLID principles
- Setup DI Container with factory pattern **in code** (not as folder)
- Create base interfaces and classes
- Establish error handling
- Build first working service

---

## 📚 SOLID Principles Explained

### 1️⃣ Single Responsibility Principle (SRP)

**Definition:** Each class should have one reason to change.

```javascript
// ✅ GOOD - Each class has one responsibility
class UserService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async getUser(id) {
    return await this.userRepository.findById(id);
  }
}

class UserValidator {
  validate(userData) {
    if (!userData.email) throw new Error("Email required");
    return true;
  }
}

class EmailSender {
  async sendWelcomeEmail(email) {
    // Send email logic
  }
}

// ❌ BAD - God class with multiple responsibilities
class UserManager {
  async getUser(id) {
    /* ... */
  }
  validate(userData) {
    /* ... */
  }
  sendEmail(email) {
    /* ... */
  }
  saveToDatabase(user) {
    /* ... */
  }
  logActivity(action) {
    /* ... */
  }
  // Too many reasons to change!
}
```

### 2️⃣ Open/Closed Principle (OCP)

**Definition:** Software should be open for extension, closed for modification.

```javascript
// ✅ GOOD - Use interfaces, extend without modifying
class IRepository {
  async findById(id) {
    throw new Error("Not implemented");
  }
  async save(entity) {
    throw new Error("Not implemented");
  }
}

class UserRepository extends IRepository {
  async findById(id) {
    /* MongoDB query */
  }
  async save(user) {
    /* Save to DB */
  }
}

class AdminRepository extends IRepository {
  async findById(id) {
    /* Different logic */
  }
  async save(admin) {
    /* Different save */
  }
}

// New repository type? Just extend IRepository, don't modify existing code

// ❌ BAD - Modify existing code to add new type
class UserRepository {
  async findById(id) {
    if (type === "user") {
      /* ... */
    } else if (type === "admin") {
      /* ... */
    } else if (type === "guest") {
      /* ... */
    }
    // Keep modifying this file!
  }
}
```

### 3️⃣ Liskov Substitution Principle (LSP)

**Definition:** Derived classes must be substitutable for base classes.

```javascript
// ✅ GOOD - All repositories can substitute each other
class IRepository {
  async findById(id) {
    throw new Error("Not implemented");
  }
  async save(entity) {
    throw new Error("Not implemented");
  }
}

class UserRepository extends IRepository {
  async findById(id) {
    return await this.db.users.findOne({ _id: id });
  }
  async save(user) {
    return await this.db.users.insertOne(user);
  }
}

class DocumentRepository extends IRepository {
  async findById(id) {
    return await this.db.documents.findOne({ _id: id });
  }
  async save(doc) {
    return await this.db.documents.insertOne(doc);
  }
}

// Service can use ANY repository - they're interchangeable
class GenericService {
  constructor(repository) {
    this.repository = repository; // Works with UserRepo OR DocumentRepo
  }

  async get(id) {
    return await this.repository.findById(id);
  }
}

// ❌ BAD - Derived class breaks the contract
class BrokenUserRepository extends IRepository {
  async findById(id) {
    /* ... */
  }
  async save(user) {
    throw new Error("Not implemented");
  } // Breaks contract!
}
```

### 4️⃣ Interface Segregation Principle (ISP)

**Definition:** Many client-specific interfaces are better than one general interface.

```javascript
// ✅ GOOD - Specific interfaces for specific needs
class IUserRepository {
  async findById(id) {}
  async save(user) {}
  async findByEmail(email) {}
}

class IAnalysisRepository {
  async findById(id) {}
  async save(analysis) {}
  async findByDocumentId(docId) {}
}

class IReportRepository {
  async findById(id) {}
  async save(report) {}
  async findByUserId(userId) {}
}

// Each service only depends on what it needs
class UserService {
  constructor(userRepo) {
    this.userRepo = userRepo;
  }
  // Only uses IUserRepository methods
}

// ❌ BAD - One fat interface everyone must implement
class IRepository {
  async findById(id) {}
  async save(entity) {}
  async findByEmail(email) {}
  async findByDocumentId(docId) {}
  async findByUserId(userId) {}
  async update(entity) {}
  async delete(id) {}
  // ... 20 more methods
}

// UserService must implement ALL methods, even ones it doesn't use!
```

### 5️⃣ Dependency Inversion Principle (DIP)

**Definition:** Depend on abstractions, not concrete implementations.

```javascript
// ✅ GOOD - Depend on interface, inject implementation
class IUserRepository {
  async findById(id) {
    throw new Error("Not implemented");
  }
}

class UserRepository extends IUserRepository {
  async findById(id) {
    /* MongoDB logic */
  }
}

class UserService {
  constructor(userRepository) {
    // userRepository is injected - we don't create it
    this.userRepository = userRepository;
  }

  async getUser(id) {
    return await this.userRepository.findById(id);
  }
}

// Easy to test - inject mock repository
const mockRepo = { findById: async () => ({ id: 1, name: "Test" }) };
const service = new UserService(mockRepo);

// ❌ BAD - Depend on concrete implementation
class UserService {
  constructor() {
    this.userRepository = new UserRepository(); // Hard-coded dependency
  }

  async getUser(id) {
    return await this.userRepository.findById(id);
  }
}
// Can't test easily - always creates real UserRepository
```

---

## 🏭 Design Patterns Implementation

### Factory Pattern (in code, not folder structure)

```javascript
// config/container.js - DI Container with factory logic
class DIContainer {
  constructor(config) {
    this.config = config;
    this.instances = {};
  }

  // Factory methods - create instances without exposing implementation
  createUserRepository() {
    return new UserRepository(this.mongoConnection);
  }

  createUserService() {
    const repo = this.createUserRepository();
    return new UserService(repo);
  }

  createAuthService() {
    const userService = this.createUserService();
    return new AuthService(userService);
  }

  createAnalysisService() {
    const docRepo = new DocumentRepository(this.mongoConnection);
    const aiService = new AIService(this.llmClient);
    return new AnalysisService(docRepo, aiService);
  }
}
```

### Repository Pattern

```javascript
// core/IRepository.js - Interface
class IRepository {
  async findById(id) {
    throw new Error("Not implemented");
  }
  async findAll() {
    throw new Error("Not implemented");
  }
  async save(entity) {
    throw new Error("Not implemented");
  }
  async delete(id) {
    throw new Error("Not implemented");
  }
}

// repositories/UserRepository.js - Implementation
class UserRepository extends IRepository {
  constructor(mongoConnection) {
    super();
    this.db = mongoConnection;
  }

  async findById(id) {
    return await this.db.collection("users").findOne({ _id: id });
  }

  async save(user) {
    return await this.db.collection("users").insertOne(user);
  }
}
```

---

## 📁 Flat Folder Structure (No `di/` or `factories/` folders!)

```
backend/src/
├── config/
│   └── container.js      # ← DI Container with factory logic inside
│
├── core/
│   ├── IRepository.js    # Base repository interface
│   ├── IService.js       # Base service interface
│   ├── IController.js    # Base controller interface
│   └── BaseError.js      # Error handling
│
├── domain/
│   ├── entities/         # Data models
│   │   ├── User.js
│   │   ├── Document.js
│   │   └── Analysis.js
│   └── usecases/         # Business logic
│       ├── RegisterUser.usecase.js
│       └── AnalyzeDocument.usecase.js
│
├── repositories/         # Data access layer
│   ├── UserRepository.js
│   └── DocumentRepository.js
│
├── services/            # Business services
│   ├── UserService.js
│   ├── AnalysisService.js
│   └── AIService.js
│
├── controllers/         # HTTP handlers
│   ├── AuthController.js
│   └── AnalysisController.js
│
├── routes/              # Route definitions
│   ├── auth.routes.js
│   └── analysis.routes.js
│
├── middleware/          # Express middleware
│   ├── auth.middleware.js
│   └── errorHandler.middleware.js
│
├── validators/          # Input validation
│   └── auth.validators.js
│
├── infrastructure/      # External services
│   ├── database/
│   │   ├── models/
│   │   └── connection.js
│   ├── cache/
│   │   └── RedisClient.js
│   ├── queue/
│   │   └── workers/
│   └── ai/
│       ├── LLMClient.js
│       └── agents/
│
├── utils/               # Shared utilities
│   ├── logger.js
│   ├── errors.js
│   └── constants.js
│
├── app.js               # Express setup
└── index.js             # Entry point
```

**Key Point:** Patterns are implemented **in code**, not reflected in folder structure!

---

## 💾 Core Files to Create

### 1. core/IRepository.js

```javascript
/**
 * Base repository interface
 * All repositories must implement this contract
 */
class IRepository {
  async findById(id) {
    throw new Error("findById() must be implemented");
  }

  async findAll() {
    throw new Error("findAll() must be implemented");
  }

  async save(entity) {
    throw new Error("save() must be implemented");
  }

  async update(id, entity) {
    throw new Error("update() must be implemented");
  }

  async delete(id) {
    throw new Error("delete() must be implemented");
  }
}

module.exports = IRepository;
```

### 2. core/IService.js

```javascript
/**
 * Base service interface
 * All business services must implement this contract
 */
class IService {
  async execute(params) {
    throw new Error("execute() must be implemented");
  }

  async validate(params) {
    throw new Error("validate() must be implemented");
  }
}

module.exports = IService;
```

### 3. config/container.js

```javascript
const DIContainer = require("./DIContainer");

// Setup container with all dependencies
const container = new DIContainer();

// Register repositories
container.set("UserRepository", () => new UserRepository(mongoConnection));
container.set(
  "DocumentRepository",
  () => new DocumentRepository(mongoConnection),
);

// Register services - factory methods that inject dependencies
container.set("UserService", () => {
  const userRepo = container.get("UserRepository");
  return new UserService(userRepo);
});

container.set("AnalysisService", () => {
  const docRepo = container.get("DocumentRepository");
  const aiService = new AIService(llmClient);
  return new AnalysisService(docRepo, aiService);
});

module.exports = container;
```

### 4. services/UserService.js

```javascript
class UserService {
  constructor(userRepository) {
    this.userRepository = userRepository; // Injected dependency (DIP)
  }

  async getUserById(id) {
    return await this.userRepository.findById(id);
  }

  async createUser(userData) {
    return await this.userRepository.save(userData);
  }
}

module.exports = UserService;
```

### 5. controllers/AuthController.js

```javascript
class AuthController {
  constructor(userService, authService) {
    this.userService = userService;
    this.authService = authService;
  }

  async register(req, res) {
    try {
      const user = await this.userService.createUser(req.body);
      const token = await this.authService.generateToken(user);
      res.json({ user, token });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async login(req, res) {
    try {
      const user = await this.authService.authenticate(req.body);
      const token = await this.authService.generateToken(user);
      res.json({ user, token });
    } catch (error) {
      res.status(401).json({ error: "Invalid credentials" });
    }
  }
}

module.exports = AuthController;
```

---

## ✅ Implementation Checklist

- [ ] Create `config/container.js` with DI logic
- [ ] Create base interfaces in `core/`
- [ ] Create base classes for error handling
- [ ] Create first repository (`UserRepository`)
- [ ] Create first service (`UserService`)
- [ ] Create first controller (`AuthController`)
- [ ] Setup error handling middleware
- [ ] Write unit tests for interfaces
- [ ] All tests passing
- [ ] Code follows SOLID principles

---

## 🧪 Testing Your Architecture

```bash
# Run tests
npm test

# Check specific service
npm test -- services/UserService.test.js

# Coverage report
npm run test:coverage
```

---

## ✨ Completion Criteria

✅ DI Container working  
✅ All interfaces defined  
✅ At least one service implemented  
✅ At least one controller implemented  
✅ Error handling in place  
✅ Unit tests passing  
✅ Code follows all 5 SOLID principles

---

## Next Steps

👉 Move to **PHASE 2: Database Layer & Models**

This will:

- Create Mongoose models
- Implement repositories for each model
- Setup migrations
- Create seed data

**Duration:** 2-3 hours
