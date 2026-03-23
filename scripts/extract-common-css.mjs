// Removes the common CSS block (:root + Typography System) from each lesson
// HTML file and adds a <link> to knowledge/common.css instead.

import * as fs from "node:fs";
import * as path from "node:path";

const LINK_TAG = '<link rel="stylesheet" href="../common.css">';

function processFile(filePath) {
  let html = fs.readFileSync(filePath, "utf-8");
  const filename = path.basename(filePath);
  const changes = [];

  // 1. Add <link> to common.css before <style> if not already present
  if (!html.includes('href="../common.css"')) {
    html = html.replace(
      /(<style>)/,
      `${LINK_TAG}\n\n$1`
    );
    changes.push("added <link>");
  }

  // 2. Remove :root block from <style>
  const rootRegex = /<style>\s*:root\s*\{[^}]+\}\s*/;
  if (rootRegex.test(html)) {
    html = html.replace(rootRegex, "<style>\n");
    changes.push("removed :root");
  }

  // 3. Remove Typography System block from <style>
  const typoRegex = /\/\* === Typography System === \*\/[\s\S]*?\.t-small\s*\{[^}]+\}\s*/;
  if (typoRegex.test(html)) {
    html = html.replace(typoRegex, "");
    changes.push("removed typography");
  }

  if (changes.length === 0) {
    console.log(`  OK: ${filename}`);
    return false;
  }

  fs.writeFileSync(filePath, html);
  console.log(`  UPDATED: ${filename} [${changes.join(", ")}]`);
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
