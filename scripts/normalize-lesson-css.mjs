import * as fs from "node:fs";
import * as path from "node:path";

// Canonical :root variables (from lesson 59 — the most complete Template A file)
const CANONICAL_ROOT = `:root {
  --bg: #090403;
  --bg-soft: #140906;
  --panel: rgba(30, 15, 9, 0.92);
  --panel-soft: rgba(19, 9, 6, 0.84);
  --panel-strong: rgba(42, 21, 12, 0.96);
  --text: #f6eee9;
  --muted: #d8c6ba;
  --muted-strong: #f1e2d7;
  --primary: #ec5b13;
  --primary-soft: #ff9c6d;
  --accent: #ffd8bb;
  --success: #79dfb8;
  --warning: #ffc57f;
  --danger: #ff9b8f;
  --sky: #8fd7ff;
  --violet: #cfb7ff;
  --border: rgba(236, 91, 19, 0.16);
  --border-strong: rgba(255, 156, 109, 0.30);
  --shadow: 0 28px 84px rgba(0, 0, 0, 0.36);
  --radius-xl: 34px;
  --radius-lg: 24px;
  --radius-md: 18px;
  --radius-sm: 12px;
  --max-width: 1180px;
}`;

// Template B variable renames: old → canonical
const VAR_RENAMES = {
  "--line": "--border",
  "--line-strong": "--border-strong",
  // In Template B, --accent is used as primary (orange action color)
  // and --accent-strong as primary-soft. We need careful handling.
};

// Template B: these variables need value-based remapping
// Template B uses --accent for what Template A calls --primary
// Template B uses --accent-strong for what Template A calls --primary-soft
// Template B uses --accent-soft for rgba of primary

// Class renames: old → canonical
const CLASS_RENAMES = {
  "page-shell": "page",
  "top-badge": "eyebrow",
  "hero-badge": "eyebrow",
  "info-chip": "meta-card",
  "info-card": "meta-card",
  "info-row": "meta-grid",
  "info-strip": "meta-grid",
  "info-grid": "meta-grid",
  "result-box": "result-card",
  "foot-note": "footer-note",
  "preset-button": "preset-btn",
  "operator-button": "preset-btn",
  "mode-btn": "preset-btn",
};

function detectTemplateB(css) {
  return css.includes("Manrope") || /--line\s*:/.test(css);
}

function replaceRoot(css) {
  // Replace the entire :root { ... } block with canonical
  return css.replace(/:root\s*\{[^}]+\}/, CANONICAL_ROOT);
}

function renameVarsInCSS(css) {
  // Rename Template B variables throughout CSS
  let result = css;
  // --line → --border (but not --line-strong or --line-height etc.)
  result = result.replace(/var\(--line\)/g, "var(--border)");
  result = result.replace(/var\(--line-strong\)/g, "var(--border-strong)");
  // --accent-soft → rgba(236, 91, 19, 0.12) or use var(--border) depending on context
  // Actually, since we replaced :root, Template B references to --accent-soft won't resolve.
  // We need to replace them with appropriate values.
  result = result.replace(/var\(--accent-soft\)/g, "rgba(236, 91, 19, 0.12)");
  // --soft → var(--muted-strong) (Template B's --soft served similar purpose)
  result = result.replace(/var\(--soft\)/g, "var(--muted-strong)");
  // --gold → var(--warning) (similar warm highlight)
  result = result.replace(/var\(--gold\)/g, "var(--warning)");

  // In Template B, --accent was used where Template A uses --primary
  // and --accent-strong where Template A uses --primary-soft
  // But Template A also has --accent (a different, paler color).
  // Since we replaced :root with canonical values, Template B's var(--accent)
  // now resolves to Template A's --accent (#ffd8bb) instead of the orange.
  // We need to fix this: in Template B files, var(--accent) should become var(--primary)
  // and var(--accent-strong) should become var(--primary-soft).
  // HOWEVER, we must be careful: Template A files also use var(--accent) legitimately.
  // So this rename should ONLY happen for Template B files.
  return result;
}

function renameTemplateBAccentVars(css) {
  // Only for Template B files: --accent was their primary, --accent-strong was primary-soft
  let result = css;
  result = result.replace(/var\(--accent-strong\)/g, "var(--primary-soft)");
  // var(--accent) → var(--primary) BUT only where it's used as the action color,
  // not as a pale highlight. In Template B, ALL var(--accent) usages are as primary.
  result = result.replace(/var\(--accent\)/g, "var(--primary)");
  return result;
}

function renameClassesInCSS(css) {
  let result = css;
  for (const [oldName, newName] of Object.entries(CLASS_RENAMES)) {
    // Replace in CSS selectors: .old-name → .new-name
    // Use word boundary to avoid partial matches
    const re = new RegExp(`\\.${escapeRegex(oldName)}\\b`, "g");
    result = result.replace(re, `.${newName}`);
  }
  return result;
}

function renameClassesInHTML(html) {
  let result = html;
  for (const [oldName, newName] of Object.entries(CLASS_RENAMES)) {
    // Replace in class attributes: class="... old-name ..."
    // Match old-name as a whole word within class attribute values
    const re = new RegExp(`(class="[^"]*?)\\b${escapeRegex(oldName)}\\b([^"]*?")`, "g");
    // Need to loop because one class attr might have multiple renames
    let prev;
    do {
      prev = result;
      result = result.replace(re, `$1${newName}$2`);
    } while (result !== prev);
  }
  return result;
}

function renameClassesInJS(html) {
  let result = html;
  for (const [oldName, newName] of Object.entries(CLASS_RENAMES)) {
    // Replace in querySelector/querySelectorAll/getElementById/getElementsByClassName strings
    // and classList.add/remove/toggle/contains calls
    const re = new RegExp(`(['"\`])${escapeRegex(oldName)}(['"\`])`, "g");
    result = result.replace(re, `$1${newName}$2`);
    // Also in querySelector('.old-name')
    const re2 = new RegExp(`\\.${escapeRegex(oldName)}\\b`, "g");
    // This is already handled by CSS rename, but JS strings in <script> need it too
  }
  return result;
}

function updateGoogleFontsLink(html) {
  // Replace Manrope/Sora font links with Public Sans
  return html.replace(
    /<link[^>]*fonts\.googleapis\.com\/css2\?family=(?:Manrope|Sora)[^>]*>/gi,
    '<link href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">'
  );
}

function updateFontFamily(css) {
  // Replace Manrope/Sora font-family with Public Sans
  return css.replace(
    /font-family:\s*["']?(?:Manrope|Sora)["']?\s*,/gi,
    'font-family: "Public Sans",'
  );
}

function updateCanvasFonts(html) {
  // Replace Manrope in canvas ctx.font strings
  return html.replace(/Manrope/g, "Public Sans");
}

function fixOrphanedVars(html) {
  // Replace any remaining var(--accent-soft) with inline value
  return html.replace(/var\(--accent-soft\)/g, "rgba(236, 91, 19, 0.12)");
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function processFile(filePath) {
  let html = fs.readFileSync(filePath, "utf-8");
  const filename = path.basename(filePath);

  // Extract style block
  const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/);
  if (!styleMatch) {
    console.log(`  SKIP (no <style> block): ${filename}`);
    return { changed: false };
  }

  let css = styleMatch[1];
  const isTemplateB = detectTemplateB(css);
  const changes = [];

  // 1. Replace :root block
  const oldRoot = css.match(/:root\s*\{[^}]+\}/)?.[0];
  if (oldRoot && oldRoot !== CANONICAL_ROOT) {
    css = replaceRoot(css);
    changes.push(":root normalized");
  }

  // 2. Rename Template B variables
  if (isTemplateB) {
    const before = css;
    css = renameTemplateBAccentVars(css);
    css = renameVarsInCSS(css);
    css = updateFontFamily(css);
    if (css !== before) changes.push("Template B vars renamed");

    // Also rename in HTML outside of <style>
    html = html.replace(styleMatch[0], `<style>${css}</style>`);
    const htmlBefore = html;
    html = renameTemplateBAccentVars(html); // for inline styles
    html = renameVarsInCSS(html);
    html = updateGoogleFontsLink(html);
    html = updateCanvasFonts(html);
    if (html !== htmlBefore) changes.push("Template B HTML updated");
  } else {
    html = html.replace(styleMatch[0], `<style>${css}</style>`);
  }

  // Fix any orphaned vars and Manrope canvas fonts (runs on ALL files)
  const beforeFix = html;
  html = fixOrphanedVars(html);
  html = updateCanvasFonts(html);
  if (html !== beforeFix) changes.push("remaining fixes applied");

  // 3. Rename classes in CSS
  const cssAfterClassRename = renameClassesInCSS(
    html.match(/<style>([\s\S]*?)<\/style>/)[1]
  );
  if (cssAfterClassRename !== html.match(/<style>([\s\S]*?)<\/style>/)[1]) {
    html = html.replace(
      /<style>([\s\S]*?)<\/style>/,
      `<style>${cssAfterClassRename}</style>`
    );
    changes.push("CSS classes renamed");
  }

  // 4. Rename classes in HTML
  const htmlBefore = html;
  html = renameClassesInHTML(html);
  html = renameClassesInJS(html);
  if (html !== htmlBefore) changes.push("HTML classes renamed");

  if (changes.length === 0) {
    console.log(`  OK (no changes needed): ${filename}`);
    return { changed: false };
  }

  fs.writeFileSync(filePath, html);
  console.log(`  UPDATED: ${filename} [${changes.join(", ")}]`);
  return { changed: true, changes };
}

// Main
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
  const htmlFiles = fs
    .readdirSync(dirPath)
    .filter((f) => f.endsWith(".html"));
  for (const f of htmlFiles) {
    const { changed } = processFile(path.join(dirPath, f));
    if (changed) totalChanged++;
  }
}

console.log(`\nDone. ${totalChanged} files updated out of ${dirs.length}.`);
