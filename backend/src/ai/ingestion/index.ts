const buildCorpusEntry = (document, text) => ({
  id: String(document._id),
  title: document.fileName,
  body: String(text || ""),
  createdAt: document.createdAt,
});

module.exports = {
  buildCorpusEntry,
};
