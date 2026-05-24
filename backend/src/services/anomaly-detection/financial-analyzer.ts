import { FraudAnomaly } from "../../types/domain.js";

export class FinancialAnalyzer {
  /**
   * Analyzes financial data to detect unrealistic values or sudden spikes.
   */
  async checkFinancials(
    declaredIncome: number | undefined, 
    historicalIncome: number | undefined
  ): Promise<FraudAnomaly[]> {
    const anomalies: FraudAnomaly[] = [];

    if (declaredIncome === undefined || isNaN(declaredIncome)) {
      anomalies.push({
        type: "missing_financials",
        severity: "low",
        description: "No readable income data found on document",
        affectedField: "declaredIncome",
        confidence: 0.8,
        suggestedAction: "Request alternative proof of income",
      });
      return anomalies;
    }

    // Outlier detection
    if (declaredIncome > 500000) {
      anomalies.push({
        type: "high_income_outlier",
        severity: "medium",
        description: `Declared income of $${declaredIncome} is unusually high`,
        affectedField: "declaredIncome",
        confidence: 0.7,
        suggestedAction: "Require IRS tax transcripts (Form 4506-C) for verification",
      });
    }

    // Historical spike detection
    if (historicalIncome && historicalIncome > 0) {
      const increasePercentage = ((declaredIncome - historicalIncome) / historicalIncome) * 100;
      if (increasePercentage > 50) {
        anomalies.push({
          type: "unrealistic_income_spike",
          severity: "high",
          description: `Income jumped by ${Math.round(increasePercentage)}% compared to historical records ($${historicalIncome} -> $${declaredIncome})`,
          affectedField: "declaredIncome",
          confidence: 0.85,
          suggestedAction: "Verify employment history and reason for sudden income increase",
        });
      }
    }

    return anomalies;
  }
}
