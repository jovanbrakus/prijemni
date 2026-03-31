# Convert Problem to v2 Fragment Format

Convert an existing solution HTML file from the old full-HTML format to the new v2 fragment format.

**Argument:** `$ARGUMENTS` — path to the solution HTML file (e.g. `problems/univerzitet_u_beogradu_elektrotehnicki_fakultet_2003/univerzitet_u_beogradu_elektrotehnicki_fakultet_2003_problem_1_solution.html`)

## Instructions

Follow these steps exactly:

### Step 1: Read the inputs

Read the spec and CSS using the Read tool, but read the source file using Bash `cat`:

1. **Read tool**: `problems_v2/solution-format-v2.md` (spec)
2. **Read tool**: `problems_v2/solution-v2.css` (CSS)
3. **Bash tool**: `cat $ARGUMENTS` (source file — exceeds Read tool's 10K token limit)

If the source file does not exist, tell the user and stop.

Set these variables:
- `SOURCE_PATH` = `$ARGUMENTS`
- `OUTPUT_PATH` = `problems_v2/{same relative path}` (mirror the directory structure under `problems_v2/`)

### Step 2: Understand the source

Analyze the source HTML carefully:

1. **Identify all sections/cards** — look for `.card` divs, named sections like `.problem-statement`, `.plan-card`, `.insight-box`, `.final-answer-card`, `.final-answer-box`, `.pitfall-card`, `.challenge-card`, `.challenge-box`, `.key-insight`, step containers, theory sections, etc.
2. **Extract the title** from `<h1>` and subtitle from `.subtitle`
3. **Extract the logic scratchpad** from `<script type="text/info" id="logic-scratchpad">`
4. **Identify answer options** — check all 3 tiers:
   - `.answer-option[data-option]` with `.value` divs (preferred format)
   - `.answer-chip` elements
   - `.final-option`, `.option-btn`, `.option-card`, `.opt`, `.option` elements
5. **Find the correct answer** — element with class `correct` (not `incorrect`), or text pattern "Tačan odgovor je (X)"
6. **Identify canvas elements** and their associated `<script>` blocks
7. **Note any language issues** — Cyrillic text, missing diacritics ("shaved" Latin)
8. **Extract the BRAINSPARK_META** block

### Step 3: Convert to v2 fragment

Create the new v2 fragment following the specification exactly. The output must:

#### 3a. Start with the format marker
```
<!--MATOTEKA_FORMAT v2-->
```

#### 3b. Include the logic scratchpad
Keep the original scratchpad content. If it contains Cyrillic, convert to Serbian Latin. If it has ASCII Serbian (missing diacritics), add proper diacritics.

#### 3c. Title and subtitle
- Title: `<h1 data-card="problem-title">Title</h1>`
- Subtitle: `<p data-card="problem-subtitle" class="subtitle">Subtitle</p>`
- Keep the original title/subtitle content
- Fix language: convert Cyrillic to Latin, add missing diacritics
- Do NOT include exam metadata (year, faculty name, etc.) — math content only

#### 3d. Convert each section to a data-card

Map old card types to new `data-card` attributes:

| Old class/pattern | New `data-card` | `data-title` |
|---|---|---|
| `.problem-statement`, first `.card` | `problem-statement` | Tekst zadatka |
| `.plan-card`, card with "Plan" in h2 | `plan` | Plan rešavanja |
| Card with `<details>` + theory formulas | `theory` | Podsetnik iz teorije |
| Card with `<canvas>` | `visual-aid` | Vizuelni prikaz |
| Card with `.step` / `.step-container` children | `step-solution` | Rešenje korak po korak |
| `.insight-box`, `.key-insight` | `key-insight` | Ključni uvid |
| `.final-answer-card`, `.final-answer-box`, `.final-answer` | `final-answer` | Konačan odgovor |
| `.pitfall-card`, pitfall content | `pitfalls` | Česte greške |
| `.challenge-card`, `.challenge-box` | `challenge` | Dodatni izazov |

For each card:
- Add `data-card="..."` and `data-title="..."` attributes
- Keep the h2 heading, add appropriate emoji prefix if not present
- Preserve all content (math, text, lists) — just restructure the container
- Fix language throughout (Cyrillic → Latin, add diacritics)

#### 3e. Standardize answer options in problem-statement

Convert whatever answer format exists to:
```html
<div class="answer-grid">
  <div class="answer-option" data-option="A">
    <span class="answer-label">(A)</span>
    <span class="answer-value">\( ... \)</span>
  </div>
  <!-- B, C, D, E -->
</div>
```

Rules:
- Always use Latin letters A, B, C, D, E (convert Cyrillic А,Б,В,Г,Д)
- Remove any correct/incorrect class from problem-statement options
- Remove "Ne znam" option if present
- Ensure `.answer-value` has the answer content wrapped in MathJax delimiters

#### 3f. Standardize final answer

Convert to:
```html
<div class="answer-options">
  <span class="answer-option" data-option="A">(A) \( ... \)</span>
  <span class="answer-option correct" data-option="C">(C) \( ... \)</span>
  <!-- etc -->
</div>
```

Exactly ONE option must have class `correct`.

#### 3g. Fix canvas dimensions

The original canvas often has insufficient height causing overlapping labels, legends, or axis text. **Review the canvas drawing code and increase canvas height if elements overlap.** Common fixes:
- If legend overlaps the diagram, increase canvas height by 60-80px
- If axis labels are clipped at bottom, increase height by 30-40px
- If multiple diagrams are stacked vertically, ensure enough height for all with spacing
- Typical safe minimum: 400px for simple graphs, 500px for labeled diagrams with legends

#### 3h. Convert canvas scripts to use CSS variables

This is critical. Replace ALL hardcoded colors in canvas `<script>` blocks:

| Old color(s) | CSS variable |
|---|---|
| `#0f172a`, `#0c1222` | `--sol-canvas-bg` |
| `#1e293b` | `--sol-canvas-grid` |
| `#334155`, `#475569` | `--sol-canvas-axis` |
| `#60a5fa`, `#38bdf8` | `--sol-canvas-primary` |
| `#a78bfa`, `#818cf8` | `--sol-canvas-secondary` |
| `#34d399`, `#4ade80` | `--sol-canvas-accent` |
| `#f472b6` | `--sol-canvas-highlight` |
| `#e2e8f0`, `#cbd5e1`, `#f1f5f9` | `--sol-canvas-text` |
| `#94a3b8`, `#64748b` | `--sol-canvas-muted` |
| `#f87171`, `#ef4444` | `--sol-canvas-danger` |
| `rgba(96, 165, 250, ...)` | Use `cv('--sol-canvas-primary')` + separate alpha |
| `rgba(167, 139, 250, ...)` | Use `cv('--sol-canvas-secondary')` + separate alpha |
| `rgba(52, 211, 153, ...)` / `rgba(74, 222, 128, ...)` | Use `cv('--sol-canvas-accent')` + separate alpha |

Wrap the entire canvas script in an IIFE with the CSS variable helper:

```javascript
(function() {
  var root = document.documentElement;
  var styles = getComputedStyle(root);
  function cv(name) { return styles.getPropertyValue(name).trim(); }

  // ... converted drawing code using cv('--sol-canvas-*') ...

  // Re-draw on theme change
  window.addEventListener('message', function(e) {
    if (e.data && e.data.type === 'matoteka-theme') {
      setTimeout(function() {
        styles = getComputedStyle(root);
        draw();
      }, 50);
    }
  });
})();
```

For `rgba()` colors where you need both the base color and alpha, use a helper:
```javascript
function cvAlpha(name, alpha) {
  var c = cv(name);
  // Parse hex to rgba
  if (c.startsWith('#')) {
    var r = parseInt(c.slice(1,3), 16);
    var g = parseInt(c.slice(3,5), 16);
    var b = parseInt(c.slice(5,7), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
  }
  return c;
}
```

#### 3i. Remove all forbidden elements

- Remove ALL `<style>` blocks
- Remove ALL inline `style="..."` attributes (except canvas `width`/`height`)
- Remove `<!DOCTYPE>`, `<html>`, `<head>`, `<body>` and their closing tags
- Remove MathJax `<script src="...mathjax...">` and `MathJax = {...}` config
- Remove any `onclick`, `onmouseover` etc. attributes (convert to addEventListener)
- Remove CSS reset (`* { margin: 0; ... }`)

#### 3j. Fix all text to Serbian Latin with diacritics

- Convert any Cyrillic characters to Latin equivalents
- Add diacritics to "shaved" Latin: resenje→rešenje, jednacina→jednačina, tacan→tačan, konacan→konačan, greske→greške, ceste→česte, kljucni→ključni, etc.
- Answer labels: А→A, Б→B, В→V (but for answer options В→C, Г→D, Д→E as positional mapping)

#### 3k. Update metadata

Update the BRAINSPARK_META block:
- Add `"format": "v2"` field
- Keep existing title, subject, unit, topic_tags
- Fix any Cyrillic in title or topic_tags

### Step 4: Write the output

**IMPORTANT: Write the complete converted file in a single Write call.**
Do NOT write a partial file and then Edit it. Plan the full conversion mentally before writing. If validation fails, re-read your output with `cat`, fix the issues, and Write the complete corrected file (do not use Edit — it adds a full API round-trip with accumulated context).

Create the output directory and write the file:

```bash
mkdir -p problems_v2/{directory_name}/
```

Use the Write tool to save the converted fragment to `{OUTPUT_PATH}`.

### Step 5: Validate

Run the validator on the output:

```bash
npx tsx scripts/validate-solution-v2.ts {OUTPUT_PATH}
```

If the validator reports ERRORS:
1. Read the error messages carefully
2. Fix the issues in the output file
3. Re-run the validator
4. Repeat until all errors are resolved (warnings are acceptable)

### Step 6: Report

Tell the user:
- Source file path
- Output file path
- Validation result (pass/fail, any warnings)
- Summary of changes made (language fixes, canvas conversions, structural changes)
- If canvas was converted, note it for visual verification
