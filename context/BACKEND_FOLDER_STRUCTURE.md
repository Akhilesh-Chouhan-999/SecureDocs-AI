# Backend Folder Structure

The backend keeps a flat-enough structure so it stays readable, but each folder now has a concrete role.

## Runtime entry

```text
backend/src/
  app.js
  server.js
  index.js
```

- `app.js`: Express app assembly only
- `server.js`: startup only
- `index.js`: compatibility export

## Core application folders

```text
config/         environment, database, container, llm config
routes/         route definitions, including system routes
controllers/    HTTP handlers
services/       business workflows
repositories/   persistence helpers
middleware/     auth, validation, upload, error handling
errors/         AppError, AuthError, NotFoundError, ValidationError
utils/          response and token helpers
```

## Shared logic folders

```text
constants/      app enums and shared statuses
types/          route groups, regex, mime types
helpers/        compact object and text helpers
logs/           simple JSON logger
core/           base repository contract
interfaces/     DI token list
domain/         pure entity mappers and risk rules
```

## SecureDocs-specific support folders

```text
ai/             parser, memory, embedding, rag, ingestion, workflow helpers
infrastructure/ storage, database models, queue workers, ai tools, cache
jobs/           job record builders
events/         job lifecycle event names
listeners/      event listeners for job lifecycle logging
uploads/        upload configuration summary
docs/           route catalog and module summaries
sockets/        Socket.IO bootstrap
schedulers/     future scheduled task registry
```

## Why this is not over-engineered

- The HTTP path is still straightforward: route -> controller -> service -> repository.
- Support folders only contain small reusable modules.
- We avoided adding extra layers like factories, api subtrees, or deep domain nesting.
- `app.js` and `server.js` separate construction from startup, which keeps testing and maintenance easier.
