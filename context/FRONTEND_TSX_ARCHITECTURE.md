# Frontend TypeScript Architecture

This document outlines the architectural conventions established during the migration of the frontend from JavaScript to TypeScript.

## Motivation
Migrating to TypeScript improves code reliability, offers better developer experience through IntelliSense, and enforces a more modular structure, ensuring long-term maintainability for the SecureDocs AI project.

## Directory Structure
To keep type definitions modular and accessible, we have created a dedicated `types` folder within the `src` directory:

```
frontend/src/
  ├── types/
  │   ├── auth.ts       # Authentication and user-related types (e.g. User, AuthState)
  │   ├── dashboard.ts  # Types for dashboard widgets and metrics
  │   ├── document.ts   # Document management and upload types
  │   └── index.ts      # Barrel file for centralized exports
```

## TypeScript Conventions
- **Strict Typing:** All components and services must explicitly define types for their inputs (props) and return values where applicable.
- **Interfaces vs Types:** Use `interface` for defining object shapes (like components' props and API responses). Use `type` aliases for unions, primitives, and complex functional types.
- **Centralized Types:** Always import types from the `src/types/index.ts` barrel file rather than navigating deep into the `types` directory. For example:
  ```typescript
  import { User, AuthState } from '../types';
  ```

## File Extensions
- `.ts`: Used for plain TypeScript files (e.g., services, state stores, utilities, and type definitions).
- `.tsx`: Used for files containing React JSX (e.g., UI components and pages).

## Tooling Integration
- **Vite:** Handled via `@vitejs/plugin-react` and standard `tsconfig.json`.
- **Linting:** ESLint is configured to parse TypeScript through its recommended plugins for a robust developer workflow.
