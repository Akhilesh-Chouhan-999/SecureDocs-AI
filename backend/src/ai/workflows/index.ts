import { parseDocumentText } from "../parsers/index.js";
import { buildAnalysisMemory } from "../memory/index.js";
import { buildHistoricalContext } from "../rag/index.js";
import { buildCorpusEntry } from "../ingestion/index.js";
import { runFraudDetectionAgent } from "../../infrastructure/ai/agents/index.js";

const runDocumentAnalysisWorkflow = ({
  document,
  text,
  historicalRecords = [],
}: {
  document: any;
  text: string;
  historicalRecords?: any[];
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

export { runDocumentAnalysisWorkflow };
