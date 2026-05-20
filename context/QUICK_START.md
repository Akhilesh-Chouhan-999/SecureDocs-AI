# Quick Start Guide (JavaScript Stack)

## TL;DR - Get Running in 10 Minutes

### Step 1: Clone & Setup

```bash
git clone <repo-url>
cd backend
npm install
cp .env.example .env  # Fill in API keys!
```

### Step 2: Configure .env (Must Have)

```env
# Required
OPENAI_API_KEY=sk-your-key-here
MONGODB_URI=mongodb://localhost:27017/securedoc_ai
JWT_SECRET=<generate-with-node-crypto>

# Optional (defaults provided)
PORT=5000
NODE_ENV=development
```

### Step 3: Start Services

```bash
# Terminal 1: MongoDB
mongod

# Terminal 2: Redis
redis-server

# Terminal 3: Backend
npm run dev
```

### Step 4: Test Backend

```bash
# Health check
curl http://localhost:5000/health

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"pass123","organization":"TestBank"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"pass123"}'
```

### Step 5: Upload Document (with JWT token)

```bash
TOKEN="your-jwt-token-from-login"

curl -X POST http://localhost:5000/api/documents/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "document=@document.pdf"
```

---

## API Endpoints Cheat Sheet

```
POST   /api/auth/register             Register new user
POST   /api/auth/login                Login user
POST   /api/auth/refresh-token        Rotate access token
GET    /api/auth/profile              Get current profile
POST   /api/documents/upload          Upload document
GET    /api/documents                 List current user documents
GET    /api/documents/:id             Get document
DELETE /api/documents/:id             Delete document
POST   /api/analysis/analyze          Start analysis
POST   /api/analysis/ocr              Extract OCR text only
POST   /api/analysis/anomalies        Detect anomalies
POST   /api/analysis/risk-score       Calculate risk score
GET    /api/analysis/status/:documentId Get analysis status
GET    /api/analysis/results/:documentId Get analysis results
GET    /api/reports/:reportId         Get fraud report
GET    /api/reports                   List reports
GET    /api/reports/:reportId/download Download report payload
GET    /api/history/:email            Get user history
GET    /api/jobs                      List jobs
POST   /api/jobs/analysis             Queue analysis job
GET    /api/jobs/:jobId/status        Get job status
POST   /api/jobs/:jobId/cancel        Cancel job
```

---

## Common Issues

| Issue                            | Fix                                           |
| -------------------------------- | --------------------------------------------- |
| "Cannot find module 'langchain'" | Run `npm install langchain @langchain/openai` |
| "MongoDB connection refused"     | Start mongod: `mongod`                        |
| "OPENAI_API_KEY is undefined"    | Check .env file and restart app               |
| "Redis connection failed"        | Start redis: `redis-server`                   |
| "Port 5000 already in use"       | Change PORT in .env or `lsof -i :5000`        |

---

## File Upload Example (JavaScript)

```javascript
const formData = new FormData();
formData.append("document", fileInputElement.files[0]);

const response = await fetch("http://localhost:5000/api/documents/upload", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
  },
  body: formData,
});

const result = await response.json();
console.log("Document ID:", result.document.id);
```

---

## Next: Detailed Setup

See `BACKEND_SETUP.md` for complete step-by-step instructions.
