---
name: grade-difficulty
description: >-
  Use when the user asks to "grade a problem", "grade difficulty",
  "determine difficulty for a problem".
argument-hint: "[solution_path]"
allowed-tools: Read
---

# Grade Difficulty

Grade the difficulty of a single solved math problem using a position-based heuristic.

**Argument:** `$ARGUMENTS` — the solution HTML file path (e.g. `problems/univerzitet_u_beogradu_elektrotehnicki_fakultet_2023/univerzitet_u_beogradu_elektrotehnicki_fakultet_2023_problem_5_solution.html`)

## Instructions

Follow these steps exactly:

### Step 1: Resolve the problem

Parse the argument to extract:
- `SOLUTION_PATH` = `$ARGUMENTS`
- `FOLDER` = the directory name inside `problems/` (extract from path)
- `DOCUMENT` = `{FOLDER}.pdf`
- `N` = the problem number (extract from `_problem_{N}_solution.html` in the filename)

Verify the solution HTML file exists using the Read tool. If the file does not exist, tell the user and stop.

### Step 2: Assign difficulty by position

Difficulty is determined by the problem's position (order) within the exam. For standard 20-problem exams, randomly pick a value from the appropriate range:

| Problem # | Possible values |
|-----------|-----------------|
| 1–5       | 2.0, 2.5, 3.0, 3.5, 4.0 |
| 6–12      | 4.0, 4.5, 5.0, 5.5, 6.0 |
| 13–17     | 6.5, 7.0, 7.5, 8.0, 8.5 |
| 18–20     | 8.0, 8.5, 9.0, 9.5 |

All ranges are inclusive. Values are in 0.5 increments.

**Rationale**: Entrance exams order problems by difficulty. Scoring schemes confirm this — earlier problems are worth fewer points (3–4 pts) and later ones more (6–7 pts).

If the problem number falls outside 1–20, report this to the user and ask how to handle it.

### Step 3: Update problems.json

1. Read `database/problems.json`
2. Find the entry matching `document` == `DOCUMENT` and `order` == `N`
3. Set its `difficulty` field to the assigned score
4. Write the updated array back to `database/problems.json`

If no matching entry exists in the database, report this to the user and skip the database update.

### Step 4: Report result

Output a single line:

```
Problem {N} from {DOCUMENT}: difficulty {X.X}
```
