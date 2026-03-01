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

**Score 4.0 — Easy** (one technique, a few careful steps)

Reference: "Count four-digit numbers divisible by 5 with all different digits."
Why 4.0: Multiplication principle with two cases (last digit 0 or 5). Each case is mechanical counting. No tricks, but requires organizing two cases correctly.

**Score 5.0-5.5 — Medium** (one technique with significant computation, OR two standard techniques from the same area)

Reference: "If cos²α + cos²β = 2, find cos²α + cos²β + cos²(α-β)."
Why 5.0: Apply power-reduction identities, then sum-to-product. Two standard identities in sequence, both from trigonometry, each step routine.

**Score 6.0-6.5 — Medium-Hard** (two techniques from different areas combined, both steps routine)

Reference: "In cube K₁ with edge 1cm, inscribe sphere L₁; in L₁ inscribe K₂; and so on. Find total surface area of all cubes."
Why 6.0: 3D geometry (space diagonal) to find common ratio, then geometric series formula. Two different areas but both applications are standard.

**Score 7.0-7.5 — Hard** (two techniques where at least one step is non-obvious, or problems with subtle traps)

Reference: "Arrange 3 type-A, 4 type-B, and 2 type-C products so no two A's are adjacent and all B's are together."
Why 7.0: Block method for B's + gap method for A's. Requires recognizing two different combinatorial techniques and that the gap count exactly constrains the arrangement.

**Score 8.0-8.5 — Very Hard** (multiple techniques combined with a key insight, or a non-obvious problem setup)

Reference: "Find all solutions of 1^(sinx) + (sinx)^0 + (sinx)^(sinx) = 3 on (0, 2π)."
Why 8.0: Must recognize the meta-insight about when a^b equals specific values (three separate cases), solve a trig equation via substitution, and carefully check domain. The key insight about exponential cases is not part of standard curriculum.

**Score 8.5-9.0 — Hardest on exam** (the 2-3 most difficult problems on a typical entrance exam)

Reference: "Cylinder inscribed in a sphere of radius R. Find dimensions when lateral surface area is maximal."
Why 9.0: Geometric constraint setup (Pythagorean relation) → express area as function of one variable → calculus optimization → verify maximum. Chains geometry and calculus, requires formulating the problem correctly before solving — a step where most students get stuck.

##### Score summary table

| Score | Label | What it means |
|---|---|---|
| 1.0-2.0 | Below exam level | Simpler than anything on entrance exams. Basic arithmetic. |
| 3.0-3.5 | Easiest on exam | One standard technique, direct application. |
| 4.0-4.5 | Easy | One technique but requires careful multi-step algebra or case-splitting. |
| 5.0-5.5 | Medium | Two standard techniques from the same area, or one technique with significant computation. |
| 6.0-6.5 | Medium-Hard | Two techniques from different areas combined, both applications routine. |
| 7.0-7.5 | Hard | Two techniques where at least one step is non-obvious, or problems with subtle traps. |
| 8.0-8.5 | Very Hard | Multiple techniques with a key insight or non-obvious problem setup. |
| 8.5-9.0 | Hardest on exam | The 2-3 most difficult problems on a typical entrance exam. |
| 10.0 | Extreme ceiling | Hypothetical maximum. Almost never assigned. |

##### What to consider

- **Number of solution steps**: 2-3 steps = easy. 4-5 steps = medium. 6+ steps = hard.
- **Techniques required**: One technique = easy (3-4). Two from same area = medium (5-6). Two from different areas = hard (6-7). Two+ with a non-obvious step = very hard (8+).
- **Insight vs procedure**: Obvious solution path = easier. Any step where the approach isn't obvious = 7.0+. Needing a key insight most students miss = 8.0+.
- **Computational complexity**: Short algebra = easier. Long chains with sign/case tracking = harder.
- **Error opportunities**: Few places to go wrong = easier. Many branching points or subtle traps = harder.

##### Important guidelines

- **Distribution target**: A typical 20-problem exam should have scores spanning 3.0-9.0, with at least 3 problems scoring 8.0+. If all your scores fall below 7.0, you are grading too conservatively — re-evaluate the hardest problems.
- The easiest 3-5 problems on an exam: 3.0-4.0.
- The middle ~10 problems: 4.5-7.0.
- The hardest 5-7 problems: 7.0-9.0, with at least 3 of those at 8.0+.
- A single-formula problem is 3.0-4.0 even if the algebra takes several lines.
- Any problem combining two different mathematical areas (e.g. geometry + series, trig + algebra, combinatorics + number theory) scores at least 6.0.
- Any problem requiring a substitution or setup that isn't immediately obvious scores at least 7.0.
- Any problem involving calculus optimization, or where the first step is non-trivial to identify, scores at least 8.0.
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
