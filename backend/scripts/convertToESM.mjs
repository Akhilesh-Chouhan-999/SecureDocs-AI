#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.join(__dirname, "../src");

function addJsExtension(modulePath) {
  if (!modulePath.startsWith(".")) return modulePath;
  if (!modulePath.endsWith(".js") && !modulePath.endsWith(".ts")) {
    return modulePath + ".js";
  }
  if (modulePath.endsWith(".ts")) {
    return modulePath.replace(/\.ts$/, ".js");
  }
  return modulePath;
}

function convertFile(filePath) {
  let content = fs.readFileSync(filePath, "utf-8");
  const originalContent = content;

  if (content.includes("import ") && !content.includes("require(")) {
    return null;
  }

  // Convert: const { X } = require("./path")
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

  // Convert: const X = require("./path")
  content = content.replace(
    /const\s+(\w+)\s*=\s*require\s*\(\s*["']([^"']+)["']\s*\)/g,
    (match, varName, modulePath) => {
      const fullPath = addJsExtension(modulePath);
      return `import ${varName} from "${fullPath}"`;
    },
  );

  // Handle module.exports = { ... }
  content = content.replace(
    /module\.exports\s*=\s*{\s*([^}]*)\s*}/g,
    "export { $1 }",
  );

  // Handle: module.exports.X = Y
  content = content.replace(
    /module\.exports\.(\w+)\s*=\s*([^;]+);/g,
    "export const $1 = $2;",
  );

  // Handle: module.exports = X
  content = content.replace(
    /module\.exports\s*=\s*([^;]+);/g,
    "export default $1;",
  );

  return content !== originalContent ? content : null;
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  const tsFiles = [];

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
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

      if (result === null) {
        skipped++;
      } else {
        fs.writeFileSync(filePath, result, "utf-8");
        converted++;
        console.log(`✓ ${path.relative(srcDir, filePath)}`);
      }
    } catch (error) {
      failed++;
      console.error(`✗ ${path.relative(srcDir, filePath)}: ${error.message}`);
    }
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(`✓ Converted: ${converted} files`);
  console.log(`⊘ Skipped: ${skipped} files`);
  console.log(`✗ Failed: ${failed} files`);
  console.log(`${"=".repeat(60)}\n`);
}

main();
