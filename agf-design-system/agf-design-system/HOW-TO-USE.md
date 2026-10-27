# AGF design system — file guide

**Start here: open `index.html` in any browser.** It needs nothing else: `agf.css` beside it carries the tokens, the three fonts (embedded) and the component styles, and the page shows every component with a Midnight / Daylight / Air switch.

- `README.md` — the brand book (voice, colour, type, space, texture, marks, components).
- `02-applications.md` — divisions, CMF specs, hardware, packaging, gifts, web.
- `03-motion.md` — the damped motion rules.
- `agf.css` — the one stylesheet to link in your own pages: `<link rel="stylesheet" href="agf.css">`, then set `data-theme="midnight|daylight|air"` on `<html>` and use the `.agf-*` classes from the component previews.
- `tokens.json` — every token (3 themes), machine-readable. `tokens.css` is the same compiled to CSS custom properties (fonts referenced by file; `agf.css` embeds them instead so it works from `file://`).
- `components/<Name>/preview.html` + `README.md` — 20 components; each preview opens on its own (it links `../../agf.css`).
- `assets/Logos/` — mark, lockup, seal, floating-ground (SVG). `assets/Icons/` — 10 line icons.
- `fonts/` — Commissioner (4-axis variable), Monoton, Poiret One (woff2, OFL).
- `preview-*.png` — rendered contact sheets.
- `design-system.json` — index for the published Claude artifact; ignore elsewhere.
