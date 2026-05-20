# Architecture Context

MongoDB + ChromaDB

---

# Services

## Frontend

Responsibilities:

- document upload
- dashboard visualization
- fraud reports
- anomaly highlighting
- risk score display

---

## Backend

Responsibilities:

- authentication
- file upload APIs
- database operations
- AI service communication
- report storage

---

## Backend AI Engine (Node.js + LangChain.js)

Responsibilities:

- OCR extraction (Tesseract.js)
- document parsing (NLP)
- anomaly detection (algorithms)
- LLM analysis (LangChain agents)
- RAG pipeline (vector search)
- risk scoring (composite calculation)

Location: `/backend/src/ai/`

Key Files:

- `ocr.service.js` - Tesseract.js wrapper
- `llm.service.js` - LangChain client
- `rag.service.js` - ChromaDB integration
- `agents/` - LangChain agent definitions
- `prompts/` - Structured prompt templates

---

# AI Pipeline

PDF/Image
↓
OCR
↓
Structured Parsing
↓
Historical Record Matching
↓
Fraud Analysis
↓
Risk Score
↓
AI Summary

---

# Database Collections

## users

Stores:

- user info
- roles
- authentication

## historical_records

Stores:

- previous ownership data
- financial records
- legal references

## fraud_reports

Stores:

- anomalies
- risk scores
- AI summaries
