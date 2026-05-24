import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import {
  historicalLookupTool,
  financialAnalysisTool,
  documentValidationTool,
} from "../tools/fraudDetectionTools.js";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";

class FraudDetectionAgent {
  static async initialize() {
    const llm = new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY || "test-api-key",
      modelName: "gpt-4",
      temperature: 0.3, // Low temp for consistent fraud detection
    });

    const tools = [
      historicalLookupTool,
      financialAnalysisTool,
      documentValidationTool,
    ];

    const prompt = ChatPromptTemplate.fromMessages([
      ["system", `You are a expert fraud detection analyst. Your job is to:
1. Look up historical records for the customer
2. Analyze financial patterns
3. Validate document authenticity
4. Identify red flags and anomalies
5. Calculate a fraud risk score

Always be thorough and conservative - flag any suspicious activity.
Current Document: {document}
Historical Data: {historicalData}`],
      ["user", "{input}"],
      new MessagesPlaceholder("agent_scratchpad"),
    ]);

    const agent = await createOpenAIFunctionsAgent({
      llm,
      tools: tools as any,
      prompt
    });

    const executor = new AgentExecutor({
      agent,
      tools: tools as any,
      verbose: process.env.LOG_LEVEL === "debug",
      returnIntermediateSteps: true,
    });

    return executor;
  }

  static async analyzeDocument(documentData: any) {
    try {
      const executor = await this.initialize();

      const input = `
Analyze this document for fraud:
Name: ${documentData.ownerName || "Unknown"}
Email: ${documentData.ownerEmail || "Unknown"}
Document Type: ${documentData.documentType || "Unknown"}
Amount: $${documentData.amount || 0}
Issue Date: ${documentData.dateOfIssue || "Unknown"}

Please perform comprehensive fraud detection.
      `;

      const result = await executor.invoke({
        input,
        document: JSON.stringify(documentData),
        historicalData: "{}", // Will be fetched by tool
      });

      return this.parseAgentResult(result);
    } catch (error: any) {
      console.error("Agent Error:", error);
      throw new Error(`Fraud detection failed: ${error.message}`);
    }
  }

  static parseAgentResult(result: any) {
    const output = result.output || "";

    // Extract risk score from agent output
    const riskMatch = output.match(/risk score[:\s]+(\d+)/i);
    const riskScore = riskMatch ? parseInt(riskMatch[1]) : 50;

    // Extract anomalies from agent output
    const anomalies: any[] = [];
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

  static determineSeverity(text: string) {
    const lower = text.toLowerCase();
    if (lower.includes("critical") || lower.includes("high")) return "high";
    if (lower.includes("medium") || lower.includes("suspicious"))
      return "medium";
    return "low";
  }

  static mapRiskLevel(score: number) {
    if (score >= 81) return "Critical";
    if (score >= 61) return "High";
    if (score >= 31) return "Medium";
    return "Low";
  }
}

export default FraudDetectionAgent;
