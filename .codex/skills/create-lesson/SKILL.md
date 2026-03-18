---
name: create-lesson
description: Create one standalone knowledge lesson HTML file from `matematika-lekcije.md` using `knowledge-lesson-instructions.md` and `reference_designs/knowledge_lesson/`. Use when the user asks to create a lesson by number, continue the `knowledge/lessonN_codex/` series, or run the old `/create_lesson N` workflow.
---

# Create Lesson

Create exactly one knowledge-base lesson HTML file for a requested lesson number.

## Workflow

1. Validate the input.
   - Treat `$ARGUMENTS` as the lesson number.
   - Accept only a positive integer.
   - If the value is missing or invalid, tell the user to use `/create_lesson 3` and stop.

2. Read the required sources before writing.
   - `knowledge-lesson-instructions.md`
   - `matematika-lekcije.md`
   - `reference_designs/knowledge_lesson/code.html`
   - `reference_designs/knowledge_lesson/screen.png`
   - Optionally inspect existing lessons under `knowledge/lesson*_codex/` for structure and quality only. Do not copy lesson content.

3. Extract the exact lesson definition from `matematika-lekcije.md`.
   - Find the heading `**Lekcija {LESSON_NUMBER}: ...`.
   - Extract the exact lesson title and the curriculum text that belongs to that lesson.
   - Record the parent category heading and the parent group heading.
   - If the heading does not exist, tell the user and stop.

4. Determine the output path.
   - Use `knowledge/lesson{LESSON_NUMBER}_codex/` as the output directory.
   - Build the filename as `lesson{LESSON_NUMBER}_{slug}.html`.
   - Make `slug` ASCII-safe: lowercase, transliterate Serbian Latin diacritics for the filename only, replace spaces with underscores, and remove punctuation where practical.
   - Create the output directory if needed.
   - Do not delete or rename existing lesson folders or unrelated lesson files unless the user explicitly asks.

5. Build the lesson.
   - Create exactly one standalone `.html` file.
   - Follow `knowledge-lesson-instructions.md` as the main implementation spec.
   - Keep visible text in Serbian, Latin script, with full Serbian letters where needed.
   - Render visible mathematics with MathJax.
   - Keep all CSS inside `<style>`.
   - Keep all JavaScript inside `<script>` and wrap it in an IIFE.
   - Include `KNOWLEDGE_LESSON_META`.
   - Use the reference design only for visual language, spacing, typography, and component ideas.

6. Include the required teaching structure.
   - Hero section.
   - Menu or quick navigation.
   - Section `Zašto je ova lekcija važna`.
   - Main lesson sections with definitions, intuition, formal notation, and multiple examples.
   - At least one meaningful lesson-specific interactive element, preferably canvas-based.
   - Guided examples.
   - End-of-lesson exercises with `details` solutions.
   - Final summary.

7. Add the hero-image placeholder metadata.
   - Reuse the same temporary hero-image approach already used in existing knowledge lessons.
   - Add an HTML comment with a future image-generation prompt specific to the lesson.
   - Copy the same prompt into `KNOWLEDGE_LESSON_META`.

8. Self-check before finishing.
   - Confirm the file starts with `<!DOCTYPE html>`.
   - Confirm it is a complete standalone HTML document.
   - Confirm MathJax is present.
   - Confirm there is at least one meaningful interactive element.
   - Confirm `KNOWLEDGE_LESSON_META` is present.
   - Confirm the topic matches the extracted lesson scope.
   - Leave `matematika-lekcije.md` unchanged.

9. Report the result.
   - Give the exact lesson title.
   - Give the output file path.
   - Mention any assumptions used while expanding the curriculum into a full lesson.
