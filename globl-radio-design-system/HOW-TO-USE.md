# Globl Radio design system — file guide

**Start here: open `index.html` in any browser.** It needs nothing else: `globl.css` beside it carries the AGF tokens and fonts (embedded) plus the Globl Radio layer, and the page shows every component with a Midnight / Daylight / Air switch.

- `README.md` — the brand book for the sub-brand (the mark, voice, colour, type, texture, components), written against the AGF brand book in `../agf-design-system/agf-design-system/README.md`, which still governs everything this one does not mention.
- `02-applications.md` — the player, venue surfaces, the virtual ticket, broadcast graphics, hardware screens, print, web.
- `03-motion.md` — what moves, and only when something is live.
- `globl.css` — the one stylesheet to link: `agf.css` and the Globl Radio layer in one file. Set `data-theme="midnight|daylight|air"` on `<html>` and use the `.agf-*` classes from AGF and the `.gr-*` classes from here.
- `globl-layer.css` — the Globl Radio layer alone, for pages that already load `agf.css`.
- `tokens.json` / `tokens.css` — only the tokens Globl Radio adds (the live voice, the stave). Every other token is AGF's and lives in the AGF package.
- `components/<Name>/preview.html` + `README.md` — 13 components; each preview opens on its own (it links `../../globl.css`).
- `assets/Logos/` — monogram, lockup and ring in brass, ink and bone; `source/` holds the designer's two EPS files the SVGs were converted from. `assets/Icons/` — four icons added to AGF's ten.
- `fonts/` — the same three faces as AGF (woff2, OFL), for pages that load `tokens.css` instead of `globl.css`.
- `preview-*.png` — rendered contact sheets.
- `build/build.py` — regenerates the SVGs from the EPS sources, `globl.css` from `agf.css` + the layer, the component previews, the showcase and the contact sheets. Run with `python3 -I build/build.py` from this folder; needs the AGF package beside it and, for the PNGs, the repo's Playwright.
- `design-system.json` — index for the published Claude artifact; ignore elsewhere.
