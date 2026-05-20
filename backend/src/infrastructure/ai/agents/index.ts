import { detectFraudSignals } from "../../../domain/usecases";

export const runFraudDetectionAgent = ({ text, structuredData, historicalContext }: { text: any; structuredData: any; historicalContext: any }) =>
  detectFraudSignals({
    text,
    structuredData,
    historicalContext,
  });
