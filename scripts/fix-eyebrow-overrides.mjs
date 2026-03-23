// Remove inline .eyebrow overrides that duplicate common.css.
// Removes: standalone .eyebrow { } rules that just re-declare the pill styling,
// and .mini-card .eyebrow / .formula-card .eyebrow scoped rules.
// Does NOT remove .eyebrow small, .eyebrow p, or the card-variant .eyebrow rules
// (those in lessons 31-44, 58 that restyle .eyebrow as a card container).

import * as fs from "node:fs";
import * as path from "node:path";

function processFile(filePath) {
  let html = fs.readFileSync(filePath, "utf-8");
  const filename = path.basename(filePath);
  const original = html;

  // 1. Remove .mini-card .eyebrow { ... } and .formula-card .eyebrow { ... } rules
  html = html.replace(
    /\.(?:mini-card|formula-card)\s+\.eyebrow(?:\s*,\s*\.task-label)?\s*\{[^}]*\}\s*/g,
    ""
  );

  // 2. Remove standalone .eyebrow { ... } rules from inline styles
  //    But KEEP the card-variant .eyebrow rules (those with backdrop-filter or border-radius: 20px)
  //    Strategy: match .eyebrow { ... } and only remove if it looks like a pill override
  html = html.replace(
    /^([ \t]*)\.eyebrow\s*\{([^}]*)\}/gm,
    (match, indent, body) => {
      // Keep if it's the card-variant (has backdrop-filter or border-radius: 20px or padding: 14px)
      if (body.includes("backdrop-filter") || body.includes("border-radius: 20px") || body.includes("padding: 14px")) {
        return match;
      }
      return "";
    }
  );

  // Clean up excessive blank lines
  html = html.replace(/\n{3,}/g, "\n\n");

  if (html === original) {
    console.log(`  OK: ${filename}`);
    return false;
  }

  fs.writeFileSync(filePath, html);
  console.log(`  UPDATED: ${filename}`);
  return true;
}

// Main
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
