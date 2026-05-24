const fs = require('fs');

let content = fs.readFileSync('tests/integration/reports.test.ts', 'utf8');

content = content.replace(/testUserId = "user-123"/g, 'testUserId = "507f1f77bcf86cd799439011"');
content = content.replace(/testDocumentId = "doc-123"/g, 'testDocumentId = "507f1f77bcf86cd799439012"');
content = content.replace(/testReportId = "report-123"/g, 'testReportId = "507f1f77bcf86cd799439013"');
content = content.replace(/id: "user-123"/g, 'id: "507f1f77bcf86cd799439011"');
content = content.replace(/"invalid-id"/g, '"507f1f77bcf86cd799439014"');
content = content.replace(/"report-1"/g, '"507f1f77bcf86cd799439021"');
content = content.replace(/"report-2"/g, '"507f1f77bcf86cd799439022"');
content = content.replace(/"doc-1"/g, '"507f1f77bcf86cd799439031"');
content = content.replace(/"doc-2"/g, '"507f1f77bcf86cd799439032"');

// Fix review notes since Joi expects notes, not reviewNotes
content = content.replace(/send\({ decision }\)/g, 'send({ decision, notes: "test notes" })');
content = content.replace(/send\(\{\s*decision:\s*"approved",\s*reviewNotes:\s*"Approved after verification",\s*\}\)/g, 'send({ decision: "approved", notes: "Approved after verification" })');
content = content.replace(/send\(\{\s*decision:\s*"manual_review",\s*reviewNotes:\s*"Further investigation needed",\s*\}\)/g, 'send({ decision: "manual_review", notes: "Further investigation needed" })');


fs.writeFileSync('tests/integration/reports.test.ts', content);
