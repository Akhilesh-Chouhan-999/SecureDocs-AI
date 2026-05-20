# LangChain.js AI Agents Guide

## Overview

This guide covers building, testing, and deploying LangChain.js agents for SecureDoc AI fraud detection.

---

## 1. LangChain.js Basics

### Installation

```bash
npm install langchain @langchain/openai @langchain/core
npm install @langchain/community  # For additional tools
```

### Core Concepts

- **LLM**: Language model (ChatOpenAI, ChatGoogleGenerativeAI)
- **Tools**: Functions agent can call (custom or built-in)
- **Agents**: Orchestrators that decide which tool to use
- **Chains**: Sequential operations (Prompt → LLM → Parser)
- **Memory**: Conversation history (not used in fraud detection)

---

## 2. Define Tools for Fraud Detection

Create `src/ai/tools/fraudDetectionTools.js`:

```javascript
const { Tool } = require("@langchain/core/tools");
const HistoricalRecord = require("../../api/models/HistoricalRecord");

// Tool 1: Historical Lookup
const historicalLookupTool = new Tool({
  name: "historical_lookup",
  description: "Lookup historical records for a customer by email or name",
  schema: z.object({
    email: z.string().email().optional(),
    name: z.string().optional(),
  }),
  func: async ({ email, name }) => {
    try {
      const query = email ? { ownerEmail: email } : { ownerName: name };
      const records = await HistoricalRecord.findOne(query);

      if (!records) return JSON.stringify({ status: "not_found" });

      return JSON.stringify({
        status: "found",
        previousApplications: records.previousApplications || [],
        legalRecords: records.legalRecords || [],
        riskFactors: records.riskFactors || [],
      });
    } catch (error) {
      return JSON.stringify({ error: error.message });
    }
  },
});

// Tool 2: Financial Analysis
const financialAnalysisTool = new Tool({
  name: "financial_analysis",
  description: "Analyze financial patterns and detect anomalies",
  schema: z.object({
    amount: z.number(),
    expectedRange: z.object({ min: z.number(), max: z.number() }),
    transactionHistory: z.array(z.number()).optional(),
  }),
  func: async ({ amount, expectedRange, transactionHistory }) => {
    const anomalies = [];

    if (amount < expectedRange.min || amount > expectedRange.max) {
      anomalies.push({
        type: "amount_mismatch",
        severity: "high",
        expectedRange,
        actual: amount,
      });
    }

    if (transactionHistory && transactionHistory.length > 0) {
      const avg =
        transactionHistory.reduce((a, b) => a + b) / transactionHistory.length;
      const deviation = Math.abs(amount - avg) / avg;

      if (deviation > 0.5) {
        // 50% deviation
        anomalies.push({
          type: "pattern_deviation",
          severity: "medium",
          deviation: `${(deviation * 100).toFixed(2)}%`,
        });
      }
    }

    return JSON.stringify({
      anomalies,
      riskScore: anomalies.length * 10,
    });
  },
});

// Tool 3: Document Validation
const documentValidationTool = new Tool({
  name: "document_validation",
  description: "Validate document metadata and integrity",
  schema: z.object({
    documentType: z.string(),
    issueDate: z.string(),
    expiryDate: z.string(),
    issuer: z.string(),
  }),
  func: async ({ documentType, issueDate, expiryDate, issuer }) => {
    const issues = [];

    const now = new Date();
    const expiry = new Date(expiryDate);

    if (expiry < now) {
      issues.push({
        type: "document_expired",
        severity: "high",
      });
    }

    return JSON.stringify({
      valid: issues.length === 0,
      issues,
      riskScore: issues.length * 15,
    });
  },
});

module.exports = {
  historicalLookupTool,
  financialAnalysisTool,
  documentValidationTool,
};
```

---

## 3. Create Fraud Detection Agent

Create `src/ai/agents/fraudDetectionAgent.js`:

```javascript
const { initializeAgentExecutorWithOptions } = require("langchain/agents");
const { ChatOpenAI } = require("@langchain/openai");
const { PromptTemplate } = require("@langchain/core/prompts");
const {
  historicalLookupTool,
  financialAnalysisTool,
  documentValidationTool,
} = require("../tools/fraudDetectionTools");

class FraudDetectionAgent {
  static async initialize() {
    const llm = new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      modelName: "gpt-4",
      temperature: 0.3, // Low temp for consistent fraud detection
    });

    const tools = [
      historicalLookupTool,
      financialAnalysisTool,
      documentValidationTool,
    ];

    const systemPrompt = PromptTemplate.fromTemplate(`
You are a expert fraud detection analyst. Your job is to:
1. Look up historical records for the customer
2. Analyze financial patterns
3. Validate document authenticity
4. Identify red flags and anomalies
5. Calculate a fraud risk score

Always be thorough and conservative - flag any suspicious activity.
Current Document: {document}
Historical Data: {historicalData}
    `);

    const executor = await initializeAgentExecutorWithOptions(tools, llm, {
      agentType: "openai-functions",
      verbose: process.env.LOG_LEVEL === "debug",
      returnIntermediateSteps: true,
    });

    return executor;
  }

  static async analyzeDocument(documentData) {
    try {
      const executor = await this.initialize();

      const input = `
Analyze this document for fraud:
Name: ${documentData.ownerName}
Email: ${documentData.ownerEmail}
Document Type: ${documentData.documentType}
Amount: $${documentData.amount}
Issue Date: ${documentData.dateOfIssue}

Please perform comprehensive fraud detection.
      `;

      const result = await executor.invoke({
        input,
        document: JSON.stringify(documentData),
        historicalData: "{}", // Will be fetched by tool
      });

      return this.parseAgentResult(result);
    } catch (error) {
      console.error("Agent Error:", error);
      throw new Error(`Fraud detection failed: ${error.message}`);
    }
  }

  static parseAgentResult(result) {
    const output = result.output || "";

    // Extract risk score from agent output
    const riskMatch = output.match(/risk score[:\s]+(\d+)/i);
    const riskScore = riskMatch ? parseInt(riskMatch[1]) : 50;

    // Extract anomalies from agent output
    const anomalies = [];
    const lines = output.split("\n");

    for (const line of lines) {
      if (
        line.toLowerCase().includes("anomaly") ||
        line.toLowerCase().includes("red flag")
      ) {
        anomalies.push({
          description: line.trim(),
          severity: this.determineSeverity(line),
        });
      }
    }

    return {
      status: "completed",
      riskScore: Math.min(100, Math.max(0, riskScore)),
      riskLevel: this.mapRiskLevel(riskScore),
      anomalies,
      summary: output,
      timestamp: new Date(),
    };
  }

  static determineSeverity(text) {
    const lower = text.toLowerCase();
    if (lower.includes("critical") || lower.includes("high")) return "high";
    if (lower.includes("medium") || lower.includes("suspicious"))
      return "medium";
    return "low";
  }

  static mapRiskLevel(score) {
    if (score >= 81) return "Critical";
    if (score >= 61) return "High";
    if (score >= 31) return "Medium";
    return "Low";
  }
}

module.exports = FraudDetectionAgent;
```

---

## 4. Create Report Generation Agent

Create `src/ai/agents/reportGenerationAgent.js`:

```javascript
const { ChatOpenAI } = require("@langchain/openai");
const { PromptTemplate } = require("@langchain/core/prompts");
const { LLMChain } = require("langchain/chains");

class ReportGenerationAgent {
  static async generateReport(fraudAnalysis, documentData) {
    try {
      const llm = new ChatOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        modelName: "gpt-4",
        temperature: 0.4,
      });

      const template = `
Generate a professional fraud risk report based on the analysis:

Document: {documentType}
Customer: {customerName}
Analysis Date: {date}

FRAUD ANALYSIS:
{analysis}

ANOMALIES DETECTED:
{anomalies}

RISK SCORE: {riskScore}/100
RISK LEVEL: {riskLevel}

Please provide:
1. Executive Summary (2-3 sentences)
2. Key Findings (3-5 bullet points)
3. Red Flags Identified
4. Recommendations
5. Confidence Level

Format as clean, professional text suitable for bank underwriters.
      `;

      const prompt = PromptTemplate.fromTemplate(template);
      const chain = new LLMChain({ llm, prompt });

      const report = await chain.call({
        documentType: documentData.documentType,
        customerName: documentData.ownerName,
        date: new Date().toLocaleDateString(),
        analysis: fraudAnalysis.summary,
        anomalies: JSON.stringify(fraudAnalysis.anomalies),
        riskScore: fraudAnalysis.riskScore,
        riskLevel: fraudAnalysis.riskLevel,
      });

      return {
        reportText: report.text,
        timestamp: new Date(),
        documentId: documentData._id,
      };
    } catch (error) {
      console.error("Report Generation Error:", error);
      throw error;
    }
  }
}

module.exports = ReportGenerationAgent;
```

---

## 5. Integrate Agents into Backend

Create `src/api/controllers/analysis.controller.js`:

```javascript
const FraudDetectionAgent = require("../../ai/agents/fraudDetectionAgent");
const ReportGenerationAgent = require("../../ai/agents/reportGenerationAgent");
const FraudReport = require("../models/FraudReport");
const Document = require("../models/Document");
const analysisQueue = require("../../jobs/analysisQueue");

class AnalysisController {
  static async startAnalysis(req, res) {
    try {
      const { documentId } = req.body;
      const userId = req.user.id;

      // Validate document
      const document = await Document.findById(documentId);
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }

      // Create job
      const job = await analysisQueue.add(
        {
          documentId,
          userId,
          documentData: document.toObject(),
        },
        { attempts: 3, backoff: "exponential" },
      );

      // Return job ID
      res.json({
        success: true,
        jobId: job.id,
        status: "queued",
        estimatedTime: "30 seconds",
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getAnalysisStatus(req, res) {
    try {
      const { jobId } = req.params;

      const job = await analysisQueue.getJob(jobId);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }

      const state = await job.getState();
      const progress = job.progress();

      res.json({
        jobId,
        status: state,
        progress,
        data: job.data,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = AnalysisController;
```

---

## 6. Setup Job Worker

Create `src/jobs/workers.js`:

```javascript
const analysisQueue = require("./analysisQueue");
const FraudDetectionAgent = require("../ai/agents/fraudDetectionAgent");
const ReportGenerationAgent = require("../ai/agents/reportGenerationAgent");
const FraudReport = require("../api/models/FraudReport");

analysisQueue.process(async (job) => {
  try {
    console.log(`Processing job ${job.id}`);

    const { documentId, userId, documentData } = job.data;

    // Step 1: Run fraud detection
    job.progress(25);
    const fraudAnalysis =
      await FraudDetectionAgent.analyzeDocument(documentData);

    // Step 2: Generate report
    job.progress(50);
    const reportData = await ReportGenerationAgent.generateReport(
      fraudAnalysis,
      documentData,
    );

    // Step 3: Save to database
    job.progress(75);
    const report = await FraudReport.create({
      documentId,
      userId,
      riskScore: fraudAnalysis.riskScore,
      riskLevel: fraudAnalysis.riskLevel,
      anomalies: fraudAnalysis.anomalies,
      aiSummary: reportData.reportText,
      status: "completed",
    });

    job.progress(100);
    return report;
  } catch (error) {
    console.error(`Job ${job.id} failed:`, error);
    throw error;
  }
});

analysisQueue.on("completed", (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

analysisQueue.on("failed", (job, err) => {
  console.log(`Job ${job.id} failed:`, err.message);
});
```

---

## 7. Test Agents Locally

Create `src/ai/agents/__tests__/fraudDetectionAgent.test.js`:

```javascript
const FraudDetectionAgent = require("../fraudDetectionAgent");

describe("FraudDetectionAgent", () => {
  it("should detect fraud in suspicious document", async () => {
    const testDocument = {
      ownerName: "John Doe",
      ownerEmail: "john@example.com",
      documentType: "mortgage_application",
      amount: 500000,
      dateOfIssue: "2025-05-15",
    };

    const result = await FraudDetectionAgent.analyzeDocument(testDocument);

    expect(result).toHaveProperty("riskScore");
    expect(result).toHaveProperty("riskLevel");
    expect(result).toHaveProperty("anomalies");
    expect(result.riskScore).toBeGreaterThanOrEqual(0);
    expect(result.riskScore).toBeLessThanOrEqual(100);
  });

  it("should return low risk for legitimate document", async () => {
    const testDocument = {
      ownerName: "Jane Smith",
      ownerEmail: "jane@bank.com",
      documentType: "salary_slip",
      amount: 50000,
      dateOfIssue: "2025-05-15",
    };

    const result = await FraudDetectionAgent.analyzeDocument(testDocument);

    expect(result.riskLevel).toMatch(/Low|Medium/);
  });
});
```

Run tests:

```bash
npm test -- fraudDetectionAgent.test.js
```

---

## 8. Agent Performance Tips

### Optimization Strategies

```javascript
// 1. Cache embeddings
const cache = new Map();
const cacheKey = JSON.stringify(documentData);
if (cache.has(cacheKey)) {
  return cache.get(cacheKey);
}

// 2. Use smaller models for simple tasks
const miniLLM = new ChatOpenAI({ modelName: "gpt-3.5-turbo" });

// 3. Add timeout
const withTimeout = (promise, ms) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), ms),
    ),
  ]);
};

// 4. Batch processing
const analyzeMultiple = async (documents) => {
  return Promise.all(
    documents.map((doc) => FraudDetectionAgent.analyzeDocument(doc)),
  );
};
```

---

## 9. Error Handling

```javascript
try {
  const result = await FraudDetectionAgent.analyzeDocument(data);
} catch (error) {
  if (error.message.includes("OPENAI")) {
    // LLM API error
    logger.error("LLM API unavailable", error);
    // Fall back to rule-based analysis
  } else if (error.message.includes("database")) {
    // Database error
    logger.error("Database error", error);
    // Retry or queue for later
  } else {
    logger.error("Unexpected error", error);
    // Generic error handling
  }
}
```

---

## 10. Monitoring Agents

```javascript
// Log all agent decisions
const originalAnalyze = FraudDetectionAgent.analyzeDocument;
FraudDetectionAgent.analyzeDocument = async (doc) => {
  console.time("fraudDetection");
  try {
    const result = await originalAnalyze(doc);
    console.timeEnd("fraudDetection");
    return result;
  } catch (error) {
    console.timeEnd("fraudDetection");
    throw error;
  }
};
```
