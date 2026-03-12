# Category Detection for Problems

## Overview

Two-step process to assign categories to problems:

1. **Sema lookup** — deterministic, uses `database/sema_zadataka.md` tables
2. **Keyword matching** — regex-based, reads solution HTML text

Both steps are lossless (no AI tokens needed).

---

## Step 1: Sema Lookup

The `sema_zadataka.md` file contains tables mapping `(faculty, year, problem_order)` → category abbreviation for ETF, FON, RGF, MATF, and MAS.

Each abbreviation maps to a `categories.json` ID:

| Abbreviation | Category ID |
|---|---|
| `%` | percent_proportion |
| `ai` | algebraic_expressions |
| `agn`, `aign`, `aing` | sequences |
| `ang`, `agv` | analytic_geometry |
| `aps`, `sis` | linear_equations |
| `bi` | binomial_formula |
| `delj`, `etb`, `tb` | real_numbers |
| `eks` | exponential_equations |
| `gvf` | limits |
| `if`, `pi`, `izv` | derivatives |
| `irac` | irrational_equations |
| `kb` | complex_numbers |
| `kom`, `mi` | combinatorics |
| `kvf` | quadratic_function |
| `kvj` | quadratic_equations |
| `lgj`, `log` | logarithm |
| `lnj` | linear_equations |
| `of`, `oif` | function_properties |
| `pla`, `plj`, `geo` | planimetry |
| `po`, `pol` | polynomials |
| `rb` | real_numbers |
| `sikt` | trigonometric_equations |
| `ste` | stereometry |
| `tri` | trigonometric_expressions |
| `trj` | trigonometric_equations |
| `ver` | probability |
| `vf` | polynomials |

Combined abbreviations like `eks/log` → take the first part.
Suffix `+` (e.g. `pla+`) is stripped (indicates harder variant).

### Sema row → document mapping

- **ETF**: row "YYYY" (skip "prob. YYYY") → `elektrotehnicki_fakultet_{YYYY}.pdf`
- **FON**: row "YYYY" (skip prob/sept) → `fakultet_organizacionih_nauka_{YYYY}.pdf`
- **RGF**: row "YYYY" (skip sept) → try `_grupa_1.pdf`, then `.pdf`
- **MATF**: row "YYYY" (skip prob) → `matematicki_fakultet_{YYYY}.pdf`
- **MAS**: pre-2019 use main row (skip sept); 2019+ use MI row (skip ITM/sept)

---

## Step 2: Keyword Matching

For problems not covered by sema (TMF, Fizički, Građevinski, remaining MAS, new problems), extract text from the solution HTML and match against regex patterns.

### Text extraction

Strip HTML overhead (head, style, script, tags), decode entities, collapse whitespace. First ~800 chars is enough — contains problem title and statement.

### Keyword rules

Order matters — first match wins. More specific patterns come first.

```python
import re, html, os, json

def extract_text(filepath, max_chars=800):
    with open(filepath) as f:
        content = f.read()
    text = re.sub(r'<head[^>]*>.*?</head>', '', content, flags=re.DOTALL)
    text = re.sub(r'<style[^>]*>.*?</style>', '', text, flags=re.DOTALL)
    text = re.sub(r'<script[^>]*>.*?</script>', '', text, flags=re.DOTALL)
    text = re.sub(r'<[^>]+>', ' ', text)
    text = html.unescape(text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text[:max_chars]

KEYWORD_RULES = [
    # Very specific first
    (r'kompleksn|imaginar|konjugovan.*bro|i\^2\s*=\s*-1', 'complex_numbers'),
    (r'binomn|njutn|paskal.*trougao|binom.*formul', 'binomial_formula'),
    (r'verovatnoc|verovatno[sš]|slučajn', 'probability'),
    (r'kombinat|varijacij|permutacij|teorij.*igara', 'combinatorics'),

    # Geometry — 3D
    (r'stereometrij|zapremina.*tela|prav.*prizm|piramid|konus|cilindar|kupa|lopta.*zapremina|zapremin.*lopt|sfer|prave.*u.*prostor|omotač.*valjk|površin.*omotač', 'stereometry'),

    # Geometry — 2D (multiple patterns for breadth)
    (r'planimetrij|četvorougao|trapez|paralelogr|romb|opisana.*kružnic|upisana.*kružnic|tetivni|tangentni|sličnost.*trougl|podudarn', 'planimetry'),
    (r'trougao.*stranic|visina.*trougla|obim.*trougla|površin.*trougla|ugao.*trougla', 'planimetry'),
    (r'krug.*površin|površin.*krug|kružn.*odsečak|upisan.*krug|krug.*upisan|tetiv.*kružnic|dijagonal.*šestougao|šestougao.*dijagonal|praviln.*mnogougao|praviln.*šestougao|dijagonal.*praviln', 'planimetry'),
    (r'centraln.*ugao|perifern.*ugao|tangent.*kružn|zajedničk.*tangent|geometrija.*krug', 'planimetry'),
    (r'геометрија.*круг|централн.*угао|перифер.*угао', 'planimetry'),  # Cyrillic
    (r'mnogougao.*stranic|broj.*stranic.*praviln|ugao.*praviln.*mnogougao', 'planimetry'),

    # Analytic geometry
    (r'analit.*geomet|prava.*ravan|elips|hiperbol|parabol|kružnic.*jednačin|jednačin.*kružnic|jednačin.*prav|konik|fokus|direkt|ekscentricitet|asimptot.*hiperb', 'analytic_geometry'),
    (r'jednačina.*prave|normal.*na.*prav|tangent.*kruznic.*prav|uslov.*tangent|koeficijent.*pravca|simetrala.*duž', 'analytic_geometry'),

    # Trigonometry
    (r'trigonometrij.*jedn|trig.*jednačin|trig.*nejednačin|sin\s*x\s*=|cos\s*x\s*=|tg\s*x\s*=', 'trigonometric_equations'),
    (r'trigonometrij|sin\s|cos\s|tg\s|ctg\s|sin\^|cos\^|sinusn.*kosinusn|adicione|dupli.*ugao', 'trigonometric_expressions'),

    # Analysis
    (r'izvod|derivat|tangent.*funkcij|monoton.*funkcij|ekstrem|minimum.*funkcij|maksimum.*funkcij|stacionar', 'derivatives'),
    (r'graničn.*vrednost|limes|limit|granična', 'limits'),
    (r'aritmet.*niz|geometr.*niz|geometrij.*niz|niz.*razlik|niz.*količnik|beskonačn.*red|zbir.*niz|opšti.*član.*niz|n-ti.*član', 'sequences'),
    (r'aritmetičk.*progresij|geometrijsk.*progresij|progresij.*član|član.*progresij|zbir.*članov.*progresij', 'sequences'),

    # Functions
    (r'osobin.*funkcij|domen|kodomen|paran.*neparan|injekt|surjekt|bijekt|inverzn.*funkcij|kompozicij.*funkcij|oblast.*definisan', 'function_properties'),
    (r'supstitucij.*funkcij|vrednost.*funkcij.*supstituc|funkcionaln.*jednačin|vrednost.*kompozit|vrednost.*funkcij|f\!\s*\\left|izračunavanje.*vrednosti.*funkcij', 'function_properties'),
    (r'linearn.*funkcij.*parametr', 'function_properties'),

    # Equations
    (r'eksponencij.*jedn|eksponencij.*nejedn|eksponencij.*funkcij|\d+\^x|e\^x', 'exponential_equations'),
    (r'logarit|log\s|ln\s|log_|\\log|\\ln', 'logarithm'),
    (r'iracional.*jedn|iracional.*nejedn|\\sqrt.*=|koren.*jednačin', 'irrational_equations'),
    (r'рационалн.*неједначин|рационалн.*једначин', 'irrational_equations'),  # Cyrillic
    (r'kvadrat.*funkcij|kvadrat.*nejednačin|parabola.*teme|graf.*kvadrat|diskriminant.*nejednačin|najm.*vrednost.*kvadrat|kompletir.*kvadrat', 'quadratic_function'),
    (r'kvadrat.*jednačin|vijet|diskriminant|rešenja.*jednačin.*drugog', 'quadratic_equations'),
    (r'polinom|deljiv.*polinom|nul[ae].*polinom|horner|faktoriz', 'polynomials'),
    (r'linearn.*jedn|linearn.*nejedn|linearn.*sistem|sistem.*jednačin|apsolutn.*vrednost.*jedn', 'linear_equations'),
    (r'algebars.*izraz|racional.*izraz|razlom.*izraz|stepenov.*izraz|pojednostav', 'algebraic_expressions'),
    (r'razlomcima.*decimalni|decimalni.*razlom|složeni razlomak|mesovit.*broj', 'real_numbers'),
    (r'jednačin.*razlomc', 'real_numbers'),
    (r'procen|proporcij|razmera|srazmer', 'percent_proportion'),
    (r'realn.*broj|prirodn.*broj|ceo.*broj|racional.*broj|iracional.*broj|deljiv|deljivost|nzd|nzs|prost.*broj|teorij.*brojev', 'real_numbers'),

    # Broad geometry fallback
    (r'geometrija\b.*trougao|geometrija\b.*krug|osnovna geometrija', 'planimetry'),
]

# Usage:
with open('database/problems.json') as f:
    problems = json.load(f)

uncat = [p for p in problems if not p.get('category') and p.get('solution_path')]
updated = 0
unmatched = []

for p in uncat:
    path = p['solution_path']
    if not os.path.exists(path):
        continue
    text = extract_text(path).lower()

    found = False
    for pattern, cat_id in KEYWORD_RULES:
        if re.search(pattern, text):
            p['category'] = cat_id
            updated += 1
            found = True
            break

    if not found:
        unmatched.append((p, text[:300]))

print(f"Updated: {updated}")
print(f"Still unmatched: {len(unmatched)}")
for p, text in unmatched:
    print(f"  {p['document']} #{p['order']}: {text[:200]}")

with open('database/problems.json', 'w', encoding='utf-8') as f:
    json.dump(problems, f, ensure_ascii=False, indent=2)
    f.write('\n')
```

### Notes

- The keyword rules match **lowercased** text.
- Cyrillic patterns are included for TMF 2012 and Fizički 2013 solutions which use Serbian Cyrillic.
- If a problem doesn't match any rule, inspect the extracted text manually and either add a new pattern or assign the category directly in `problems.json`.
- Typical hit rate: ~97% of problems match on first pass. The remaining 2-3% are edge cases (Cyrillic, unusual topic framing, cross-topic problems).
