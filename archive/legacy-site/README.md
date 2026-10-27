# product-pdf/ — Modular PDF Template Renderer

Extracted verbatim from `server/templates/product-pdf.js` (848 lines)
by `tickets/A-product-pdf.extract.py`. See `tickets/A-product-pdf.md`
for the full architecture rationale.

## Module map

```
product-pdf/
├── index.js              renderPdfHtml (verbatim) + export default
├── helpers.js            esc, md, fmtRange, fmtUSD, sectionCfg
├── sections/             one file per renderer + dispatch index
├── css/                  10 CSS partials + assembler index
└── README.md             this file
```

## Error tracking

- `sections/index.js` wraps each renderer in `safeRender()`: a failing
  section logs `[product-pdf] section "<key>" failed for product "<slug>"`
  and is replaced with an HTML comment marker. The PDF still renders.
- `css/index.js` wraps each CSS partial: a failing partial logs
  `[product-pdf-css] partial "<name>" failed` and substitutes a CSS comment.
- Map a log line to a file instantly: `section "audio_specs"` →
  `sections/audio-specs.js`; `partial "specs"` → `css/specs.css.js`.

## Migration steps

1. Run `A-product-pdf.extract.py` (already done to produce this package).
2. Review files; confirm `css/index.js` output is byte-identical to the
   original `buildCss()` (the script asserts this during extraction).
3. Replace `server/templates/product-pdf.js` with the 1-line shim in
   `product-pdf.js.shim.example` (the only source-touching step).
4. Export a PDF before & after; diff the HTML bytes — expect zero diff.

## Recommended follow-ups (NOT applied by verbatim extraction)

- Add an input guard at the top of `renderPdfHtml` for null `product`.
- Extract the inline default `sections` array into a named
  `DEFAULT_SECTIONS` constant (currently kept inline to stay verbatim).
- Decide project-wide on `||` vs `??` for palette color fallbacks.
