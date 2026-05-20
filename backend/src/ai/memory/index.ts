import { truncateText } from "../../helpers";
import type { DocumentEntity } from "../../types/domain";

const buildAnalysisMemory = (document: DocumentEntity) => ({
  documentId: String(document._id),
  fileName: document.fileName,
  status: document.status,
  preview: truncateText(document.ocrText || document.fileName),
});

export { buildAnalysisMemory };
