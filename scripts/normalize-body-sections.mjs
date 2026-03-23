// Normalize body text, section h2, and section-kicker styles
// to match lesson 1 canonical values across all lesson files.

import * as fs from "node:fs";
import * as path from "node:path";

// Canonical values from lesson 1
const CANONICAL = {
  // body
  fontFamily: `"Public Sans", system-ui, -apple-system, sans-serif`,
  lineHeight: "1.7",
  bodyPadding: "28px 18px 80px",
  // section h2 (via .t-section class, but also fix contextual rules)
  sectionFontSize: "clamp(1.8rem, 4vw, 2.7rem)",
  sectionLineHeight: "1.02",
  sectionFontWeight: "850",
  sectionLetterSpacing: "-0.03em",
  // section-kicker (via .t-kicker class, but also fix contextual rules)
  kickerFontSize: "0.76rem",
  kickerFontWeight: "700",
  kickerLetterSpacing: "0.11em",
};

function processFile(filePath) {
  let html = fs.readFileSync(filePath, "utf-8");
  const filename = path.basename(filePath);
  const original = html;

  // === 1. Normalize body font-family ===
  // Match various font-family declarations and normalize
  html = html.replace(
    /font-family:\s*['"]?Public Sans['"]?\s*,\s*[^;]+;/g,
    `font-family: ${CANONICAL.fontFamily};`
  );

  // === 2. Normalize body line-height ===
  // In body rule: line-height varies (1.7, 1.72, 1.74, 1.75)
  html = html.replace(
    /(body\s*\{[^}]*?)line-height:\s*[\d.]+;/g,
    `$1line-height: ${CANONICAL.lineHeight};`
  );

  // === 3. Normalize body padding ===
  html = html.replace(
    /(body\s*\{[^}]*?)padding:\s*[\dpx\s]+;/g,
    `$1padding: ${CANONICAL.bodyPadding};`
  );

  // === 4. Normalize section h2 font-size ===
  // Match clamp() values for section headings
  html = html.replace(
    /(\.section-header\s+h2[\s\S]*?|\.section-title[\s\S]*?|\.section h2[\s\S]*?)font-size:\s*clamp\([^)]+\);/g,
    `$1font-size: ${CANONICAL.sectionFontSize};`
  );

  // === 5. Normalize section h2 line-height ===
  html = html.replace(
    /(\.section-header\s+h2[^}]*?)line-height:\s*[\d.]+;/g,
    `$1line-height: ${CANONICAL.sectionLineHeight};`
  );

  // === 6. Normalize section h2 font-weight ===
  html = html.replace(
    /(\.section-header\s+h2[^}]*?)font-weight:\s*\d+;/g,
    `$1font-weight: ${CANONICAL.sectionFontWeight};`
  );

  // === 7. Normalize section h2 letter-spacing ===
  html = html.replace(
    /(\.section-header\s+h2[^}]*?)letter-spacing:\s*-?[\d.]+em;/g,
    `$1letter-spacing: ${CANONICAL.sectionLetterSpacing};`
  );

  // === 8. Normalize section-kicker ===
  html = html.replace(
    /(\.section-kicker[^}]*?)font-size:\s*[\d.]+rem;/g,
    `$1font-size: ${CANONICAL.kickerFontSize};`
  );
  html = html.replace(
    /(\.section-kicker[^}]*?)font-weight:\s*\d+;/g,
    `$1font-weight: ${CANONICAL.kickerFontWeight};`
  );
  html = html.replace(
    /(\.section-kicker[^}]*?)letter-spacing:\s*[\d.]+em;/g,
    `$1letter-spacing: ${CANONICAL.kickerLetterSpacing};`
  );

  // === 9. Also update the t-section and t-kicker in the Typography System block ===
  // These should already match, but ensure they do
  html = html.replace(
    /(\.t-section\s*\{[^}]*?)font-size:\s*clamp\([^)]+\);/g,
    `$1font-size: ${CANONICAL.sectionFontSize};`
  );
  html = html.replace(
    /(\.t-section\s*\{[^}]*?)line-height:\s*[\d.]+;/g,
    `$1line-height: ${CANONICAL.sectionLineHeight};`
  );
  html = html.replace(
    /(\.t-section\s*\{[^}]*?)font-weight:\s*\d+;/g,
    `$1font-weight: ${CANONICAL.sectionFontWeight};`
  );
  html = html.replace(
    /(\.t-section\s*\{[^}]*?)letter-spacing:\s*-?[\d.]+em;/g,
    `$1letter-spacing: ${CANONICAL.sectionLetterSpacing};`
  );
  html = html.replace(
    /(\.t-kicker\s*\{[^}]*?)font-size:\s*[\d.]+rem;/g,
    `$1font-size: ${CANONICAL.kickerFontSize};`
  );
  html = html.replace(
    /(\.t-kicker\s*\{[^}]*?)font-weight:\s*\d+;/g,
    `$1font-weight: ${CANONICAL.kickerFontWeight};`
  );
  html = html.replace(
    /(\.t-kicker\s*\{[^}]*?)letter-spacing:\s*[\d.]+em;/g,
    `$1letter-spacing: ${CANONICAL.kickerLetterSpacing};`
  );

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
