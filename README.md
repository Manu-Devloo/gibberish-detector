# Gibberish Detector

A small deterministic demo that automatically classifies any word or phrase as
plausible text or likely gibberish. Detection runs entirely in the browser and
makes no LLM or network calls.

The detector combines a general and technical vocabulary, repeated-pattern
checks, common keyboard-sequence checks, and character n-gram plausibility for
Latin-script text. Non-Latin scripts are accepted conservatively unless they
are clearly repetitive or malformed, and the result explicitly explains when
that conservative pass-through was used.

The public site includes descriptive metadata, a canonical URL, social preview
metadata, `WebApplication` structured data, crawl rules, and a sitemap.

## Run locally

```bash
npm install
npm run dev
```

Use `npm run build` for a production build and `npm test` for the rendered-page
check.
