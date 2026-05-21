# Phase 3: Quick Reference Guide

**Quick Start for Developers**

---

## 30-Second Overview

Phase 3 provides **6 specialized LangChain agents** for intelligent fraud detection:

```typescript
import { FraudDetectionAgent } from "src/ai/agents/index.js";
import { getLLMManager } from "src/ai/llm/llm-manager.js";

const llm = await getLLMManager().getModel();
const agent = new FraudDetectionAgent(llm);

const result = await agent.execute({
  documentId: "doc-123",
  documentType: "Income",
  customerName: "John Doe",
  customerEmail: "john@example.com",
  ocrContent: "Extracted text...",
  declaredAmount: 75000,
});

console.log(result.output); // JSON risk analysis
```

---

## 6 Available Agents

| Agent                      | Purpose                               | Input                      | Output                                |
| -------------------------- | ------------------------------------- | -------------------------- | ------------------------------------- |
| **FraudDetectionAgent**    | Orchestrate multi-tool fraud analysis | OCR text + financial data  | Risk analysis + anomalies             |
| **RiskScoringAgent**       | Calculate composite risk score        | Anomalies list             | Risk score + recommendation           |
| **OCRAgent**               | Validate OCR quality                  | OCR text + confidence      | Issues + suggestions                  |
| **DocumentParserAgent**    | Extract structured data               | OCR text + expected fields | Parsed JSON + confidence              |
| **ReportGenerationAgent**  | Create professional reports           | Analysis results           | Formatted report                      |
| **HistoricalContextAgent** | Retrieve historical patterns          | Customer info              | Historical context + risk multipliers |

---

## 4 Built-in Tools

Used automatically by agents:

1. **HistoricalLookupTool** - Search customer history
2. **FinancialAnalysisTool** - Detect financial anomalies
3. **DocumentValidationTool** - Validate document dates/signatures
4. **AnomalyDetectionTool** - Flag fraud keywords/patterns

---

## Common Usage Patterns

### Pattern 1: Full Fraud Analysis Workflow

```typescript
import {
  FraudDetectionAgent,
  RiskScoringAgent,
  ReportGenerationAgent,
} from "src/ai/agents/index.js";

async function analyzeDocument(docId: string) {
  // 1. Detect fraud
  const fraudAgent = new FraudDetectionAgent(llm);
  const fraudResult = await fraudAgent.execute({...});
  const fraud = JSON.parse(fraudResult.output);

  // 2. Calculate risk
  const riskAgent = new RiskScoringAgent(llm);
  const riskResult = await riskAgent.execute({
    anomalies: fraud.anomalies,
    ...
  });
  const risk = JSON.parse(riskResult.output);

  // 3. Generate report
  const reportAgent = new ReportGenerationAgent(llm);
  const reportResult = await reportAgent.execute({...});

  return JSON.parse(reportResult.output);
}
```

### Pattern 2: Simple Risk Scoring

```typescript
const riskAgent = new RiskScoringAgent(llm);
const result = await riskAgent.execute({
  anomalies: [
    { type: "expired_doc", severity: "High", confidence: 0.95 },
    { type: "amount_mismatch", severity: "Medium", confidence: 0.8 },
  ],
  customerName: "John Doe",
  customerEmail: "john@example.com",
  applicationCount: 2,
  ocrConfidence: 85,
  documentType: "Income Statement",
});

const { overallRiskScore, riskLevel, recommendation } = JSON.parse(
  result.output,
);
```

### Pattern 3: Document Processing

```typescript
const ocrAgent = new OCRAgent(llm);
const parserAgent = new DocumentParserAgent(llm);

// Validate OCR
const ocrResult = await ocrAgent.execute({
  ocrText: "...",
  confidence: 85,
  imageQuality: "high",
  documentType: "Income",
});

// Parse structured data
const parseResult = await parserAgent.execute({
  ocrText: "...",
  documentType: "Income",
  expectedFields: ["name", "amount", "date"],
});
```

---

## Error Handling Quick Ref

```typescript
try {
  const result = await agent.execute(input);

  if (!result.success) {
    // Agent failed but didn't throw
    console.error(result.error);
    // Provide fallback
    return { riskScore: 50, riskLevel: "Medium" };
  }

  return JSON.parse(result.output);
} catch (error) {
  // Network/LLM error
  logger.error("Agent failed:", error);
  // Use fallback or retry
}
```

---

## Environment Setup (5 minutes)

```bash
# 1. Set API keys in .env
OPENAI_API_KEY=sk-...
GOOGLE_API_KEY=...

# 2. Start backend
npm run dev

# 3. Verify LLM connectivity
curl http://localhost:3000/api/system/health
```

---

## Troubleshooting

| Error                      | Fix                                           |
| -------------------------- | --------------------------------------------- |
| `OPENAI_API_KEY not found` | Set env var: `export OPENAI_API_KEY="sk-..."` |
| `Agent execution timeout`  | Increase timeout or check LLM status          |
| `Tool execution failed`    | Check database connection                     |
| `Low confidence result`    | Agent recommends manual review                |
| `Fallback activated`       | Primary LLM failed, using Gemini              |

---

## Performance Tips

✅ **DO**:

- Reuse LLM manager: `getLLMManager()`
- Cache agent instances
- Set appropriate temperatures (0.2 for fraud)
- Use reasonable timeouts (30s default)

❌ **DON'T**:

- Create new LLM instances repeatedly
- Create new agents in loops
- Ignore fallback errors
- Set temperature too high (>0.5)

---

## File Locations

```
src/ai/
├── agents/
│   ├── fraud-detection-agent.ts      ← Main fraud analysis
│   ├── risk-scoring-agent.ts         ← Risk calculation
│   ├── report-generation-agent.ts    ← Report creation
│   ├── ocr-agent.ts                  ← OCR validation
│   ├── document-parser-agent.ts      ← Data extraction
│   └── historical-context-agent.ts   ← Pattern analysis
├── tools/
│   └── fraud-detection-tools.ts      ← 4 analysis tools
├── llm/
│   ├── llm-manager.ts                ← LLM orchestration
│   ├── openai-client.ts              ← GPT-4 integration
│   └── gemini-client.ts              ← Gemini fallback
└── prompts/
    ├── fraud-detection-prompt.ts     ← Fraud prompts
    └── risk-scoring-prompt.ts        ← Risk prompts
```

---

## Documentation Files

All in `context/` folder:

1. **PHASE3_IMPLEMENTATION_COMPLETE.md** - Full technical reference
2. **PHASE3_INTEGRATION_GUIDE.md** - Integration examples & patterns
3. **PHASE3_SUMMARY.md** - High-level overview
4. **PHASE3_CHECKLIST.md** - Verification checklist
5. This file! - Quick reference

---

## Key Numbers

- **Risk Score**: 0-100
- **Confidence**: 0-100% (per finding)
- **Risk Levels**: Low (0-30), Medium (31-60), High (61-80), Critical (81-100)
- **Tools**: 4 built-in tools
- **Agents**: 6 specialized agents
- **LLM Options**: OpenAI (primary), Gemini (fallback)
- **Retry Attempts**: 3 (with exponential backoff)
- **Timeout**: 30 seconds

---

## Result Format

```json
{
  "success": true,
  "status": "completed",
  "output": "{...parsed JSON...}",
  "intermediateSteps": [
    { "tool": "historical_lookup", "input": "...", "output": "..." }
  ],
  "executionTime": 8234,
  "agentType": "FraudDetectionAgent"
}
```

---

## Integration Checklist

When adding Phase 3 to a service:

- [ ] Import agent from `src/ai/agents/index.js`
- [ ] Get LLM: `const llm = await getLLMManager().getModel()`
- [ ] Create agent: `new AgentName(llm)`
- [ ] Call execute: `agent.execute(input)`
- [ ] Parse output: `JSON.parse(result.output)`
- [ ] Handle errors with try-catch
- [ ] Log results with logger
- [ ] Add tests

---

## Next Phase

**Phase 4: RAG Pipeline** starts after Phase 3:

- ChromaDB integration
- Vector embeddings
- Similarity search
- Context augmentation

All Phase 3 agents will work with Phase 4 RAG enhancements automatically.

---

**Status**: ✅ Production Ready  
**Version**: 1.0  
**Last Updated**: May 21, 2026
