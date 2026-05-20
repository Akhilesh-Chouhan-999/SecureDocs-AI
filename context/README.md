# SecureDocs AI Context

Use this folder as the source of truth for the current backend shape.

## Most relevant files after the restart

- `README_BACKEND.md`: current backend overview
- `BACKEND_STATUS.md`: implementation status after the refactor
- `BACKEND_FOLDER_STRUCTURE.md`: what each backend folder is doing now
- `QUICK_START.md`: project startup notes
- `SYSTEM_DESIGN.md`: broader product architecture

## Backend snapshot

- Runtime split: `backend/src/app.js` and `backend/src/server.js`
- Active route catalog lives in `backend/src/docs/index.js`
- Route count: 36 documented routes
- Structure is modular, but intentionally flatter than the old overbuilt layout

## Notes

- Some older docs in this folder describe a larger future roadmap.
- For the current implementation, trust the three backend docs above first.
