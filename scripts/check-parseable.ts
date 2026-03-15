#!/usr/bin/env npx tsx
/**
 * Checks whether a problem solution HTML file can be parsed by the matoteka app.
 *
 * This is a RELAXED check that mirrors the actual parsing logic — it accepts
 * all the legacy formats that the parser handles (multiple answer patterns,
 * multiple statement patterns, etc.). Use validate-solution-html.ts for
 * strict validation of NEW files.
 *
 * Returns exit code 0 if parseable, non-zero if not.
 *
 * Usage: npx tsx scripts/check-parseable.ts <path-to-html-file>
 */

import fs from "fs";
import * as cheerio from "cheerio";

const file = process.argv[2];
if (!file) {
  console.error("Usage: npx tsx scripts/check-parseable.ts <path-to-html-file>");
  process.exit(2);
}

if (!fs.existsSync(file)) {
  console.error(`File not found: ${file}`);
  process.exit(2);
}

const html = fs.readFileSync(file, "utf-8");
const $ = cheerio.load(html);
const errors: string[] = [];

// ── 1. Title ──
const title = $("title").text().trim();
if (!title) {
  errors.push("No <title> tag found.");
}

// ── 2. Problem Statement Extractable ──
// Mirrors: route.ts extractStatementHtml — tries .problem-statement, then .card
const hasStatementMarker =
  !!html.match(/<div\s+class="[^"]*problem-statement[^"]*">/) ||
  !!html.match(/<div\s+class="card">/);

if (!hasStatementMarker) {
  errors.push("Cannot extract problem statement: no .problem-statement or .card div found.");
}

// ── 3. Answer Options ──
// Mirrors: lib/problems.ts parseHtml — 3 tiers of answer detection
const LABEL_RE = /^\(?([A-Za-z\u0400-\u04FF\u0110\u017D\u0106\u010C\u0160\u0111\u017E\u0107\u010D\u0161])\)\s*/;

const answerOptions: string[] = [];
const originalLabels: string[] = [];

// Tier 1: .answer-option[data-option]
$(".answer-option[data-option]").each((_, el) => {
  const valueEl = $(el).find(".value");
  const value = (valueEl.html() || valueEl.text() || "").trim();
  if (value) {
    answerOptions.push(value);
  } else {
    const elHtml = ($(el).html() || $(el).text() || "").trim();
    const stripped = elHtml
      .replace(LABEL_RE, "")
      .replace(/<div[^>]*class="label"[^>]*>.*?<\/div>/i, "")
      .trim();
    answerOptions.push(stripped || elHtml);
  }
  originalLabels.push(($(el).attr("data-option") || "").toUpperCase());
});

// Tier 2: .answer-chip
if (answerOptions.length === 0) {
  $(".answer-chip").each((_, el) => {
    const text = $(el).text().trim();
    const match = text.match(LABEL_RE);
    if (match) originalLabels.push(match[1].toUpperCase());
    const stripped = text.replace(/^\([A-Za-z\u0400-\u04FF\u0110\u017D\u0106\u010C\u0160\u0111\u017E\u0107\u010D\u0161]\)\s*/, "");
    answerOptions.push(stripped || text);
  });
}

// Tier 3: fallback selectors
if (answerOptions.length === 0) {
  const OPTION_SELECTORS =
    ".final-option, .option-btn, .option-card, .option-chip, .option-item, " +
    ".option-box, .answer-opt, .option-final, .option-pill, .final-opt, " +
    ".answer-option-final, .opt, .option";
  $(OPTION_SELECTORS).each((_, el) => {
    const text = $(el).text().trim();
    if (/ne\s+znam/i.test(text)) return;
    const cls = $(el).attr("class") || "";
    if (cls.includes("incorrect")) return;
    const match = text.match(LABEL_RE);
    if (match) {
      originalLabels.push(match[1].toUpperCase());
      const elHtml = ($(el).html() || text).trim();
      answerOptions.push(elHtml.replace(LABEL_RE, ""));
    }
  });
}

if (answerOptions.length === 0) {
  errors.push("No answer options found via any parsing method (.answer-option, .answer-chip, .option, .opt, etc.).");
} else if (answerOptions.length < 3) {
  errors.push(`Only ${answerOptions.length} answer option(s) found — expected at least 3.`);
}

// ── 4. Correct Answer Detectable ──
// Mirrors: lib/problems.ts — [class*=correct] then "Tačan odgovor" fallback
const LETTER_MATCH_RE = /\(?([A-Za-z\u0400-\u04FF])\)/;
let correctAnswer = "";

$("[class*=correct]").each((_, el) => {
  if (correctAnswer) return;
  const cls = $(el).attr("class") || "";
  if (cls.includes("incorrect")) return;
  const text = $(el).text().trim();
  const match = text.match(LETTER_MATCH_RE);
  if (match) correctAnswer = match[1].toUpperCase();
});

if (!correctAnswer) {
  const bodyText = $.text();
  const match = bodyText.match(/[Tt]a[čc]an\s+odgovor[^)]*\(?([A-Za-z\u0400-\u04FF])\)/);
  if (match) correctAnswer = match[1].toUpperCase();
}

if (!correctAnswer) {
  errors.push("Cannot detect correct answer: no element with 'correct' class containing a letter, and no 'Tačan odgovor' text found.");
}

// ── 5. Correct answer maps to an option ──
if (correctAnswer && originalLabels.length > 0) {
  const idx = originalLabels.indexOf(correctAnswer);
  if (idx === -1) {
    errors.push(`Correct answer "${correctAnswer}" does not match any option label: [${originalLabels.join(", ")}].`);
  }
}

// ── Output ──
if (errors.length === 0) {
  console.log("PARSEABLE");
  if (title) console.log(`  Title: ${title}`);
  console.log(`  Options: ${answerOptions.length}`);
  console.log(`  Correct: ${correctAnswer}`);
  if (originalLabels.length > 0) {
    const idx = originalLabels.indexOf(correctAnswer);
    if (idx !== -1) {
      console.log(`  Mapped to: ${String.fromCharCode(65 + idx)} (index ${idx})`);
    }
  }
  process.exit(0);
} else {
  console.log(`NOT PARSEABLE (${errors.length} issue${errors.length > 1 ? "s" : ""}):`);
  for (const e of errors) {
    console.log(`  ✗ ${e}`);
  }
  process.exit(1);
}
