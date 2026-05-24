import { AnomalyDetectionService } from "../anomaly-detection.service.js";

describe("AnomalyDetectionService", () => {
  let service: AnomalyDetectionService;

  beforeEach(() => {
    service = new AnomalyDetectionService();
  });

  it("should evaluate document and return anomalies", async () => {
    const document = { ownerName: "John Doe", createdAt: new Date() };
    const extractedData = {
      declaredIncome: 600000, // Trigger high income outlier
      borrowerName: "Jane Doe", // Trigger ownership mismatch
    };
    const historicalRecords: any[] = [];

    const anomalies = await service.evaluateDocument(document, extractedData, historicalRecords);

    expect(anomalies.length).toBeGreaterThan(0);
    const types = anomalies.map(a => a.type);
    expect(types).toContain("high_income_outlier");
    expect(types).toContain("ownership_mismatch");
  });
});
