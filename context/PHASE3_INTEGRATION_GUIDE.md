# Phase 3 Integration Guide - Using LangChain Agents in Backend Services

**Date**: May 21, 2026

---

## Quick Start

### 1. Initialize LLM Manager in Your Service

```typescript
import { getLLMManager } from "../ai/llm/llm-manager.js";

// Get singleton instance
const llmManager = getLLMManager({
  temperature: 0.3,
  maxTokens: 2000,
});

// Get the base LLM for agent initialization
const llm = await llmManager.getModel();
```

### 2. Use Specialized Agents

#### Fraud Detection Workflow

```typescript
import {
  FraudDetectionAgent,
  RiskScoringAgent,
  ReportGenerationAgent,
} from "../ai/agents/index.js";

async function analyzeFraud(documentId: string) {
  // Step 1: Initialize agents
  const fraudAgent = new FraudDetectionAgent(llm);
  const riskAgent = new RiskScoringAgent(llm);
  const reportAgent = new ReportGenerationAgent(llm);

  // Step 2: Run fraud detection
  const fraudResult = await fraudAgent.execute({
    documentId,
    documentType: "Income Statement",
    customerName: "John Doe",
    customerEmail: "john@example.com",
    ocrContent: ocrData,
    declaredAmount: 75000,
    historicalAverage: 65000,
  });

  if (!fraudResult.success) {
    throw new Error(fraudResult.error);
  }

  // Step 3: Calculate risk score
  const fraudAnalysis = JSON.parse(fraudResult.output);
  const riskResult = await riskAgent.execute({
    anomalies: fraudAnalysis.anomalies,
    customerName: "John Doe",
    customerEmail: "john@example.com",
    applicationCount: 2,
    ocrConfidence: 85,
    documentType: "Income Statement",
  });

  const riskAnalysis = JSON.parse(riskResult.output);

  // Step 4: Generate report
  const reportResult = await reportAgent.execute({
    documentId,
    customerName: "John Doe",
    customerEmail: "john@example.com",
    documentType: "Income Statement",
    riskScore: riskAnalysis.overallRiskScore,
    riskLevel: riskAnalysis.riskLevel,
    anomalies: fraudAnalysis.anomalies,
    recommendations: riskAnalysis.actionItems,
    analysisSummary: fraudAnalysis.summary,
    uploadDate: new Date().toISOString(),
  });

  const report = JSON.parse(reportResult.output);

  return {
    fraud: fraudAnalysis,
    risk: riskAnalysis,
    report,
  };
}
```

#### Document Processing Workflow

```typescript
import {
  OCRAgent,
  DocumentParserAgent,
  HistoricalContextAgent,
} from "../ai/agents/index.js";

async function processDocument(ocrText: string, documentType: string) {
  const ocrAgent = new OCRAgent(llm);
  const parserAgent = new DocumentParserAgent(llm);
  const historyAgent = new HistoricalContextAgent(llm);

  // Step 1: Validate OCR
  const ocrValidation = await ocrAgent.execute({
    ocrText,
    confidence: 85,
    imageQuality: "high",
    documentType,
  });

  // Step 2: Parse structured data
  const parsingResult = await parserAgent.execute({
    ocrText,
    documentType,
    expectedFields: ["name", "amount", "date", "signature"],
  });

  const parsed = JSON.parse(parsingResult.output);

  // Step 3: Get historical context
  const historyResult = await historyAgent.execute({
    customerName: parsed.extractedFields.name?.value,
    customerEmail: parsed.extractedFields.email?.value,
    documentType,
    declaredAmount: parsed.extractedFields.amount?.value,
  });

  const history = JSON.parse(historyResult.output);

  return {
    ocr: JSON.parse(ocrValidation.output),
    parsed,
    history,
  };
}
```

---

## Integrating with Existing Services

### In Analysis Service (`src/services/analysis.service.ts`)

```typescript
import {
  FraudDetectionAgent,
  RiskScoringAgent,
  OCRAgent,
  DocumentParserAgent,
} from "../ai/agents/index.js";
import { getLLMManager } from "../ai/llm/llm-manager.js";

export class AnalysisService {
  private llm: any;

  constructor() {
    // Initialize in constructor
    this.initializeLLM();
  }

  private async initializeLLM() {
    const llmManager = getLLMManager();
    this.llm = await llmManager.getModel();
  }

  async analyzeDocument(documentId: string) {
    // Use agents for analysis
    const fraudAgent = new FraudDetectionAgent(this.llm);

    const result = await fraudAgent.execute({
      documentId,
      // ... other parameters
    });

    return JSON.parse(result.output);
  }
}
```

### In Report Service (`src/services/report.service.ts`)

```typescript
import { ReportGenerationAgent } from "../ai/agents/index.js";

export class ReportService {
  async generateReport(analysisData: any) {
    const reportAgent = new ReportGenerationAgent(this.llm);

    const result = await reportAgent.execute({
      documentId: analysisData.documentId,
      customerName: analysisData.customerName,
      // ... other fields
    });

    return JSON.parse(result.output);
  }
}
```

---

## Error Handling Patterns

### Pattern 1: Try-Catch with Fallback

```typescript
try {
  const result = await fraudAgent.execute(input);

  if (!result.success) {
    logger.warn(`Agent failed: ${result.error}`);
    // Provide fallback result
    return {
      riskScore: 50,
      riskLevel: "Medium",
      recommendation: "ManualReview",
      note: "Agent analysis unavailable, defaulting to manual review",
    };
  }

  return JSON.parse(result.output);
} catch (error) {
  logger.error("Agent execution error:", error);
  throw new Error(`Analysis failed: ${error.message}`);
}
```

### Pattern 2: Fallback to Simple Analysis

```typescript
async function analyzeWithFallback(documentId: string) {
  try {
    const fraudAgent = new FraudDetectionAgent(llm);
    const result = await fraudAgent.execute({
      documentId,
      // ... parameters
    });

    return JSON.parse(result.output);
  } catch (error) {
    logger.warn("LLM agent failed, using rule-based analysis");
    // Fall back to rule-based system
    return await ruleBasedAnalysis(documentId);
  }
}
```

---

## Monitoring & Debugging

### Check LLM Manager Stats

```typescript
import { getLLMManager } from "../ai/llm/llm-manager.js";

const llmManager = getLLMManager();

// Get statistics
const stats = llmManager.getStats();
console.log(stats);
// Output: {
//   config: { ... },
//   callStats: { openaiSuccesses: 10, openaiFailures: 1, ... },
//   successRate: { openai: "90.91%", gemini: "N/A" }
// }
```

### Enable Debug Logging

```bash
# In .env file
LOG_LEVEL=debug

# or at runtime
export LOG_LEVEL=debug
```

### Check Agent Status

```typescript
const fraudAgent = new FraudDetectionAgent(llm);

console.log(fraudAgent.getAgentName()); // "FraudDetectionAgent"
console.log(fraudAgent.getToolsCount()); // 4
```

---

## Performance Tips

### 1. Reuse LLM Manager Instance

```typescript
// ❌ DON'T - Creates new instance every time
const llm1 = await new LLMManager().getModel();
const llm2 = await new LLMManager().getModel();

// ✅ DO - Use singleton
const llm = await getLLMManager().getModel();
```

### 2. Cache Agent Instances

```typescript
class AnalysisService {
  private fraudAgent: FraudDetectionAgent | null = null;

  private getFraudAgent() {
    if (!this.fraudAgent) {
      this.fraudAgent = new FraudDetectionAgent(this.llm);
    }
    return this.fraudAgent;
  }

  async analyze(documentId: string) {
    return this.getFraudAgent().execute(input);
  }
}
```

### 3. Use Appropriate Temperature Settings

```typescript
// For fraud detection (deterministic)
llmManager.updateConfig({ temperature: 0.2 });

// For report generation (more creative)
llmManager.updateConfig({ temperature: 0.5 });
```

### 4. Monitor Timeouts

```typescript
// Set timeout for long operations
const timeoutPromise = new Promise((_, reject) =>
  setTimeout(() => reject(new Error("Timeout")), 30000),
);

const analysisPromise = fraudAgent.execute(input);

try {
  return await Promise.race([analysisPromise, timeoutPromise]);
} catch (error) {
  if (error.message === "Timeout") {
    logger.warn("Agent analysis timeout, using fallback");
  }
  throw error;
}
```

---

## Testing Agents Locally

### Manual Testing

```typescript
import { FraudDetectionAgent } from "../ai/agents/index.js";
import { getLLMManager } from "../ai/llm/llm-manager.js";

async function testAgent() {
  const llm = await getLLMManager().getModel();
  const agent = new FraudDetectionAgent(llm);

  const result = await agent.execute({
    documentId: "test-doc-1",
    documentType: "Income Statement",
    customerName: "Test User",
    customerEmail: "test@example.com",
    ocrContent: `
      Customer Name: Test User
      Income: $75,000
      Document Type: Income Statement
      Issue Date: 2024-01-15
      Expiry Date: 2025-01-15
    `,
    declaredAmount: 75000,
    historicalAverage: 65000,
  });

  console.log("Agent Result:", result);
  console.log("Parsed Output:", JSON.parse(result.output));
}

testAgent().catch(console.error);
```

### Unit Test Example

```typescript
import { FraudDetectionAgent } from "../../ai/agents/index.js";

describe("FraudDetectionAgent", () => {
  let agent: FraudDetectionAgent;
  let mockLLM: any;

  beforeEach(() => {
    mockLLM = {
      invoke: jest.fn().mockResolvedValue({
        content: '{"riskScore": 45, "riskLevel": "Low"}',
      }),
    };
    agent = new FraudDetectionAgent(mockLLM);
  });

  it("should execute fraud detection", async () => {
    const result = await agent.execute({
      documentId: "doc-1",
      documentType: "Income",
      customerName: "Test",
      customerEmail: "test@example.com",
      ocrContent: "Test content",
    });

    expect(result.success).toBe(true);
    expect(result.status).toBe("completed");
  });
});
```

---

## Troubleshooting

| Issue                         | Solution                                     |
| ----------------------------- | -------------------------------------------- |
| `OPENAI_API_KEY not found`    | Set environment variable before starting     |
| `Agent initialization failed` | Check LLM API keys and network connectivity  |
| `Tool execution timeout`      | Increase timeout in config or check database |
| `Low OCR confidence`          | Agent recommends manual review               |
| `High latency`                | May be due to LLM API - check OpenAI status  |
| `Fallback activation`         | Primary LLM failed 3x, now using Gemini      |

---

## Next Steps

After Phase 3, you can now:

1. **Integrate into existing services** - Use agents in analysis/report controllers
2. **Build workflow orchestration** - Chain agents for complex analysis
3. **Add RAG (Phase 4)** - Enhance agent context with vector search
4. **Monitor performance** - Track agent execution times and success rates
5. **Implement caching** - Cache embeddings and results for fast lookups

---

## Architecture Diagram

```
API Controller
    ↓
Service Layer
    ↓
Agent Layer (Phase 3)
├── FraudDetectionAgent ─→ Tools: Historical, Financial, Document, Anomaly
├── RiskScoringAgent ────→ Risk Calculation
├── ReportGenerationAgent → Professional Report
└── Other Agents ────────→ Support Operations
    ↓
LLM Manager (Fallback Support)
├── OpenAI (Primary)
└── Gemini (Fallback)
    ↓
Database/External Services
├── HistoricalRecord
├── Document
└── FraudReport
```

---

**Version**: 1.0  
**Last Updated**: May 21, 2026  
**Status**: Production Ready
