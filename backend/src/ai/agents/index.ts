// Base agent framework
export { BaseAgent, type AgentExecutionResult } from "./base-agent.js";

// Specialized agents (Phase 3)
export { FraudDetectionAgent } from "./fraud-detection-agent.js";
export {
  RiskScoringAgent,
  type RiskScoringAgentInput,
} from "./risk-scoring-agent.js";
export { OCRAgent, type OCRAgentInput } from "./ocr-agent.js";
export {
  DocumentParserAgent,
  type DocumentParserAgentInput,
} from "./document-parser-agent.js";
export {
  ReportGenerationAgent,
  type ReportGenerationAgentInput,
} from "./report-generation-agent.js";
export {
  HistoricalContextAgent,
  type HistoricalContextAgentInput,
} from "./historical-context-agent.js";

// Legacy agent exports (keep for backward compatibility)
export * from "./fraud-detection.agent.js";
