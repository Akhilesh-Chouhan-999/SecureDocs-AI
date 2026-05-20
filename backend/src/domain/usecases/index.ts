import { RISK_LEVELS } from "../../constants";
import type {
  FraudAnomaly,
  RiskAssessment,
  StructuredDocumentData,
  RiskLevel,
} from "../../types/domain";

/**
 * Run heuristic rule analysis against raw text, segments, and historical matches
 * to flag potential fraud anomalies.
 * @param params Input text, segments, and historical cross-match scores
 */
export const detectFraudSignals = ({
  text,
  structuredData,
  historicalContext = [],
}: {
  text: string;
  structuredData: StructuredDocumentData;
  historicalContext?: Array<{ key: string; source: string; score: number }>;
}): FraudAnomaly[] => {
  const anomalies: FraudAnomaly[] = [];
  const normalizedText = String(text || "").toLowerCase();

  if (normalizedText.includes("mismatch") || normalizedText.includes("owner")) {
    anomalies.push({
      type: "ownership_mismatch",
      severity: "high",
      description: "Potential ownership inconsistency detected.",
      affectedField: "ownership",
      confidence: 0.78,
      suggestedAction:
        "Compare borrower and ownership details against historical records.",
    });
  }

  if (
    structuredData.declaredIncome &&
    Number(structuredData.declaredIncome) >= 250000
  ) {
    anomalies.push({
      type: "income_verification",
      severity: "medium",
      description:
        "Declared income is high enough to require source validation.",
      affectedField: "income",
      confidence: 0.67,
      suggestedAction: "Verify income through bank statements or tax records.",
    });
  }

  if (!structuredData.borrowerName) {
    anomalies.push({
      type: "missing_borrower_name",
      severity: "medium",
      description: "Borrower name could not be extracted from the document.",
      affectedField: "borrowerName",
      confidence: 0.61,
      suggestedAction:
        "Review scan quality or provide a clearer source document.",
    });
  }

  if (historicalContext.some((match) => match.score >= 2)) {
    anomalies.push({
      type: "historical_overlap",
      severity: "low",
      description:
        "Similar values appear in historical records and should be reviewed.",
      affectedField: "historical",
      confidence: 0.58,
      suggestedAction: "Cross-check the document against previous submissions.",
    });
  }

  return anomalies;
};

/**
 * Calculate the overall risk score and assign a risk tier level
 * based on flagged anomalies.
 * @param anomalies List of flagged document anomalies
 */
export const buildRiskAssessment = (
  anomalies: FraudAnomaly[] = [],
): RiskAssessment => {
  const severityWeights = {
    critical: 50,
    high: 35,
    medium: 20,
    low: 8,
  };

  const riskScore = Math.min(
    Math.round(
      anomalies.reduce((total, anomaly) => {
        const weight = severityWeights[anomaly.severity] || 0;
        return total + weight * (anomaly.confidence || 0.5);
      }, 0),
    ),
    100,
  );

  let riskLevel: RiskLevel = RISK_LEVELS[0]; // "low"

  if (riskScore >= 81) {
    riskLevel = "critical";
  } else if (riskScore >= 61) {
    riskLevel = "high";
  } else if (riskScore >= 31) {
    riskLevel = "medium";
  }

  return {
    riskScore,
    riskLevel,
    summary: [
      "Fraud Risk Assessment Report",
      `Risk Level: ${riskLevel}`,
      `Risk Score: ${riskScore}/100`,
      `Potential Anomalies Flagged: ${anomalies.length}`,
      "The system flags possible inconsistencies only; it does not confirm fraud.",
    ].join("\n"),
    recommendations:
      anomalies.length === 0 || riskLevel === "low"
        ? ["Proceed with standard underwriting verification."]
        : anomalies.map((anomaly) => anomaly.suggestedAction),
  };
};

export const usecases = {
  detectFraudSignals,
  buildRiskAssessment,
};

export default usecases;
