#!/usr/bin/env npx tsx
/**
 * Preview a v1 solution fragment in the browser.
 *
 * Wraps the fragment in the preview-wrapper and opens it in the default browser.
 * Creates a temporary HTML file that loads the fragment inline.
 *
 * Usage: npx tsx scripts/preview-solution.ts <path-to-fragment.html>
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const file = process.argv[2];
if (!file) {
  console.error("Usage: npx tsx scripts/preview-solution.ts <path-to-fragment.html>");
  process.exit(2);
}

if (!fs.existsSync(file)) {
  console.error(`File not found: ${file}`);
  process.exit(2);
}

const fragment = fs.readFileSync(file, "utf-8");
const cssPath = path.join(__dirname, "..", "problems_v2", "solution-v2.css");
const css = fs.readFileSync(cssPath, "utf-8");

const fileName = path.basename(file);

const html = `<!DOCTYPE html>
<html lang="sr" class="dark">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Preview: ${fileName}</title>
<script>
MathJax = {
  tex: {
    inlineMath: [['\\\\(', '\\\\)'], ['$', '$']],
    displayMath: [['\\\\[', '\\\\]']]
  },
  svg: { fontCache: 'global' }
};
</script>
<script id="MathJax-script" async
  src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js">
</script>
<style>${css}</style>
<style>
  .preview-toolbar {
    position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
    display: flex; align-items: center; gap: 12px; padding: 8px 16px;
    background: rgba(20, 20, 20, 0.95); backdrop-filter: blur(8px);
    border-bottom: 1px solid rgba(255,255,255,0.1);
    font-family: 'Inter', system-ui, sans-serif; font-size: 13px; color: #94a3b8;
  }
  .preview-toolbar .title { font-weight: 600; color: #e2e8f0; }
  .preview-toolbar button {
    padding: 4px 12px; border: 1px solid rgba(255,255,255,0.15); border-radius: 6px;
    background: rgba(255,255,255,0.05); color: #e2e8f0; cursor: pointer; font-size: 13px;
  }
  .preview-toolbar button:hover { background: rgba(255,255,255,0.1); }
  .preview-toolbar button.active { background: #ec5b13; border-color: #ec5b13; color: #fff; }
  .preview-toolbar .file-name { font-family: monospace; font-size: 12px; color: #64748b; margin-left: auto; }
  body { padding-top: 48px; }
  .solution-container { max-width: 900px; margin: 0 auto; }
</style>
</head>
<body>
<div class="preview-toolbar">
  <span class="title">Solution v2 Preview</span>
  <button id="btn-dark" class="active" onclick="setTheme('dark')">Dark</button>
  <button id="btn-light" onclick="setTheme('light')">Light</button>
  <span class="file-name">${fileName}</span>
</div>
<div class="solution-container">
${fragment}
</div>
<script>
window.setTheme = function(theme) {
  document.documentElement.className = theme;
  document.getElementById('btn-dark').classList.toggle('active', theme === 'dark');
  document.getElementById('btn-light').classList.toggle('active', theme === 'light');
  window.postMessage({ type: 'matoteka-theme', theme: theme }, '*');
};
</script>
</body>
</html>`;

const tmpFile = path.join("/tmp", `preview-${Date.now()}.html`);
fs.writeFileSync(tmpFile, html);

console.log(`Preview written to: ${tmpFile}`);
console.log(`Opening in browser...`);

// Open in default browser (macOS)
try {
  execSync(`open "${tmpFile}"`);
} catch {
  console.log(`Could not auto-open. Open manually: file://${tmpFile}`);
}
