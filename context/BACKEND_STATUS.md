# SecureDocs AI Backend Status

Last updated: 2026-05-17

## Current state

- Express app split into `src/app.js` and `src/server.js`
- Mongo bootstrap isolated from app construction
- Route catalog added in `src/docs/index.js`
- System endpoints added for API overview and module visibility
- Empty placeholder folders replaced with small active modules
- Analysis flow now uses shared AI/domain helpers instead of one large placeholder method

## Implemented route groups

- System: 7 routes
- Auth: 5 routes
- Documents: 4 routes
- Analysis: 6 routes
- History: 2 routes
- Reports: 7 routes
- Jobs: 5 routes

Total documented routes: 36

## What works now

- Auth registration, login, refresh, logout, and profile flow
- Protected document upload and document ownership checks
- OCR-only, full-analysis, anomaly, and risk-score endpoints
- Fraud anomaly generation through shared workflow helpers
- Report creation with centralized risk scoring, review decisions, and PDF download
- Historical lookup endpoint plus admin search for prior-record review
- Job creation, listing, retry, cancellation, and status tracking with queue-ready lifecycle events
- Socket bootstrap for future live updates
- Route-surface tests covering the new workflow endpoints

## Why the route count is above 12

The project needed at least 10-12 valid routes, but SecureDocs naturally breaks into seven real backend areas. Cutting the API down to exactly 12 would force unrelated actions into the same endpoints and make the design less clear. The current route set stays modular while keeping each route tied to a real business action.

## Still lightweight by design

- OCR output is still mocked text, not Tesseract runtime output
- Redis/Bull queue is not active yet
- Scheduler entries are documentation-first
- No automated test suite was added in this pass

## Next sensible steps

1. Replace mocked OCR in `src/services/analysis.service.js`
2. Add integration tests for auth, documents, and analysis
3. Upgrade in-memory jobs to Bull/Redis
4. Add persistence-backed analysis history if needed
