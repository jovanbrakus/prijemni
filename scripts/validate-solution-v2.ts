#!/usr/bin/env npx tsx
/**
 * Validates a v2 fragment solution HTML file for structural correctness.
 *
 * Checks the fragment against the solution-format-v1 specification.
 * Returns exit code 0 on success (no errors), non-zero on failure.
 * Errors and warnings are printed to stdout for generator feedback.
 *
 * Usage: npx tsx scripts/validate-solution-v2.ts <path-to-html-file>
 */

import fs from "fs";
import * as cheerio from "cheerio";

const file = process.argv[2];
if (!file) {
  console.error("Usage: npx tsx scripts/validate-solution-v2.ts <path-to-html-file>");
  process.exit(2);
}

if (!fs.existsSync(file)) {
  console.error(`File not found: ${file}`);
  process.exit(2);
}

const raw = fs.readFileSync(file, "utf-8");
const errors: string[] = [];
const warnings: string[] = [];

// ── 1. Format marker ──
const trimmed = raw.trimStart();
if (!trimmed.startsWith("<!--MATOTEKA_FORMAT v2-->")) {
  errors.push('Fragment must start with "<!--MATOTEKA_FORMAT v2-->" on the first line.');
}

// ── 2. No HTML scaffold ──
const SCAFFOLD_PATTERNS = [
  { re: /<!DOCTYPE\s/i, name: "<!DOCTYPE>" },
  { re: /<html[\s>]/i, name: "<html>" },
  { re: /<\/html>/i, name: "</html>" },
  { re: /<head[\s>]/i, name: "<head>" },
  { re: /<\/head>/i, name: "</head>" },
  { re: /<body[\s>]/i, name: "<body>" },
  { re: /<\/body>/i, name: "</body>" },
];
for (const { re, name } of SCAFFOLD_PATTERNS) {
  if (re.test(raw)) {
    errors.push(`Fragment must not contain ${name} — the host app provides the document scaffold.`);
  }
}

// ── 3. No <style> tags ──
if (/<style[\s>]/i.test(raw)) {
  errors.push("Fragment must not contain <style> tags — all styling comes from the external CSS.");
}

// ── 4. No inline style attributes (except canvas width/height) ──
// Match style="..." but exclude it when on <canvas> elements
const styleAttrMatches = raw.matchAll(/(<\w+[^>]*)\sstyle\s*=\s*"([^"]*)"/gi);
for (const m of styleAttrMatches) {
  const tag = m[1].toLowerCase();
  const value = m[2].toLowerCase().trim();
  // Allow width/height on canvas
  if (tag.startsWith("<canvas") && /^(width|height)\s*:/.test(value)) continue;
  // Allow pure width/height inline styles on any element
  if (/^(width\s*:[^;]+;?\s*height\s*:[^;]+|height\s*:[^;]+;?\s*width\s*:[^;]+)\s*;?\s*$/.test(value)) continue;
  errors.push(`Inline style attribute found: style="${m[2]}". Remove all inline styles — use CSS classes instead.`);
}

// Load with cheerio for DOM checks
// Wrap in a container div so cheerio can parse the fragment
const $ = cheerio.load(`<div id="__fragment__">${raw}</div>`, { xmlMode: false });
const fragment = $("#__fragment__");

// ── 5. Logic scratchpad ──
const scratchpad = fragment.find('script[type="text/info"]#logic-scratchpad');
if (scratchpad.length === 0) {
  warnings.push('Missing logic scratchpad: <script type="text/info" id="logic-scratchpad">.');
} else {
  const text = scratchpad.text().trim();
  if (text.length < 50) {
    warnings.push("Logic scratchpad seems too short — should contain full solution reasoning.");
  }
}

// ── 6. Required cards ──
const REQUIRED_CARDS = ["problem-statement", "step-solution", "final-answer"];
const VALID_CARDS = new Set([
  "problem-title", "problem-subtitle",
  "problem-statement", "plan", "theory", "visual-aid", "step-solution",
  "key-insight", "final-answer", "pitfalls", "challenge",
]);
const NO_TITLE_NEEDED = new Set(["problem-title", "problem-subtitle"]);

for (const card of REQUIRED_CARDS) {
  if (fragment.find(`[data-card="${card}"]`).length === 0) {
    errors.push(`Required card missing: data-card="${card}".`);
  }
}

// ── 7. All data-card values from allowed enum ──
fragment.find("[data-card]").each((_, el) => {
  const val = $(el).attr("data-card") || "";
  if (!VALID_CARDS.has(val)) {
    errors.push(`Invalid data-card value "${val}". Allowed: ${[...VALID_CARDS].join(", ")}.`);
  }
});

// ── 8. Every data-card has data-title (except problem-title and problem-subtitle) ──
fragment.find("[data-card]").each((_, el) => {
  const card = $(el).attr("data-card") || "";
  if (NO_TITLE_NEEDED.has(card)) return;
  const title = $(el).attr("data-title");
  if (!title || !title.trim()) {
    const card = $(el).attr("data-card");
    errors.push(`Card "${card}" is missing data-title attribute.`);
  }
});

// ── 9. Answer options in problem-statement ──
const problemStatement = fragment.find('[data-card="problem-statement"]');
if (problemStatement.length > 0) {
  const answerGrid = problemStatement.find(".answer-grid");
  if (answerGrid.length === 0) {
    errors.push("Problem statement missing .answer-grid container for answer options.");
  } else {
    const options = answerGrid.find(".answer-option[data-option]");
    if (options.length === 0) {
      errors.push("No .answer-option[data-option] elements found inside .answer-grid.");
    } else if (options.length < 2) {
      errors.push(`Only ${options.length} answer option(s) — expected at least 2.`);
    }

    const VALID_LABELS = new Set(["A", "B", "C", "D", "E", "F"]);
    options.each((_, el) => {
      const opt = ($(el).attr("data-option") || "").trim();

      // Check label
      if (!opt) {
        errors.push("Answer option missing data-option attribute.");
      } else if (!VALID_LABELS.has(opt.toUpperCase())) {
        errors.push(`Unexpected option label "${opt}" — use A, B, C, D, or E.`);
      }

      // Check children
      const label = $(el).find(".answer-label");
      const value = $(el).find(".answer-value");

      if (label.length === 0) {
        errors.push(`Answer option (${opt}) missing .answer-label child.`);
      }
      if (value.length === 0) {
        errors.push(`Answer option (${opt}) missing .answer-value child.`);
      } else {
        const html = (value.html() || "").trim();
        if (!html) {
          errors.push(`Answer option (${opt}) has empty .answer-value.`);
        }
      }

      // No correct/incorrect class in problem statement
      const cls = $(el).attr("class") || "";
      if (cls.includes("correct") || cls.includes("incorrect")) {
        errors.push("Answer options in problem-statement must NOT have correct/incorrect classes.");
      }
    });
  }
}

// ── 10. Correct answer in final-answer ──
const finalAnswer = fragment.find('[data-card="final-answer"]');
if (finalAnswer.length > 0) {
  const correctOptions = finalAnswer.find(".answer-option.correct[data-option]");
  if (correctOptions.length === 0) {
    errors.push('No .answer-option.correct[data-option] found in final-answer card.');
  } else if (correctOptions.length > 1) {
    errors.push(`Found ${correctOptions.length} correct options in final-answer — expected exactly 1.`);
  }
}

// ── 11. data-option values are uppercase Latin A-E ──
const CYRILLIC_RE = /[А-ЯЂЉЊЋЏа-яђљњћџЈјЉљЊњЋћЅѕЃѓЌќ]/;
fragment.find("[data-option]").each((_, el) => {
  const opt = $(el).attr("data-option") || "";
  if (CYRILLIC_RE.test(opt)) {
    errors.push(`Answer option uses Cyrillic letter "${opt}" — must use Latin (A, B, C, D, E).`);
  }
});

// ── 12. No Cyrillic text in content ──
const CYRILLIC_TEXT_RE = /[А-ЯЂЉЊЋЏа-яђљњћџЈјЉљЊњЋћЅѕЃѓЌќИиШшЖжЧчЦц]/;
// Get all text except script content
const bodyClone = fragment.clone();
bodyClone.find("script").remove();
const allText = bodyClone.text();
const cyrlMatch = allText.match(CYRILLIC_TEXT_RE);
if (cyrlMatch) {
  const idx = allText.indexOf(cyrlMatch[0]);
  const snippet = allText.slice(Math.max(0, idx - 20), idx + 30).replace(/\s+/g, " ").trim();
  errors.push(
    `Cyrillic text detected: "${snippet}". All text must be Serbian Latin (with diacritics: š, č, ć, ž, đ).`
  );
}

// ── 13. Serbian diacritics spot-check ──
// Common words that MUST have diacritics if they appear
const DIACRITICS_CHECKS: Array<{ wrong: RegExp; right: string; word: string }> = [
  { wrong: /\bresenje\b/i, right: "rešenje", word: "resenje" },
  { wrong: /\bjednacina\b/i, right: "jednačina", word: "jednacina" },
  { wrong: /\bnejednacina\b/i, right: "nejednačina", word: "nejednacina" },
  { wrong: /\btacan\b/i, right: "tačan", word: "tacan" },
  { wrong: /\bodredjivanje\b/i, right: "određivanje", word: "odredjivanje" },
  { wrong: /\bpovrsina\b/i, right: "površina", word: "povrsina" },
  { wrong: /\bgreske\b/i, right: "greške", word: "greske" },
  { wrong: /\bceste\b/i, right: "česte", word: "ceste" },
  { wrong: /\bkonacan\b/i, right: "konačan", word: "konacan" },
  { wrong: /\bkljucni\b/i, right: "ključni", word: "kljucni" },
  { wrong: /\bpodsetnik\b/i, right: "podsetnik", word: "podsetnik" }, // this one is actually correct
  { wrong: /\bresavanja\b/i, right: "rešavanja", word: "resavanja" },
  { wrong: /\bresavamo\b/i, right: "rešavamo", word: "resavamo" },
  { wrong: /\btrigonometrijs/i, right: "trigonometrijs...", word: "trigonometrijs" },
  { wrong: /\bvizuelni\b/i, right: "vizuelni", word: "vizuelni" }, // correct as-is
  { wrong: /\bzaduzenje\b/i, right: "zaduženje", word: "zaduzenje" },
  { wrong: /\bfunkcij[ae]\b/i, right: "funkcija", word: "funkcija" }, // correct
  { wrong: /\bslozenost\b/i, right: "složenost", word: "slozenost" },
  { wrong: /\bprimenicu\b/i, right: "primenicu", word: "primenicu" }, // correct
  { wrong: /\bodgovarajuc/i, right: "odgovarajuć...", word: "odgovarajuc" },
  { wrong: /\boblast definisanosti\b/i, right: "oblast definisanosti", word: "definisanosti" }, // correct
];

// Only check words that genuinely need diacritics
const STRICT_DIACRITICS: Array<{ wrong: RegExp; correct: string }> = [
  { wrong: /\bresenje\b/gi, correct: "rešenje" },
  { wrong: /\bresenja\b/gi, correct: "rešenja" },
  { wrong: /\bresavanja\b/gi, correct: "rešavanja" },
  { wrong: /\bresavamo\b/gi, correct: "rešavamo" },
  { wrong: /\bresimo\b/gi, correct: "rešimo" },
  { wrong: /\bresiti\b/gi, correct: "rešiti" },
  { wrong: /\bjednacina\b/gi, correct: "jednačina" },
  { wrong: /\bjednacine\b/gi, correct: "jednačine" },
  { wrong: /\bnejednacina\b/gi, correct: "nejednačina" },
  { wrong: /\bnejednacine\b/gi, correct: "nejednačine" },
  { wrong: /\btacan\b/gi, correct: "tačan" },
  { wrong: /\btacno\b/gi, correct: "tačno" },
  { wrong: /\btacka\b/gi, correct: "tačka" },
  { wrong: /\bkonacan\b/gi, correct: "konačan" },
  { wrong: /\bkonacno\b/gi, correct: "konačno" },
  { wrong: /\bkljucni\b/gi, correct: "ključni" },
  { wrong: /\bkljucne\b/gi, correct: "ključne" },
  { wrong: /\bgreske\b/gi, correct: "greške" },
  { wrong: /\bgreska\b/gi, correct: "greška" },
  { wrong: /\bceste\b/gi, correct: "česte" },
  { wrong: /\bcesto\b/gi, correct: "često" },
  { wrong: /\bpovrsina\b/gi, correct: "površina" },
  { wrong: /\bpovrsine\b/gi, correct: "površine" },
  { wrong: /\bodredjivanje\b/gi, correct: "određivanje" },
  { wrong: /\bslozenost\b/gi, correct: "složenost" },
  { wrong: /\bslozeni\b/gi, correct: "složeni" },
  { wrong: /\bodgovarajuc/gi, correct: "odgovarajuć..." },
  { wrong: /\bprimecujemo\b/gi, correct: "primećujemo" },
  { wrong: /\bznacaj\b/gi, correct: "značaj" },
  { wrong: /\bznaci\b/gi, correct: "znači" },
  { wrong: /\bzaduzenje\b/gi, correct: "zaduženje" },
  { wrong: /\bpromenlj/gi, correct: "promenljiv..." },
];

for (const { wrong, correct } of STRICT_DIACRITICS) {
  const match = allText.match(wrong);
  if (match) {
    errors.push(`Missing diacritics: found "${match[0]}" — should be "${correct}".`);
  }
}

// ── 14. Canvas scripts reference CSS variables ──
const canvasEls = fragment.find("canvas");
if (canvasEls.length > 0) {
  const scripts = fragment.find("script:not([type])");
  let hasColorVar = false;
  scripts.each((_, el) => {
    const code = $(el).text();
    if (code.includes("--sol-canvas") || code.includes("getComputedStyle")) {
      hasColorVar = true;
    }
  });
  if (!hasColorVar) {
    warnings.push(
      "Canvas element found but scripts do not reference --sol-canvas CSS variables. " +
      "Canvas colors should be read via getComputedStyle for theme support."
    );
  }
}

// ── 15. BRAINSPARK_META ──
const metaMatch = raw.match(/<!--BRAINSPARK_META\s*([\s\S]*?)\s*BRAINSPARK_META-->/);
if (!metaMatch) {
  errors.push("Missing metadata block: <!--BRAINSPARK_META {...} BRAINSPARK_META-->");
} else {
  try {
    const meta = JSON.parse(metaMatch[1]);
    if (!meta.title) errors.push("Metadata missing 'title' field.");
    if (!meta.subject) errors.push("Metadata missing 'subject' field.");
    if (!meta.unit) errors.push("Metadata missing 'unit' field.");
    if (!meta.topic_tags || !Array.isArray(meta.topic_tags)) errors.push("Metadata missing 'topic_tags' array.");
    if (meta.format !== "v2") errors.push(`Metadata 'format' must be "v2". Got: "${meta.format}".`);

    const validSubjects = ["math", "physics", "rejected"];
    if (meta.subject && !validSubjects.includes(meta.subject)) {
      errors.push(`Metadata 'subject' must be one of: ${validSubjects.join(", ")}. Got: "${meta.subject}".`);
    }
  } catch {
    errors.push("Metadata block contains invalid JSON.");
  }
}

// ── 16. Script blocks wrapped in IIFE ──
fragment.find("script:not([type]):not([src])").each((_, el) => {
  const code = $(el).text().trim();
  if (!code) return;
  // Check for IIFE pattern: starts with ( and function/arrow, or void function
  const iifePatterns = [
    /^\s*\(function\s*\(/,
    /^\s*\(\(\)\s*=>\s*\{/,
    /^\s*\(function\s*\(\)\s*\{/,
    /^\s*void\s+function/,
    /^\s*!\s*function/,
  ];
  const isIife = iifePatterns.some((p) => p.test(code));
  if (!isIife) {
    const snippet = code.slice(0, 60).replace(/\s+/g, " ");
    warnings.push(`Script block not wrapped in IIFE: "${snippet}...". Wrap in (function() { ... })(); for scope isolation.`);
  }
});

// ── 17. No MathJax script src ──
fragment.find('script[src]').each((_, el) => {
  const src = $(el).attr("src") || "";
  if (/mathjax/i.test(src)) {
    errors.push("Fragment must not load MathJax — the host app loads it. Remove: <script src=\"...mathjax...\">.");
  }
});

// ── 18. No MathJax config object ──
fragment.find("script:not([type]):not([src])").each((_, el) => {
  const code = $(el).text();
  if (/MathJax\s*=\s*\{/.test(code)) {
    warnings.push("Fragment should not configure MathJax (MathJax = {...}) — the host app handles configuration.");
  }
});

// ── Output ──
if (errors.length === 0 && warnings.length === 0) {
  console.log("✓ OK: All validation checks passed.");
  process.exit(0);
}

if (warnings.length > 0) {
  console.log(`WARNINGS (${warnings.length}):`);
  for (const w of warnings) {
    console.log(`  ⚠ ${w}`);
  }
}

if (errors.length > 0) {
  console.log(`\nERRORS (${errors.length}):`);
  for (const e of errors) {
    console.log(`  ✗ ${e}`);
  }
  process.exit(1);
}

// Warnings only — still pass
console.log("\n✓ OK: Passed with warnings.");
process.exit(0);
