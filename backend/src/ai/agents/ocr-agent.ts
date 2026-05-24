/**
 * OCR Agent
 * Orchestrates OCR extraction and quality validation
 */

import { BaseLanguageModel } from "@langchain/core/language_models/base";
import BaseAgent, { AgentExecutionResult } from "./base-agent.js";
import { logger } from "../../logs/index.js";

/**
 * OCRAgentInput - Input for OCR agent
 */
export interface OCRAgentInput {
  ocrText: string;
  confidence: number;
  imageQuality: "high" | "medium" | "low";
  documentType: string;
  language?: string;
}

/**
 * OCRAgent - OCR extraction and validation
 */
export class OCRAgent extends BaseAgent {

  constructor(llm: BaseLanguageModel) {
    super("OCRAgent", llm, []);
  }

  /**
   * Execute OCR validation and enhancement
   */
  async execute(input: OCRAgentInput): Promise<AgentExecutionResult> {
    try {
      const prompt = this.buildPrompt(input);

      logger.info(
        `OCRAgent: Validating OCR for ${input.documentType} (confidence: ${input.confidence}%)`,
      );

      const result = await this.executeAgent(prompt, OCR_SYSTEM_PROMPT);

      if (result.success) {
        const validatedOCR = this.validateAndEnhance(result.output, input);
        result.output = JSON.stringify(validatedOCR);
      }

      return result;
    } catch (error) {
      logger.error("OCRAgent execution error:", error);
      throw error;
    }
  }

  /**
   * Build OCR validation prompt
   */
  private buildPrompt(input: OCRAgentInput): string {
    return `
Analyze and validate the following OCR extraction:

**OCR Confidence:** ${input.confidence}%
**Image Quality:** ${input.imageQuality}
**Document Type:** ${input.documentType}
**Language:** ${input.language || "English"}

**Extracted Text:**
${input.ocrText}

Please:
1. Identify any likely OCR errors or questionable words
2. Suggest corrections if OCR confidence is low
3. Flag areas that may need manual verification
4. Assess overall OCR reliability
5. Recommend next steps based on quality

Focus on accuracy for critical fields (names, amounts, dates).
    `;
  }

  /**
   * Validate and enhance OCR results
   */
  private validateAndEnhance(output: string, input: OCRAgentInput): any {
    const issues: any[] = [];
    const suggestions: any[] = [];

    // Check confidence level
    if (input.confidence < 80) {
      issues.push({
        type: "low_confidence",
        severity: "High",
        message: `OCR confidence is ${input.confidence}%, recommend manual verification`,
      });
    }

    if (input.confidence < 60) {
      issues.push({
        type: "very_low_confidence",
        severity: "Critical",
        message: "OCR result may be unreliable, recommend manual review",
      });
    }

    // Check image quality
    if (input.imageQuality === "low") {
      issues.push({
        type: "poor_image_quality",
        severity: "High",
        message: "Image quality is poor, verification recommended",
      });
    }

    // Extract issues from LLM output
    const outputLines = output.split("\n");
    for (const line of outputLines) {
      if (/error|wrong|incorrect|unclear/.test(line.toLowerCase())) {
        issues.push({
          description: line.trim(),
          source: "llm_analysis",
        });
      }
    }

    return {
      status: "completed",
      documentType: input.documentType,
      ocrText: input.ocrText,
      confidence: input.confidence,
      imageQuality: input.imageQuality,
      validationResult: {
        issues,
        suggestions,
        requiresManualReview: input.confidence < 75 || issues.length > 0,
      },
      llmAnalysis: output,
    };
  }

}

const OCR_SYSTEM_PROMPT = `You are an OCR validation specialist. Your role is to:

1. **Identify Errors**: Spot likely OCR misreadings (common confusions: 0/O, l/1, etc.)
2. **Assess Reliability**: Evaluate whether extracted text is trustworthy
3. **Flag Concerns**: Highlight areas needing manual verification
4. **Suggest Corrections**: When confident, suggest likely correct words
5. **Quality Check**: Ensure critical fields are accurately captured

OCR Error Patterns to Watch:
- Numbers confused with letters (0→O, 1→l, 5→S, 8→B)
- Similar characters (m↔n, rn→m, cl→d)
- Degraded/blurry areas
- Skewed text recognition
- Handwriting vs. printed confusion

Critical Fields for Finance/ID Documents:
- Names (must be person's actual name)
- Amounts (must be numeric accuracy)
- Dates (must be valid date format)
- ID numbers (must be exact)
- Signatures (must be present and visible)

Provide assessment that helps underwriting teams know:
- How much to trust this OCR
- What fields need verification
- What follow-up is recommended`;

export default OCRAgent;
