/**
 * Escape text characters that could corrupt PDF stream syntax
 * @param value Text block to escape
 */
const escapePdfText = (value: string = ""): string =>
  String(value)
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/\r?\n/g, "\\n");

/**
 * Basic pure PDF generator creating Helvetica page stream
 * @param lines Text lines to display
 */
const renderPdfBuffer = (lines: string[] = []): Buffer => {
  const sanitizedLines = lines.filter(Boolean);
  const body = sanitizedLines
    .map((line, index) => `BT /F1 12 Tf 50 ${770 - index * 18} Td (${escapePdfText(line)}) Tj ET`)
    .join("\n");

  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Count 1 /Kids [3 0 R] >> endobj",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj",
    "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
    `5 0 obj << /Length ${Buffer.byteLength(body, "utf8")} >> stream\n${body}\nendstream endobj`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  for (const object of objects) {
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += `${object}\n`;
  }

  const xrefStart = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";

  for (let index = 1; index < offsets.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }

  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return Buffer.from(pdf, "utf8");
};

/**
 * Generate a PDF document report buffer from FraudReportEntity details
 * @param report The fraud report object context
 */
export const buildReportPdf = (report: any): Buffer => {
  const lines = [
    "SecureDocs AI Fraud Report",
    `Report ID: ${report._id}`,
    `Document ID: ${report.document?._id || report.document || "unknown"}`,
    `Analyst ID: ${report.analyst?._id || report.analyst || "unknown"}`,
    `Risk Level: ${report.riskLevel}`,
    `Risk Score: ${report.riskScore}/100`,
    `Decision: ${report.decision || "pending"}`,
    `Reviewed By: ${report.reviewedBy?._id || report.reviewedBy || "n/a"}`,
    `Reviewed At: ${report.reviewedAt || "n/a"}`,
    "",
    "Summary:",
    report.summary || "No summary available",
    "",
    "Recommendations:",
    ...(report.recommendations || []).map((item: string, index: number) => `${index + 1}. ${item}`),
    "",
    "Anomalies:",
    ...((report.anomalies || []).map((anomaly: any, index: number) =>
      `${index + 1}. [${anomaly.severity}] ${anomaly.type} - ${anomaly.description}`,
    )),
  ];

  return renderPdfBuffer(lines);
};

export const reportPdf = {
  buildReportPdf,
};

export default reportPdf;
