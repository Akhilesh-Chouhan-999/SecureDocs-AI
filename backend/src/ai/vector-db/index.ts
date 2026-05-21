const compareFingerprints = (
  left: Record<string, number> = {},
  right: Record<string, number> = {},
) => {
  const sharedKeys = Object.keys(left).filter((key) => right[key]);

  if (sharedKeys.length === 0) {
    return 0;
  }

  const score = sharedKeys.reduce(
    (total, key) => total + Math.min(left[key], right[key]),
    0,
  );

  return Number((score / sharedKeys.length).toFixed(2));
};

// Phase 4: RAG Vector Database
export {
  getChromaClient,
  closeAllChromaClients,
  ChromaClient,
  ChromaError,
} from "./chroma-client.js";
export {
  getSimilaritySearchService,
  SimilaritySearchService,
} from "./similarity-search.js";

export { compareFingerprints };
