const createKeywordFingerprint = (text: string): Record<string, number> => {
  const tokens = String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 3);

  return tokens.reduce<Record<string, number>>((accumulator, token) => {
    accumulator[token] = (accumulator[token] || 0) + 1;
    return accumulator;
  }, {});
};

export { createKeywordFingerprint,
 };
