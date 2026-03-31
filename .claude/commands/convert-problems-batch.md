# Batch Convert Problems to v2 Fragment Format

Convert all solution HTML files from a single exam directory to v2 fragment format, update `database_v2/problems.json`, and commit.

**Argument:** `$ARGUMENTS` — the directory name inside `problems/` (e.g. `univerzitet_u_beogradu_elektrotehnicki_fakultet_2003`)

## Instructions

### Step 1: Read shared context (ONCE for entire batch)

Read these 3 files — they apply to ALL conversions:

1. **Spec**: `problems_v2/solution-format-v2.md`
2. **CSS** (with usage comments): `problems_v2/solution-v2.css`
3. **Reference conversion**: `problems_v2/univerzitet_u_beogradu_elektrotehnicki_fakultet_2003/univerzitet_u_beogradu_elektrotehnicki_fakultet_2003_problem_8_solution.html`

### Step 2: Resolve the file list

1. Verify `problems/$ARGUMENTS/` exists. If not, tell the user and stop.
2. List all `*_solution.html` files in `problems/$ARGUMENTS/`
3. Check which already exist in `problems_v2/$ARGUMENTS/` — skip those.
4. Report: "Found N files to convert, M already converted (skipped)."

### Step 3: Read the original database

Use Bash to extract only the relevant entries (the full file is 1.4MB and will fail the Read tool):

```bash
node -e "const p=require('./database/problems.json').filter(x=>x.document.includes('$ARGUMENTS'));console.log(JSON.stringify(p,null,2))"
```

This gives you just the ~20 entries for this exam directory. You'll need the `id`, `document`, `order`, `category`, and `difficulty` for updating `database_v2/problems.json` in Step 6.

### Step 4: Convert each file sequentially

For EACH source file, do these sub-steps. Do NOT re-read the spec/CSS/reference — use the context from Step 1.

#### 4a. Read the source file

Use the Bash tool to read the source file:

```bash
cat problems/$ARGUMENTS/<filename>
```

**Do NOT use the Read tool** — source files exceed its 10K token limit and will require multiple chunked reads, wasting API round-trips.

#### 4b. Convert to v2 fragment

**IMPORTANT: Write the complete converted file in a single Write call.**
Do NOT write a partial file and then Edit it. Plan the full conversion mentally before writing. If validation fails, re-read your output with `cat`, fix the issues, and Write the complete corrected file (do not use Edit — it adds a full API round-trip with accumulated context).

Apply ALL of these transformations:

**Structure:**
- Start with `<!--MATOTEKA_FORMAT v2-->`
- Keep logic scratchpad as `<script type="text/info" id="logic-scratchpad">`
- Title: `<h1 data-card="problem-title">Title</h1>`
- Subtitle: `<p data-card="problem-subtitle" class="subtitle">Subtitle</p>`
- Remove: `<!DOCTYPE>`, `<html>`, `<head>`, `<body>` and closing tags
- Remove: ALL `<style>` blocks
- Remove: ALL inline `style="..."` attributes (except canvas width/height)
- Remove: MathJax `<script src>` and `MathJax = {...}` config
- Remove: inline event handlers (onclick, onchange, etc.)

**Cards:**
- Every section gets `data-card="TYPE"` and `data-title="TITLE"` attributes
- Card type mapping from old classes:

| Old class/pattern | `data-card` | `data-title` |
|---|---|---|
| `.problem-statement`, first `.card` | `problem-statement` | Tekst zadatka |
| `.plan-card`, card with "Plan" h2 | `plan` | Plan rešavanja |
| Card with `<details>` + theory | `theory` | Podsetnik iz teorije |
| Card with `<canvas>` | `visual-aid` | Vizuelni prikaz |
| Card with `.step` children | `step-solution` | Rešenje korak po korak |
| `.insight-box`, `.key-insight` | `key-insight` | Ključni uvid |
| `.final-answer-card/box/` | `final-answer` | Konačan odgovor |
| `.pitfall-card`, pitfall content | `pitfalls` | Česte greške |
| `.challenge-card/box` | `challenge` | Dodatni izazov |

**Answer options in problem-statement:**
```html
<div class="answer-grid">
  <div class="answer-option" data-option="A">
    <span class="answer-label">(A)</span>
    <span class="answer-value">\(...\)</span>
  </div>
</div>
```
- Remove correct/incorrect classes from problem-statement options
- Remove "Ne znam" option
- Labels always uppercase Latin A-E

**Final answer:**
```html
<div class="answer-options">
  <span class="answer-option correct" data-option="C">(C) \(...\)</span>
</div>
```
- Exactly ONE option has class `correct`

**Steps:**
```html
<div class="step" data-step="1">
  <div class="step-badge">1</div>
  <div class="step-content">
    <h3 class="step-title">Title</h3>
    <p>Text</p>
    <div class="math-block">\[...\]</div>
  </div>
</div>
```

**Canvas scripts** — replace ALL hardcoded colors with CSS variable reads:
```javascript
(function() {
  var root = document.documentElement;
  var styles = getComputedStyle(root);
  function cv(name) { return styles.getPropertyValue(name).trim(); }

  // In draw(): use cv('--sol-canvas-bg'), cv('--sol-canvas-primary'), etc.

  // Theme change listener:
  window.addEventListener('message', function(e) {
    if (e.data && e.data.type === 'matoteka-theme') {
      setTimeout(function() { styles = getComputedStyle(root); draw(); }, 50);
    }
  });
})();
```

**Canvas height**: The original canvas often has insufficient height causing overlapping labels, legends, or axis text. When converting, **review the canvas dimensions and increase height if needed** to ensure no elements overlap. Common fixes:
- If legend overlaps the diagram, increase canvas height by 60-80px
- If axis labels are clipped at bottom, increase height by 30-40px
- If multiple diagrams are stacked vertically, ensure enough height for all with spacing
- Typical safe minimum: 400px for simple graphs, 500px for labeled diagrams with legends

Color mapping:
```
#0f172a, #0c1222           → --sol-canvas-bg
#1e293b                    → --sol-canvas-grid
#334155, #475569           → --sol-canvas-axis
#60a5fa, #38bdf8, #3b82f6 → --sol-canvas-primary
#a78bfa, #818cf8           → --sol-canvas-secondary
#34d399, #4ade80           → --sol-canvas-accent
#f472b6                    → --sol-canvas-highlight
#e2e8f0, #cbd5e1, #f1f5f9 → --sol-canvas-text
#94a3b8, #64748b           → --sol-canvas-muted
#f87171, #ef4444           → --sol-canvas-danger
#fbbf24, #facc15           → --sol-canvas-muted (warm labels)
#fff, #ffffff              → --sol-canvas-text
```

**Language:**
- Fix Cyrillic → Serbian Latin
- Fix shaved Latin → proper diacritics (resenje→rešenje, jednacina→jednačina, tacan→tačan, konacan→konačan, greske→greške, ceste→česte, kljucni→ključni, etc.)
- Answer labels: А→A, Б→B, В→C, Г→D, Д→E (Cyrillic positional mapping)

**Metadata:**
- Update BRAINSPARK_META: add `"format": "v2"`

#### 4c. Write the output

```bash
mkdir -p problems_v2/$ARGUMENTS/
```
Write to: `problems_v2/$ARGUMENTS/{same_filename}`

#### 4d. Validate

Run: `cd /Users/jovan/personal/prijemni && npx tsx scripts/validate-solution-v2.ts <output-path>`

- If **errors**: fix and re-validate (up to 2 retries, then skip with error note)
- If **warnings only**: accept (pass)
- If **clean pass**: continue to next file

#### 4e. Discard source content

The source file content and conversion work for this problem are now complete.
For subsequent problems, do NOT reference or re-read this problem's source HTML.
Only retain: the shared context (spec, CSS, reference) and the running log of pass/fail results.

#### 4f. Log the result

Track: filename, pass/fail, warnings, any notable changes.

### Step 5: Run batch validation

After all files are written, run the validator on ALL files in the output directory to confirm:

```bash
cd /Users/jovan/personal/prijemni && for f in problems_v2/$ARGUMENTS/*_solution.html; do npx tsx scripts/validate-solution-v2.ts "$f" 2>/dev/null || echo "FAIL: $f"; done
```

If any fail, fix them before proceeding.

### Step 6: Update database_v2/problems.json

Read the current `database_v2/problems.json`. For each successfully converted file:

1. Look up the original problem entry from `database/problems.json` (matched by `solution_path` in Step 3)
2. Create a new entry with the same fields but updated `solution_path`:
   ```json
   {
     "id": "<same id from original>",
     "document": "<same document>",
     "order": <same order>,
     "solution_path": "problems_v2/$ARGUMENTS/<filename>",
     "category": "<same category>",
     "difficulty": <same difficulty>
   }
   ```
3. Append to the existing `database_v2/problems.json` array (do not overwrite existing entries from previous batches)
4. Sort the final array by `document` then `order`
5. Write back to `database_v2/problems.json`

### Step 7: Commit

Stage and commit all changes:

```bash
git add problems_v2/$ARGUMENTS/ database_v2/problems.json
```

Commit message format:
```
Convert {FACULTY_SHORT} {YEAR} to v2 format ({COUNT} problems)

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

Where:
- `FACULTY_SHORT` is a readable faculty name (e.g. "ETF Belgrade" for `elektrotehnicki_fakultet`)
- `YEAR` is extracted from the directory name
- `COUNT` is the number of successfully converted problems

Use a HEREDOC for the commit message.

### Step 8: Summary report

```
=== Batch Conversion Summary ===
Directory:  $ARGUMENTS
Converted:  X/Y files
Passed:     X
Failed:     Z (list failures with reasons)
Skipped:    M (already converted)

Database:   database_v2/problems.json updated (N new entries, T total)
Commit:     <commit hash>

Notable changes:
- N files had Cyrillic text converted
- N files had shaved Latin diacritics fixed
- N files had canvas scripts converted
- N files had no canvas

Validation warnings: (list any)
```

### Performance Notes

**This command runs as a single serial agent — do NOT split into subagents.**

Token efficiency optimizations:
- Shared context (spec + CSS + reference) loaded ONCE (~1,500 lines)
- Source files read via `cat` (Bash) to avoid Read tool's 10K token limit and chunked reads
- Each problem's source discarded after conversion — context stays flat at ~2-3K lines
- Complete files written in one shot (no Edit round-trips)
- database/problems.json queried via `node` to extract only relevant entries
- A full 20-problem exam should cost ~600K-800K tokens total (~30-40K per problem)
