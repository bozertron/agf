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
| `content/sections/*.json` | The old site's database, one file per section version (`.v2`, `.v3` and so on are further versions of the same section). The suffix does not reliably mean older or newer: several versions share one timestamp, so the base/`.v2` split was an arbitrary tie-break. See "Which version the site uses" below. Raw rows in `content/raw/`. |
| `content/products/*.json` | The six products from the database. |
| `assets/` | Every image in the repo, catalogued: `renders/` (per product), `brand-boards/`, `concept-boards/`, `concepts/`, `prior-work/`, `section-backgrounds/`. `ASSETS.md` and `renders/RENDERS.md` describe each file; `assets.json` and `renders/renders.json` are the same data as JSON. Copy transcribed from the boards is in `ASSETS.md`. |
| `tools/build-content.py` | Composed the nine `content.json` files from `content/`. Re-running overwrites hand edits; only re-run to start over from the database. |
| `CONTENT-HARVEST.md` | The inventory written before the database was recovered, plus a note on what the recovery added. |
| `../REPO-MAP.md` | The whole-repo map: topic index, full file tree, open questions compiled from the content files. Start there when writing a spec. |
| `../archive/legacy-site/LEGACY-MAP.md` | Module-by-module map of the retired site, including the visualisations worth re-implementing and their data contracts. |
| `../agf-design-system/agf-design-system/` | The brand book and design system. `site/shared/agf.css` is a copy of its stylesheet; the folder is the source. |
| `../globl-radio-design-system/` | The Globl Radio sub-brand package (live streaming service), built on the AGF system. Open its `index.html`. |
| `../stereos-brand/` and `../BRAND-INTEGRATION.md` | The stereOS wordmark package and the plan for how AGF, stereOS and Globl Radio fit together. |

## Which version the site uses

The base file is not always the current one. Several versions of a section share one `updated_at` timestamp, so which one carries the `.v2` suffix was an arbitrary tie-break rather than a statement of age. `tools/build-content.py` therefore picks versions deliberately:

| Section | Base file | Used by the site | Why |
|---|---|---|---|
| artist-rights | `artist-rights.json` | `artist-rights.v2.json` | same timestamp; v2 carries `revenue_streams_heading` |
| business-model | `business-model.json` | `business-model.v2.json` | same timestamp; v2 adds `runway_heading`, `scaling_heading` |
| distribution | `distribution.json` | `distribution.v2.json` | same timestamp; v2 adds heading keys |
| founder | `founder.json` | `founder.v2.json` | same timestamp; v2 adds CTA and heading keys |
| concept-explainer | `concept-explainer.json` (an empty shell, 415 bytes) | `concept-explainer.v2.json` | only v2 holds the four "Why This Matters" modules |
| prelude | `prelude.json` | `prelude.v5.json` | v5 is the full three-square version; v1 to v4 are earlier drafts (v4 titled "Foundations - Products and Technologies") |
| tenet | `tenet.json` (July 14) | both | bodies from base, worked-example titles from `.v2` (July 6) |
| technology | `technology.json` (July 14) | both | base shown; `.v2` used to flag the patent-status conflict |

Every other section the generator reads (hero, footer, team-note, timeline, consolidation, overview, venue, competitive-positioning, launch-roadmap) is the base file; it has no other version that the site uses.

Not everything in the database was exported as page content. The `sections` table has 76 rows, and 37 of them are header rows titled "Test Duplicate" (all stamped `2026-07-06 08:21:02`); these were never exported and are not in `content/sections/`. The two hidden config rows, `comparison-config` and `pdf-config`, are exported (with `pdf-config.v2`) but are configuration for the old site's compare overlay and PDF export, not page content, and nothing in the new site reads them. The exported `header` rows have empty `nav_links`; `header.v2.json` holds the "Request the Deck" call to action and `header.v3.json` has only empty strings.

## Section types the renderer understands

`prose`, `quote`, `list`, `cards`, `table`, `spec`, `timeline`, `steps`, `compare`, `pipeline`, `metrics`, `figures`, `html`. See `site/shared/site.js` for the fields each one reads. Any section may carry `note` (a visible working note), `_assumed: true` (an "assumed" badge on its heading), `eyebrow`, `title`, `lede` and `id` (the anchor).

## Collaboration conventions

- **Working notes** are visible by default and can be hidden with the Notes button in the nav. They mark open questions and drafted-for-the-site lines. Delete the `note` key when a section is signed off.
- **Nothing is invented.** Copy comes from the database export. Lines written for the site rather than lifted from the document carry `_assumed` or a note saying so.
- **Standing lines** are not rewritten: All Grounds Floating · Even Rails → Smooth Tracks · Measured in silence. · Pure signal.
- Internal numbers (COGS, tooling, certification budgets) are present and flagged. Decide per page whether they survive to a public site.
