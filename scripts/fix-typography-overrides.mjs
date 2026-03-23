// Remove inline typography overrides that duplicate what's in common.css:
// - .section-header h2 / .section h2 / .insight-card h2 font-size/weight/spacing
// - .hero h1 .accent / .hero-copy .gradient-text (gradient text effect)
// - .section-kicker typography (when it matches canonical)

import * as fs from "node:fs";
import * as path from "node:path";

const STRIP_PROPS = [
  /\s*font-size:[^;]+;/g,
  /\s*line-height:[^;]+;/g,
  /\s*letter-spacing:[^;]+;/g,
  /\s*font-weight:[^;]+;/g,
];

function stripTypographyFromRule(css, selectorPattern) {
  return css.replace(selectorPattern, (match, selector, body) => {
    let newBody = body;
    for (const prop of STRIP_PROPS) {
      newBody = newBody.replace(prop, "");
    }
    if (newBody.trim() === "") return "";
    return selector + newBody + "}";
  });
}

function processFile(filePath) {
  let html = fs.readFileSync(filePath, "utf-8");
  const filename = path.basename(filePath);
  const original = html;

  // 1. Strip font-size/weight/spacing from section h2 rules
  //    (handled by .t-section class)
  html = html.replace(
    /(\.section-header\s+h2(?:\s*,\s*\.insight-card\s+h2)?\s*\{)([^}]*)\}/g,
    (match, sel, body) => {
      let b = body;
      for (const p of STRIP_PROPS) b = b.replace(p, "");
      return b.trim() === "" ? "" : sel + b + "}";
    }
  );
  // Also handle .section-title { font-size... }
  html = html.replace(
    /(\.section-title\s*\{)([^}]*)\}/g,
    (match, sel, body) => {
      let b = body;
      for (const p of STRIP_PROPS) b = b.replace(p, "");
      return b.trim() === "" ? "" : sel + b + "}";
    }
  );

  // 2. Remove .hero h1 .accent / .hero-copy .gradient-text rules
  //    (handled by .t-hero .accent in common.css)
  html = html.replace(
    /\.hero(?:-copy)?\s+(?:h1\s+)?\.(?:accent|gradient-text)\s*\{[^}]*\}\s*/g,
    ""
  );

  // 3. Strip .section-kicker typography props (handled by .t-kicker)
  html = html.replace(
    /(\.section-kicker(?:\s*,\s*\.card-kicker)?\s*\{)([^}]*)\}/g,
    (match, sel, body) => {
      let b = body;
      // Strip all typography props
      b = b.replace(/\s*color:[^;]+;/g, "");
      b = b.replace(/\s*text-transform:[^;]+;/g, "");
      for (const p of STRIP_PROPS) b = b.replace(p, "");
      b = b.replace(/\s*margin-bottom:[^;]+;/g, "");
      return b.trim() === "" ? "" : sel + b + "}";
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
