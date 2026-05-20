# API Keys & Environment Setup Guide

## Overview

This document covers how to obtain, configure, and manage API keys for SecureDoc AI's JavaScript stack.

---

## 1. OpenAI API Key

### Get Your Key

1. Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Click "Create new secret key"
3. Copy the key (you won't be able to see it again)
4. Set usage limits and quotas

### Add to .env

```env
OPENAI_API_KEY=sk-your-actual-key-here
```

### Usage in Code

```javascript
const { ChatOpenAI } = require("@langchain/openai");

const llm = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  modelName: "gpt-4",
  temperature: 0.7,
});
```

### Pricing

- **Input**: $0.003 per 1K tokens
- **Output**: $0.006 per 1K tokens
- Monitor at: [https://platform.openai.com/account/billing/overview](https://platform.openai.com/account/billing/overview)

---

## 2. Google Gemini API Key

### Get Your Key

1. Go to [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Select project or create new one
4. Copy and save securely

### Add to .env

```env
GEMINI_API_KEY=your-gemini-key-here
```

### Usage in Code

```javascript
const { GoogleGenerativeAI } = require("@google/generative-ai");

const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = client.getGenerativeModel({ model: "gemini-pro" });
```

### Pricing

- Free tier: 60 requests per minute
- Paid: $0.000075 per 1K input tokens, $0.000300 per 1K output tokens

---

## 3. MongoDB Connection

### Local MongoDB

```bash
# Install MongoDB Community Edition
# https://docs.mongodb.com/manual/installation/

# Start MongoDB
mongod

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### MongoDB Atlas (Cloud)

1. Go to [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Create database user (username/password)
4. Whitelist your IP
5. Copy connection string

### .env Configuration

```env
# Local
MONGODB_URI=mongodb://localhost:27017/securedoc_ai

# Atlas (cloud)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/securedoc_ai?retryWrites=true&w=majority
MONGODB_USER=your_username
MONGODB_PASSWORD=your_password
```

---

## 4. Redis Setup (For Job Queue)

### Local Redis

```bash
# macOS
brew install redis
redis-server

# Docker
docker run -d -p 6379:6379 --name redis redis:latest

# Windows (WSL2)
wsl -d Ubuntu
sudo apt-get update
sudo apt-get install redis-server
redis-server
```

### Add to .env

```env
REDIS_URL=redis://localhost:6379
```

### Usage with Bull Queue

```javascript
const Queue = require("bull");

const analysisQueue = new Queue("document-analysis", process.env.REDIS_URL);

analysisQueue.process(async (job) => {
  console.log("Processing job:", job.id);
  // Process document analysis
  return { status: "completed" };
});
```

---

## 5. JWT Secrets

### Generate Secure Secrets

```bash
# Generate JWT Secret (64 chars)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate Refresh Token Secret (64 chars)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Add to .env

```env
JWT_SECRET=<your-generated-secret-here>
JWT_EXPIRY=15m
REFRESH_TOKEN_SECRET=<your-generated-secret-here>
REFRESH_TOKEN_EXPIRY=7d
```

### Usage

```javascript
const jwt = require("jsonwebtoken");

// Generate token
const token = jwt.sign(
  { userId: user._id, email: user.email },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRY },
);

// Verify token
const decoded = jwt.verify(token, process.env.JWT_SECRET);
```

---

## 6. ChromaDB Setup

### Install and Start

```bash
# Using pip
pip install chromadb

# Start ChromaDB server
chroma run --host localhost --port 8000

# Or Docker
docker run -p 8000:8000 chromadb/chroma:latest
```

### Add to .env

```env
CHROMA_DB_URL=http://localhost:8000
```

### JavaScript Integration

```javascript
const { ChromaClient } = require("chromadb");

const client = new ChromaClient({
  path: process.env.CHROMA_DB_URL,
});

// Create collection
const collection = await client.getOrCreateCollection({
  name: "document_embeddings",
});

// Add documents
await collection.add({
  ids: ["doc1", "doc2"],
  documents: ["This is a document", "Another document"],
  embeddings: [
    [1.2, 2.3],
    [4.5, 6.7],
  ],
});

// Query
const results = await collection.query({
  queryEmbeddings: [[1.1, 2.2]],
  nResults: 10,
});
```

---

## 7. SMTP Email Configuration

### Gmail Setup

1. Go to [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Select "Mail" and "Windows Computer"
3. Generate app password (16 characters)
4. Copy to .env

### .env Configuration

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=<16-char-app-password>
SMTP_FROM=noreply@securedocai.com
```

### Usage

```javascript
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

await transporter.sendMail({
  from: process.env.SMTP_FROM,
  to: user.email,
  subject: "Analysis Complete",
  text: "Your document analysis is ready.",
});
```

---

## 8. Tesseract.js Setup

### Installation

```bash
npm install tesseract.js
```

### No API Key Required

Tesseract.js works locally without API keys. It downloads language models on first use.

### Usage

```javascript
const Tesseract = require("tesseract.js");

const {
  data: { text },
} = await Tesseract.recognize("image.jpg", "eng");
console.log(text);
```

---

## 9. LangChain.js Setup

### Installation

```bash
npm install langchain @langchain/openai @langchain/core
```

### No Separate API Key

Uses existing OpenAI or Gemini API keys from .env

### Basic Usage

```javascript
const { ChatOpenAI } = require("@langchain/openai");
const { PromptTemplate } = require("@langchain/core/prompts");

const llm = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const template = "You are a fraud detection expert. Analyze: {document}";
const prompt = new PromptTemplate({
  template,
  inputVariables: ["document"],
});

const chain = prompt.pipe(llm);
const result = await chain.invoke({ document: extractedText });
```

---

## 10. Complete .env Example

```env
# ===== Server =====
NODE_ENV=development
PORT=5000
HOST=localhost

# ===== Database =====
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/securedoc_ai
MONGODB_USER=your_username
MONGODB_PASSWORD=your_password

# ===== Authentication =====
JWT_SECRET=your-generated-64-char-secret-here
JWT_EXPIRY=15m
REFRESH_TOKEN_SECRET=your-generated-64-char-secret-here
REFRESH_TOKEN_EXPIRY=7d

# ===== LLM Providers (Choose at least one) =====
OPENAI_API_KEY=sk-your-openai-key-here
GEMINI_API_KEY=your-gemini-key-here
LANGCHAIN_API_KEY=

# ===== Vector Database =====
CHROMA_DB_URL=http://localhost:8000

# ===== File Upload =====
MAX_FILE_SIZE=52428800  # 50MB in bytes
UPLOAD_DIR=./uploads

# ===== Cache & Queue =====
REDIS_URL=redis://localhost:6379

# ===== Email =====
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-char-app-password
SMTP_FROM=noreply@securedocai.com

# ===== Logging =====
LOG_LEVEL=debug
LOG_FILE=./logs/app.log

# ===== Security =====
BCRYPT_ROUNDS=10
CORS_ORIGIN=http://localhost:3000

# ===== Monitoring =====
SENTRY_DSN=
```

---

## 11. Security Best Practices

### ✅ DO:

- Store API keys in `.env` (never in code)
- Rotate API keys regularly
- Use environment-specific keys
- Set up usage alerts
- Enable IP whitelisting
- Use least-privilege access

### ❌ DON'T:

- Commit `.env` to Git
- Share API keys in Slack/email
- Use same key for dev/prod
- Leave API keys hardcoded
- Ignore API usage warnings

---

## 12. Environment-Specific Setup

### Development (.env.development)

```env
NODE_ENV=development
OPENAI_API_KEY=<dev-key>
MONGODB_URI=mongodb://localhost:27017/securedoc_ai_dev
LOG_LEVEL=debug
```

### Staging (.env.staging)

```env
NODE_ENV=staging
OPENAI_API_KEY=<staging-key>
MONGODB_URI=mongodb+srv://user:pass@staging-cluster.mongodb.net/securedoc_ai_staging
LOG_LEVEL=info
```

### Production (.env.production)

```env
NODE_ENV=production
OPENAI_API_KEY=<prod-key>
MONGODB_URI=mongodb+srv://user:pass@prod-cluster.mongodb.net/securedoc_ai
LOG_LEVEL=warn
SENTRY_DSN=<sentry-dsn>
```

---

## 13. Troubleshooting

### "OPENAI_API_KEY is not valid"

- Check key format (starts with `sk-`)
- Ensure no extra spaces in `.env`
- Verify key hasn't been revoked
- Test at [https://platform.openai.com/docs/api-reference](https://platform.openai.com/docs/api-reference)

### "MongoDB connection failed"

- Check connection string format
- Verify MongoDB service is running
- Whitelist your IP (if using Atlas)
- Test with: `mongo <connection-string>`

### "Redis connection refused"

- Ensure Redis is running (`redis-cli ping`)
- Check REDIS_URL format
- Verify port 6379 is accessible

### "Tesseract.js slow on first run"

- First run downloads ~65MB language model
- Subsequent runs are cached
- Use with larger files to see efficiency gains

---

## 14. API Key Rotation Schedule

| Service       | Frequency      | Method                                  |
| ------------- | -------------- | --------------------------------------- |
| OpenAI        | Monthly        | Create new key, update .env, delete old |
| Gemini        | Quarterly      | Revoke old, generate new in console     |
| MongoDB       | Quarterly      | Change password in Atlas                |
| JWT Secret    | Yearly         | Generate new, update env                |
| SMTP Password | Every 6 months | Update app password                     |
