import FraudDetectionAgent from "../fraudDetectionAgent.js";

describe("FraudDetectionAgent", () => {
  it("should detect fraud in suspicious document", async () => {
    // Mock OpenAI and Agents in a real test environment,
    // Here we're checking the basic parsing and logic properties
    const mockOutput = `I found a critical red flag:
- Anomaly: Signature doesn't match past records (High)
Risk Score: 85`;

    const result = FraudDetectionAgent.parseAgentResult({ output: mockOutput });

    expect(result).toHaveProperty("riskScore");
    expect(result).toHaveProperty("riskLevel");
    expect(result).toHaveProperty("anomalies");
    expect(result.riskScore).toBe(85);
    expect(result.riskLevel).toBe("Critical");
    expect(result.anomalies.length).toBe(2);
    expect(result.anomalies[0].severity).toBe("high");
  });

  it("should return low risk for legitimate document", async () => {
    const mockOutput = `The document looks completely fine.
No anomalies detected.
Risk Score: 10`;

    const result = FraudDetectionAgent.parseAgentResult({ output: mockOutput });

    expect(result.riskLevel).toBe("Low");
    expect(result.riskScore).toBe(10);
    expect(result.anomalies.length).toBe(0);
  });
});
