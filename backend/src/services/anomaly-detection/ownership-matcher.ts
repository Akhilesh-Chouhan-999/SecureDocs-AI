import { FraudAnomaly } from "../../types/domain.js";

export class OwnershipMatcher {
  /**
   * Matches document ownership against historical data to detect impersonation.
   */
  async checkOwnership(
    documentOwner: string, 
    extractedName: string | undefined, 
    historicalRecords: any[]
  ): Promise<FraudAnomaly[]> {
    const anomalies: FraudAnomaly[] = [];
    
    if (!extractedName) {
      anomalies.push({
        type: "missing_ownership",
        severity: "medium",
        description: "Document does not contain a discernible owner name",
        affectedField: "borrowerName",
        confidence: 0.6,
        suggestedAction: "Manually verify the document belongs to the claimant",
      });
      return anomalies;
    }

    // Direct mismatch
    if (documentOwner.toLowerCase().trim() !== extractedName.toLowerCase().trim()) {
      anomalies.push({
        type: "ownership_mismatch",
        severity: "high",
        description: `Extracted name '${extractedName}' does not match expected owner '${documentOwner}'`,
        affectedField: "borrowerName",
        confidence: 0.85,
        suggestedAction: "Request proof of legal name change or verify document authenticity",
      });
    }

    // Historical cross-referencing
    const matchingHistorical = historicalRecords.filter(
      r => r.metadata?.borrowerName && r.metadata.borrowerName.toLowerCase() === extractedName.toLowerCase()
    );

    if (matchingHistorical.length > 0) {
      // Check if historical cases associated with this name had fraud
      const historicalFraud = matchingHistorical.find(r => r.metadata?.fraudulent === true);
      if (historicalFraud) {
        anomalies.push({
          type: "historical_fraud_association",
          severity: "critical",
          description: `The extracted name '${extractedName}' is associated with prior fraudulent activity (Case: ${historicalFraud.id})`,
          affectedField: "borrowerName",
          confidence: 0.95,
          suggestedAction: "Escalate to fraud investigation team immediately",
        });
      }
    }

    return anomalies;
  }
}
