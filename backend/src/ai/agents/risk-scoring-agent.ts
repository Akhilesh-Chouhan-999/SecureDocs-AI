/**
 * Risk Scoring Agent
 * Calculates composite fraud risk score
 */

import { BaseLanguageModel } from "@langchain/core/language_models/base";
import BaseAgent, { AgentExecutionResult } from "./base-agent.js";
import { logger } from "../../logs/index.js";
import { RISK_SCORING_SYSTEM_PROMPT } from "../prompts/risk-scoring-prompt.js";

/**
 * RiskScoringAgentInput - Input for risk scoring
 */
export interface RiskScoringAgentInput {
  anomalies: Array<{
    type: string;
    severity: "Low" | "Medium" | "High" | "Critical";
    description: string;
    confidence: number;
  }>;
  customerName: string;
  customerEmail: string;
  applicationCount: number;
  historicalRiskLevel?: string;
  ocrConfidence: number;
  documentType: string;
  declaredAmount?: number;
  expectedRange?: { min: number; max: number };
  similarCaseCount?: number;
  daysSinceLastApplication?: number;
}

/**
 * RiskScoringAgent - Risk score calculation agent
 */
export class RiskScoringAgent extends BaseAgent {
  constructor(llm: BaseLanguageModel) {
    super("RiskScoringAgent", llm, []);
  }

  /**
   * Execute risk scoring analysis
   */
  async execute(input: RiskScoringAgentInput): Promise<AgentExecutionResult> {
    try {
      const prompt = this.buildPrompt(input);

      logger.info(
        `RiskScoringAgent: Starting risk assessment for ${input.customerEmail}`,
      );

      const result = await this.executeAgent(
        prompt,
        RISK_SCORING_SYSTEM_PROMPT,
      );

      if (result.success) {
        const parsedResult = this.parseResult(result.output, input);
        result.output = JSON.stringify(parsedResult);
      }

      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("RiskScoringAgent execution error:", err);
      throw error;
    }
  }

  /**
   * Build scoring prompt from input
   */
  private buildPrompt(input: RiskScoringAgentInput): string {
    const anomaliesText = input.anomalies
      .map(
        (a) =>
          `- ${a.severity}: ${a.type} (${a.description}, confidence: ${a.confidence}%)`,
      )
      .join("\n");

    return `
Calculate comprehensive fraud risk score based on these anomalies:

**Anomalies Detected:**
${anomaliesText}

**Customer Profile:**
- Name: ${input.customerName}
- Email: ${input.customerEmail}
- Previous Applications: ${input.applicationCount}
- Historical Risk Level: ${input.historicalRiskLevel || "Unknown"}

**Document Metrics:**
- OCR Confidence: ${input.ocrConfidence}%
- Document Type: ${input.documentType}

**Financial Metrics:**
${input.declaredAmount ? `- Declared Amount: $${input.declaredAmount}` : ""}
${input.expectedRange ? `- Expected Range: $${input.expectedRange.min} - $${input.expectedRange.max}` : ""}

**Historical Context:**
- Similar Cases Found: ${input.similarCaseCount || 0}
- Days Since Last Application: ${input.daysSinceLastApplication || "Unknown"}

Please calculate the composite risk score using the methodology provided and provide recommendations.
    `;
  }

  /**
   * Parse agent result to structured format
   */
  private parseResult(output: string, input: RiskScoringAgentInput): any {
    try {
      // Try to extract JSON from output
      const jsonMatch = output.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // Fallback to calculated score
      const baseScore = this.calculateBaseScore(input.anomalies);
      const confidenceAdjustment = input.ocrConfidence / 100;
      const historicalMultiplier = input.applicationCount > 2 ? 1.5 : 1.0;

      const finalScore = Math.min(
        100,
        baseScore * confidenceAdjustment * historicalMultiplier,
      );

      return {
        status: "completed",
        overallRiskScore: Math.round(finalScore),
        riskLevel: this.mapRiskLevel(finalScore),
        scoreBreakdown: {
          baseScore,
          confidenceMultiplier: confidenceAdjustment,
          historicalMultiplier,
        },
        recommendation: this.getRecommendation(finalScore),
        actionItems: this.getActionItems(finalScore, input.anomalies),
      };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Error parsing risk scoring result:", err);
      return {
        status: "parsing_error",
        rawOutput: output,
        overallRiskScore: 50,
        riskLevel: "Medium",
      };
    }
  }

  /**
   * Calculate base score from anomalies
   */
  private calculateBaseScore(
    anomalies: RiskScoringAgentInput["anomalies"],
  ): number {
    const severityWeights: Record<string, number> = {
      Critical: 25,
      High: 15,
      Medium: 8,
      Low: 3,
    };

    return anomalies.reduce((sum, anomaly) => {
      const weight = severityWeights[anomaly.severity] || 0;
      return sum + weight * (anomaly.confidence / 100);
    }, 0);
  }

  /**
   * Map risk score to risk level
   */
  private mapRiskLevel(score: number): "Low" | "Medium" | "High" | "Critical" {
    if (score >= 81) return "Critical";
    if (score >= 61) return "High";
    if (score >= 31) return "Medium";
    return "Low";
  }

  /**
   * Get recommendation based on risk score
   */
  private getRecommendation(score: number): string {
    if (score >= 81) return "Reject";
    if (score >= 61) return "ManualReview";
    if (score >= 31) return "Conditional";
    return "Approve";
  }

  /**
   * Get action items based on risk score and anomalies
   */
  private getActionItems(
    score: number,
    anomalies: RiskScoringAgentInput["anomalies"],
  ): string[] {
    const items: string[] = [];

    const criticalAnomalies = anomalies.filter(
      (a) => a.severity === "Critical",
    );
    if (criticalAnomalies.length > 0) {
      items.push(
        `Address critical anomalies: ${criticalAnomalies.map((a) => a.type).join(", ")}`,
      );
    }

    if (score >= 61) {
      items.push("Escalate for manual review");
    }

    if (score >= 31) {
      items.push("Request additional documentation");
    }

    if (anomalies.length > 3) {
      items.push("Conduct in-person verification");
    }

    return items;
  }
}

export default RiskScoringAgent;
