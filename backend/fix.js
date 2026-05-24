import fs from "fs";
let code = fs.readFileSync("tests/integration/documents.test.ts", "utf8");

// Replace standard document properties
const props = [
  "id",
  "status",
  "fileType",
  "fileName",
  "ocrText",
  "ocrConfidence",
  "fileDeletedAt",
];
props.forEach((p) => {
  code = code.replace(
    new RegExp(`response\\.body\\.data\\.${p}`, "g"),
    `response.body.document.${p}`,
  );
});

// Replace array properties
code = code.replace(
  /response\.body\.data\.documents/g,
  "response.body.documents",
);
code = code.replace(
  /response\.body\.data\.pagination/g,
  "response.body.pagination",
);

// Replace mock errors
code = code.replace(
  /new Error\("Unsupported file type"\)/g,
  'Object.assign(new Error("Unsupported file type"), { status: 400 })',
);
code = code.replace(
  /new Error\("File too large"\)/g,
  'Object.assign(new Error("File too large"), { status: 400 })',
);
code = code.replace(
  /new Error\("File exceeds max size of 50MB"\)/g,
  'Object.assign(new Error("File exceeds max size of 50MB"), { status: 400 })',
);
code = code.replace(
  /new Error\("Document not found"\)/g,
  'Object.assign(new Error("Document not found"), { status: 404 })',
);
code = code.replace(
  /new Error\("Unauthorized access"\)/g,
  'Object.assign(new Error("Unauthorized access"), { status: 403 })',
);
code = code.replace(
  /new Error\("Unauthorized"\)/g,
  'Object.assign(new Error("Unauthorized"), { status: 403 })',
);
code = code.replace(
  /new Error\("Forbidden"\)/g,
  'Object.assign(new Error("Forbidden"), { status: 403 })',
);

// Replace mock methods
code = code.replace(
  /mockDocumentService\.uploadDocument/g,
  "mockDocumentService.upload",
);
code = code.replace(
  /mockDocumentService\.getDocument/g,
  "mockDocumentService.getOwnedDocument",
);
code = code.replace(
  /mockDocumentService\.deleteDocument/g,
  "mockDocumentService.deleteOwnedDocument",
);

fs.writeFileSync("tests/integration/documents.test.ts", code);
console.log("Fixed documents.test.ts");
