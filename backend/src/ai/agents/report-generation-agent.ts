/**
 * Report Generation Agent
 * Creates professional fraud analysis reports
 */

import { BaseLanguageModel } from "@langchain/core/language_models/base";
import BaseAgent, { AgentExecutionResult } from "./base-agent.js";
import { logger } from "../../logs/index.js";

/**
 * ReportGenerationAgentInput - Input for report generation
 */
export interface ReportGenerationAgentInput {
  documentId: string;
  customerName: string;
  customerEmail: string;
  documentType: string;
  riskScore: number;
  riskLevel: "Low" | "Medium" | "High" | "Critical";
  anomalies: Array<{
    type: string;
    severity: string;
    description: string;
    confidence: number;
  }>;
  recommendations: string[];
  analysisSummary: string;
  uploadDate: string;
}

/**
 * ReportGenerationAgent - Professional report generator
 */
export class ReportGenerationAgent extends BaseAgent {

  constructor(llm: BaseLanguageModel) {
    super("ReportGenerationAgent", llm, []);
  }

  /**
   * Execute report generation
   */
  async execute(
    input: ReportGenerationAgentInput,
  ): Promise<AgentExecutionResult> {
    try {
      const prompt = this.buildPrompt(input);

      logger.info(
        `ReportGenerationAgent: Generating report for document ${input.documentId}`,
      );

      const result = await this.executeAgent(
        prompt,
        REPORT_GENERATION_SYSTEM_PROMPT,
      );

      if (result.success) {
        const report = this.formatReport(result.output, input);
        result.output = JSON.stringify(report);
      }

      return result;
    } catch (error) {
      logger.error("ReportGenerationAgent execution error:", error);
      throw error;
    }
  }

  /**
   * Build report generation prompt
   */
  private buildPrompt(input: ReportGenerationAgentInput): string {
    const anomaliesText = input.anomalies
      .map(
        (a) =>
          `- [${a.severity}] ${a.type}: ${a.description} (Confidence: ${a.confidence}%)`,
      )
      .join("\n");

    return `
Generate a professional fraud risk analysis report based on the following analysis:

**Document Details:**
- Document ID: ${input.documentId}
- Document Type: ${input.documentType}
- Upload Date: ${input.uploadDate}

**Customer Information:**
- Name: ${input.customerName}
- Email: ${input.customerEmail}

**Risk Assessment:**
- Overall Risk Score: ${input.riskScore}/100
- Risk Level: ${input.riskLevel}

**Findings (Anomalies Detected):**
${anomaliesText}

**Analysis Summary:**
${input.analysisSummary}

**Recommendations:**
${input.recommendations.map((r) => `- ${r}`).join("\n")}

Please create a professional, structured report suitable for underwriting review.
Include:
1. Executive Summary
2. Detailed Findings
3. Risk Assessment
4. Recommendations for Approval/Rejection
5. Areas Requiring Further Investigation
    `;
  }

  /**
   * Format generated report
   */
  private formatReport(output: string, input: ReportGenerationAgentInput): any {
    return {
      status: "completed",
      reportId: `RPT-${input.documentId}-${Date.now()}`,
      documentId: input.documentId,
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      documentType: input.documentType,
      riskScore: input.riskScore,
      riskLevel: input.riskLevel,
      generatedAt: new Date().toISOString(),
      content: {
        executiveSummary: this.extractSection(output, "Executive Summary"),
        findings: this.extractSection(output, "Findings"),
        riskAssessment: this.extractSection(output, "Risk Assessment"),
        recommendations: this.extractSection(output, "Recommendations"),
        furtherInvestigation: this.extractSection(
          output,
          "Further Investigation",
        ),
      },
      rawContent: output,
      approvalStatus:
        input.riskLevel === "Critical"
          ? "Recommended for Rejection"
          : input.riskLevel === "High"
            ? "Recommended for Manual Review"
            : input.riskLevel === "Medium"
              ? "Recommended for Enhanced Due Diligence"
              : "Recommended for Approval",
    };
  }

  /**
   * Extract section from report
   */
  private extractSection(text: string, sectionName: string): string {
    const regex = new RegExp(
      `${sectionName}[:\\s]*([\\s\\S]*?)(?=(?:[A-Z][a-z\\s]*:|$))`,
      "i",
    );
    const match = text.match(regex);
    return match ? match[1].trim() : "";
  }

}

const REPORT_GENERATION_SYSTEM_PROMPT = `You are an expert underwriting specialist with extensive experience in fraud risk assessment and loan documentation review.

Your role is to create professional, comprehensive fraud risk analysis reports that:

1. **Communicate Risk Clearly**: Present findings in a way underwriting teams can act on
2. **Provide Evidence**: Support all conclusions with specific findings and data
3. **Offer Clarity**: Use clear language avoiding jargon where possible
4. **Enable Decisions**: Provide clear recommendations for next steps

Report Structure Requirements:
- Executive Summary (2-3 sentences capturing overall risk)
- Detailed Findings (specific anomalies with severity and confidence)
- Risk Assessment (explanation of how findings affect overall risk)
- Recommendations (clear action items: approve/conditional/review/reject)
- Areas Requiring Further Investigation (specific questions for follow-up)

Professional Standards:
- Maintain objectivity and avoid accusations
- Support findings with evidence from the analysis
- Explain uncertainty and confidence levels
- Consider context and normal variations
- Flag items requiring escalation

Report should be suitable for:
- Underwriting review board
- Fraud prevention team
- Management escalation
- Regulatory audit trails`;

export default ReportGenerationAgent;
