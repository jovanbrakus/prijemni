// Removes reset & base CSS rules from each lesson HTML file
// since they're now in knowledge/common.css.
// Processes one file at a time when given a path, or all files with --all.

import * as fs from "node:fs";
import * as path from "node:path";

// Patterns to remove from <style> blocks.
// Each is a regex that matches the full rule including selector and braces.
const PATTERNS = [
  // * { margin: 0; padding: 0; box-sizing: border-box; }
  /\*\s*\{[^}]*box-sizing[^}]*\}\s*/g,
  // html { scroll-behavior: smooth; }
  /html\s*\{[^}]*scroll-behavior[^}]*\}\s*/g,
  // body { ... } — the main body rule (matches multi-line with background gradients)
  /body\s*\{[^}]*?min-height:\s*100vh[\s\S]*?\}\s*/,
  // a { color: inherit; text-decoration: none; }
  /\ba\s*\{\s*color:\s*inherit;\s*text-decoration:\s*none;\s*\}\s*/g,
  // button, select, input { font: inherit; } (various combos)
  /(?:button|input|select)(?:\s*,\s*(?:button|input|select))*\s*\{\s*font:\s*inherit;\s*\}\s*/g,
  // button { border: 0; cursor: pointer; } or { cursor: pointer; border: none; }
  /button\s*\{\s*(?:border:\s*(?:0|none);?\s*cursor:\s*pointer;?|cursor:\s*pointer;?\s*border:\s*(?:0|none);?)\s*\}\s*/g,
  // img { display: block; max-width: 100%; } (either order)
  /img\s*\{[^}]*max-width:\s*100%[^}]*\}\s*/g,
  // summary { cursor: pointer; }
  /summary\s*\{\s*cursor:\s*pointer;\s*\}\s*/g,
  // ::selection { background: rgba(...); }
  /::selection\s*\{[^}]*\}\s*/g,
  // section[id] { scroll-margin-top: ... }
  /section\[id\]\s*\{[^}]*\}\s*/g,
  // p { line-height: ... } (standalone p rule for line-height only)
  /\bp\s*\{\s*line-height:\s*[\d.]+;\s*\}\s*/g,
];

function processFile(filePath) {
  let html = fs.readFileSync(filePath, "utf-8");
  const filename = path.basename(filePath);
  const original = html;

  // Extract <style> content
  const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/);
  if (!styleMatch) {
    console.log(`  SKIP: ${filename} (no <style>)`);
    return false;
  }

  let css = styleMatch[1];

  // Apply each removal pattern
  for (const pattern of PATTERNS) {
    css = css.replace(pattern, "\n");
  }

  // Clean up excessive blank lines
  css = css.replace(/\n{3,}/g, "\n\n");

  // Write back
  html = html.replace(styleMatch[0], `<style>${css}</style>`);

  if (html === original) {
    console.log(`  OK: ${filename}`);
    return false;
  }

  fs.writeFileSync(filePath, html);
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
  console.error("Usage: node scripts/extract-resets.mjs <file.html> | --all");
  process.exit(1);
}
