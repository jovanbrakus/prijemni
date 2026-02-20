---
name: grade-difficulty
description: >-
  Use when the user asks to "grade a problem", "grade difficulty",
  "determine difficulty for a problem".
argument-hint: "[solution_path]"
allowed-tools: Read
---

# Grade Difficulty

Grade the difficulty of a single solved math problem on a 1.0-10.0 scale.

**Argument:** `$ARGUMENTS` — the solution HTML file path (e.g. `problems/univerzitet_u_beogradu_elektrotehnicki_fakultet_2023/univerzitet_u_beogradu_elektrotehnicki_fakultet_2023_problem_5_solution.html`)

## Instructions

Follow these steps exactly:

### Step 1: Resolve the problem

Parse the argument to extract:
- `SOLUTION_PATH` = `$ARGUMENTS`
- `FOLDER` = the directory name inside `problems/` (extract from path)
- `DOCUMENT` = `{FOLDER}.pdf`
- `N` = the problem number (extract from `_problem_{N}_solution.html` in the filename)

Read the solution HTML file using the Read tool. If the file does not exist, tell the user and stop.

### Step 2: Grade the problem

Read the full HTML content. Then grade it using the rubric below.

#### Grading Rubric

The scale is anchored to REAL Serbian university entrance exam ("prijemni ispit") difficulty. The easiest problems on entrance exams score around 3.0. The hardest score around 9.0.

##### Scale with Anchor Examples

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

##### Score summary table

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

##### What to consider

- **Number of solution steps**: Count non-trivial steps in the solution. More steps = harder.
- **Techniques required**: One technique = easier. 3+ techniques chained = harder.
- **Insight vs procedure**: Obvious solution path = easier. Non-obvious trick/substitution = harder.
- **Computational complexity**: Long algebraic chains with sign/case tracking = harder.
- **Prerequisite depth**: Basic algebra < trig identities < calculus.

##### Important guidelines

- Use the full range 3.0-9.0. Do NOT cluster everything in 5.0-6.0.
- A single-formula problem is 3.0-4.0 even if the algebra takes several lines.
- A problem requiring a creative insight most students would miss is 7.0+.
- Round to one decimal place.

### Step 3: Output your grade

After analyzing the solution against the rubric, determine the difficulty score (float, one decimal place).

### Step 4: Update problems.json

1. Read `database/problems.json`
2. Find the entry matching `document` == `DOCUMENT` and `order` == `N`
3. Set its `difficulty` field to the graded score
4. Write the updated array back to `database/problems.json`

If no matching entry exists in the database, report this to the user and skip the database update.

### Step 5: Report result

Output a single line:

```
Problem {N} from {DOCUMENT}: difficulty {X.X} — {reasoning}
```

Where `{reasoning}` is a 1-2 sentence justification for the score.
