import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import HistoricalRecord from "../../models/HistoricalRecord.js";

// Tool 1: Historical Lookup using RAG Pipeline
import { getRAGPipeline } from "../rag/rag-pipeline.js";

export const historicalLookupTool = new DynamicStructuredTool({
  name: "historical_lookup",
  description:
    "Lookup historical records for a customer by email, name, or document characteristics to find past fraud anomalies.",
  schema: z.object({
    query: z
      .string()
      .describe(
        "A comprehensive query string describing the historical data you are searching for, including email, name, or anomalies.",
      ),
  }) as any,
  func: async ({ query }) => {
    try {
      // Initialize RAG Pipeline for fraud cases
      const rag = getRAGPipeline({ collectionName: "fraud_cases" });
      await rag.initialize();

      // Retrieve similar historical cases using vector search
      const ragResult = await rag.retrieve(query);

      if (
        !ragResult.retrievedDocuments ||
        ragResult.retrievedDocuments.length === 0
      ) {
        return JSON.stringify({
          status: "not_found",
          message: "No relevant historical context found.",
        });
      }

      // Map ChromaDB retrieved docs to expected format
      return JSON.stringify({
        status: "found",
        records: ragResult.retrievedDocuments.map((doc) => ({
          id: doc.id,
          similarity: doc.similarity,
          content: doc.content,
          metadata: doc.metadata,
        })),
        relevanceScore: ragResult.stats.relevanceScore,
      });
    } catch (error: any) {
      return JSON.stringify({ error: error.message });
    }
  },
});

// Tool 2: Financial Analysis
export const financialAnalysisTool = new DynamicStructuredTool({
  name: "financial_analysis",
  description:
    "Analyze financial patterns and detect anomalies based on amount and transaction history.",
  schema: z.object({
    amount: z.number(),
    expectedRange: z.object({ min: z.number(), max: z.number() }),
    transactionHistory: z.array(z.number()).optional(),
  }) as any,
  func: async ({ amount, expectedRange, transactionHistory }) => {
    const anomalies: any[] = [];

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
        transactionHistory.reduce((a: any, b: any) => a + b, 0) /
        transactionHistory.length;
      const deviation = Math.abs(amount - avg) / avg;

      if (deviation > 0.5) {
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
export const documentValidationTool = new DynamicStructuredTool({
  name: "document_validation",
  description: "Validate document metadata and integrity such as expiry date.",
  schema: z.object({
    documentType: z.string(),
    issueDate: z.string(),
    expiryDate: z.string(),
    issuer: z.string(),
  }) as any,
  func: async ({ documentType, issueDate, expiryDate, issuer }) => {
    const issues: any[] = [];

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
