import { FraudAnomaly } from "../../types/domain.js";

export class MetadataValidator {

  /**
   * Validates document metadata like creation dates, expiry, and formatting.
   */
  async validateMetadata(
    documentDate: string | undefined,
    uploadDate: Date,
  ): Promise<FraudAnomaly[]> {
    const anomalies: FraudAnomaly[] = [];

    if (!documentDate) {
      anomalies.push({
        type: "missing_date",
        severity: "low",
        description: "Document does not have a recognizable date",
        affectedField: "documentDate",
        confidence: 0.9,
        suggestedAction: "Check document validity manually",
      });
      return anomalies;
    }

    const docDate = new Date(documentDate);
    if (isNaN(docDate.getTime())) {
      return anomalies;
    }

    // Future date detection
    if (docDate > uploadDate) {
      anomalies.push({
        type: "future_date_forgery",
        severity: "critical",
        description: `Document is dated in the future (${docDate.toISOString().split("T")[0]}) relative to upload date`,
        affectedField: "documentDate",
        confidence: 0.95,
        suggestedAction: "Reject document immediately as likely forged",
      });
    }

    // Stale document detection (e.g., older than 90 days)
    const diffTime = Math.abs(uploadDate.getTime() - docDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 90 && docDate < uploadDate) {
      anomalies.push({
        type: "stale_document",
        severity: "medium",
        description: `Document is ${diffDays} days old (exceeds 90-day freshness policy)`,
        affectedField: "documentDate",
        confidence: 0.8,
        suggestedAction: "Request a more recent document",
      });
    }

    return anomalies;
  }

}
