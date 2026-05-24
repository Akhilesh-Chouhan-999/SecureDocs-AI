import { Parser } from "json2csv";
import { logger } from "../logs/index.js";

/**
 * Generate a CSV string from an array of FraudAnomaly objects
 * @param anomalies The list of anomalies detected in the document
 */
export const buildCsvDownload = (anomalies: any[]): string => {
  if (!anomalies || anomalies.length === 0) {
    return "Severity,Type,Description,Confidence\n";
  }

  try {
    const fields = ["severity", "type", "description", "confidence"];
    const opts = { fields };
    const parser = new Parser(opts);
    const csv = parser.parse(anomalies);
    return csv;
  } catch (err) {
    logger.error("Error generating CSV report", err);
    throw new Error("Failed to generate CSV format");
  }
};
