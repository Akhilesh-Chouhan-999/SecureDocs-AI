#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.join(__dirname, "../src");

function convertFile(filePath) {
  let content = fs.readFileSync(filePath, "utf-8");
  const originalContent = content;

  // Skip if already using ES modules
  if (content.includes("import ") && !content.includes("require(")) {
    return false;
  }

  // Convert require statements to imports
  // Handle: const { X } = require("./path")
  content = content.replace(
    /const\s+{\s*([^}]+)\s*}\s*=\s*require\s*\(\s*["']([^"']+)["']\s*\)/g,
    (match, vars, modulePath) => {
      const cleanVars = vars
        .split(",")
        .map((v) => v.trim())
        .join(", ");
      const fullPath = addJsExtension(modulePath);
      return `import { ${cleanVars} } from "${fullPath}"`;
    },
  );

  // Handle: const X = require("./path")
  content = content.replace(
    /const\s+(\w+)\s*=\s*require\s*\(\s*["']([^"']+)["']\s*\)/g,
    (match, varName, modulePath) => {
      const fullPath = addJsExtension(modulePath);
      return `import ${varName} from "${fullPath}"`;
    },
  );

  // Handle: const { X } = require("package")
  content = content.replace(
    /const\s+{\s*([^}]+)\s*}\s*=\s*require\s*\(\s*["']([^"'/]+)["']\s*\)/g,
    (match, vars, modulePath) => {
      const cleanVars = vars
        .split(",")
        .map((v) => v.trim())
        .join(", ");
      return `import { ${cleanVars} } from "${modulePath}"`;
    },
  );

  // Handle module.exports = { ... }
  content = content.replace(
    /module\.exports\s*=\s*{\s*([^}]+)\s*}/g,
    (match, exports) => {
      const items = exports
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item);
      const exportLines = items
        .map((item) => {
          if (item.includes(":")) {
            const [key, value] = item.split(":").map((s) => s.trim());
            return `export { ${value} as ${key} }`;
          }
          return `export { ${item} }`;
        })
        .join("\n");
      return exportLines;
    },
  );

  // Handle: module.exports.X = Y
  content = content.replace(
    /module\.exports\.(\w+)\s*=\s*([^;]+);/g,
    (match, name, value) => {
      return `export const ${name} = ${value};`;
    },
  );

  // Handle: module.exports = class X { ... } or function X() { ... }
  content = content.replace(
    /module\.exports\s*=\s*(class\s+\w+\s*{[\s\S]*?^}/m,
    "export $1",
  );

  content = content.replace(
    /module\.exports\s*=\s*(function\s+\w+[\s\S]*?^}/m,
    "export $1",
  );

  // Handle remaining module.exports = { ... } with proper formatting
  content = content.replace(/module\.exports\s*=\s*{/g, "export {");

  // Handle module.exports.default
  content = content.replace(/module\.exports\.default\s*=/g, "export default");

  // Remove any remaining module.exports lines that couldn't be converted
  content = content.replace(/module\.exports\s*=\s*/g, "export default ");

  return content !== originalContent ? content : false;
}

function addJsExtension(modulePath) {
  // Don't add extension to node_modules packages
  if (!modulePath.startsWith(".")) {
    return modulePath;
  }
  // Add .js extension if not already present and it's a relative path
  if (!modulePath.endsWith(".js") && !modulePath.endsWith(".ts")) {
    return modulePath + ".js";
  }
  // Replace .ts with .js
  if (modulePath.endsWith(".ts")) {
    return modulePath.replace(/\.ts$/, ".js");
  }
  return modulePath;
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  const tsFiles = [];

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules and dist
      if (!file.startsWith(".") && file !== "node_modules" && file !== "dist") {
        tsFiles.push(...walkDir(filePath));
      }
    } else if (file.endsWith(".ts")) {
      tsFiles.push(filePath);
    }
  }

  return tsFiles;
}

function main() {
  const files = walkDir(srcDir);
  let converted = 0;
  let failed = 0;
  let skipped = 0;

  console.log(`Found ${files.length} TypeScript files to process...\n`);

  for (const filePath of files) {
    try {
      const result = convertFile(filePath);

      if (result === false) {
        skipped++;
      } else if (result) {
        fs.writeFileSync(filePath, result, "utf-8");
        converted++;
        console.log(`✓ Converted: ${path.relative(srcDir, filePath)}`);
      }
    } catch (error) {
      failed++;
      console.error(
        `✗ Failed: ${path.relative(srcDir, filePath)} - ${error.message}`,
      );
    }
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(`Conversion Summary:`);
  console.log(`  ✓ Converted: ${converted} files`);
  console.log(`  ⊘ Skipped: ${skipped} files (already ES modules)`);
  console.log(`  ✗ Failed: ${failed} files`);
  console.log(`${"=".repeat(60)}\n`);
}

main();
