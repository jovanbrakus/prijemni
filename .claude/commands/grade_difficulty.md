# Grade Difficulty

Grade the difficulty of all solved problems in a solutions folder on a 1.0-10.0 scale.

**Argument:** `$ARGUMENTS` — the solutions folder name inside `problems/` (e.g. `univerzitet_u_beogradu_elektrotehnicki_fakultet_2023`)

## Instructions

Follow these steps exactly:

### Step 1: Validate input and gather problems

Use Glob to find all HTML solution files matching `problems/$ARGUMENTS/*_problem_*_solution.html`.

If no files found, tell the user and stop.

Set these variables:
- `FOLDER` = `$ARGUMENTS`
- `DOCUMENT` = `$ARGUMENTS` + `.pdf` (the corresponding document filename in problems.json)
- `SOLUTION_FILES` = the list of matched HTML files, sorted by problem number

Extract the problem number N from each filename (the `_problem_{N}_solution.html` part).

Read `database/problems.json` and find matching entries (by `document` equals `DOCUMENT`). If entries exist, they will be updated with difficulty scores. If no entries exist in the database for some solutions, report this but continue grading.

### Step 2: Grade each problem in parallel using agent swarm

For EACH problem, launch a Task agent **in a single message** (all agents in parallel). Every agent MUST use these settings:
- `model`: `"sonnet"` (prefer Sonnet for cost efficiency; use Opus if Sonnet is unavailable)
- `subagent_type`: `"general-purpose"`

Each agent's prompt must include:
1. The full **GRADING_RUBRIC** below
2. The full content of the problem's HTML solution file (read the file and include all of it)
3. Instructions to output ONLY a JSON object

The agent prompt should look like this (fill in the actual values):

```
You are a math difficulty grader for Serbian university entrance exams ("prijemni ispit").

Your task: Read the solved math problem below and assign a difficulty score on a 1.0-10.0 scale.

## Grading Rubric

The scale is anchored to REAL entrance exam difficulty. The easiest problems on entrance exams score around 3.0. The hardest score around 9.0. Competition/olympiad-level problems would be 11-12 and never appear here.

### Scale with Anchor Examples

**Score 3.0 — Easiest on exam** (one technique, direct application, under a minute)

Reference: "Find distance from point A(3,4) to center of circle x²+y²+2x+6y+6=0."
Why 3.0: Complete the square to find center (-1,-3), apply distance formula. 3 mechanical steps, zero insight required. Pure formula application.

**Score 3.5-4.0 — Easy** (routine, one technique, a few careful steps)

Reference: "Count four-digit numbers divisible by 5 with all different digits."
Why 3.5: Multiplication principle with two cases (last digit 0 or 5). Each case is mechanical counting. 4 steps, no tricks, but requires organizing two cases correctly.

**Score 5.0-5.5 — Medium** (two techniques combined or non-obvious approach)

Reference: "In cube K₁ with edge 1cm, inscribe sphere L₁; in L₁ inscribe K₂; and so on. Find total surface area of all cubes."
Why 5.5: Requires TWO distinct techniques — 3D inscribed figure geometry (space diagonal formula) to find the common ratio, THEN geometric series summation. 7 steps. Both techniques are standard but must be recognized and combined.

**Score 7.0-7.5 — Hard** (multi-technique chains, long solutions, creative steps)

Reference: "Solve 1/4^(√(x-1)-1) - 5/2^√(x-1) + 1 ≥ 0."
Why 7.0: Domain analysis → substitution t=2^√(x-1) → another substitution u=1/t → quadratic inequality → sign analysis → back-substitute twice. 8 steps across 3+ technique switches. High computational complexity with many opportunities for error.

**Score 9.0 — Hardest on exam** (3+ techniques, creative setup, many students fail)

Reference: "Hemisphere radius r inscribed in regular square pyramid (base in pyramid's base plane, lateral faces tangent). Find base edge when total surface area is minimal."
Why 9.0: Combines 3D tangency geometry → algebraic constraint elimination → express surface area as function of one variable → calculus optimization → solve resulting polynomial. 10 steps chaining geometry, algebra, and calculus. Requires creative problem setup that most students would not find.

### What falls between the anchors

| Score | Label | What it means |
|---|---|---|
| 1.0-2.0 | Below exam level | Simpler than anything on entrance exams. Basic arithmetic. |
| 3.0 | Easiest on exam | One standard technique, direct application. |
| 4.0-4.5 | Easy | One technique but requires careful multi-step algebra or case-splitting. |
| 5.0-5.5 | Medium | Two techniques combined, or non-obvious substitution needed. |
| 6.0-6.5 | Medium-Hard | Multiple techniques, careful case analysis, or a key insight. |
| 7.0-7.5 | Hard | Non-routine technique chains, long solutions, creative steps. |
| 8.0-8.5 | Very Hard | 3+ techniques chained non-obviously, extensive case analysis. |
| 9.0 | Hardest on exam | The most difficult entrance exam problems. |
| 10.0 | Extreme ceiling | Hypothetical maximum. Almost never assigned. |

### What to consider

- **Number of solution steps**: Count non-trivial steps in the logic scratchpad. More steps = harder.
- **Techniques required**: One technique = easier. 3+ techniques chained = harder.
- **Insight vs procedure**: Obvious solution path = easier. Non-obvious trick/substitution = harder.
- **Computational complexity**: Long algebraic chains with sign/case tracking = harder.
- **Prerequisite depth**: Basic algebra < trig identities < calculus.

### Important guidelines

- Use the full range 3.0-9.0. Do NOT cluster everything in 5.0-6.0.
- A single-formula problem is 3.0-4.0 even if the algebra takes several lines.
- A problem requiring a creative insight most students would miss is 7.0+.
- Round to one decimal place.

## Problem to Grade

Problem {N} from "{FOLDER}":

{FULL_HTML_SOLUTION_CONTENT}

## Output

Respond with ONLY a JSON object, no other text before or after:
{
  "problem_order": {N},
  "difficulty": X.X,
  "reasoning": "1-2 sentence justification for the score"
}
```

### Step 3: Collect results and run calibration pass

After ALL agents have completed, collect the JSON results. Parse each agent's output to extract the JSON object.

Launch a single calibration Task agent:
- `model`: `"opus"`
- `subagent_type`: `"general-purpose"`

The calibration agent receives ALL results and checks for internal consistency:

```
You are a calibration reviewer for math difficulty scores on Serbian entrance exams.

Below are difficulty scores (1.0-10.0) assigned independently to problems from the same exam paper. Review them for internal consistency and adjust if needed.

## Scores to Review

{TABLE OF: problem_order | category | difficulty | reasoning}

## Calibration Rules

1. The relative ordering should make sense — a simple algebraic identity problem should not score higher than a multi-step calculus problem.
2. No score should be below 2.5 (these are entrance exam problems, not trivial arithmetic) or above 9.5.
3. The scores should use a reasonable spread across the range, not cluster tightly (e.g., not all between 5.0-6.0).
4. You may adjust any score by up to +/- 1.0 to improve consistency. Document why.
5. If a score seems correct, keep it as-is (adjustment = 0).

## Output

Respond with ONLY a JSON array, no other text:
[
  {"problem_order": 1, "difficulty": X.X, "adjustment": +/-Y.Y, "reasoning": "..."},
  {"problem_order": 2, "difficulty": X.X, "adjustment": +/-Y.Y, "reasoning": "..."},
  ...
]

Where "difficulty" is the FINAL adjusted score and "adjustment" is how much you changed it (0 if unchanged).
```

### Step 4: Update problems.json

After calibration:

1. Read the current `database/problems.json` file
2. For each problem in `PROBLEMS`, find the matching entry (by `document` and `order`) and set the `difficulty` field to the calibrated score (float, one decimal place)
3. Write the updated array back to `database/problems.json`

### Step 5: Commit results

Stage and commit:

```
git add database/problems.json
```

Commit message pattern:
```
Grade difficulty for {FACULTY_SHORT} {YEAR} entrance exam ({COUNT} problems)
```

Where `FACULTY_SHORT` is a short human-readable name (e.g. "ETF Belgrade"). Use a HEREDOC and include:
```
Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

### Step 6: Report results

Display a summary table to the user:

| # | Category | Difficulty | Reasoning |
|---|---|---|---|
| 1 | real_numbers | 3.2 | Simple nested root simplification... |
| ... | ... | ... | ... |

Also report:
- How many problems were graded
- Any failures
- The commit hash
