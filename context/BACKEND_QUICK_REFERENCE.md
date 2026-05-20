# Backend Implementation Checklist & Quick Reference

## Quick Start Commands

```bash
# Install dependencies
cd backend
npm install

# Environment setup
cp .env.example .env
# Edit .env with your configuration

# Run development server
npm run dev

# Run tests
npm test

# Format code
npm run format

# Lint code
npm run lint
```

---

## API Testing with curl

### Authentication

```bash
# Register new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "organization": "Test Org",
    "role": "analyst"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Health Check

```bash
curl http://localhost:5000/health
```

### Document Upload (Protected)

```bash
# Replace TOKEN with actual JWT
curl -X POST http://localhost:5000/api/documents/upload \
  -H "Authorization: Bearer TOKEN" \
  -F "document=@/path/to/file.pdf"

# Get all documents
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/documents

# Get single document
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/documents/DOCUMENT_ID
```

### Analysis

```bash
# Perform OCR analysis
curl -X POST http://localhost:5000/api/analysis/ocr \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"documentId": "DOCUMENT_ID"}'

# Detect anomalies
curl -X POST http://localhost:5000/api/analysis/anomalies \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"documentId": "DOCUMENT_ID"}'

# Calculate risk score
curl -X POST http://localhost:5000/api/analysis/risk-score \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"documentId": "DOCUMENT_ID"}'
```

### Reports

```bash
# Generate report
curl -X POST http://localhost:5000/api/reports/generate \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "documentId": "DOCUMENT_ID",
    "anomalies": [...]
  }'

# Get report
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/reports/REPORT_ID

# Get all reports
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/reports

# Review a report
curl -X POST http://localhost:5000/api/reports/REPORT_ID/review \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"decision":"approved","notes":"Validated by underwriting"}'
```

### Jobs

```bash
# Queue analysis job
curl -X POST http://localhost:5000/api/jobs/analysis \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"documentId": "DOCUMENT_ID"}'

# List jobs
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/jobs

# Cancel job
curl -X POST http://localhost:5000/api/jobs/JOB_ID/cancel \
  -H "Authorization: Bearer TOKEN"

# Retry failed or canceled job
curl -X POST http://localhost:5000/api/jobs/JOB_ID/retry \
  -H "Authorization: Bearer TOKEN"
```

### History

```bash
# Get historical context
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/history/user@example.com
```

---

## File Structure Quick Reference

### Adding a New Feature

#### 1. Create Controller

**File:** `src/controllers/feature.controller.js`

```javascript
class FeatureController {
  static async method(req, res, next) {
    try {
      // Implementation
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
module.exports = FeatureController;
```

#### 2. Create Routes

**File:** `src/routes/feature.routes.js`

```javascript
const router = express.Router();
router.post("/", authMiddleware, FeatureController.method);
module.exports = router;
```

#### 3. Create Service

**File:** `src/services/feature.service.js`

```javascript
class FeatureService {
  static async businessLogic() {
    // Implementation
  }
}
module.exports = FeatureService;
```

#### 4. Update Module Exports

**File:** `src/controllers/index.js`

```javascript
const FeatureController = require('./feature.controller');
module.exports = { ..., FeatureController };
```

#### 5. Register Routes

**File:** `src/index.js`

```javascript
app.use("/api/feature", featureRoutes);
```

---

## Database Operations

### Create Document

```javascript
const { Document } = require("./infrastructure/database/models");

const doc = await Document.create({
  user: userId,
  fileName: "file.pdf",
  filePath: "/path/to/file",
  fileSize: 1024,
  fileType: "application/pdf",
});
```

### Find & Update

```javascript
const doc = await Document.findByIdAndUpdate(
  id,
  { status: "completed" },
  { new: true },
);
```

### Query with Relationships

```javascript
const report = await FraudReport.findById(id)
  .populate("document")
  .populate("analyst", "-password");
```

---

## Authentication Pattern

### Protecting Routes

```javascript
// In routes file
router.post('/protected', authMiddleware, Controller.method);

// In controller
static async method(req, res, next) {
  // req.user contains the authenticated user
  console.log(req.user._id, req.user.email, req.user.role);
}
```

### Checking User Role

```javascript
static async adminOnly(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  // Continue
}
```

---

## Error Handling

### In Controller

```javascript
try {
  const result = await someOperation();
  res.json({ success: true, data: result });
} catch (error) {
  // Passes to global error handler
  next(error);
}
```

### Custom Errors

```javascript
const error = new Error("Custom message");
error.status = 400; // HTTP status code
next(error);
```

---

## Common Patterns

### Pagination

```javascript
// In controller
const page = req.query.page || 1;
const limit = req.query.limit || 10;
const skip = (page - 1) * limit;

const items = await Model.find().skip(skip).limit(limit);

const total = await Model.countDocuments();
res.json({
  items,
  pagination: { page, limit, total },
});
```

### Filtering

```javascript
const filter = {};
if (req.query.status) filter.status = req.query.status;
if (req.query.user) filter.user = req.query.user;

const items = await Model.find(filter);
```

### Sorting

```javascript
const sortBy = req.query.sortBy || "-createdAt"; // '-' for descending
const items = await Model.find().sort(sortBy);
```

---

## Testing Examples

### Unit Test (Jest)

```javascript
describe("AuthController", () => {
  it("should register user", async () => {
    const req = { body: { email: "test@test.com", password: "pass" } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await AuthController.register(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
  });
});
```

### Integration Test

```javascript
describe("Auth Routes", () => {
  it("POST /api/auth/register should create user", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({ email: "test@test.com", password: "pass" });

    expect(response.status).toBe(201);
  });
});
```

---

## Debugging

### Enable Debug Logging

```bash
DEBUG=* npm run dev
```

### Common Issues

**MongoDB Connection Error**

```javascript
// Check: .env has MONGODB_URI
// Ensure: MongoDB is running
// Verify: Connection string format
```

**JWT Token Invalid**

```javascript
// Ensure Bearer prefix: "Authorization: Bearer TOKEN"
// Check: JWT_SECRET in .env
// Verify: Token hasn't expired
```

**File Upload Issues**

```javascript
// Check: multer limits in upload.middleware.js
// Ensure: uploads/ directory exists and is writable
// Verify: Content-Type header is form-data
```

---

## Performance Tips

### Database

```javascript
// Add indexes for frequently queried fields
userSchema.index({ email: 1 });
documentSchema.index({ user: 1, createdAt: -1 });

// Use select() to limit fields
User.findById(id).select("-password");

// Use lean() for read-only queries
Document.find().lean();
```

### Caching

```javascript
// Store frequently accessed data
const cacheKey = `user:${userId}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

// Set cache with TTL
await redis.setex(cacheKey, 3600, JSON.stringify(data));
```

---

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Database backups setup
- [ ] Error tracking (Sentry) configured
- [ ] Logging service setup
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] JWT secret is strong
- [ ] Database indexes created
- [ ] File upload limits set
- [ ] Health check endpoint working

---

## Documentation Files Location

| Document       | Path                              | Purpose                |
| -------------- | --------------------------------- | ---------------------- |
| Architecture   | `context/architecture-context.md` | System design          |
| Setup Guide    | `context/BACKEND_SETUP.md`        | Installation steps     |
| Phases         | `context/BACKEND_PHASES.md`       | Implementation roadmap |
| Progress       | `context/progress-tracker.md`     | Project status         |
| API Keys       | `context/API_KEYS_SETUP.md`       | Third-party setup      |
| Backend README | `backend/README.md`               | Code documentation     |

---

## Next Steps

1. **Test Current Setup**
   - Run `npm install`
   - Start server with `npm run dev`
   - Test endpoints with provided curl commands

2. **Implement Phase 2**
   - Install Tesseract.js
   - Build OCR service
   - Create analysis endpoints

3. **Add Tests**
   - Create test files in `/tests`
   - Aim for 80%+ coverage

4. **Documentation**
   - Update progress-tracker.md
   - Document API changes
   - Add deployment notes

---

## Support

For questions or issues:

1. Check documentation in `/context`
2. Review similar implementations in codebase
3. Check error logs in console
4. Refer to third-party library documentation

Last Updated: May 16, 2026
