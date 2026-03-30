# Solution Format v2 — Fragment Specification

## Overview

A v2 solution is a **content fragment** — no HTML document scaffold, no embedded CSS, no MathJax loading. The host application wraps the fragment in a full HTML document, provides the stylesheet (`solution-v2.css`), and loads MathJax.

The fragment contains only: a format marker, an optional logic scratchpad, the title/subtitle, a sequence of semantic cards, optional canvas scripts, and a metadata block.

---

## 1. Format Marker

Every v2 fragment **must** begin with this comment on the first line:

```html
<!--MATOTEKA_FORMAT v2-->
```

This allows the host app to instantly distinguish v2 fragments from legacy full-HTML files.

---

## 2. Logic Scratchpad

Immediately after the format marker, include the logic scratchpad:

```html
<script type="text/info" id="logic-scratchpad">
  Problem: [full problem statement in plain text]
  Known: [variables and given data]
  Step 1: [reasoning...]
  Step 2: [reasoning...]
  Answer: [final answer with verification]
</script>
```

- Type `text/info` means the browser will not execute it
- Must contain complete solution reasoning written **before** the visible content
- This is critical for accuracy — the LLM solves the problem here first, then writes the UI

---

## 3. Title and Subtitle

```html
<h1 data-card="problem-title">Logaritamske nejednačine</h1>
<p data-card="problem-subtitle" class="subtitle">Algebra — rešavanje nejednačina sa logaritmima</p>
```

- `<h1 data-card="problem-title">`: Describes the math content only. **Never** include exam metadata (year, faculty, exam name, problem number).
- `<p data-card="problem-subtitle" class="subtitle">`: Topic area description in muted styling.
- These use `data-card` for direct referencing but do NOT need `data-title`.

---

## 4. Cards

Cards are the core building blocks. Each card is a `<div>` with:
- `data-card` attribute: identifies the card type (from the fixed enum below)
- `data-title` attribute: human-readable title for TOC generation (not required for `problem-title` and `problem-subtitle`)

### 4.1 Card Type Enum

| `data-card` value    | Required | Description                                    |
|----------------------|----------|------------------------------------------------|
| `problem-title`      | **Yes**  | The h1 solution title (no data-title needed)    |
| `problem-subtitle`   | **Yes**  | Topic description paragraph (no data-title needed) |
| `problem-statement`  | **Yes**  | Problem text, given data, and answer options    |
| `plan`               | **Yes**  | 1–2 sentence solving approach                  |
| `theory`             | No       | Collapsible theory refresher with key formulas  |
| `visual-aid`         | No       | Canvas-based diagram or interactive element     |
| `step-solution`      | **Yes**  | Numbered step-by-step solution                  |
| `key-insight`        | No       | Highlighted "aha moment" insight                |
| `final-answer`       | **Yes**  | Final answer with all options, correct marked   |
| `pitfalls`           | No       | Common mistakes list                            |
| `challenge`          | No       | Optional extension question with hint           |

### 4.2 Card Order

Cards should appear in the order listed above. Required cards must always be present.

---

## 5. Card Specifications

### 5.1 Problem Statement

```html
<div data-card="problem-statement" data-title="Tekst zadatka">
  <h2>📋 Tekst zadatka</h2>

  <p>Problem text with \( \text{LaTeX} \) expressions...</p>

  <!-- Optional: given data grid -->
  <div class="given-grid">
    <div class="given-item">
      <span class="given-label">a</span>
      <span class="given-value">\( 3 \)</span>
    </div>
    <div class="given-item">
      <span class="given-label">b</span>
      <span class="given-value">\( -5 \)</span>
    </div>
  </div>

  <!-- Answer options (mandatory for multiple-choice) -->
  <div class="answer-grid">
    <div class="answer-option" data-option="A">
      <span class="answer-label">(A)</span>
      <span class="answer-value">\( x = 1 \)</span>
    </div>
    <div class="answer-option" data-option="B">
      <span class="answer-label">(B)</span>
      <span class="answer-value">\( x = -1 \)</span>
    </div>
    <div class="answer-option" data-option="C">
      <span class="answer-label">(C)</span>
      <span class="answer-value">\( x = 0 \)</span>
    </div>
    <div class="answer-option" data-option="D">
      <span class="answer-label">(D)</span>
      <span class="answer-value">\( x = 2 \)</span>
    </div>
    <div class="answer-option" data-option="E">
      <span class="answer-label">(E)</span>
      <span class="answer-value">\( x = -2 \)</span>
    </div>
  </div>
</div>
```

**Rules:**
- The card must have both `data-card="problem-statement"` and `data-title="Tekst zadatka"`
- Answer options use `data-option` with uppercase Latin letters: A, B, C, D, E
- Each option has `.answer-label` (showing `(A)`, `(B)`, etc.) and `.answer-value` (the answer content in MathJax)
- **No correct/incorrect indication** in the problem statement — all options must look identical
- **No click handlers** or interactive behavior on answer options
- **Ignore "Ne znam"** ("I don't know") option from source PDFs — do not include it

### 5.2 Plan

```html
<div data-card="plan" data-title="Plan rešavanja">
  <h2>🎯 Plan rešavanja</h2>
  <p class="plan-text">Primenićemo osobine logaritama da transformišemo nejednačinu,
  a zatim odredimo oblast definisanosti i rešimo odgovarajuću algebarsku nejednačinu.</p>
</div>
```

### 5.3 Theory Refresher

```html
<div data-card="theory" data-title="Podsetnik iz teorije">
  <h2>📚 Podsetnik iz teorije</h2>
  <details>
    <summary>Ključne formule i teoreme</summary>
    <div class="detail-content">
      <ul>
        <li>Logaritam količnika: \( \log_a \frac{x}{y} = \log_a x - \log_a y \)</li>
        <li>Osobina monotonosti: za \( a > 1 \), \( \log_a x > \log_a y \iff x > y \)</li>
      </ul>
    </div>
  </details>
</div>
```

- The `<details>` element is collapsed by default
- 2–4 specific formulas/theorems used in this solution

### 5.4 Visual Aid

```html
<div data-card="visual-aid" data-title="Vizuelni prikaz">
  <h2>📐 Vizuelni prikaz</h2>
  <div class="canvas-wrapper">
    <canvas id="diagram" width="700" height="380"></canvas>
  </div>
  <p class="canvas-caption">Graf funkcije \( f(x) = \log_2(x+3) \) sa označenom oblašću rešenja</p>
  <!-- Optional: sliders or controls -->
  <div class="canvas-controls">
    <label>Parametar a: <input type="range" id="slider-a" min="0" max="100" value="50"></label>
    <span id="slider-a-value">50</span>
  </div>
</div>
```

- Canvas uses fixed pixel `width`/`height` attributes (for drawing coordinate space)
- CSS handles responsive scaling via `max-width: 100%`
- **Canvas height**: Ensure sufficient height so no elements overlap. Labels, legends, axis text, and tick marks must all have clear spacing. Typical minimums: 400px for simple graphs, 500px+ for labeled diagrams with legends. When in doubt, add extra height.
- See Section 7 for canvas script requirements

### 5.5 Step-by-Step Solution

```html
<div data-card="step-solution" data-title="Rešenje korak po korak">
  <h2>✏️ Rešenje korak po korak</h2>

  <div class="step" data-step="1">
    <div class="step-badge">1</div>
    <div class="step-content">
      <h3 class="step-title">Odredimo oblast definisanosti</h3>
      <p>Argument logaritma mora biti pozitivan:</p>
      <div class="math-block">\[ x + 3 > 0 \implies x > -3 \]</div>
      <p class="note">Oblast definisanosti je \( D = (-3, +\infty) \).</p>
    </div>
  </div>

  <div class="step" data-step="2">
    <div class="step-badge">2</div>
    <div class="step-content">
      <h3 class="step-title">Transformišemo nejednačinu</h3>
      <p>Primenom osobine logaritma količnika:</p>
      <div class="math-block">\[ \log_2(x+3) - \log_2(x-1) > 1 \]</div>
      <div class="math-block">\[ \log_2 \frac{x+3}{x-1} > 1 \]</div>

      <!-- Checkpoint -->
      <div class="checkpoint">
        <details>
          <summary>Proveri sebe: Šta znači \( \log_2 A > 1 \)?</summary>
          <div class="detail-content">
            <p>To znači da je \( A > 2^1 = 2 \), jer je osnova 2 veća od 1 (rastuća funkcija).</p>
          </div>
        </details>
      </div>
    </div>
  </div>

  <!-- More steps... -->
</div>
```

**Rules:**
- Each step has `data-step="N"` attribute for programmatic access
- Steps are "student-sized": 1–3 short sentences, one main transformation per equation line
- Include 1–3 checkpoint `<details>` elements throughout for active recall
- Use `.math-block` for display math, MathJax inline `\(…\)` for inline math

### 5.6 Key Insight

```html
<div data-card="key-insight" data-title="Ključni uvid">
  <h2>💡 Ključni uvid</h2>
  <p>Nejednačina se svodi na racionalni izraz čiji znak zavisi od znaka brojioca i imenioca,
  uz uslov da argument logaritma bude pozitivan.</p>
  <div class="math-block">\[ \frac{x+3}{x-1} > 2 \iff \frac{5-x}{x-1} > 0 \]</div>
</div>
```

### 5.7 Final Answer

```html
<div data-card="final-answer" data-title="Konačan odgovor">
  <h2>✅ Konačan odgovor</h2>
  <div class="final-answer-display">
    <p class="final-answer-text">\[ x \in (1, 5) \]</p>
  </div>
  <div class="answer-options">
    <span class="answer-option" data-option="A">(A) \( (-3, 1) \)</span>
    <span class="answer-option" data-option="B">(B) \( (1, +\infty) \)</span>
    <span class="answer-option correct" data-option="C">(C) \( (1, 5) \)</span>
    <span class="answer-option" data-option="D">(D) \( (-3, 5) \)</span>
    <span class="answer-option" data-option="E">(E) \( (5, +\infty) \)</span>
  </div>
  <p class="verification">Provera: za \( x = 3 \in (1,5) \), dobijamo \( \log_2 6 - \log_2 2 = \log_2 3 \approx 1{,}58 > 1 \) ✓</p>
</div>
```

**Rules:**
- The correct option has class `correct` as a **standalone class** (e.g., `class="answer-option correct"`)
- Uses `data-option` with uppercase Latin A–E
- **Exactly one** option is marked `correct`
- Must include a verification/sanity check note

### 5.8 Common Pitfalls

```html
<div data-card="pitfalls" data-title="Česte greške">
  <h2>⚠️ Česte greške</h2>
  <ul class="pitfall-list">
    <li>Zaboraviti da se odredi oblast definisanosti — argument logaritma mora biti strogo pozitivan.</li>
    <li>Pogrešan smer nejednačine kada se množi negativnim izrazom.</li>
  </ul>
</div>
```

### 5.9 Challenge

```html
<div data-card="challenge" data-title="Dodatni izazov">
  <h2>🏆 Dodatni izazov</h2>
  <p>Kako bi se promenilo rešenje kada bi osnova logaritma bila \( \frac{1}{2} \) umesto 2?</p>
  <details>
    <summary>Pogledaj nagoveštaj</summary>
    <div class="detail-content">
      <p>Kada je osnova između 0 i 1, logaritamska funkcija je opadajuća,
      pa se smer nejednačine menja pri prelazu sa logaritma na argument.</p>
    </div>
  </details>
</div>
```

---

## 6. Forbidden Elements

The following must **never** appear in a v2 fragment:

| Element | Reason |
|---------|--------|
| `<!DOCTYPE html>` | Host app provides the document |
| `<html>`, `</html>` | Host app provides the document |
| `<head>`, `</head>` | Host app provides the head |
| `<body>`, `</body>` | Host app provides the body |
| `<style>...</style>` | All styling via external `solution-v2.css` |
| `style="..."` attributes | Exception: `width` and `height` on `<canvas>` |
| `<script src="...mathjax...">` | Host app loads MathJax |
| `MathJax = { ... }` config | Host app configures MathJax |
| `onclick`, `onmouseover`, etc. | Use `addEventListener` in `<script>` blocks |
| Cyrillic text (А-Я, а-я) | Serbian Latin only |
| "Ne znam" answer option | Not a real answer — scoring mechanism |

---

## 7. Canvas Script Requirements

Canvas scripts live in `<script>` blocks at the end of the fragment. They must:

### 7.1 Read Colors from CSS Variables

```javascript
(function() {
  var root = document.documentElement;
  var styles = getComputedStyle(root);
  function cv(name) { return styles.getPropertyValue(name).trim(); }

  var canvas = document.getElementById('diagram');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');

  function draw() {
    // Read all colors from CSS variables
    var bg       = cv('--sol-canvas-bg');
    var grid     = cv('--sol-canvas-grid');
    var axis     = cv('--sol-canvas-axis');
    var primary  = cv('--sol-canvas-primary');
    var secondary = cv('--sol-canvas-secondary');
    var accent   = cv('--sol-canvas-accent');
    var highlight = cv('--sol-canvas-highlight');
    var text     = cv('--sol-canvas-text');
    var muted    = cv('--sol-canvas-muted');
    var danger   = cv('--sol-canvas-danger');

    // Clear and draw
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // ... drawing code using the variables above ...
  }

  draw();

  // Re-draw on theme change
  window.addEventListener('message', function(e) {
    if (e.data && e.data.type === 'matoteka-theme') {
      setTimeout(function() {
        styles = getComputedStyle(root);
        draw();
      }, 50);
    }
  });
})();
```

### 7.2 Available Canvas CSS Variables

| Variable | Dark theme | Light theme | Usage |
|----------|-----------|-------------|-------|
| `--sol-canvas-bg` | Deep dark background | Light warm background | Canvas clear color |
| `--sol-canvas-grid` | Very subtle lines | Very subtle lines | Grid lines |
| `--sol-canvas-axis` | Medium visible lines | Medium visible lines | Axis lines |
| `--sol-canvas-primary` | Orange/blue primary | Darker orange/blue | Primary plot color, function lines |
| `--sol-canvas-secondary` | Purple accent | Darker purple | Secondary elements |
| `--sol-canvas-accent` | Green | Darker green | Solution regions, correct markers |
| `--sol-canvas-highlight` | Pink | Darker pink | Special highlights |
| `--sol-canvas-text` | Light text | Dark text | Labels, point names |
| `--sol-canvas-muted` | Muted text | Muted text | Captions, secondary labels |
| `--sol-canvas-danger` | Red | Red | Error markers, wrong values |

### 7.3 Script Rules

- All scripts must be wrapped in an **IIFE**: `(function() { ... })();`
- No inline event handlers (`onclick`, `onchange`, etc.) — use `addEventListener`
- Maximum 2 interactive elements (sliders, draggable points, toggles)
- Touch support required for interactive elements (`touchstart`, `touchmove`, `touchend`)
- Canvas `touch-action: none` is applied by the CSS (no need to set it in JS)
- Y-axis must point UP (mathematical convention): use coordinate transformation
- For rapidly changing values (sliders), update plain HTML `<span>` elements, not MathJax

---

## 8. Language Rules

### 8.1 Serbian Latin with Full Diacritics

All text must be in **Serbian Latin** with proper diacritics:

| Correct (š, č, ć, ž, đ) | Wrong (shaved Latin) | Wrong (Cyrillic) |
|--------------------------|---------------------|-------------------|
| rešenje | resenje | решење |
| zadatak | zadatak | задатак |
| jednačina | jednacina | једначина |
| tačan | tacan | тачан |
| određivanje | odredjivanje | одређивање |
| površina | povrsina | површина |
| česte greške | ceste greske | честе грешке |

### 8.2 Answer Labels

Always use **uppercase Latin letters**: (A), (B), (C), (D), (E)

**Never** use:
- Cyrillic: (А), (Б), (В), (Г), (Д)
- Lowercase: (a), (b), (c), (d), (e)
- Serbian-specific mappings like В→C, Г→D

### 8.3 Decimal Separator

Use **comma** (,) in visible text: 3,14 (not 3.14)

In LaTeX, use `{,}` to prevent spacing: `3{,}14` renders as 3,14

---

## 9. MathJax Notation

MathJax is loaded by the host app. Use standard LaTeX delimiters:

- **Inline**: `\( x^2 + 1 \)` or `$ x^2 + 1 $`
- **Display** (centered, larger): `\[ x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a} \]`

**Critical rules:**
- Never place HTML elements inside LaTeX delimiters: `\( <span>x</span> \)` is **wrong**
- Never output raw LaTeX without delimiters: `\frac{a}{b}` alone is **wrong**
- For aligned derivations: `\[ \begin{align} ... \end{align} \]`
- For piecewise functions: `\[ f(x) = \begin{cases} ... \end{cases} \]`

---

## 10. Metadata Block

After all fragment content, include the metadata block:

```html
<!--BRAINSPARK_META
{
  "format": "v2",
  "title": "Logaritamske nejednačine",
  "subject": "math",
  "unit": "algebra",
  "topic_tags": ["logaritam", "nejednačina", "oblast definisanosti"]
}
BRAINSPARK_META-->
```

**Required fields:**
- `format`: Must be `"v2"`
- `title`: Short descriptive title (max 100 chars), in Serbian Latin
- `subject`: `"math"` or `"physics"` (English, for indexing)
- `unit`: English enum value (algebra, geometry, trigonometry, combinatorics, calculus, number-theory, probability, statistics, linear-algebra, etc.)
- `topic_tags`: Array of Serbian Latin tags

---

## 11. Complete Fragment Example

```html
<!--MATOTEKA_FORMAT v2-->

<script type="text/info" id="logic-scratchpad">
Problem: Rešiti nejednačinu log₂(x+3) - log₂(x-1) > 1
Step 1: Domain: x+3 > 0 and x-1 > 0, so x > 1
Step 2: log₂((x+3)/(x-1)) > 1
Step 3: (x+3)/(x-1) > 2  (base > 1, monotone increasing)
Step 4: (x+3)/(x-1) - 2 > 0 → (x+3-2x+2)/(x-1) > 0 → (5-x)/(x-1) > 0
Step 5: Sign analysis: positive when 1 < x < 5
Answer: x ∈ (1, 5), which is option (C)
Verification: x=3: log₂(6) - log₂(2) = log₂(3) ≈ 1.58 > 1 ✓
</script>

<h1 data-card="problem-title">Logaritamske nejednačine</h1>
<p data-card="problem-subtitle" class="subtitle">Algebra — rešavanje nejednačina sa logaritmima</p>

<div data-card="problem-statement" data-title="Tekst zadatka">
  <h2>📋 Tekst zadatka</h2>
  <p>Rešiti nejednačinu:</p>
  <div class="math-block">\[ \log_2(x+3) - \log_2(x-1) > 1 \]</div>
  <div class="answer-grid">
    <div class="answer-option" data-option="A">
      <span class="answer-label">(A)</span>
      <span class="answer-value">\( (-3, 1) \)</span>
    </div>
    <div class="answer-option" data-option="B">
      <span class="answer-label">(B)</span>
      <span class="answer-value">\( (1, +\infty) \)</span>
    </div>
    <div class="answer-option" data-option="C">
      <span class="answer-label">(C)</span>
      <span class="answer-value">\( (1, 5) \)</span>
    </div>
    <div class="answer-option" data-option="D">
      <span class="answer-label">(D)</span>
      <span class="answer-value">\( (-3, 5) \)</span>
    </div>
    <div class="answer-option" data-option="E">
      <span class="answer-label">(E)</span>
      <span class="answer-value">\( (5, +\infty) \)</span>
    </div>
  </div>
</div>

<div data-card="plan" data-title="Plan rešavanja">
  <h2>🎯 Plan rešavanja</h2>
  <p class="plan-text">Primenićemo osobine logaritama da objedinimo levu stranu,
  zatim ćemo odrediti oblast definisanosti i rešiti racionalni izraz.</p>
</div>

<div data-card="theory" data-title="Podsetnik iz teorije">
  <h2>📚 Podsetnik iz teorije</h2>
  <details>
    <summary>Ključne formule i teoreme</summary>
    <div class="detail-content">
      <ul>
        <li>Logaritam količnika: \( \log_a \frac{x}{y} = \log_a x - \log_a y \)</li>
        <li>Monotonost: za \( a > 1 \), \( \log_a f(x) > k \iff f(x) > a^k \)</li>
      </ul>
    </div>
  </details>
</div>

<div data-card="step-solution" data-title="Rešenje korak po korak">
  <h2>✏️ Rešenje korak po korak</h2>

  <div class="step" data-step="1">
    <div class="step-badge">1</div>
    <div class="step-content">
      <h3 class="step-title">Oblast definisanosti</h3>
      <p>Oba argumenta logaritma moraju biti pozitivna:</p>
      <div class="math-block">\[ x + 3 > 0 \quad \text{i} \quad x - 1 > 0 \]</div>
      <div class="math-block">\[ x > -3 \quad \text{i} \quad x > 1 \]</div>
      <p>Presek daje: \( x > 1 \), dakle \( D = (1, +\infty) \).</p>
    </div>
  </div>

  <div class="step" data-step="2">
    <div class="step-badge">2</div>
    <div class="step-content">
      <h3 class="step-title">Primena osobine logaritma</h3>
      <p>Koristimo pravilo za razliku logaritama:</p>
      <div class="math-block">\[ \log_2 \frac{x+3}{x-1} > 1 \]</div>
      <div class="checkpoint">
        <details>
          <summary>Proveri sebe: Šta znači \( \log_2 A > 1 \)?</summary>
          <div class="detail-content">
            <p>Pošto je osnova \( 2 > 1 \), logaritam je rastuća funkcija, pa je \( A > 2^1 = 2 \).</p>
          </div>
        </details>
      </div>
    </div>
  </div>

  <div class="step" data-step="3">
    <div class="step-badge">3</div>
    <div class="step-content">
      <h3 class="step-title">Rešavamo racionalni izraz</h3>
      <div class="math-block">\[ \frac{x+3}{x-1} > 2 \]</div>
      <div class="math-block">\[ \frac{x+3}{x-1} - 2 > 0 \implies \frac{x + 3 - 2(x-1)}{x-1} > 0 \implies \frac{5-x}{x-1} > 0 \]</div>
    </div>
  </div>

  <div class="step" data-step="4">
    <div class="step-badge">4</div>
    <div class="step-content">
      <h3 class="step-title">Analiza znaka</h3>
      <p>Razlomak \( \frac{5-x}{x-1} \) je pozitivan kada su brojilac i imenilac istog znaka:</p>
      <p>Brojilac: \( 5 - x > 0 \implies x < 5 \)</p>
      <p>Imenilac: \( x - 1 > 0 \implies x > 1 \)</p>
      <p>Oba pozitivna za \( 1 < x < 5 \).</p>
    </div>
  </div>
</div>

<div data-card="key-insight" data-title="Ključni uvid">
  <h2>💡 Ključni uvid</h2>
  <p>Logaritamska nejednačina se svodi na racionalni izraz čiji znak zavisi od znaka brojioca i imenioca,
  uz dodatni uslov iz oblasti definisanosti koji se automatski zadovoljava.</p>
</div>

<div data-card="final-answer" data-title="Konačan odgovor">
  <h2>✅ Konačan odgovor</h2>
  <div class="final-answer-display">
    <p class="final-answer-text">\[ x \in (1, 5) \]</p>
  </div>
  <div class="answer-options">
    <span class="answer-option" data-option="A">(A) \( (-3, 1) \)</span>
    <span class="answer-option" data-option="B">(B) \( (1, +\infty) \)</span>
    <span class="answer-option correct" data-option="C">(C) \( (1, 5) \)</span>
    <span class="answer-option" data-option="D">(D) \( (-3, 5) \)</span>
    <span class="answer-option" data-option="E">(E) \( (5, +\infty) \)</span>
  </div>
  <p class="verification">Provera: za \( x = 3 \in (1,5) \),
  \( \log_2 6 - \log_2 2 = \log_2 3 \approx 1{,}58 > 1 \) ✓</p>
</div>

<div data-card="pitfalls" data-title="Česte greške">
  <h2>⚠️ Česte greške</h2>
  <ul class="pitfall-list">
    <li>Zaboraviti da se odredi oblast definisanosti — oba argumenta logaritma moraju biti strogo pozitivna.</li>
    <li>Množiti obe strane nejednačine izrazom \( x - 1 \) bez provere znaka — ako je \( x < 1 \), menja se smer nejednačine.</li>
  </ul>
</div>

<div data-card="challenge" data-title="Dodatni izazov">
  <h2>🏆 Dodatni izazov</h2>
  <p>Šta bi se promenilo da je osnova logaritma \( \frac{1}{2} \) umesto 2?</p>
  <details>
    <summary>Pogledaj nagoveštaj</summary>
    <div class="detail-content">
      <p>Za osnovu \( 0 < a < 1 \), logaritamska funkcija je opadajuća —
      smer nejednačine se menja pri prelasku sa logaritma na argument.</p>
    </div>
  </details>
</div>

<!--BRAINSPARK_META
{
  "format": "v2",
  "title": "Logaritamske nejednačine",
  "subject": "math",
  "unit": "algebra",
  "topic_tags": ["logaritam", "nejednačina", "oblast definisanosti"]
}
BRAINSPARK_META-->
```
