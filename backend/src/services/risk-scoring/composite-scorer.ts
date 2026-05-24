import { FraudAnomaly, RiskLevel } from "../../types/domain.js";

export class CompositeScorer {
  /**
   * Calculates a composite risk score (0-100) based on detected anomalies.
   */
  calculateRiskScore(anomalies: FraudAnomaly[]): number {
    let score = 0;
    
    for (const anomaly of anomalies) {
      let severityWeight = 0;
      switch (anomaly.severity) {
        case "low": severityWeight = 10; break;
        case "medium": severityWeight = 25; break;
        case "high": severityWeight = 50; break;
        case "critical": severityWeight = 100; break;
      }
      
      // Weight the severity by confidence (fallback to 1 if missing)
      const confidence = typeof anomaly.confidence === "number" ? anomaly.confidence : 1;
      score += severityWeight * confidence;
    }
    
    // Penalize if there are multiple anomalies (clustering penalty)
    if (anomalies.length >= 3) {
      score *= 1.25; 
    }
    
    // Cap score at 100
    return Math.min(Math.round(score), 100);
  }

  /**
   * Determines the qualitative risk level based on the 0-100 score.
   */
  determineRiskLevel(score: number): RiskLevel {
    if (score <= 30) return "low";
    if (score <= 60) return "medium";
    if (score <= 80) return "high";
    return "critical";
  }

  /**
   * Aggregates confidences into a single overall confidence score.
   */
  calculateAggregateConfidence(anomalies: FraudAnomaly[]): number {
    if (anomalies.length === 0) return 1.0;
    const sum = anomalies.reduce((acc, curr) => acc + (curr.confidence || 0), 0);
    return Number((sum / anomalies.length).toFixed(2));
  }
}
