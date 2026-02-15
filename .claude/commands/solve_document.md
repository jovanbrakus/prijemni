# Solve Document

Solve all math problems from the given PDF exam paper.

**Argument:** `$ARGUMENTS` — the PDF filename (e.g. `univerzitet_u_beogradu_elektrotehnicki_fakultet_2023.pdf`)

## Instructions

Follow these steps exactly:

### Step 1: Validate input

Check that the file `archive/$ARGUMENTS` exists using the Read tool. If it does not exist, tell the user and stop.

Set these variables for the rest of the workflow:
- `FILENAME` = `$ARGUMENTS` (the PDF filename)
- `STEM` = the filename without the `.pdf` extension
- `OUTPUT_DIR` = `problems/{STEM}/`

### Step 2: Read the solving prompt

Read the file `prompt.ts` from the project root. This file exports a `getSystemPrompt(language)` function. Extract the full prompt template and mentally evaluate it with `language = "sr"` (Serbian, Latin script). This means:
- `langName` = "Serbian (Srpski, use Latin script)"
- `isDecimalComma` = true
- `decimalInstruction` = "STRICTLY use a comma (,) as the decimal separator for output text (e.g., 3,14). Use dots (.) only within valid JavaScript/LaTeX code."
- The final `Respond entirely in:` line should say "Serbian (Srpski, use Latin script)"

This evaluated prompt is the **SOLVING_PROMPT** you will pass to each agent.

### Step 3: Read the PDF and identify problems

Read the PDF file `archive/{FILENAME}` using the Read tool. Carefully identify each distinct math problem in the document. Problems are typically numbered (1, 2, 3, ... or similar). Note:
- The exact problem text (or description if it contains images/diagrams)
- The problem number as it appears in the document
- How many total problems there are

Create the output directory using Bash: `mkdir -p {OUTPUT_DIR}`

### Step 4: Solve problems in parallel using agent swarm

For EACH problem identified, launch a Task agent **in a single message** (all agents in parallel). Every agent MUST use these settings:
- `model`: `"opus"` (Opus 4.6 — this is mandatory, do not use any other model)
- `subagent_type`: `"general-purpose"`

Each agent's prompt must include:
1. The full **SOLVING_PROMPT** from Step 2 (the evaluated prompt.ts content for Serbian)
2. The specific problem text/content
3. Clear instruction to write the output HTML file to the exact path: `{OUTPUT_DIR}/{STEM}_problem_{N}_solution.html` where N is the 1-based problem order number
4. Instruction that the output must be ONLY the HTML content as specified by the solving prompt — a complete HTML document starting with `<!DOCTYPE html>` and ending with the metadata block after `</html>`
5. Instruction to use the Write tool to save the file

The agent prompt should look like this (fill in the actual values):

```
You are a math problem solver. Your task is to solve the following math problem and produce a single self-contained HTML solution file.

## Solving Instructions

{SOLVING_PROMPT}

## Problem to Solve

Problem {N} from the exam paper "{FILENAME}":

{PROBLEM_TEXT}

## Output

Write the complete HTML solution to this exact file path using the Write tool:
{OUTPUT_DIR}/{STEM}_problem_{N}_solution.html

The file must contain ONLY the HTML document (starting with <!DOCTYPE html>) followed by the metadata block. No other content.
```

### Step 5: Update problems.json

After ALL agents have completed:

1. Read the current `database/problems.json` file
2. For each successfully solved problem, add an entry:
   ```json
   {
     "document": "{FILENAME}",
     "order": N,
     "solution_path": "problems/{STEM}/{STEM}_problem_{N}_solution.html"
   }
   ```
3. Write the updated array back to `database/problems.json` (keep existing entries, append new ones, maintain sorted order by document then order)

### Step 6: Report results

Tell the user:
- How many problems were found and solved
- List any failures
- The path to the output directory
