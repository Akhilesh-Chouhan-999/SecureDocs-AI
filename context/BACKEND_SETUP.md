# Backend Setup Guide (Node.js + LangChain.js)

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- Git
- MongoDB instance (local or Atlas)
- API keys for LLM providers (Gemini/OpenAI)

---

## Step 1: Initialize Backend Project

```bash
cd backend
npm init -y
npm install express cors dotenv mongoose axios
npm install langchain openai @langchain/openai
npm install tesseract.js
npm install chroma-js
npm install bull redis
npm install jsonwebtoken bcryptjs
npm install multer
npm install --save-dev nodemon prettier eslint
```

---

## Step 2: Project Structure

```
backend/
├── src/
│   ├── index.js                    # Entry point
│   ├── config/
│   │   ├── database.js             # MongoDB connection
│   │   ├── env.js                  # Environment variables
│   │   └── llm.js                  # LangChain setup
│   ├── api/
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── documents.routes.js
│   │   │   ├── analysis.routes.js
│   │   │   └── reports.routes.js
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── documents.controller.js
│   │   │   ├── analysis.controller.js
│   │   │   └── reports.controller.js
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js
│   │   │   ├── errorHandler.js
│   │   │   └── validation.js
│   │   └── models/
│   │       ├── User.js
│   │       ├── Document.js
│   │       ├── FraudReport.js
│   │       └── HistoricalRecord.js
│   ├── ai/
│   │   ├── ocr.service.js          # Tesseract.js wrapper
│   │   ├── llm.service.js          # LangChain client
│   │   ├── rag.service.js          # ChromaDB integration
│   │   ├── agents/
│   │   │   ├── ocrAgent.js
│   │   │   ├── fraudDetectionAgent.js
│   │   │   ├── riskScoringAgent.js
│   │   │   └── reportAgent.js
│   │   ├── prompts/
│   │   │   ├── systemPrompt.js
│   │   │   ├── anomalyPrompt.js
│   │   │   └── reportPrompt.js
│   │   └── tools/
│   │       ├── historicalLookup.js
│   │       ├── financialAnalysis.js
│   │       └── anomalyDetection.js
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── document.service.js
│   │   ├── analysis.service.js
│   │   └── report.service.js
│   ├── utils/
│   │   ├── logger.js
│   │   ├── validators.js
│   │   └── helpers.js
│   └── jobs/
│       ├── analysisQueue.js        # Bull queue
│       └── workers.js
├── .env.example
├── .gitignore
└── package.json
```

---

## Step 3: Environment Setup

Create `.env` file:

```env
# Server
NODE_ENV=development
PORT=5000
HOST=localhost

# Database
MONGODB_URI=mongodb://localhost:27017/securedoc_ai
MONGODB_USER=your_user
MONGODB_PASSWORD=your_password

# Authentication
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRY=15m
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=7d

# LLM Provider (Choose one)
LANGCHAIN_API_KEY=
OPENAI_API_KEY=sk-your-openai-key
GEMINI_API_KEY=your-gemini-api-key

# ChromaDB
CHROMA_DB_URL=http://localhost:8000

# File Upload
MAX_FILE_SIZE=52428800  # 50MB
UPLOAD_DIR=./uploads

# Redis (for Bull queue)
REDIS_URL=redis://localhost:6379

# Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Logging
LOG_LEVEL=debug
```

---

## Step 4: Initialize Database Connection

Create `src/config/database.js`:

```javascript
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
```

---

## Step 5: Setup LangChain Integration

Create `src/config/llm.js`:

```javascript
const { OpenAI } = require("openai");
const { ChatOpenAI } = require("@langchain/openai");
const { HumanMessage, SystemMessage } = require("@langchain/core/messages");

// Initialize LLM Client
const initializeLLM = () => {
  const model = process.env.OPENAI_API_KEY
    ? new ChatOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        modelName: "gpt-4",
        temperature: 0.7,
      })
    : null;

  if (!model) {
    throw new Error("LLM not configured. Check API keys.");
  }

  return model;
};

module.exports = { initializeLLM };
```

---

## Step 6: Create Main Server File

Create `src/index.js`:

```javascript
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/database");

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Connect Database
connectDB();

// Routes
app.use("/api/auth", require("./api/routes/auth.routes"));
app.use("/api/documents", require("./api/routes/documents.routes"));
app.use("/api/analysis", require("./api/routes/analysis.routes"));
app.use("/api/reports", require("./api/routes/reports.routes"));

// Health Check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date() });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
```

---

## Step 7: Setup Authentication

Create `src/api/controllers/auth.controller.js`:

```javascript
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

class AuthController {
  // Register new user
  static async register(req, res) {
    try {
      const { email, password, organization, role } = req.body;

      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await User.create({
        email,
        password: hashedPassword,
        organization,
        role: role || "analyst",
      });

      // Generate JWT
      const token = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRY },
      );

      res.status(201).json({
        success: true,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
        },
        token,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Login user
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRY },
      );

      res.json({
        success: true,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
        },
        token,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = AuthController;
```

---

## Step 8: Setup OCR Service

Create `src/ai/ocr.service.js`:

```javascript
const Tesseract = require("tesseract.js");
const fs = require("fs").promises;

class OCRService {
  static async extractText(filePath) {
    try {
      const result = await Tesseract.recognize(filePath, "eng");

      return {
        text: result.data.text,
        confidence: result.data.confidence,
        words: result.data.words,
      };
    } catch (error) {
      console.error("OCR Error:", error);
      throw new Error(`OCR extraction failed: ${error.message}`);
    }
  }

  static async validateOCRConfidence(confidence, threshold = 0.7) {
    if (confidence < threshold) {
      return {
        valid: false,
        warning: `OCR confidence (${confidence}%) below threshold (${threshold}%)`,
      };
    }
    return { valid: true };
  }
}

module.exports = OCRService;
```

---

## Step 9: Setup LangChain Agent

Create `src/ai/agents/fraudDetectionAgent.js`:

```javascript
const { initializeAgentExecutorWithOptions } = require("langchain/agents");
const { Tool } = require("@langchain/core/tools");
const { ChatOpenAI } = require("@langchain/openai");

class FraudDetectionAgent {
  static async initialize() {
    const llm = new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      modelName: "gpt-4",
    });

    // Define tools
    const tools = [
      new Tool({
        name: "historical_lookup",
        description: "Look up historical records for the customer",
        func: async (input) => {
          // Implementation
          return JSON.stringify({ status: "found", records: [] });
        },
      }),
      new Tool({
        name: "financial_analysis",
        description: "Analyze financial patterns and anomalies",
        func: async (input) => {
          // Implementation
          return JSON.stringify({ anomalies: [] });
        },
      }),
    ];

    const executor = await initializeAgentExecutorWithOptions(tools, llm, {
      agentType: "openai-functions",
      verbose: true,
    });

    return executor;
  }

  static async runAnalysis(documentData) {
    try {
      const executor = await this.initialize();
      const result = await executor.invoke({
        input: `Analyze this document for fraud: ${JSON.stringify(documentData)}`,
      });
      return result;
    } catch (error) {
      console.error("Agent Error:", error);
      throw error;
    }
  }
}

module.exports = FraudDetectionAgent;
```

---

## Step 10: Start Development Server

Add to `package.json`:

```json
"scripts": {
  "start": "node src/index.js",
  "dev": "nodemon src/index.js",
  "test": "jest --coverage",
  "lint": "eslint src/",
  "format": "prettier --write src/"
}
```

Run:

```bash
npm run dev
```

---

## API Key Setup Checklist

- [ ] **OpenAI API Key** - Get from [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- [ ] **Gemini API Key** - Get from [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
- [ ] **MongoDB Connection String** - Get from MongoDB Atlas or use local instance
- [ ] **JWT Secret** - Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- [ ] **Redis Instance** - For job queue (local or cloud)

---

## Testing the Backend

```bash
# Test health endpoint
curl http://localhost:5000/health

# Test registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"pass123","organization":"Bank","role":"analyst"}'

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"pass123"}'
```

---

## Next Steps

1. ✅ Set up API routes for document upload
2. ✅ Implement OCR processing pipeline
3. ✅ Create LangChain agents for analysis
4. ✅ Connect to MongoDB for storage
5. ✅ Setup background job queue with Bull
6. ✅ Implement caching strategy
7. ✅ Add comprehensive error handling
8. ✅ Setup logging and monitoring
