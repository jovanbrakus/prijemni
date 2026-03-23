// Remove all content placed over hero images in lesson HTML files.
// Removes hero-overlay and visual-overlay div blocks entirely.

import * as fs from "node:fs";
import * as path from "node:path";

// All class names used for overlay content over hero images
const OVERLAY_PATTERNS = [
  /class="hero-overlay"/,
  /class="visual-overlay"/,
  /class="hero-visual-content"/,
  /class="visual-note"/,
  /class="hero-badges"/,
  /class="hero-photo"/,
  /class="pill-row"/,
  /class="hero-formula"/,
  /class="formula-board"/,
  /class="visual-formulas"/,
];

function removeOverlayBlocks(html) {
  const lines = html.split("\n");
  const result = [];
  let depth = 0;
  let removing = false;

  for (const line of lines) {
    if (!removing) {
      // Check if this line starts an overlay block
      if (OVERLAY_PATTERNS.some((p) => p.test(line))) {
        removing = true;
        depth = 0;
        const opens = (line.match(/<div/g) || []).length;
        const closes = (line.match(/<\/div>/g) || []).length;
        depth += opens - closes;
        if (depth <= 0) removing = false;
        continue;
      }
      result.push(line);
    } else {
      const opens = (line.match(/<div/g) || []).length;
      const closes = (line.match(/<\/div>/g) || []).length;
      depth += opens - closes;
      if (depth <= 0) {
        removing = false;
      }
    }
  }

  return result.join("\n");
}

function processFile(filePath) {
  let html = fs.readFileSync(filePath, "utf-8");
  const filename = path.basename(filePath);

  const result = removeOverlayBlocks(html);

  if (result === html) {
    console.log(`  OK: ${filename}`);
    return false;
  }

  // Clean up excessive blank lines
  const cleaned = result.replace(/\n{3,}/g, "\n\n");
  fs.writeFileSync(filePath, cleaned);
  console.log(`  UPDATED: ${filename}`);
  return true;
}

// Main
const args = process.argv.slice(2);
if (args[0] === "--all") {
  const knowledgeDir = path.resolve(import.meta.dirname, "../knowledge");
  const dirs = fs.readdirSync(knowledgeDir).filter((d) => d.match(/^lesson\d/));
  dirs.sort((a, b) => {
    const numA = parseFloat(a.match(/lesson([\d.]+)/)?.[1] || "0");
    const numB = parseFloat(b.match(/lesson([\d.]+)/)?.[1] || "0");
    return numA - numB;
  });
  let total = 0;
  for (const dir of dirs) {
    const dirPath = path.join(knowledgeDir, dir);
    for (const f of fs.readdirSync(dirPath).filter((f) => f.endsWith(".html"))) {
      if (processFile(path.join(dirPath, f))) total++;
    }
  }
  console.log(`\nDone. ${total} files updated.`);
} else if (args[0]) {
  processFile(path.resolve(args[0]));
} else {
  console.error("Usage: node scripts/clear-hero-overlays.mjs <file.html> | --all");
}
