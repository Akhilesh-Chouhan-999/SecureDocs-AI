import { FraudAnomaly } from "../../types/domain.js";
import { FinancialAnalyzer } from "./financial-analyzer.js";
import { MetadataValidator } from "./metadata-validator.js";
import { OwnershipMatcher } from "./ownership-matcher.js";
import { PatternRecognizer } from "./pattern-recognizer.js";

export class AnomalyDetectionService {

  private financialAnalyzer: FinancialAnalyzer;
  private metadataValidator: MetadataValidator;
  private ownershipMatcher: OwnershipMatcher;
  private patternRecognizer: PatternRecognizer;

  constructor() {
    this.financialAnalyzer = new FinancialAnalyzer();
    this.metadataValidator = new MetadataValidator();
    this.ownershipMatcher = new OwnershipMatcher();
    this.patternRecognizer = new PatternRecognizer();
  }

  /**
   * Run all deterministic anomaly detection rules against a document's extracted data.
   */
  async evaluateDocument(
    document: any,
    extractedData: any,
    historicalRecords: any[],
  ): Promise<FraudAnomaly[]> {
    const anomalies: FraudAnomaly[] = [];

    // Financial Checks
    const financialAnomalies = await this.financialAnalyzer.checkFinancials(
      extractedData?.declaredIncome,
      extractedData?.historicalIncome,
    );
    anomalies.push(...financialAnomalies);

    // Metadata Checks
    const metadataAnomalies = await this.metadataValidator.validateMetadata(
      extractedData?.documentDate,
      new Date(document.createdAt || Date.now()),
    );
    anomalies.push(...metadataAnomalies);

    // Ownership Checks
    // Expected owner is typically derived from the user context or document record
    // We assume document has an ownerName property or similar, falling back to a dummy string if not found for testing
    const expectedOwner = document.ownerName || "Unknown Owner";
    const ownershipAnomalies = await this.ownershipMatcher.checkOwnership(
      expectedOwner,
      extractedData?.borrowerName || extractedData?.name,
      historicalRecords,
    );
    anomalies.push(...ownershipAnomalies);

    // Pattern Checks
    // We pass historical records that look similar or belong to the same cluster
    const patternAnomalies = await this.patternRecognizer.detectFraudClusters(
      extractedData,
      historicalRecords,
    );
    anomalies.push(...patternAnomalies);

    return anomalies;
  }

}
