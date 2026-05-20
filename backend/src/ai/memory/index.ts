import { truncateText } from "../../helpers/index.js";
import type { DocumentEntity } from "../../types/domain.js";

const buildAnalysisMemory = (document: DocumentEntity) => ({
  documentId: String(document._id),
  fileName: document.fileName,
  status: document.status,
  preview: truncateText(document.ocrText || document.fileName),
});

export { buildAnalysisMemory };
