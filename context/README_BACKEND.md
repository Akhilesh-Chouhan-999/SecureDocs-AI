# SecureDocs AI Backend

This backend is now organized around a simple runtime split:

- `src/app.js`: builds the Express app, middleware, and routes.
- `src/server.js`: connects MongoDB, starts HTTP, and initializes sockets.
- `src/index.js`: compatibility export that forwards to `server.js`.

## Current goals

- Keep the architecture modular without adding deep nesting.
- Make each existing folder do a real job.
- Keep the API practical for SecureDocs workflows: auth, documents, analysis, reports, jobs, and system metadata.

## Active route surface

There are 36 working routes documented in `src/docs/index.js`.

Main groups:

- `system`: `/`, `/health`, `/ready`, `/api`, `/api/system/*`
- `auth`: register, login, refresh-token, logout, profile
- `documents`: upload, list, get one, delete one
- `analysis`: full analysis, OCR-only, anomaly-only, risk-score, status, results
- `history`: lookup by email and admin search
- `reports`: generate, list mine, list by user, get one, download PDF, review, delete
- `jobs`: list, queue analysis, job status, retry, cancel

## Folder usage

These folders are now actively used instead of being empty placeholders:

- `constants`, `types`, `helpers`, `logs`
- `domain/entities`, `domain/usecases`
- `ai/*` workflow helpers
- `infrastructure/storage`, `infrastructure/queue/workers`, `infrastructure/ai/tools`, `infrastructure/cache`
- `events`, `listeners`, `jobs`, `uploads`, `docs`, `sockets`, `schedulers`

## What is still intentionally lightweight

- OCR is still a mocked implementation, but the flow is real and upgrade-ready.
- Job queue behavior is in-memory for now, with events and socket hooks already wired.
- Scheduler definitions are documented but not running yet.

## Run

```bash
cd backend
npm install
npm run dev
```

Server entry:

```bash
node src/server.js
```
