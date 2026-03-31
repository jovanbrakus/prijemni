# Batch Convert Problems to v2 Fragment Format

Convert all solution HTML files from a single exam directory to v2 fragment format, update `database_v2/problems.json`, and commit.

**Argument:** `$ARGUMENTS` — the directory name inside `problems/` (e.g. `univerzitet_u_beogradu_elektrotehnicki_fakultet_2003`)

## Instructions

### Step 1: Resolve the file list and database entries

1. Verify `problems/$ARGUMENTS/` exists. If not, tell the user and stop.
2. List all `*_solution.html` files in `problems/$ARGUMENTS/`
3. Check which already exist in `problems_v2/$ARGUMENTS/` — skip those.
4. Report: "Found N files to convert, M already converted (skipped)."
5. Extract database entries for this exam:
```bash
node -e "const p=require('./database/problems.json').filter(x=>x.document.includes('$ARGUMENTS'));console.log(JSON.stringify(p,null,2))"
```
6. Create the output directory:
```bash
mkdir -p problems_v2/$ARGUMENTS/
```

### Step 2: Delegate to agents

Split the files to convert into groups of 5 and spawn one agent per group. Use `model: "opus"` to prevent model downgrades.

**IMPORTANT: Always use `model: "opus"` when spawning agents.** Do NOT allow agents to run on Sonnet — Sonnet produces lower quality conversions and skips canvas.

For a typical 20-problem exam, spawn 4 agents:
- Agent 1: problems 1-5
- Agent 2: problems 6-10
- Agent 3: problems 11-15
- Agent 4: problems 16-20

Each agent prompt must include:
1. The full list of source file paths it should convert
2. The output directory path
3. The database entries (id, document, order, category, difficulty) for its problems
4. ALL the conversion rules from the "Conversion Rules" section below

Instruct each agent to:
1. Read the shared context (spec, CSS, reference) — see "Shared Context Files" below
2. For each source file: read with `cat`, convert, write, validate
3. Report results when done

**Spawn all agents in parallel** (single message with multiple Agent tool calls).
**Wait for all agents to complete** before proceeding to Step 3.

### Shared Context Files (each agent reads these)

1. **Spec**: `problems_v2/solution-format-v2.md`
2. **CSS**: `problems_v2/solution-v2.css`
3. **Reference**: `problems_v2/univerzitet_u_beogradu_elektrotehnicki_fakultet_2003/univerzitet_u_beogradu_elektrotehnicki_fakultet_2003_problem_8_solution.html`

### Conversion Rules (include in each agent prompt)

For EACH source file:

#### Read the source file

Use the Bash tool:
```bash
cat problems/$ARGUMENTS/<filename>
```
**Do NOT use the Read tool** — source files exceed its 10K token limit.

#### Convert to v2 fragment

**IMPORTANT: Write the complete converted file in a single Write call.**
Do NOT write a partial file and then Edit it. If validation fails, re-read your output with `cat`, fix the issues, and Write the complete corrected file.

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

**Canvas scripts** — **MANDATORY: if the source file has a `<canvas>` element and drawing scripts, you MUST convert them. Do NOT skip or remove canvas. Do NOT defer canvas to later. NEVER say canvas is optional.** Replace ALL hardcoded colors with CSS variable reads:
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

**Canvas height**: Review canvas dimensions and increase height if needed to prevent overlapping labels/legends. Typical minimums: 400px for simple graphs, 500px for labeled diagrams with legends.

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

#### Validate

Run: `cd /Users/jovan/personal/prijemni && npx tsx scripts/validate-solution-v2.ts <output-path>`

- If **errors**: fix and re-validate (up to 2 retries, then skip with error note)
- If **warnings only**: accept (pass)
- If **clean pass**: continue to next file

### Step 3: Run batch validation

After ALL agents complete, run the validator on ALL files in the output directory:

```bash
cd /Users/jovan/personal/prijemni && for f in problems_v2/$ARGUMENTS/*_solution.html; do npx tsx scripts/validate-solution-v2.ts "$f" 2>/dev/null || echo "FAIL: $f"; done
```

Also verify canvas was not skipped:
```bash
cd /Users/jovan/personal/prijemni && for f in problems_v2/$ARGUMENTS/*_solution.html; do v1="problems/$ARGUMENTS/$(basename $f)"; if grep -q '<canvas' "$v1" 2>/dev/null && ! grep -q '<canvas' "$f"; then echo "MISSING CANVAS: $f"; fi; done
```

If any fail validation or are missing canvas, fix them before proceeding.

### Step 4: Update database_v2/problems.json

Read the current `database_v2/problems.json`. For each successfully converted file:

1. Look up the original problem entry from the database entries extracted in Step 1
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
3. Append to the existing array (do not overwrite existing entries from previous batches)
4. Sort the final array by `document` then `order`
5. Write back to `database_v2/problems.json`

### Step 5: Commit

Stage and commit all changes:

```bash
git add problems_v2/$ARGUMENTS/ database_v2/problems.json
```

Commit message format (use HEREDOC):
```
Convert {FACULTY_SHORT} {YEAR} to v2 format ({COUNT} problems)

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

### Step 6: Summary report

```
=== Batch Conversion Summary ===
Directory:  $ARGUMENTS
Converted:  X/Y files
Passed:     X
Failed:     Z (list failures with reasons)
Skipped:    M (already converted)

Database:   database_v2/problems.json updated (N new entries, T total)
Commit:     <commit hash>

Validation warnings: (list any)
```

### Performance Notes

**Delegation**: 4 agents with 5 problems each. Each agent keeps context under 150K tokens.
**Model pinning**: Always use `model: "opus"` — Sonnet skips canvas and produces lower quality.
**Source file reads**: `cat` via Bash (not Read tool) to avoid 10K token limit.
**Write discipline**: Complete files in one Write call, no Edit round-trips.
**Canvas is MANDATORY**: Every source canvas must be converted. Post-conversion check verifies this.
