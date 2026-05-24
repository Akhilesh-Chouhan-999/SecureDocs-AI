const fs = require('fs');
const path = require('path');

const documentsPath = path.join(__dirname, 'backend', 'tests', 'integration', 'documents.test.ts');
if (fs.existsSync(documentsPath)) {
  let content = fs.readFileSync(documentsPath, 'utf-8');
  if (!content.includes('__dirname')) {
    // skip
  } else if (!content.includes('fileURLToPath')) {
    content = content.replace(
      'import path from "path";',
      'import path from "path";\nimport { fileURLToPath } from "url";\nconst __filename = fileURLToPath(import.meta.url);\nconst __dirname = path.dirname(__filename);'
    );
    fs.writeFileSync(documentsPath, content);
  }
}

const historyPath = path.join(__dirname, 'backend', 'tests', 'integration', 'history.test.ts');
if (fs.existsSync(historyPath)) {
  let content = fs.readFileSync(historyPath, 'utf-8');
  // Update the mock to use headers
  content = content.replace(
    'role: "analyst"',
    'role: req.headers["x-test-role"] || "analyst"'
  );
  fs.writeFileSync(historyPath, content);
}

const reportsPath = path.join(__dirname, 'backend', 'tests', 'integration', 'reports.test.ts');
if (fs.existsSync(reportsPath)) {
  let content = fs.readFileSync(reportsPath, 'utf-8');
  content = content.replace(
    'role: "analyst"',
    'role: req.headers["x-test-role"] || "analyst"'
  );
  fs.writeFileSync(reportsPath, content);
}

const routeSurfacePath = path.join(__dirname, 'backend', 'tests', 'integration', 'route-surface.test.ts');
if (fs.existsSync(routeSurfacePath)) {
  let content = fs.readFileSync(routeSurfacePath, 'utf-8');
  // convert import app to dynamic import in beforeAll
  content = content.replace('import app from "../../src/app.js";', 'let app;');
  if (!content.includes('beforeAll')) {
    content = content.replace('beforeEach(() => {', 'beforeAll(async () => {\n    app = (await import("../../src/app.js")).default || await import("../../src/app.js");\n  });\n\n  beforeEach(() => {');
  }
  fs.writeFileSync(routeSurfacePath, content);
}
