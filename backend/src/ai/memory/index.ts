const { truncateText } = require("../../helpers");

const buildAnalysisMemory = (document) => ({
  documentId: String(document._id),
  fileName: document.fileName,
  status: document.status,
  preview: truncateText(document.ocrText || document.fileName),
});

module.exports = {
  buildAnalysisMemory,
};
