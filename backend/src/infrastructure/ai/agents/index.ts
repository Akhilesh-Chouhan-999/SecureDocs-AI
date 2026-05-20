const { detectFraudSignals } = require("../../../domain/usecases");

const runFraudDetectionAgent = ({ text, structuredData, historicalContext }) =>
  detectFraudSignals({
    text,
    structuredData,
    historicalContext,
  });

module.exports = {
  runFraudDetectionAgent,
};
