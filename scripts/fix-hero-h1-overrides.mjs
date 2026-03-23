// Remove font-size, line-height, letter-spacing, font-weight, and max-width
// from inline .hero h1 / .hero-copy h1 rules so that .t-hero in common.css
// takes effect consistently across all lessons.

import * as fs from "node:fs";
import * as path from "node:path";

// Properties to strip from .hero h1 rules (these are handled by .t-hero)
const STRIP_PROPS = [
  /\s*font-size:[^;]+;/g,
  /\s*line-height:[^;]+;/g,
  /\s*letter-spacing:[^;]+;/g,
  /\s*font-weight:[^;]+;/g,
  /\s*max-width:[^;]+;/g,
];

function processFile(filePath) {
  let html = fs.readFileSync(filePath, "utf-8");
  const filename = path.basename(filePath);
  const original = html;

  // Match .hero h1 { ... } or .hero-copy h1 { ... } rules
  // These can appear as standalone or inside @media blocks
  html = html.replace(
    /(\.hero(?:-copy)?\s+h1\s*\{)([^}]*)\}/g,
    (match, selector, body) => {
      let newBody = body;
      for (const prop of STRIP_PROPS) {
        newBody = newBody.replace(prop, "");
      }
      // If body is now empty (only whitespace), remove the entire rule
      if (newBody.trim() === "") {
        return "";
      }
      return selector + newBody + "}";
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
