/**
 * Historical Context Agent
 * Retrieves relevant historical data via RAG for fraud detection
 */

import { BaseLanguageModel } from "@langchain/core/language_models/base";
import BaseAgent, { AgentExecutionResult } from "./base-agent.js";
import { logger } from "../../logs/index.js";
import HistoricalRecord from "../../models/HistoricalRecord.js";

/**
 * HistoricalContextAgentInput - Input for historical context retrieval
 */
export interface HistoricalContextAgentInput {
  customerName: string;
  customerEmail: string;
  documentType: string;
  declaredAmount?: number;
  customerId?: string;
  similarityThreshold?: number; // 0-1, default 0.7
  maxResults?: number; // default 5
}

/**
 * HistoricalContextAgent - RAG and historical data retrieval
 */
export class HistoricalContextAgent extends BaseAgent {
  constructor(llm: BaseLanguageModel) {
    super("HistoricalContextAgent", llm, []);
  }

  /**
   * Execute historical context retrieval
   */
  async execute(
    input: HistoricalContextAgentInput,
  ): Promise<AgentExecutionResult> {
    try {
      logger.info(
        `HistoricalContextAgent: Retrieving context for ${input.customerEmail}`,
      );

      const historicalData = await this.retrieveHistoricalData(input);

      const prompt = this.buildPrompt(input, historicalData);

      const result = await this.executeAgent(
        prompt,
        HISTORICAL_CONTEXT_SYSTEM_PROMPT,
      );

      if (result.success) {
        const enrichedContext = this.enrichContext(
          result.output,
          historicalData,
          input,
        );
        result.output = JSON.stringify(enrichedContext);
      }

      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("HistoricalContextAgent execution error:", err);
      throw error;
    }
  }

  /**
   * Retrieve historical records from database
   */
  private async retrieveHistoricalData(
    input: HistoricalContextAgentInput,
  ): Promise<any[]> {
    try {
      const query: any = {};

      // Search by email or name
      if (input.customerEmail) {
        query.$or = [
          { ownerEmail: input.customerEmail },
          { ownerName: new RegExp(input.customerName, "i") },
        ];
      } else if (input.customerName) {
        query.ownerName = new RegExp(input.customerName, "i");
      }

      if (input.customerId) {
        query.customerId = input.customerId;
      }

      // Search using Mongoose HistoricalRecord model
      // Normalizing format to match our expected historical pattern
      const dbRecords = await HistoricalRecord.find(query).limit(input.maxResults || 5).lean();
      
      const records: any[] = dbRecords.map((doc: any) => ({
        ownerName: input.customerName,
        ownerEmail: input.customerEmail,
        flaggedAsHighRisk: false, // Provide defaults
        previousApplications: [],
        legalRecords: [],
        riskFactors: [],
        ...doc.value, // Mixin the unstructured historical document data
        updatedAt: doc.createdAt
      }));

      logger.info(`Historical search found ${records.length} matching records`);

      return records;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Error retrieving historical data:", err);
      return [];
    }
  }

  /**
   * Build prompt for historical analysis
   */
  private buildPrompt(
    input: HistoricalContextAgentInput,
    historicalData: any[],
  ): string {
    const historicalSummary =
      historicalData.length > 0
        ? historicalData
            .map((record) => {
              const applications = record.previousApplications?.length || 0;
              const legal = record.legalRecords?.length || 0;
              const riskFactors = record.riskFactors || [];

              return `
- Customer: ${record.ownerName}
  Applications: ${applications}
  Legal Records: ${legal}
  Risk Factors: ${riskFactors.join(", ") || "None"}
  High Risk Flag: ${record.flaggedAsHighRisk ? "YES" : "NO"}
  Last Updated: ${record.updatedAt}
              `;
            })
            .join("\n")
        : "No historical records found for this customer";

    return `
Analyze historical context for fraud detection:

**Current Application:**
- Name: ${input.customerName}
- Email: ${input.customerEmail}
- Document Type: ${input.documentType}
${input.declaredAmount ? `- Amount: $${input.declaredAmount}` : ""}

**Historical Records Found:**
${historicalSummary}

Please:
1. Identify patterns in historical data
2. Flag any repeated fraud indicators
3. Assess risk based on historical frequency
4. Recommend specific verification steps
5. Highlight any known associations
    `;
  }

  /**
   * Enrich context with historical insights
   */
  private enrichContext(
    output: string,
    historicalData: any[],
    input: HistoricalContextAgentInput,
  ): any {
    const fraudIndicators: string[] = [];
    const similarPatterns: any[] = [];
    let riskMultiplier = 1.0;

    // Analyze historical data for fraud patterns
    for (const record of historicalData) {
      if (record.flaggedAsHighRisk) {
        fraudIndicators.push(`Customer has previous high-risk flag`);
        riskMultiplier *= 1.5;
      }

      if ((record.legalRecords?.length || 0) > 0) {
        fraudIndicators.push(
          `${record.legalRecords.length} legal records on file`,
        );
        riskMultiplier *= 1.3;
      }

      if ((record.previousApplications?.length || 0) > 5) {
        fraudIndicators.push(
          `Frequent applicant: ${record.previousApplications.length} applications`,
        );
        riskMultiplier *= 1.2;
      }

      // Extract similar patterns
      if (record.previousApplications?.length > 0) {
        const recentApps = record.previousApplications.filter((app: any) => {
          const daysSince =
            (Date.now() - new Date(app.date).getTime()) / (1000 * 60 * 60 * 24);
          return daysSince < 90; // Last 90 days
        });

        if (recentApps.length > 0) {
          similarPatterns.push({
            type: "recent_applications",
            count: recentApps.length,
            severity: recentApps.length > 2 ? "high" : "medium",
          });
        }
      }
    }

    return {
      status: "completed",
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      historicalRecordsFound: historicalData.length,
      fraudIndicators,
      similarPatterns,
      riskMultiplier: Math.min(riskMultiplier, 3.0),
      recommendations: this.generateRecommendations(
        historicalData,
        fraudIndicators,
      ),
      llmAnalysis: output,
    };
  }

  /**
   * Generate verification recommendations
   */
  private generateRecommendations(
    historicalData: any[],
    fraudIndicators: string[],
  ): string[] {
    const recommendations: string[] = [];

    if (historicalData.length === 0) {
      recommendations.push(
        "No historical data found - proceed with standard verification",
      );
      return recommendations;
    }

    if (fraudIndicators.length > 0) {
      recommendations.push(
        "Request additional documentation due to historical flags",
      );
      recommendations.push("Conduct in-person verification if possible");
    }

    const highRiskCount = historicalData.filter(
      (r) => r.flaggedAsHighRisk,
    ).length;
    if (highRiskCount > 0) {
      recommendations.push("Escalate to fraud prevention team for review");
    }

    const legalRecordCount = historicalData.reduce(
      (sum, r) => sum + (r.legalRecords?.length || 0),
      0,
    );
    if (legalRecordCount > 0) {
      recommendations.push("Review legal records before approval");
    }

    if (recommendations.length === 0) {
      recommendations.push(
        "Historical check complete - no additional concerns",
      );
    }

    return recommendations;
  }
}

const HISTORICAL_CONTEXT_SYSTEM_PROMPT = `You are a historical fraud pattern analyst. Your role is to:

1. **Pattern Recognition**: Identify recurring fraud schemes and tactics
2. **Risk Assessment**: Evaluate risk based on historical frequency and severity
3. **Correlation Analysis**: Link current findings to historical patterns
4. **Recommendation**: Suggest verification based on identified patterns

Historical Red Flags:
- Multiple applications in short timeframe (churning)
- Similar false information across applications
- Pattern of small amounts (structuring)
- Repeated use of same accomplices
- Document tampering patterns
- Geographic inconsistencies

Fraud Patterns to Watch:
1. **Application Churning**: Multiple applications over short period
2. **Information Reuse**: Same false information across applications
3. **Ring Activity**: Multiple applicants with shared documents/contacts
4. **Escalation**: Risk indicators increasing over time
5. **Timing Patterns**: Patterns in application timing and approval

Risk Multipliers:
- First offense: 1.0x
- Known pattern: 1.5-2.0x
- Part of fraud ring: 2.0-3.0x
- Repeat offender: 3.0-5.0x

Provide analysis that helps teams understand:
- How this customer compares to fraud patterns
- What historical factors increase current risk
- What specific verification steps are recommended
- Whether escalation is needed`;

export default HistoricalContextAgent;
