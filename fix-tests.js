const fs = require('fs');
const path = require('path');

const tsFiles = ['documents.test.ts', 'history.test.ts', 'reports.test.ts'];

for (const file of tsFiles) {
  const filePath = path.join(__dirname, 'backend', 'tests', 'integration', file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf-8');
    content = content.replace('beforeAll(() => {', 'beforeAll(async () => {');
    content = content.replace(
      'app = require("../../src/app").default || require("../../src/app");',
      'const appModule = await import("../../src/app.js");\n    app = appModule.default || appModule;'
    );
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  }
}

// Fix route-surface.test.js
const routeSurfacePath = path.join(__dirname, 'backend', 'tests', 'integration', 'route-surface.test.js');
if (fs.existsSync(routeSurfacePath)) {
  let content = fs.readFileSync(routeSurfacePath, 'utf-8');
  content = content.replace('const request = require("supertest");', 'import request from "supertest";\nimport { jest } from "@jest/globals";');
  content = content.replace('const app = require("../../src/app");', 'import app from "../../src/app.js";');
  fs.writeFileSync(path.join(__dirname, 'backend', 'tests', 'integration', 'route-surface.test.ts'), content);
  fs.unlinkSync(routeSurfacePath);
  console.log('Updated route-surface.test.js to .ts');
}

