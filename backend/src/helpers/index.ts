const compactObject = (input = {}) =>
  Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined),
  );

const truncateText = (value, maxLength = 180) => {
  const text = String(value || "").replace(/\s+/g, " ").trim();

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 3).trim()}...`;
};

const uniqueStrings = (values = []) => [...new Set(values.filter(Boolean))];

module.exports = {
  compactObject,
  truncateText,
  uniqueStrings,
};
