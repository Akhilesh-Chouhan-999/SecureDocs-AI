#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.join(__dirname, "../src");

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, "utf-8");
  const originalContent = content;

  // Fix: export const default = X  ->  export default X
  content = content.replace(
    /export\s+const\s+default\s+=\s+(.+);/g,
    "export default $1;",
  );

  // Fix: export const default  ->  export default (without assignment on same line)
  content = content.replace(/export\s+const\s+default\s+/g, "export default ");

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
  let fixed = 0;
  let skipped = 0;
  let failed = 0;

  console.log(`Fixing export defaults in ${files.length} files...\n`);

  for (const filePath of files) {
    try {
      const result = fixFile(filePath);

      if (result === null) {
        skipped++;
      } else {
        fs.writeFileSync(filePath, result, "utf-8");
        fixed++;
        console.log(`✓ ${path.relative(srcDir, filePath)}`);
      }
    } catch (error) {
      failed++;
      console.error(`✗ ${path.relative(srcDir, filePath)}: ${error.message}`);
    }
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(`✓ Fixed: ${fixed} files`);
  console.log(`⊘ Skipped: ${skipped} files`);
  console.log(`✗ Failed: ${failed} files`);
  console.log(`${"=".repeat(60)}\n`);
}

main();
