// Canonical typography classes for knowledge lessons.
// Source of truth: lesson 1 (iskazi i iskazne formule).
// Used by normalize-lesson-css.mjs to stamp into every lesson file.

export const TYPOGRAPHY_CSS = `/* === Typography System === */

.t-hero {
  font-size: clamp(3rem, 7vw, 5.7rem);
  line-height: 0.92;
  font-weight: 900;
  letter-spacing: -0.05em;
  margin-bottom: 18px;
}

.t-hero .accent {
  display: block;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-soft) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.t-section {
  font-size: clamp(1.8rem, 4vw, 2.7rem);
  line-height: 1.02;
  font-weight: 850;
  letter-spacing: -0.03em;
}

.t-card-title {
  font-size: 1.12rem;
  font-weight: 700;
  margin-bottom: 10px;
}

.t-lead {
  font-size: 1.05rem;
  color: var(--muted);
  max-width: 720px;
  margin-bottom: 24px;
}

.t-kicker {
  color: var(--primary-soft);
  text-transform: uppercase;
  letter-spacing: 0.11em;
  font-size: 0.76rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.t-label {
  color: var(--primary-soft);
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 6px;
}

.t-muted {
  color: var(--muted);
}

.t-muted-strong {
  color: var(--muted-strong);
}

.t-small {
  font-size: 0.92rem;
  color: var(--muted);
}`;

export const CANONICAL_ROOT = `:root {
  --bg: #090403;
  --bg-soft: #140906;
  --panel: rgba(30, 15, 9, 0.92);
  --panel-soft: rgba(19, 9, 6, 0.84);
  --panel-strong: rgba(42, 21, 12, 0.96);
  --text: #f6eee9;
  --muted: #d8c6ba;
  --muted-strong: #f1e2d7;
  --primary: #ec5b13;
  --primary-soft: #ff9c6d;
  --accent: #ffd8bb;
  --success: #79dfb8;
  --warning: #ffc57f;
  --danger: #ff9b8f;
  --sky: #8fd7ff;
  --violet: #cfb7ff;
  --border: rgba(236, 91, 19, 0.16);
  --border-strong: rgba(255, 156, 109, 0.30);
  --shadow: 0 28px 84px rgba(0, 0, 0, 0.36);
  --radius-xl: 34px;
  --radius-lg: 24px;
  --radius-md: 18px;
  --radius-sm: 12px;
  --max-width: 1180px;
}`;
