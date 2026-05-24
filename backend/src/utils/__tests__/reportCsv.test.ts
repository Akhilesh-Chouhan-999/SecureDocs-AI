import { buildCsvDownload } from "../reportCsv.js";

describe("Report CSV Utilities", () => {
  it("should generate a CSV with headers even if anomalies array is empty", () => {
    const csv = buildCsvDownload([]);
    expect(csv).toContain("Severity,Type,Description,Confidence");
  });

  it("should generate a valid CSV string from an array of anomalies", () => {
    const anomalies = [
      {
        severity: "high",
        type: "mismatch",
        description: "Name mismatch",
        confidence: 0.9,
      },
    ];

    const csv = buildCsvDownload(anomalies);
    expect(csv).toContain("severity");
    expect(csv).toContain("high");
    expect(csv).toContain("mismatch");
    expect(csv).toContain("0.9");
  });
});
