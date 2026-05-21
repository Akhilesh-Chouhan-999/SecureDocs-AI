import { BasePromptTemplate } from "@langchain/core/prompts";

const FRAUD_DETECTION_PROMPT = `You are a fraud detection expert. Analyze the following document and historical context to identify fraud indicators.\n\nDocument:\n{document}\n\nHistorical Context:\n{historicalContext}\n\nProvide a structured analysis including:\n1. Identified Anomalies\n2. Risk Score (0-100)\n3. Fraud Indicators\n4. Recommendations`;

export { FRAUD_DETECTION_PROMPT };
