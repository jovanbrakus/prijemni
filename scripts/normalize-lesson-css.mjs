import * as fs from "node:fs";
import * as path from "node:path";
import { TYPOGRAPHY_CSS, CANONICAL_ROOT } from "./common-lesson-css.mjs";

// ── helpers ──────────────────────────────────────────────────────────────────

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function addClassToTag(html, tagRegex, className) {
  // Add className to matching tags. Handles both <tag> and <tag class="existing">
  return html.replace(tagRegex, (match) => {
    if (match.includes(className)) return match; // already has it
    if (match.includes('class="')) {
      return match.replace(/class="([^"]*)"/, `class="$1 ${className}"`);
    }
    // Bare tag like <h1> or <h1\n>
    return match.replace(/>$/, ` class="${className}">`);
  });
}

// ── Typography injection ─────────────────────────────────────────────────────

const TYPO_MARKER = "/* === Typography System === */";

function injectTypography(css) {
  // If already injected, replace it
  if (css.includes(TYPO_MARKER)) {
    // Replace from marker to next block that doesn't start with .t-
    css = css.replace(
      /\/\* === Typography System === \*\/[\s\S]*?(?=\n\n[^.t]|\n\n\/\*[^=]|\n\n\*\s|\n\nhtml|\n\nbody|\n\na\b|\n\nbutton|\n\n\.|$)/,
      ""
    );
  }

  // Insert after :root block
  const rootEnd = css.indexOf("}", css.indexOf(":root"));
  if (rootEnd === -1) {
    return TYPOGRAPHY_CSS + "\n\n" + css;
  }
  const insertPos = rootEnd + 1;
  return css.slice(0, insertPos) + "\n\n" + TYPOGRAPHY_CSS + css.slice(insertPos);
}

// ── HTML class application ───────────────────────────────────────────────────

function addTypographyClasses(html) {
  let result = html;
  const changes = [];
  const before = result;

  // 1. h1: add t-hero (most files have exactly one h1)
  result = addClassToTag(result, /<h1(?:\s[^>]*)?\s*>/g, "t-hero");
  if (result !== before) changes.push("t-hero");

  // 2. Hero lead paragraph
  let prev = result;
  result = addClassToTag(result, /<p\s+class="hero-lead[^"]*">/g, "t-lead");
  result = addClassToTag(result, /<p\s+class="lead[^"]*">/g, "t-lead");
  if (result !== prev) changes.push("t-lead");

  // 3. h2: add t-section
  prev = result;
  result = addClassToTag(result, /<h2(?:\s[^>]*)?\s*>/g, "t-section");
  if (result !== prev) changes.push("t-section");

  // 4. Section kickers and nav-title: add t-kicker
  prev = result;
  result = addClassToTag(result, /<div\s+class="section-kicker[^"]*">/g, "t-kicker");
  result = addClassToTag(result, /<span\s+class="section-kicker[^"]*">/g, "t-kicker");
  result = addClassToTag(result, /<div\s+class="nav-title[^"]*">/g, "t-kicker");
  if (result !== prev) changes.push("t-kicker");

  // 5. Task labels: add t-label
  prev = result;
  result = addClassToTag(result, /<div\s+class="task-label[^"]*">/g, "t-label");
  if (result !== prev) changes.push("t-label");

  // 6. h3: add t-card-title
  prev = result;
  result = addClassToTag(result, /<h3(?:\s[^>]*)?\s*>/g, "t-card-title");
  if (result !== prev) changes.push("t-card-title");

  return { html: result, changes };
}

// ── Main processing ──────────────────────────────────────────────────────────

function processFile(filePath) {
  let html = fs.readFileSync(filePath, "utf-8");
  const filename = path.basename(filePath);

  const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/);
  if (!styleMatch) {
    console.log(`  SKIP (no <style> block): ${filename}`);
    return { changed: false };
  }

  let css = styleMatch[1];
  const allChanges = [];

  // 1. Ensure :root is canonical
  const oldRoot = css.match(/:root\s*\{[^}]+\}/)?.[0];
  if (oldRoot && oldRoot !== CANONICAL_ROOT) {
    css = css.replace(/:root\s*\{[^}]+\}/, CANONICAL_ROOT);
    allChanges.push(":root");
  }

  // 2. Inject typography CSS
  if (!css.includes(TYPO_MARKER)) {
    css = injectTypography(css);
    allChanges.push("typography CSS injected");
  }

  // Write CSS back
  html = html.replace(styleMatch[0], `<style>${css}</style>`);

  // 3. Add typography classes to HTML
  const { html: updatedHtml, changes: typoChanges } = addTypographyClasses(html);
  if (typoChanges.length > 0) {
    html = updatedHtml;
    const unique = [...new Set(typoChanges)];
    allChanges.push(`classes: ${unique.join(", ")}`);
  }

  if (allChanges.length === 0) {
    console.log(`  OK: ${filename}`);
    return { changed: false };
  }

  fs.writeFileSync(filePath, html);
  console.log(`  UPDATED: ${filename} [${allChanges.join(" | ")}]`);
  return { changed: true };
}

// ── Entry point ──────────────────────────────────────────────────────────────

const knowledgeDir = path.resolve(import.meta.dirname, "../knowledge");
const dirs = fs.readdirSync(knowledgeDir).filter((d) => d.match(/^lesson\d/));
dirs.sort((a, b) => {
  const numA = parseFloat(a.match(/lesson([\d.]+)/)?.[1] || "0");
  const numB = parseFloat(b.match(/lesson([\d.]+)/)?.[1] || "0");
  return numA - numB;
});

let totalChanged = 0;
for (const dir of dirs) {
  const dirPath = path.join(knowledgeDir, dir);
  const htmlFiles = fs.readdirSync(dirPath).filter((f) => f.endsWith(".html"));
  for (const f of htmlFiles) {
    const { changed } = processFile(path.join(dirPath, f));
    if (changed) totalChanged++;
  }
}

console.log(`\nDone. ${totalChanged} files updated out of ${dirs.length}.`);
