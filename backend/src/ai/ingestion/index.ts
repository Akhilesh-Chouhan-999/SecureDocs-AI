interface IngestionDocument {
  _id: unknown;
  fileName: string;
  createdAt: unknown;
}

interface CorpusEntry {
  id: string;
  title: string;
  body: string;
  createdAt: IngestionDocument["createdAt"];
}

const buildCorpusEntry = (
  document: IngestionDocument,
  text: string | null | undefined,
): CorpusEntry => ({
  id: String(document._id),
  title: document.fileName,
  body: String(text || ""),
  createdAt: document.createdAt,
});

export { buildCorpusEntry };
