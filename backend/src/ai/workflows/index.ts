const { parseDocumentText } = require("../parsers");
const { buildAnalysisMemory } = require("../memory");
const { buildHistoricalContext } = require("../rag");
const { buildCorpusEntry } = require("../ingestion");
const { runFraudDetectionAgent } = require("../../infrastructure/ai/agents");

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

module.exports = {
  runDocumentAnalysisWorkflow,
};
