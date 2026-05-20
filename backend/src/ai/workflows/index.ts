import { parseDocumentText } from "../parsers.js";
import { buildAnalysisMemory } from "../memory.js";
import { buildHistoricalContext } from "../rag.js";
import { buildCorpusEntry } from "../ingestion.js";
import { runFraudDetectionAgent } from "../../infrastructure/ai/agents.js";

const runDocumentAnalysisWorkflow = ({
  document,
  text,
  historicalRecords = [],
}) => {
  const structuredData = parseDocumentText(text);
  const memory = buildAnalysisMemory(document);
  const historicalContext = buildHistoricalContext(text, historicalRecords);
  const anomalies = runFraudDetectionAgent({
    text,
    structuredData,
    historicalContext,
  });

  return {
    structuredData,
    anomalies,
    memory,
    historicalContext,
    corpusEntry: buildCorpusEntry(document, text),
  };
};

export { runDocumentAnalysisWorkflow,
 };
