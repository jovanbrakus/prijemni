# Prijemni Ispit - Math Problems Archive

Archive of math problems from college entrance exams ("prijemni ispit") in Serbia and Slovenia.

## Language

- Problem statements and solutions are in Serbian (Latin script) or Slovenian.
- Code comments and file/folder names use ASCII-safe naming where practical.

## Structure

- `archive/` — original PDF documents (official test papers, problem sets, etc.). These are source-of-truth reference materials.
- Problems are organized by country, institution, and year.
- Each problem includes: statement, solution, and topic tags.

### Archive filename convention

Files in `archive/` follow the pattern: `{university_slug}_{faculty_slug}_{year}[_suffix].pdf`

- All lowercase, words separated by underscores, ASCII only (no diacritics).
- **university_slug**: e.g. `univerzitet_u_beogradu`, `univerzitet_u_novom_sadu`, `univerzitet_u_nisu`, `univerzitet_u_kragujevcu`, `univerzitet_odbrane`
- **faculty_slug**: e.g. `elektrotehnicki_fakultet`, `fakultet_organizacionih_nauka`, `matematicki_fakultet`
- **year**: 4-digit year of the exam
- **suffix** (optional): `_resenja` (solutions), `_grupa_1` / `_grupa_a` (exam group), `_zbirka` (problem collection), `_informator`, `_skripta`

Examples:
- `univerzitet_u_beogradu_elektrotehnicki_fakultet_2023.pdf`
- `univerzitet_u_beogradu_fizicki_fakultet_2019_grupa_a.pdf`
- `univerzitet_odbrane_vojna_akademija_2024_resenja.pdf`
- `univerzitet_u_novom_sadu_fakultet_tehnickih_nauka_zbirka.pdf`

## Current Scope

For now, we are focusing only on faculties from **Univerzitet u Beogradu**.
List of faculties in focus form "Uniterzitet u Beograd":
 * Elektrotehnicki fakultet
 * Fakultet Organizacionih Nauka
 * Fizicki fakultet
 * Gradjevinski fakultet
 * Rudarsko Geoloski fakultet
 * Saobracajni fakultet
 * Prirodno Matematiski fakultet
 * Masinski fakultet
 * Tehnolosko Metalurski fakultet

Years of interest: **2000 to present**.

## Math Conventions

- Use LaTeX for all mathematical notation.
- Use standard Serbian/Slovenian math terminology where applicable.
- Number formatting: decimal comma (e.g., 3,14), not decimal point.

## Content Guidelines

- Preserve original problem wording as closely as possible.
- Solutions should show full step-by-step work.
- Tag problems by topic (algebra, geometry, analysis, combinatorics, etc.).
