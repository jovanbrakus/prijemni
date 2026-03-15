#!/usr/bin/env npx tsx
/**
 * Validates a generated problem solution HTML file for structural correctness.
 *
 * Used by the solution generator to verify output before saving.
 * Returns exit code 0 on success, non-zero on failure.
 * Errors are printed to stdout so the generator can use them as feedback.
 *
 * Usage: npx tsx scripts/validate-solution-html.ts <path-to-html-file>
 */

import fs from "fs";
import * as cheerio from "cheerio";

const file = process.argv[2];
if (!file) {
  console.error("Usage: npx tsx scripts/validate-solution-html.ts <path-to-html-file>");
  process.exit(2);
}

if (!fs.existsSync(file)) {
  console.error(`File not found: ${file}`);
  process.exit(2);
}

const html = fs.readFileSync(file, "utf-8");
const $ = cheerio.load(html);
const errors: string[] = [];
const warnings: string[] = [];

// ── 1. Title ──
const title = $("title").text().trim();
if (!title) {
  errors.push("Missing <title> tag.");
} else if (/\b(20\d{2})\b/.test(title) || /fakultet|etf|fon|matf|rgf/i.test(title)) {
  warnings.push(`Title should describe math content only, not exam metadata: "${title}"`);
}

// ── 2. Logic Scratchpad ──
const scratchpad = $('script[type="text/info"]#logic-scratchpad');
if (scratchpad.length === 0) {
  errors.push('Missing logic scratchpad: <script type="text/info" id="logic-scratchpad"> in <head>.');
} else {
  const text = scratchpad.text().trim();
  if (text.length < 50) {
    warnings.push("Logic scratchpad seems too short — should contain full solution reasoning.");
  }
}

// ── 3. Problem Statement ──
const problemStatement = $(".problem-statement");
if (problemStatement.length === 0) {
  errors.push('Missing problem statement: no element with class "problem-statement" found.');
} else {
  const el = problemStatement.first();
  const cls = el.attr("class") || "";
  if (!cls.includes("card")) {
    errors.push('Problem statement must have both "card" and "problem-statement" classes: <div class="card problem-statement">');
  }
}

// ── 4. Answer Options in Problem Statement ──
const answerOptions = $(".answer-option[data-option]");
if (answerOptions.length === 0) {
  errors.push("No answer options found. Use: <div class=\"given-item answer-option\" data-option=\"A\"> inside a <div class=\"given-grid\">.");
} else {
  // Check container
  const firstParent = answerOptions.first().parent();
  if (!(firstParent.attr("class") || "").includes("given-grid")) {
    errors.push('Answer options must be inside a <div class="given-grid"> container.');
  }

  // Check each option
  const seenLabels = new Set<string>();
  const VALID_LABELS = new Set(["A", "B", "C", "D", "E", "F"]);
  const CYRILLIC_RE = /[А-ЯЂЉЊЋЏа-яђљњћџ]/;

  answerOptions.each((_, el) => {
    const opt = $(el).attr("data-option") || "";

    // data-option must be uppercase Latin
    if (!opt) {
      errors.push("Answer option missing data-option attribute.");
    } else if (CYRILLIC_RE.test(opt)) {
      errors.push(`Answer option uses Cyrillic letter "${opt}" — must use Latin (A, B, C, D, E).`);
    } else if (!VALID_LABELS.has(opt.toUpperCase())) {
      errors.push(`Unexpected option label "${opt}" — use A, B, C, D, or E.`);
    }
    seenLabels.add(opt.toUpperCase());

    // Must have .label and .value children
    const labelEl = $(el).find(".label");
    const valueEl = $(el).find(".value");

    if (labelEl.length === 0) {
      errors.push(`Answer option (${opt}) missing <div class="label"> child.`);
    } else {
      const labelText = labelEl.text().trim();
      if (!/^\([A-E]\)$/.test(labelText)) {
        warnings.push(`Answer option (${opt}) label should be "(${opt})" but found "${labelText}".`);
      }
    }

    if (valueEl.length === 0) {
      errors.push(`Answer option (${opt}) missing <div class="value"> child.`);
    } else {
      const valueHtml = (valueEl.html() || "").trim();
      if (!valueHtml) {
        errors.push(`Answer option (${opt}) has empty .value — must contain the answer content.`);
      }
    }
  });

  if (answerOptions.length < 2) {
    errors.push(`Only ${answerOptions.length} answer option(s) — expected at least 2.`);
  }

  // Check no correct/incorrect class on problem statement options
  answerOptions.each((_, el) => {
    const cls = $(el).attr("class") || "";
    if (cls.includes("correct") || cls.includes("incorrect")) {
      errors.push("Answer options in problem statement must NOT have correct/incorrect classes — all must look identical.");
    }
  });
}

// ── 5. Correct Answer in Final Answer Section ──
const correctEls = $("[class*=correct]").filter((_, el) => {
  const cls = $(el).attr("class") || "";
  return !cls.includes("incorrect");
});

if (correctEls.length === 0) {
  errors.push('No correct answer marked. Final answer section must have an element with standalone "correct" class (e.g. class="opt correct").');
} else {
  let foundLetter = false;
  correctEls.each((_, el) => {
    const text = $(el).text().trim();
    if (/\(?[A-E]\)/.test(text)) foundLetter = true;
  });
  if (!foundLetter) {
    errors.push('Correct answer element must contain an option letter like "(A)" using uppercase Latin A-E.');
  }

  // Check it's not inside the problem statement
  correctEls.each((_, el) => {
    if ($(el).closest(".problem-statement").length > 0) {
      errors.push("Correct answer must NOT be marked inside the problem statement — only in the final answer section.");
    }
  });
}

// ── 6. MathJax ──
const hasMathJaxScript = $('script[src*="mathjax"]').length > 0;
if (!hasMathJaxScript) {
  errors.push("Missing MathJax script tag. Include: <script src=\"https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js\">.");
}

// ── 7. Metadata Block ──
const metaMatch = html.match(/<!--BRAINSPARK_META\s*([\s\S]*?)\s*BRAINSPARK_META-->/);
if (!metaMatch) {
  errors.push("Missing metadata block after </html>: <!--BRAINSPARK_META {...} BRAINSPARK_META-->");
} else {
  try {
    const meta = JSON.parse(metaMatch[1]);
    if (!meta.title) errors.push("Metadata missing 'title' field.");
    if (!meta.subject) errors.push("Metadata missing 'subject' field.");
    if (!meta.unit) errors.push("Metadata missing 'unit' field.");
    if (!meta.topic_tags || !Array.isArray(meta.topic_tags)) errors.push("Metadata missing 'topic_tags' array.");

    const validSubjects = ["math", "physics", "rejected"];
    if (meta.subject && !validSubjects.includes(meta.subject)) {
      errors.push(`Metadata 'subject' must be one of: ${validSubjects.join(", ")}. Got: "${meta.subject}".`);
    }
  } catch {
    errors.push("Metadata block contains invalid JSON.");
  }
}

// ── 8. No inline event handlers ──
const inlineHandlers = html.match(/\s(onclick|onmouseover|onmouseout|onchange|onsubmit|onkeydown|onkeyup|onfocus|onblur)\s*=/gi);
if (inlineHandlers) {
  errors.push(`Found inline event handler(s): ${[...new Set(inlineHandlers.map(h => h.trim()))].join(", ")}. Use addEventListener instead.`);
}

// ── 9. Ne znam option should not be present ──
$(".answer-option[data-option]").each((_, el) => {
  const text = $(el).text().trim();
  if (/ne\s+znam/i.test(text)) {
    errors.push('"Ne znam" option must not be included in answer options.');
  }
});

// ── Output ──
if (errors.length === 0 && warnings.length === 0) {
  console.log("OK: All validation checks passed.");
  process.exit(0);
}

if (warnings.length > 0) {
  console.log(`WARNINGS (${warnings.length}):`);
  for (const w of warnings) {
    console.log(`  ⚠ ${w}`);
  }
}

if (errors.length > 0) {
  console.log(`ERRORS (${errors.length}):`);
  for (const e of errors) {
    console.log(`  ✗ ${e}`);
  }
  process.exit(1);
}

// Warnings only — still pass
console.log("\nOK: Passed with warnings.");
process.exit(0);
