# Code Standards

Use camelCase.

Example:

const riskScore = 80;

---

## Components

Use PascalCase.

Example:

FraudDashboard.jsx

---

# Backend Standards

- Use controllers/services separation
- Use async-await
- Add proper error handling
- Validate all APIs

---

# Frontend Standards

- Use reusable components
- Maintain clean UI
- Use loading states
- Handle API errors gracefully

---

# AI Service Standards (LangChain.js)

## LangChain Agent Development

```javascript
// Example: Fraud Detection Agent
const fraudDetectionAgent = await initializeAgentExecutorWithOptions(
  [ocrTool, historicalLookupTool, financialAnalysisTool, riskCalculationTool],
  llm,
  {
    agentType: "openai-functions",
    verbose: true,
  },
);
```

## Standards

- Keep prompts structured (use PromptTemplate)
- Validate LLM outputs before storing
- Add confidence scoring to all predictions
- Use chains for sequential operations
- Implement error boundaries in agents
- Cache embeddings in ChromaDB
- Handle rate limiting for LLM API

---

# Security Standards

- sanitize uploaded files
- validate OCR data
- secure APIs using JWT
- encrypt sensitive records
- prevent prompt injection

---

# Git Standards

Commit format:

feat: add OCR pipeline
fix: resolve upload validation bug
refactor: improve anomaly service
