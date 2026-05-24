import { FraudAnomaly } from "../../types/domain.js";

export class IndicatorEvaluator {

  /**
   * Normalizes and evaluates indicators coming from different sources
   * (e.g. LLM, rules, heuristics) to ensure a consistent anomaly format.
   */
  evaluateIndicators(rawIndicators: any[]): FraudAnomaly[] {
    return rawIndicators.map((indicator) => {
      return {
        type: indicator.type || "unknown_anomaly",
        severity: this.normalizeSeverity(indicator.severity),
        description:
          indicator.description || "An unidentified anomaly was found.",
        affectedField: indicator.affectedField || "document",
        confidence:
          typeof indicator.confidence === "number" ? indicator.confidence : 0.5,
        suggestedAction:
          indicator.suggestedAction ||
          "Proceed with caution and manual review.",
      };
    });
  }

  private normalizeSeverity(
    severity: string,
  ): "low" | "medium" | "high" | "critical" {
    const s = String(severity).toLowerCase();
    if (["critical", "high", "medium", "low"].includes(s)) {
      return s as "low" | "medium" | "high" | "critical";
    }
    return "medium"; // Default fallback
  }

}
