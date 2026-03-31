# Solve Document

Solve all math problems from the given PDF exam paper and produce v2 fragment solutions.

**Argument:** `$ARGUMENTS` — the PDF filename (e.g. `univerzitet_u_beogradu_elektrotehnicki_fakultet_2023.pdf`)

## Instructions

Follow these steps exactly:

### Step 1: Validate input

Check that the file `archive/$ARGUMENTS` exists using the Read tool. If it does not exist, tell the user and stop.

Set these variables for the rest of the workflow:
- `FILENAME` = `$ARGUMENTS` (the PDF filename)
- `STEM` = the filename without the `.pdf` extension
- `OUTPUT_DIR` = `problems_v2/{STEM}/`

### Step 2: Read the solving prompt

Read the file `prompt_v2.ts` from the project root. This file exports a `getSystemPrompt(language)` function. Extract the full prompt template and mentally evaluate it with `language = "sr"` (Serbian, Latin script). This means:
- `langName` = "Serbian (Srpski, use Latin script with full diacritics: š, č, ć, ž, đ)"
- `isDecimalComma` = true
- `decimalInstruction` = "STRICTLY use a comma (,) as the decimal separator for output text (e.g., 3,14). Use dots (.) only within valid JavaScript/LaTeX code."
- The final `Respond entirely in:` line should say "Serbian (Srpski, use Latin script with full diacritics: š, č, ć, ž, đ)"

This evaluated prompt is the **SOLVING_PROMPT** you will pass to each agent.

### Step 3: Read the PDF and identify problems

Read the PDF file `archive/{FILENAME}` using the Read tool. Carefully identify each distinct math problem in the document. Problems are typically numbered (1, 2, 3, ... or similar). Note:
- The exact problem text (or description if it contains images/diagrams)
- The problem number as it appears in the document
- How many total problems there are

Create the output directory using Bash: `mkdir -p {OUTPUT_DIR}`

### Step 3b: Look up existing problem metadata

Extract existing entries for this document from `database/problems.json`:

```bash
node -e "const p=require('./database/problems.json').filter(x=>x.document==='{FILENAME}');console.log(JSON.stringify(p,null,2))"
```

This gives you the `id`, `category`, and `difficulty` for each problem (matched by `order`). Save this lookup — you'll use it in Step 6 to populate `database_v2/problems.json` with the same values instead of nulls.

If the document has no entries in `database/problems.json` (new exam not yet in v1), you'll generate new IDs and use `null` for category/difficulty in Step 6.

### Step 4: Solve problems in parallel using agent swarm

For EACH problem identified, launch a Task agent **in a single message** (all agents in parallel). Every agent MUST use these settings:
- `model`: `"opus"` — **MANDATORY. Never use Sonnet — it produces lower quality and skips canvas.**
- `subagent_type`: `"general-purpose"`

Each agent's prompt must include:
1. The full **SOLVING_PROMPT** from Step 2 (the evaluated prompt_v2.ts content for Serbian)
2. The specific problem text/content
3. Clear instruction to write the output file to: `{OUTPUT_DIR}/{STEM}_problem_{N}_solution.html`
4. Instruction that the output must be a v2 **fragment** — NOT a full HTML document
5. Instruction to validate after writing

The agent prompt should look like this (fill in the actual values):

```
You are a math problem solver. Your task is to solve the following math problem and produce a v2 fragment solution file.

IMPORTANT: The entire solution — all headings, explanations, labels, canvas text, metadata title, and topic tags — MUST be written in Serbian (Srpski, Latin script with full diacritics: š, č, ć, ž, đ). No English except for fixed metadata enum values (subject, unit).

## Visual Aids — Canvas Diagrams

Every problem MUST include at least one canvas-based visual aid (`data-card="visual-aid"`).
Math is visual — even "pure algebra" problems benefit from a number line, function graph, or solution region diagram.

**Geometry problems**: Include 3–4 canvas diagrams throughout the solution, not just one.
For example: (1) the initial figure with labeled points/angles, (2) diagram showing the key construction or auxiliary line, (3) diagram highlighting the solution region or final answer, (4) annotated diagram showing common mistake to avoid.
Each diagram gets its own `visual-aid` card placed at the relevant point in the solution flow.

**Graphs/functions**: Show the function plot, highlight key points (roots, extrema, asymptotes), shade solution regions.

**Algebra/equations**: Show a number line with solution intervals, or a coordinate plane with relevant curves.

**Interactivity**: Decide whether to make a diagram interactive (sliders, draggable points) based purely on educational value — if dragging a point helps the student build intuition, add it. Do NOT skip interactivity due to implementation effort.

All canvas scripts MUST use CSS variables (`cv('--sol-canvas-*')`) for colors and include the theme change listener. Never hardcode colors.

## Solving Instructions

{SOLVING_PROMPT}

## Problem to Solve

Problem {N} from the exam paper "{FILENAME}":

{PROBLEM_TEXT}

## Output

Write the complete v2 fragment to this exact file path using the Write tool:
{OUTPUT_DIR}/{STEM}_problem_{N}_solution.html

The file must contain ONLY the v2 fragment (starting with <!--MATOTEKA_FORMAT v2-->) and ending with the BRAINSPARK_META block. No HTML document wrapper (no <!DOCTYPE>, <html>, <head>, <body>).

Write the complete file in a single Write call. Do NOT write a partial file and then Edit it.

After writing, validate with:
cd /Users/jovan/personal/prijemni && npx tsx scripts/validate-solution-v2.ts {OUTPUT_DIR}/{STEM}_problem_{N}_solution.html

If validation reports ERRORS, fix the issues and rewrite the complete file. Warnings are acceptable.
```

### Step 5: Validate all outputs

After ALL agents have completed, run batch validation:

```bash
cd /Users/jovan/personal/prijemni && for f in problems_v2/{STEM}/*_solution.html; do npx tsx scripts/validate-solution-v2.ts "$f" 2>/dev/null || echo "FAIL: $f"; done
```

If any files fail, fix them before proceeding.

### Step 6: Update database_v2/problems.json

After validation passes:

1. Read the current `database_v2/problems.json` file
2. Collect all existing `id` values into a Set for uniqueness checking
3. For each successfully solved problem, look up the matching entry from Step 3b (by `order` number):
   - **If found**: reuse its `id`, `category`, and `difficulty`
   - **If not found**: generate a new unique 8-character hex ID using `crypto.randomBytes(4).toString('hex')` (re-generate if it collides), set `category` and `difficulty` to `null`
4. Add the entry:
   ```json
   {
     "id": "<from v1 database or generated>",
     "document": "{FILENAME}",
     "order": N,
     "solution_path": "problems_v2/{STEM}/{STEM}_problem_{N}_solution.html",
     "category": "<from v1 database or null>",
     "difficulty": "<from v1 database or null>"
   }
   ```
5. Write the updated array back to `database_v2/problems.json` (keep existing entries, append new ones, sort by document then order)

### Step 7: Commit results

Stage and commit all generated files:

```bash
git add {OUTPUT_DIR}/ database_v2/problems.json
```

Commit message format (use HEREDOC):
```
Add v2 solutions for {FACULTY_SHORT} {YEAR} entrance exam ({COUNT} problems)

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

Where:
- `FACULTY_SHORT` is a short human-readable faculty name (e.g. "ETF Belgrade" for `elektrotehnicki_fakultet`)
- `YEAR` is the exam year extracted from the filename
- `COUNT` is the number of problems solved

### Step 8: Report results

Tell the user:
- How many problems were found and solved
- List any failures
- The path to the output directory
- The commit hash
