const fs = require('fs');
const glob = require('glob');
const path = require('path');

const files = fs.readdirSync('tests/integration').filter(f => f.includes('.test.'));

files.forEach(file => {
  const filePath = path.join('tests/integration', file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace auth middleware mock
  content = content.replace(
    /jest\.mock\("\.\.\/\.\.\/src\/middleware\/auth\.middleware"[\s\S]*?(?=\s*jest\.mock|\s*app\s*=\s*require)/,
    `jest.mock("../../src/middleware/auth.middleware", () => ({ __esModule: true, default: (req: any, res: any, next: any) => { req.user = { id: "user-123", email: "testuser@example.com", role: "analyst" }; next(); } }));\n\n    `
  );

  // Replace container mock
  content = content.replace(
    /jest\.mock\("\.\.\/\.\.\/src\/config\/container"[\s\S]*?(?=\s*app\s*=\s*require)/,
    `jest.mock("../../src/config/container", () => ({
      __esModule: true,
      default: { get: (name: string) => {
        try { return eval("mock" + name.charAt(0).toUpperCase() + name.slice(1)); } catch (e) { return null; }
      } },
      container: { get: (name: string) => {
        try { return eval("mock" + name.charAt(0).toUpperCase() + name.slice(1)); } catch (e) { return null; }
      } }
    }));\n\n    `
  );

  // Fix app import
  content = content.replace(
    /app\s*=\s*require\("\.\.\/\.\.\/src\/app"\);/g,
    `app = require("../../src/app").default || require("../../src/app");`
  );

  fs.writeFileSync(filePath, content);
});
