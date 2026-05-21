import { createKeywordFingerprint } from "../embeddings/index.js";
import { compareFingerprints } from "../vector-db/index.js";

const buildHistoricalContext = (
  text: string,
  historicalRecords: any[] = [],
) => {
  const currentFingerprint = createKeywordFingerprint(text);

  return historicalRecords
    .map((record: any) => {
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
    .sort((left: any, right: any) => right.score - left.score)
    .slice(0, 3);
};

// Phase 4: RAG Pipeline
export {
  getRAGPipeline,
  closeAllRAGPipelines,
  RAGPipeline,
} from "./rag-pipeline.js";
export {
  getContextAugmentationService,
  ContextAugmentationService,
} from "./context-augmentation.js";

export { buildHistoricalContext };
