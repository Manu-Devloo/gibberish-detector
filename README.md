# Gibberish Detector

A small deterministic demo that classifies a professional query as plausible
text or likely gibberish. Detection runs entirely in the browser and makes no
LLM or network calls.

The detector combines a small professional-term vocabulary, repeated-pattern
checks, common keyboard-sequence checks, and character n-gram plausibility for
Latin-script text. Non-Latin scripts are accepted conservatively unless they
are clearly repetitive or malformed.

## Run locally

```bash
npm install
npm run dev
```

Use `npm run build` for a production build and `npm test` for the rendered-page
check.
