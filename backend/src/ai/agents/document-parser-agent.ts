/**
 * Document Parser Agent
 * Extracts and normalizes structured data from OCR text
 */

import { BaseLanguageModel } from "@langchain/core/language_models/base";
import BaseAgent, { AgentExecutionResult } from "./base-agent.js";
import { logger } from "../../logs/index.js";

/**
 * DocumentParserAgentInput - Input for document parser
 */
export interface DocumentParserAgentInput {
  ocrText: string;
  documentType: string;
  expectedFields: string[];
  language?: string;
}

/**
 * DocumentParserAgent - Structured data extraction
 */
export class DocumentParserAgent extends BaseAgent {

  constructor(llm: BaseLanguageModel) {
    super("DocumentParserAgent", llm, []);
  }

  /**
   * Execute document parsing
   */
  async execute(
    input: DocumentParserAgentInput,
  ): Promise<AgentExecutionResult> {
    try {
      const prompt = this.buildPrompt(input);

      logger.info(
        `DocumentParserAgent: Parsing ${input.documentType} document`,
      );

      const result = await this.executeAgent(
        prompt,
        DOCUMENT_PARSER_SYSTEM_PROMPT,
      );

      if (result.success) {
        const parsed = this.parseStructuredData(result.output, input);
        result.output = JSON.stringify(parsed);
      }

      return result;
    } catch (error) {
      logger.error("DocumentParserAgent execution error:", error);
      throw error;
    }
  }

  /**
   * Build parsing prompt
   */
  private buildPrompt(input: DocumentParserAgentInput): string {
    const expectedFieldsList = input.expectedFields
      .map((f) => `- ${f}`)
      .join("\n");

    return `
Extract structured data from this ${input.documentType} OCR text:

**Expected Fields:**
${expectedFieldsList}

**OCR Text:**
${input.ocrText}

Please extract all available fields in JSON format. For each field:
- Use exact value from document
- Normalize format (dates, amounts)
- Mark missing fields as null
- Include confidence (0-1) for each extracted value
- Flag any inconsistencies or formatting issues

Return JSON structure like:
{
  "extractedFields": {
    "fieldName": {
      "value": "extracted value",
      "confidence": 0.95,
      "formatted": "normalized value",
      "issues": ["any formatting issues"]
    }
  },
  "missingFields": ["field names not found"],
  "inconsistencies": ["any detected inconsistencies"]
}
    `;
  }

  /**
   * Parse structured data from output
   */
  private parseStructuredData(
    output: string,
    input: DocumentParserAgentInput,
  ): any {
    try {
      const jsonMatch = output.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          status: "completed",
          documentType: input.documentType,
          extractedFields: parsed.extractedFields || {},
          missingFields: parsed.missingFields || [],
          inconsistencies: parsed.inconsistencies || [],
          completeness: this.calculateCompleteness(
            input.expectedFields,
            parsed.missingFields || [],
          ),
        };
      }

      return {
        status: "parsing_error",
        documentType: input.documentType,
        rawOutput: output,
      };
    } catch (error) {
      logger.error("Error parsing document structure:", error);
      return {
        status: "error",
        documentType: input.documentType,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Calculate document completeness percentage
   */
  private calculateCompleteness(
    expectedFields: string[],
    missingFields: string[],
  ): number {
    if (expectedFields.length === 0) return 100;
    const found = expectedFields.length - missingFields.length;
    return Math.round((found / expectedFields.length) * 100);
  }

}

const DOCUMENT_PARSER_SYSTEM_PROMPT = `You are an expert document data extraction specialist.

Your responsibilities:
1. **Extract Values**: Precisely extract data from OCR text
2. **Normalize Format**: Convert to standard formats (dates, currency, etc.)
3. **Assess Confidence**: Rate how confident you are in each extraction
4. **Flag Issues**: Identify formatting problems or ambiguities
5. **Handle Missing Data**: Clearly mark fields not found

Data Normalization Rules:

**Names:**
- Full format: "FirstName LastName"
- Remove titles (Mr., Dr., etc.)
- Handle suffixes (Jr., Sr., III)

**Dates:**
- Standard format: YYYY-MM-DD
- Try multiple formats if ambiguous
- Flag impossible dates (e.g., 2/30/2024)

**Currency/Amounts:**
- Remove currency symbols
- Standard format: 12345.67
- Flag negative amounts
- Flag unreasonable values

**ID Numbers:**
- Remove hyphens/spaces for comparison
- Validate format (e.g., SSN: XXX-XX-XXXX)
- Flag check digit failures
- Case-insensitive for letters

**Addresses:**
- Standard format: Street, City, State ZIP
- Normalize state abbreviations
- Flag missing postal codes

**Dates vs. Text:**
- Clearly distinguish between dates and text descriptions
- Flag ambiguous formats (MM/DD vs DD/MM)

**Confidence Scoring:**
- 1.0: Exact, unambiguous, all text clear
- 0.8-0.99: Very likely, minor formatting uncertainty
- 0.6-0.79: Probable, some OCR ambiguity
- 0.4-0.59: Questionable, needs verification
- < 0.4: Unreliable, recommend manual review

Always return valid JSON with detailed confidence information.`;

export default DocumentParserAgent;
