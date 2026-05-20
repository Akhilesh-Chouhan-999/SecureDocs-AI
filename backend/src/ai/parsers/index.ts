const parseDocumentText = (text: string) => {
  const source = String(text || "");
  const nameMatch = source.match(/borrower[:\s]+([a-z ,.'-]+)/i);
  const incomeMatch = source.match(/income[:\s$]+([\d,]+)/i);
  const dateMatch = source.match(/date[:\s]+(\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4})/i);

  return {
    borrowerName: nameMatch ? nameMatch[1].trim() : null,
    declaredIncome: incomeMatch
      ? Number(incomeMatch[1].replace(/,/g, ""))
      : null,
    documentDate: dateMatch ? dateMatch[1].trim() : null,
  };
};

export { parseDocumentText };
