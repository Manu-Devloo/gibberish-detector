# Gibberish Detector

A small deterministic demo that automatically classifies any word or phrase as
plausible text or likely gibberish. Detection runs entirely in the browser and
makes no LLM or network calls.

The detector combines a general and technical vocabulary, repeated-pattern
checks, common keyboard-sequence checks, and character n-gram plausibility for
Latin-script text. Unknown one-to-three-character Latin inputs are rejected
unless they appear in the built-in list of common short words, abbreviations,
or units. This intentionally stricter rule prevents low-information inputs such
as `Mn` from bypassing the longer-word checks. Non-Latin scripts are accepted
conservatively unless they are clearly repetitive or malformed, and the result
explicitly explains when that conservative pass-through was used.

This remains a heuristic rather than a universal dictionary. Very short text is
inherently ambiguous, so uncommon names, codes, or abbreviations may need to be
added to the recognised list when they are valid for a particular use case.

The public site includes descriptive metadata, a canonical URL, social preview
metadata, `WebApplication` structured data, crawl rules, and a sitemap.

## Run locally

```bash
npm install
npm run dev
```

Use `npm run build` for a production build and `npm test` for the rendered-page
check.
