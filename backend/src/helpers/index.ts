export const compactObject = (input: Record<string, any> = {}) =>
  Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined),
  );

export const truncateText = (value: any, maxLength = 180) => {
  const text = String(value || "")
    .replace(/\s+/g, " ")
    .trim();

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 3).trim()}...`;
};

export const uniqueStrings = (values: any[] = []): string[] => [
  ...new Set(values.filter(Boolean)),
];
