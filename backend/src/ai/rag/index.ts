import { createKeywordFingerprint } from "../embeddings.js";
import { compareFingerprints } from "../vector-db.js";

const buildHistoricalContext = (text, historicalRecords = []) => {
  const currentFingerprint = createKeywordFingerprint(text);

  return historicalRecords
    .map((record) => {
      const referenceText = JSON.stringify(record.value || record);
      return {
        key: record.key || "unknown",
        source: record.source || "historical-record",
        score: compareFingerprints(
          currentFingerprint,
          createKeywordFingerprint(referenceText),
        ),
      };
    })
    .sort((left, right) => right.score - left.score)
    .slice(0, 3);
};

export { buildHistoricalContext,
 };
