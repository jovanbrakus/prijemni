# Create Lesson

Create one knowledge-base lesson HTML file from the curriculum in `matematika-lekcije.md`.

**Argument:** `$ARGUMENTS` — lesson number (e.g. `3`)

## Instructions

Follow these steps exactly:

### Step 1: Validate input

Check that `$ARGUMENTS` is a positive integer lesson number.

If it is missing or invalid, tell the user to use:

```text
/create_lesson 3
```

and stop.

Set these variables for the rest of the workflow:

- `LESSON_NUMBER` = `$ARGUMENTS`
- `OUTPUT_DIR` = `knowledge/lesson{LESSON_NUMBER}_codex/`

### Step 2: Read the required sources

Read these sources before writing anything:

- `knowledge-lesson-instructions.md` — this is the main implementation spec
- `matematika-lekcije.md` — this is the authoritative lesson-content source; read it but do not modify it
- `reference_designs/knowledge_lesson/code.html` and `reference_designs/knowledge_lesson/screen.png` — use only for visual language, element style, spacing, colors, typography, and component ideas

You may also inspect existing lessons such as:

- `knowledge/lesson1_codex/lesson1_iskazi_i_iskazne_formule.html`
- `knowledge/lesson2_codex/lesson2_teorija_skupova_i_operacije_nad_skupovima.html`

Use them only as structure and quality references. Do not copy their lesson content.

### Step 3: Extract the exact lesson definition

In `matematika-lekcije.md`, find the exact heading:

```text
**Lekcija {LESSON_NUMBER}: ...
```

Extract the lesson title and the curriculum text that belongs to that lesson. Treat that excerpt as the authoritative scope for the lesson.

Also identify:

- the parent category heading
- the parent group heading

If the lesson heading does not exist, tell the user and stop.

Set:

- `LESSON_TITLE` = the exact lesson title from `matematika-lekcije.md`

### Step 4: Determine the output path

Create an ASCII-safe filename slug from `LESSON_TITLE`:

- lowercase
- Serbian Latin diacritics transliterated to ASCII for the filename only
- spaces replaced with underscores
- punctuation removed where practical

Write the output to:

```text
knowledge/lesson{LESSON_NUMBER}_codex/lesson{LESSON_NUMBER}_{slug}.html
```

Create `OUTPUT_DIR` if it does not exist.

Do not delete or rename existing lesson folders or files unless the user explicitly asks for that.

### Step 5: Build the lesson

Create exactly one standalone HTML file that follows `knowledge-lesson-instructions.md`.

Required content and formatting rules:

- visible language must be Serbian, Latin script
- visible text must use the full Serbian alphabet where needed: `č`, `ć`, `š`, `ž`, `đ`
- do not shave Serbian letters in visible text
- all visible mathematical notation must use LaTeX rendered through MathJax
- do not show math as ASCII when MathJax can render it
- keep all CSS inside `<style>`
- keep all JavaScript inside `<script>`
- keep JavaScript in an IIFE
- include `KNOWLEDGE_LESSON_META`

Required pedagogical structure:

- hero section
- menu / quick navigation
- section "Zašto je ova lekcija važna"
- detailed lesson body with definitions, intuition, formal notation, and multiple examples
- meaningful lesson-specific interactive element, preferably canvas-based
- guided examples
- exercises at the end with `details` solutions
- final summary at the very end

Use the reference design only for presentation. Generate the lesson content independently from the curriculum excerpt and sound pedagogy.

### Step 6: Hero image requirement

For now, reuse the same temporary hero image approach as the existing knowledge lessons.

Also include:

- an HTML comment containing a future image-generation prompt specific to this lesson
- the same image prompt inside `KNOWLEDGE_LESSON_META`

The prompt must describe the actual lesson topic, not a generic math image.

### Step 7: Self-check before finishing

Before reporting completion, verify that the generated file:

- starts with `<!DOCTYPE html>`
- is a complete standalone HTML document
- contains MathJax
- contains at least one meaningful interactive element
- contains `KNOWLEDGE_LESSON_META`
- follows the exact lesson topic from `matematika-lekcije.md`
- leaves `matematika-lekcije.md` unchanged

### Step 8: Report results

Tell the user:

- the exact lesson title found
- the output file path
- any assumptions you made while expanding the curriculum into a full lesson
