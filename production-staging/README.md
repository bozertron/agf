# production-staging

Everything extracted from the old site, plus the new reference site, in one place. This folder is the point of collaborative discussion for the final website.

## Run the site

```sh
cd production-staging/site
./serve.sh            # serves production-staging/ on port 8787
# open http://localhost:8787/site/
```

Pages read their copy from JSON, and browsers refuse to fetch JSON from `file://`, so the one-line server is needed. Nothing to install beyond python3.

## What is where

| Path | What it is |
|---|---|
| `site/` | The reference site: a portal (`index.html`) and nine options, each a folder with `intro.html`, `deep.html` and `content.json`. |
| `site/site.json` | The manifest: brand lines, the nine options in order (slug, number, eyebrow, title, summary). Reorder or rename options here. |
| `site/shared/` | `agf.css` (the design system, fonts embedded), `site.css` (page chrome), `site.js` (the one renderer), logos and icons. |
| `site/<option>/content.json` | All copy for that option. `intro` holds headline, lede, three points, metrics and a quote. `deep` holds ordered typed sections. **This is the editable source.** |
| `content/sections/*.json` | The old site's database, one file per section, newest version first (`.v2`, `.v3` are older versions). Raw rows in `content/raw/`. |
| `content/products/*.json` | The six products from the database. |
| `assets/` | Every image in the repo, catalogued: `renders/` (per product), `brand-boards/`, `concept-boards/`, `concepts/`, `prior-work/`, `section-backgrounds/`. `ASSETS.md` and `renders/RENDERS.md` describe each file; `assets.json` and `renders/renders.json` are the same data as JSON. Copy transcribed from the boards is in `ASSETS.md`. |
| `tools/build-content.py` | Composed the nine `content.json` files from `content/`. Re-running overwrites hand edits; only re-run to start over from the database. |
| `CONTENT-HARVEST.md` | The inventory written before the database was recovered, plus a note on what the recovery added. |
| `../REPO-MAP.md` | The whole-repo map: topic index, full file tree, open questions compiled from the content files. Start there when writing a spec. |
| `../archive/legacy-site/LEGACY-MAP.md` | Module-by-module map of the retired site, including the visualisations worth re-implementing and their data contracts. |
| `../agf-design-system/agf-design-system/` | The brand book and design system. `site/shared/agf.css` is a copy of its stylesheet; the folder is the source. |
| `../globl-radio-design-system/` | The Globl Radio sub-brand package (live streaming service), built on the AGF system. Open its `index.html`. |
| `../stereos-brand/` and `../BRAND-INTEGRATION.md` | The stereOS wordmark package and the plan for how AGF, stereOS and Globl Radio fit together. |

## Section types the renderer understands

`prose`, `quote`, `list`, `cards`, `table`, `spec`, `timeline`, `steps`, `compare`, `pipeline`, `metrics`, `figures`, `html`. See `site/shared/site.js` for the fields each one reads. Any section may carry `note` (a visible working note), `_assumed: true` (an "assumed" badge on its heading), `eyebrow`, `title`, `lede` and `id` (the anchor).

## Collaboration conventions

- **Working notes** are visible by default and can be hidden with the Notes button in the nav. They mark open questions and drafted-for-the-site lines. Delete the `note` key when a section is signed off.
- **Nothing is invented.** Copy comes from the database export. Lines written for the site rather than lifted from the document carry `_assumed` or a note saying so.
- **Standing lines** are not rewritten: All Grounds Floating · Even Rails → Smooth Tracks · Measured in silence. · Pure signal.
- Internal numbers (COGS, tooling, certification budgets) are present and flagged. Decide per page whether they survive to a public site.
