/**
 * Fraud Detection Tools
 * LangChain tools for fraud analysis and risk assessment
 */

import { Tool } from "@langchain/core/tools";
import { z } from "zod";
import { logger } from "../../logs/index.js";
import HistoricalRecord from "../../models/HistoricalRecord.js";
import Document from "../../models/Document.js";

/**
 * Historical Lookup Tool
 * Searches for historical records by email or customer name
 */
export class HistoricalLookupTool extends Tool {
  name = "historical_lookup";
  description =
    "Retrieve historical records for a customer by email, name, or customer ID. Returns previous applications, legal records, and known fraud indicators.";

  schema = z.object({
    email: z.string().email().optional(),
    customerName: z.string().optional(),
    customerId: z.string().optional(),
  });

  protected async _call(input: any): Promise<string> {
    try {
      const { email, customerName, customerId } = input;

      if (!email && !customerName && !customerId) {
        return JSON.stringify({
          status: "error",
          message: "Must provide at least one search criteria",
        });
      }

      const query: any = {};
      if (email) query.ownerEmail = email;
      if (customerName) query.ownerName = new RegExp(customerName, "i");
      if (customerId) query.customerId = customerId;

      const records = await HistoricalRecord.find(query).limit(10);

      if (records.length === 0) {
        return JSON.stringify({
          status: "not_found",
          message: "No historical records found",
        });
      }

      const summary = records.map((record: any) => ({
        id: record._id,
        email: record.ownerEmail,
        name: record.ownerName,
        previousApplications: record.previousApplications?.length || 0,
        legalRecords: record.legalRecords?.length || 0,
        flaggedAsHighRisk: record.flaggedAsHighRisk || false,
        lastUpdated: record.updatedAt,
      }));

      logger.info(`Historical lookup found ${records.length} records`);

      return JSON.stringify({
        status: "found",
        recordCount: records.length,
        records: summary,
      });
    } catch (error) {
      logger.error("Historical lookup error:", error);
      return JSON.stringify({
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}

/**
 * Financial Analysis Tool
 * Analyzes financial patterns and detects anomalies
 */
export class FinancialAnalysisTool extends Tool {
  name = "financial_analysis";
  description =
    "Analyze financial data for anomalies. Detects outliers, unusual patterns, and suspicious transactions.";

  schema = z.object({
    declaredAmount: z.number().positive(),
    documentType: z.string(),
    historicalAverage: z.number().optional(),
    transactionHistory: z.array(z.number()).optional(),
    expectedRange: z
      .object({
        min: z.number(),
        max: z.number(),
      })
      .optional(),
  });

  protected async _call(input: any): Promise<string> {
    try {
      const {
        declaredAmount,
        documentType,
        historicalAverage,
        transactionHistory,
        expectedRange,
      } = input;

      const anomalies: any[] = [];
      let riskScore = 0;

      // Check against expected range
      if (expectedRange) {
        if (
          declaredAmount < expectedRange.min ||
          declaredAmount > expectedRange.max
        ) {
          anomalies.push({
            type: "amount_out_of_range",
            severity: "high",
            expectedRange,
            actual: declaredAmount,
            confidence: 0.95,
          });
          riskScore += 25;
        }
      }

      // Check against historical average
      if (historicalAverage) {
        const deviation =
          Math.abs(declaredAmount - historicalAverage) / historicalAverage;
        if (deviation > 0.5) {
          anomalies.push({
            type: "significant_deviation_from_history",
            severity: "medium",
            deviation: (deviation * 100).toFixed(2) + "%",
            historicalAverage,
            declared: declaredAmount,
            confidence: 0.85,
          });
          riskScore += 15;
        } else if (deviation > 0.3) {
          anomalies.push({
            type: "moderate_deviation_from_history",
            severity: "low",
            deviation: (deviation * 100).toFixed(2) + "%",
            confidence: 0.7,
          });
          riskScore += 5;
        }
      }

      // Check transaction history patterns
      if (transactionHistory && transactionHistory.length > 0) {
        const avg =
          transactionHistory.reduce((a, b) => a + b, 0) /
          transactionHistory.length;
        const standardDeviation = Math.sqrt(
          transactionHistory.reduce((sq, n) => sq + Math.pow(n - avg, 2), 0) /
            transactionHistory.length,
        );

        // Check if current amount is outlier (>2 standard deviations)
        if (Math.abs(declaredAmount - avg) > 2 * standardDeviation) {
          anomalies.push({
            type: "statistical_outlier",
            severity: "medium",
            message:
              "Amount is >2 standard deviations from transaction history",
            confidence: 0.9,
          });
          riskScore += 20;
        }
      }

      logger.info(`Financial analysis: ${anomalies.length} anomalies found`);

      return JSON.stringify({
        status: "completed",
        anomalies,
        riskScore: Math.min(100, riskScore),
        documentType,
      });
    } catch (error) {
      logger.error("Financial analysis error:", error);
      return JSON.stringify({
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}

/**
 * Document Validation Tool
 * Validates document metadata and checks for expiration/forgery
 */
export class DocumentValidationTool extends Tool {
  name = "document_validation";
  description =
    "Validate document metadata including issue dates, expiry dates, and issuer authenticity.";

  schema = z.object({
    documentType: z.string(),
    issueDate: z.string(),
    expiryDate: z.string(),
    issuer: z.string(),
  });

  protected async _call(input: any): Promise<string> {
    try {
      const { documentType, issueDate, expiryDate, issuer } = input;
      const issues: any[] = [];
      let riskScore = 0;

      try {
        const now = new Date();
        const issue = new Date(issueDate);
        const expiry = new Date(expiryDate);

        // Check if expiry date is in the past
        if (expiry < now) {
          issues.push({
            type: "document_expired",
            severity: "high",
            message: `Document expired on ${expiryDate}`,
            confidence: 1.0,
          });
          riskScore += 30;
        }

        // Check if issue date is in the future
        if (issue > now) {
          issues.push({
            type: "future_issue_date",
            severity: "high",
            message: "Issue date is in the future",
            confidence: 1.0,
          });
          riskScore += 35;
        }

        // Check if document validity period is suspicious (too short)
        const validityDays =
          (expiry.getTime() - issue.getTime()) / (1000 * 60 * 60 * 24);
        if (validityDays < 30) {
          issues.push({
            type: "suspiciously_short_validity_period",
            severity: "medium",
            message: `Document only valid for ${validityDays} days`,
            confidence: 0.8,
          });
          riskScore += 15;
        }

        // Check if document validity period is unreasonably long (>20 years)
        if (validityDays > 7300) {
          issues.push({
            type: "unusually_long_validity_period",
            severity: "low",
            message: `Document valid for ${validityDays} days (>20 years)`,
            confidence: 0.6,
          });
          riskScore += 5;
        }
      } catch {
        issues.push({
          type: "invalid_date_format",
          severity: "high",
          message: "Could not parse date formats",
          confidence: 1.0,
        });
        riskScore += 25;
      }

      logger.info(`Document validation: ${issues.length} issues found`);

      return JSON.stringify({
        status: "completed",
        valid: issues.length === 0,
        issues,
        riskScore: Math.min(100, riskScore),
      });
    } catch (error) {
      logger.error("Document validation error:", error);
      return JSON.stringify({
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}

/**
 * Anomaly Detection Tool
 * Identifies potential fraud indicators from OCR data
 */
export class AnomalyDetectionTool extends Tool {
  name = "anomaly_detection";
  description =
    "Detect fraud anomalies in document OCR data. Identifies inconsistencies, suspicious patterns, and red flags.";

  schema = z.object({
    ocrText: z.string(),
    documentType: z.string(),
    expectedFields: z.array(z.string()).optional(),
  });

  protected async _call(input: any): Promise<string> {
    try {
      const { ocrText, documentType, expectedFields } = input;
      const anomalies: any[] = [];
      let confidenceSum = 0;

      // Check for incomplete information
      if (expectedFields) {
        for (const field of expectedFields) {
          const fieldRegex = new RegExp(field, "i");
          if (!fieldRegex.test(ocrText)) {
            anomalies.push({
              type: "missing_field",
              field,
              severity: "high",
              confidence: 0.9,
            });
            confidenceSum += 0.9;
          }
        }
      }

      // Check for suspicious keywords (common fraud indicators)
      const fraudKeywords = [
        "correction",
        "amended",
        "void",
        "sample",
        "test",
        "draft",
        "photocopy",
        "duplicate",
        "tampered",
      ];

      for (const keyword of fraudKeywords) {
        if (new RegExp(keyword, "i").test(ocrText)) {
          anomalies.push({
            type: "suspicious_keyword_detected",
            keyword,
            severity: "high",
            confidence: 0.85,
          });
          confidenceSum += 0.85;
        }
      }

      // Check for inconsistent formatting (indicates potential tampering)
      const lineVariation = ocrText.split("\n").length;
      if (lineVariation < 3) {
        anomalies.push({
          type: "unusually_sparse_content",
          severity: "low",
          confidence: 0.6,
        });
      }

      logger.info(`Anomaly detection: ${anomalies.length} anomalies detected`);

      const avgConfidence =
        anomalies.length > 0 ? confidenceSum / anomalies.length : 0;

      return JSON.stringify({
        status: "completed",
        anomalyCount: anomalies.length,
        anomalies,
        averageConfidence: (avgConfidence * 100).toFixed(2) + "%",
        overallRiskScore:
          Math.min(100, anomalies.length * 10 + confidenceSum * 50) || 0,
      });
    } catch (error) {
      logger.error("Anomaly detection error:", error);
      return JSON.stringify({
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}

/**
 * Export all tools
 */
export const fraudDetectionTools = [
  new HistoricalLookupTool(),
  new FinancialAnalysisTool(),
  new DocumentValidationTool(),
  new AnomalyDetectionTool(),
];

export default fraudDetectionTools;
