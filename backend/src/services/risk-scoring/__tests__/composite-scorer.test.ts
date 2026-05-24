import { CompositeScorer } from "../composite-scorer.js";
import { FraudAnomaly } from "../../../types/domain.js";

describe("CompositeScorer", () => {
  let scorer: CompositeScorer;

  beforeEach(() => {
    scorer = new CompositeScorer();
  });

  it("should calculate correct risk score for single anomaly", () => {
    const anomalies: FraudAnomaly[] = [
      {
        type: "test",
        severity: "medium",
        description: "Test",
        confidence: 0.8,
        affectedField: "test",
        suggestedAction: "review",
      },
    ];
    // Medium (25) * 0.8 = 20
    const score = scorer.calculateRiskScore(anomalies);
    expect(score).toBe(20);
    expect(scorer.determineRiskLevel(score)).toBe("low");
  });

  it("should apply clustering penalty for 3+ anomalies", () => {
    const anomalies: FraudAnomaly[] = [
      {
        type: "test1",
        severity: "high",
        description: "",
        confidence: 1,
        affectedField: "",
        suggestedAction: "",
      }, // 50
      {
        type: "test2",
        severity: "high",
        description: "",
        confidence: 1,
        affectedField: "",
        suggestedAction: "",
      }, // 50
      {
        type: "test3",
        severity: "low",
        description: "",
        confidence: 1,
        affectedField: "",
        suggestedAction: "",
      }, // 10
    ];
    // Total: 110 * 1.25 = 137.5 -> Math.min(138, 100) -> 100
    const score = scorer.calculateRiskScore(anomalies);
    expect(score).toBe(100);
    expect(scorer.determineRiskLevel(score)).toBe("critical");
  });
});
