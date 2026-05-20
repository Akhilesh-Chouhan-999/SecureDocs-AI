const compactObject = (input = {}) =>
  Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined),
  );

const truncateText = (value: string | null | undefined, maxLength = 180) => {
  const text = String(value || "")
    .replace(/\s+/g, " ")
    .trim();

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 3).trim()}...`;
};

const uniqueStrings = (values: string[] = []) => [
  ...new Set(values.filter(Boolean)),
];

export { compactObject, truncateText, uniqueStrings };
