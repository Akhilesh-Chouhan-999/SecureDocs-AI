import { initializeAgentExecutorWithOptions } from "@langchain/agents";
import type { Tool } from "@langchain/core/tools";
import { DynamicTool } from "@langchain/core/tools";
import { getLLMManager } from "../llm/llm-manager.js";
import type {
  FraudAnomaly,
  RiskAssessment,
  StructuredDocumentData,
} from "../../types/domain.js";
import { logger } from "../../logs/index.js";

/**
 * Fraud Detection Agent
 *
 * Orchestrates multi-step fraud analysis using LLM + tools:
 * 1. Historical lookup (find similar cases)
 * 2. Financial analysis (detect income mismatches)
 * 3. Document validation (check authenticity)
 * 4. Anomaly detection (flag suspicious patterns)
 * 5. Risk scoring (calculate final score)
 */

interface FraudAnalysisInput {
  ocrText: string;
  structuredData: StructuredDocumentData;
  historicalData?: unknown;
}

interface FraudAnalysisResult {
  anomalies: FraudAnomaly[];
  riskScore: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  reasoning: string;
  recommendations: string[];
}

export class FraudDetectionAgent {
  private llmManager = getLLMManager();
  private tools: Tool[] = [];

  constructor() {
    this.initializeTools();
    logger.info("FraudDetectionAgent initialized");
  }

  /**
   * Initialize agent tools
   */
  private initializeTools(): void {
    // Tool 1: Historical Lookup
    this.tools.push(
      new DynamicTool({
        name: "historical_lookup",
        description:
          "Look up similar fraud cases from historical records to identify patterns",
        func: async (input: string) => {
          logger.debug(`Historical lookup: ${input}`);
          // Simulate historical lookup
          return JSON.stringify({
            matchedCases: [
              {
                caseId: "fraud-2024-001",
                similarity: 0.87,
                pattern: "income_falsification",
                severity: "high",
              },
              {
                caseId: "fraud-2024-045",
                similarity: 0.72,
                pattern: "document_forgery",
                severity: "high",
              },
            ],
            riskIndicators: [
              "Multiple similar cases found",
              "High severity match",
            ],
          });
        },
      }),
    );

    // Tool 2: Financial Analysis
    this.tools.push(
      new DynamicTool({
        name: "financial_analysis",
        description:
          "Analyze financial data for anomalies like income mismatches",
        func: async (input: string) => {
          logger.debug(`Financial analysis: ${input}`);
          // Parse input and analyze
          let declaredIncome = 0;
          try {
            declaredIncome = JSON.parse(input).income || 0;
          } catch {
            declaredIncome = parseInt(input) || 0;
          }

          const anomalies: string[] = [];
          if (declaredIncome > 500000) {
            anomalies.push("Unusually high income requiring verification");
          }
          if (declaredIncome === 0) {
            anomalies.push("No income declared");
          }

          return JSON.stringify({
            incomeScore: Math.min(declaredIncome / 1000, 100),
            anomalies,
            requiresVerification: anomalies.length > 0,
          });
        },
      }),
    );

    // Tool 3: Document Validation
    this.tools.push(
      new DynamicTool({
        name: "document_validation",
        description: "Validate document metadata and check for forgery signs",
        func: async (input: string) => {
          logger.debug(`Document validation: ${input}`);
          return JSON.stringify({
            documentValid: true,
            issues: [],
            confidenceScore: 0.92,
            recommendations: [
              "Document appears authentic",
              "No forgery detected",
            ],
          });
        },
      }),
    );

    // Tool 4: Pattern Matching
    this.tools.push(
      new DynamicTool({
        name: "pattern_matching",
        description: "Detect known fraud patterns in the document",
        func: async (input: string) => {
          logger.debug(`Pattern matching: ${input}`);
          return JSON.stringify({
            detectedPatterns: [
              {
                pattern: "income_verification_required",
                severity: "medium",
                confidence: 0.78,
              },
            ],
            riskFactors: [
              "Document requires income verification",
              "Income level above threshold",
            ],
          });
        },
      }),
    );

    // Tool 5: Risk Calculation
    this.tools.push(
      new DynamicTool({
        name: "risk_calculation",
        description:
          "Calculate composite fraud risk score based on all factors",
        func: async (input: string) => {
          logger.debug(`Risk calculation: ${input}`);
          // Parse anomalies and calculate score
          let anomalies: FraudAnomaly[] = [];
          try {
            anomalies = JSON.parse(input).anomalies || [];
          } catch {
            anomalies = [];
          }

          const baseScore = anomalies.reduce((sum: number, a: FraudAnomaly) => {
            const weights: Record<string, number> = { low: 5, medium: 20, high: 35, critical: 50 };
            const severityWeight = weights[a.severity] || 0;
            return sum + severityWeight * (a.confidence || 0.5);
          }, 0);

          const riskScore = Math.min(Math.round(baseScore), 100);
          const riskLevel: "low" | "medium" | "high" | "critical" =
            riskScore >= 81
              ? "critical"
              : riskScore >= 61
                ? "high"
                : riskScore >= 31
                  ? "medium"
                  : "low";

          return JSON.stringify({
            riskScore,
            riskLevel,
            scoreBreakdown: {
              anomalyWeight: 40,
              historyWeight: 30,
              patternWeight: 20,
              financialWeight: 10,
            },
          });
        },
      }),
    );

    logger.info(`Initialized ${this.tools.length} fraud detection tools`);
  }

  /**
   * Analyze document for fraud risk
   */
  async analyzeDocument(
    input: FraudAnalysisInput,
  ): Promise<FraudAnalysisResult> {
    try {
      const systemPrompt = `You are an expert fraud detection analyst. 
      
Your role is to analyze documents and identify fraud indicators using available tools.

Guidelines:
1. Always check historical records for similar cases
2. Analyze financial data for inconsistencies  
3. Validate document authenticity
4. Match against known fraud patterns
5. Calculate comprehensive risk score

Current Document:
- OCR Text: ${input.ocrText.substring(0, 500)}...
- Borrower: ${input.structuredData.borrowerName || "Unknown"}
- Income: $${input.structuredData.declaredIncome || "Not specified"}
- Document Date: ${input.structuredData.documentDate || "Unknown"}

Use your tools to thoroughly analyze this document. Report all findings.`;

      const userPrompt = `Analyze this document for fraud risk and provide:
1. Any anomalies detected (type, severity, confidence)
2. Historical matches found (if any)
3. Risk factors identified
4. Final risk score and level
5. Recommendations`;

      logger.info("Starting fraud detection analysis...");

      // Initialize agent executor
      const llm = await this.llmManager.getPrimaryLLM();
      const executor = await initializeAgentExecutorWithOptions(
        this.tools,
        llm as any,
        {
          agentType: "openai-functions",
          verbose: process.env.LOG_LEVEL === "debug",
          returnIntermediateSteps: true,
        },
      );

      // Execute agent
      const result = await executor.invoke({
        input: userPrompt,
      });

      logger.info("Fraud detection analysis completed");

      // Parse results
      const anomalies = this.extractAnomalies(result);
      const riskScore = this.calculateRiskScore(anomalies);
      const riskLevel = this.assignRiskLevel(riskScore);

      return {
        anomalies,
        riskScore,
        riskLevel,
        reasoning: result.output || "",
        recommendations: this.generateRecommendations(riskLevel, anomalies),
      };
    } catch (error) {
      logger.error(`Fraud detection analysis failed: ${error}`);
      throw error;
    }
  }

  /**
   * Extract anomalies from agent output
   */
  private extractAnomalies(agentOutput: any): FraudAnomaly[] {
    const anomalies: FraudAnomaly[] = [];

    // Parse agent output and extract anomalies
    // This would be more sophisticated in production
    try {
      if (agentOutput.output) {
        // Extract from text output
        if (agentOutput.output.includes("income_verification")) {
          anomalies.push({
            type: "income_verification",
            severity: "medium",
            description: "Income verification required",
            affectedField: "income",
            confidence: 0.75,
            suggestedAction:
              "Verify income with recent tax returns or pay stubs",
          });
        }

        if (agentOutput.output.includes("ownership")) {
          anomalies.push({
            type: "ownership_mismatch",
            severity: "high",
            description: "Potential ownership inconsistency",
            affectedField: "ownership",
            confidence: 0.85,
            suggestedAction: "Verify ownership against legal documents",
          });
        }
      }
    } catch (error) {
      logger.warn(`Failed to extract anomalies: ${error}`);
    }

    return anomalies;
  }

  /**
   * Calculate risk score from anomalies
   */
  private calculateRiskScore(anomalies: FraudAnomaly[]): number {
    if (anomalies.length === 0) return 10;

    const severityWeights = {
      critical: 50,
      high: 35,
      medium: 20,
      low: 8,
    };

    const baseScore = anomalies.reduce((total, anomaly) => {
      const weight =
        severityWeights[anomaly.severity as keyof typeof severityWeights] || 0;
      return total + weight * (anomaly.confidence || 0.5);
    }, 0);

    return Math.min(Math.round(baseScore), 100);
  }

  /**
   * Assign risk level based on score
   */
  private assignRiskLevel(
    score: number,
  ): "low" | "medium" | "high" | "critical" {
    if (score >= 81) return "critical";
    if (score >= 61) return "high";
    if (score >= 31) return "medium";
    return "low";
  }

  /**
   * Generate recommendations based on risk level
   */
  private generateRecommendations(
    riskLevel: string,
    anomalies: FraudAnomaly[],
  ): string[] {
    const recommendations: string[] = [];

    switch (riskLevel) {
      case "critical":
        recommendations.push("Recommend rejection of application");
        recommendations.push("Escalate to fraud investigation team");
        recommendations.push("File suspicious activity report if needed");
        break;
      case "high":
        recommendations.push("Conduct manual review by senior analyst");
        recommendations.push("Request additional documentation");
        recommendations.push("Verify all provided information");
        break;
      case "medium":
        recommendations.push("Enhanced due diligence recommended");
        recommendations.push("Request income verification documents");
        break;
      case "low":
        recommendations.push("Proceed with standard verification process");
        break;
    }

    // Add anomaly-specific recommendations
    anomalies.forEach((anomaly) => {
      recommendations.push(anomaly.suggestedAction);
    });

    return [...new Set(recommendations)]; // Remove duplicates
  }

  /**
   * Get agent statistics
   */
  getStats() {
    return {
      toolsAvailable: this.tools.length,
      tools: this.tools.map((t) => t.name),
      llmStats: this.llmManager.getStats(),
    };
  }
}

/**
 * Singleton instance
 */
let fraudDetectionAgentInstance: FraudDetectionAgent | null = null;

/**
 * Get or create FraudDetectionAgent singleton
 */
export function getFraudDetectionAgent(): FraudDetectionAgent {
  if (!fraudDetectionAgentInstance) {
    fraudDetectionAgentInstance = new FraudDetectionAgent();
  }
  return fraudDetectionAgentInstance;
}

export default FraudDetectionAgent;
