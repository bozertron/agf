# AGF repository map

Written 2026-10-27 for the founder, as a lookup table for writing website specs: pick a topic, open the files in the order given. Branch `claude/agf-brand-website-37qbgk`, HEAD `03a1e31`, 540 files tracked by git, working tree clean and no untracked files at the time of writing (this file is the only addition). All paths are relative to the repo root (`/home/user/agf`). Nothing in this map was invented: where a description rests on a filename rather than on reading the file, it says "appears to".

Contents: 1 Orientation · 2 Topic index (T01 to T24) · 3 Full file tree · 4 The nine site options · 5 Open questions carried in the content · 6 Known rough edges.

---

## 1. Orientation

### 1.1 What this repo is

AGF ("All Grounds Floating") is a premium audio brand. This repo holds everything known about it: the strategy document's text (recovered from the old site's database), every image, the brand book and design system, a working reference website that renders the strategy as nine "options", and the retired code of the earlier site. There is no production website yet; `production-staging/` is where it is being designed, and this map is for writing the specs for it.

### 1.2 The three trees

| Tree | Path | What it is | Status |
|---|---|---|---|
| Production staging | `production-staging/` | The one place for new work: reference site (`site/`), the old site's content as JSON (`content/`), every image catalogued (`assets/`), the generator script (`tools/`), the pre-recovery inventory (`CONTENT-HARVEST.md`). Start with `production-staging/README.md`. | Live working area |
| Design system | `agf-design-system/agf-design-system/` | The brand book and design system: voice, colour, type, space, texture, marks, 19 documented components, applications (CMF, packaging), motion. Open `index.html` there to see it. | The visual law |
| Archive | `archive/legacy-site/` | The retired schema-driven site (web site, in-page editor, PDF spec-sheet renderer, 22 JSON schemas, CSS). Read `LEGACY-MAP.md` there instead of the code. | Reference only, not run |

Also at the top level: `fonts/` (licensed source fonts with OFL licences and web woff2), `agf.db` (the SQLite database the content was exported from), and this file.

### 1.3 The two source-of-truth rules

1. **Copy: the `content.json` files are the editable copy.** Each option folder `production-staging/site/<slug>/content.json` holds all words for that option. `production-staging/content/` is the record of what the old database held; it is the evidence, not the working copy. `production-staging/tools/build-content.py` composed the nine `content.json` files from `content/`; re-running it overwrites hand edits. At the time of writing the nine files, `site.json` and the 19 page shells match the generator's output exactly (checked by running the script in a scratch copy and diffing), so no copy has been hand-edited yet.
2. **Look and feel: the design system is the visual law.** Where the old brand boards (`production-staging/assets/brand-boards/`), the legacy CSS (`archive/legacy-site/styles/`) or anything else disagree with `agf-design-system/agf-design-system/`, the design system wins. `production-staging/site/shared/agf.css` is a byte-identical copy of the design system's `agf.css`, and `site/shared/logos/` and `site/shared/icons/` are byte-identical copies of the design system's `assets/Logos/` and `assets/Icons/` (checked with `cmp`). The design-system folder is the source; if it changes, the copies must be refreshed by hand.

A third convention (from `production-staging/README.md`): the **standing lines are not rewritten** (see T14), nothing is invented (lines drafted for the site carry an `_assumed` badge or a note), and internal numbers (COGS, tooling, certification budgets) are present but flagged; decide per page whether they survive to a public site.

### 1.4 How to run the site

```sh
cd production-staging/site
./serve.sh            # runs python3 -m http.server 8787 from production-staging/
# open http://localhost:8787/site/
```

- Needs only `python3`. Browsers refuse to fetch JSON from `file://`, so opening the HTML files directly shows a "Content did not load" message.
- URLs: portal `/site/`; per option `/site/<slug>/intro.html` and `/site/<slug>/deep.html`; every deep section has an anchor `#<section id>`.
- The Notes button in the nav hides or shows the visible working notes (`note` fields); the choice is kept in the browser's `localStorage` key `agf-notes`.
- Editing: change a `content.json`, reload; pages fetch with `cache: 'no-store'`.
- The design system needs no server: open `agf-design-system/agf-design-system/index.html` (it has a Midnight / Daylight / Air switch); each `components/<Name>/preview.html` also opens alone.
- Do not re-run `python3 -I production-staging/tools/build-content.py` unless you mean to start over from the database export.

### 1.5 How the reference site works (for specs)

- 19 page shells (`index.html` plus `intro.html` and `deep.html` per option), each an 18-line file with an empty `<header id="nav">`, `<main id="main">`, `<footer id="foot">` and one script, `site/shared/site.js` (241 lines, no dependencies). The script reads `site/site.json` (the manifest) and the option's `content.json`, then builds nav, body and footer.
- The theme is fixed to Midnight (`data-theme="midnight"` on every page); there is no Daylight or Air variant in the site yet.
- `content.json` shape: `intro` (headline, lede, `points` x3, `metrics`, optional `metrics_note`, `quote`, optional `note`) and `deep` (headline, lede, optional `note`, ordered `sections`).
- Section types the renderer understands: `prose`, `quote`, `list`, `cards`, `table`, `spec`, `timeline`, `steps`, `compare`, `pipeline`, `metrics`, `figures`, `html`. Any section may carry `id` (anchor), `eyebrow`, `title`, `lede`, `note` (visible working note), `_assumed: true` (an "assumed" badge on the heading). `figures` sources are written `assets/...` and resolve against `production-staging/assets/`.
- Text supports `**bold**`, `*italic*`, blank line = paragraph, newline = line break; `→` is wrapped for styling.
- The `intro` blocks (three points, metrics, quote) are composed text, lifted and edited from the sections listed in section 4; the `deep` sections follow the database fields closely.

### 1.6 Suggested reading order for a spec writer

1. `agf-design-system/agf-design-system/README.md` (voice, colour, type, marks) then `02-applications.md` and `03-motion.md`.
2. `production-staging/README.md`, then the portal in a browser, then each option's intro and deep page.
3. This map's section 5 (open questions) and section 6 (rough edges) before deciding what is settled.
4. `archive/legacy-site/LEGACY-MAP.md` section 8.1 for visualisations to carry forward (T23).

---

## 2. Topic index

Each topic lists the files to open, in order, with one line on what each contributes. `PS` = `production-staging`, `DS` = `agf-design-system/agf-design-system` appear only in the compact tables (T05, T06, T20); everywhere else full paths are given. Section files named `x.v2.json` are alternate database versions (see rough edge R10).

### T01 · Brand and tenets

1. `production-staging/site/brand/content.json` — option 01 copy: intro (name / posture / model points, three structural-count metrics, B&O quote) and seven deep sections: `thesis`, `prelude`, `lineage`, `tenets`, `boards`, `standing-lines`, `divisions`.
2. `production-staging/content/sections/tenet.json` — the six operating tenets, July 14 version: title, anchor phrase, first-person body, key insight.
3. `production-staging/content/sections/tenet.v2.json` — July 6 version: older wording, worked-example titles (the site adds these as a "Worked example" line on each card), and the other key-insight wording for tenet 6.
4. `production-staging/content/sections/hero.json` — headline "All Grounds Floating" and the thesis paragraph (`subheadline`).
5. `production-staging/content/sections/team-note.json` — the team note on Bang & Olufsen as the model ("Experience and Timing, meet Preparation and Opportunity"), shown as `lineage`.
6. `production-staging/content/sections/prelude.v5.json` — the full prelude: the founder's "every side of the fence" intro plus three squares (consumer audio is an old market where veterans have "seen it all"; ad-spend is a crippling obligation for a start-up; the strategy must be sticky and defensible), shown as `prelude`.
7. `agf-design-system/agf-design-system/README.md` — opening paragraph: the three divisions AGF // HEAR (consumer), AGF // FIELD (professional capture), AGF // AIR (broadcast) and the printed-circuit-board brand idea.
8. `agf-design-system/agf-design-system/02-applications.md` — "The three divisions" table (theme, substrate, signature detail per division).
9. `production-staging/assets/brand-boards/agf-master-design-system-board-portrait.png` — AI board with the three-division tier system and "The forest holds the gold"; its transcribed copy is in `production-staging/assets/ASSETS.md` (heading "brand-boards/agf-master-design-system-board-portrait.png"). Superseded by the design system.

### T02 · The thesis / the name

1. `production-staging/content/sections/hero.json` — `subheadline` is the thesis, verbatim: "When you listen to music, you're hearing your power supply." plus the tubes / digital / "plant our flag" lines.
2. `production-staging/site/brand/content.json` — intro point "The name" and deep section `thesis` (carries a note that the same paragraph is the pitch for BT'N-Tech).
3. `production-staging/site/site.json` — `brand.portal_headline` ("The forest holds the gold.") and `brand.portal_lede` (the thesis paragraph on the portal).
4. `agf-design-system/agf-design-system/README.md` — first paragraph defines a floating ground ("isolates a circuit from the noise of common earth") as the brand idea.
5. `production-staging/assets/ASSETS.md` — the master board's body copy on the floating ground (heading "brand-boards/agf-master-design-system-board-portrait.png").
6. `production-staging/content/sections/technology.json` — BT'N-Tech entry: the power-supply argument carried into a technology (per the note on the brand `thesis` section).

### T03 · The opportunity and "history rhymes"

1. `production-staging/site/opportunity/content.json` — option 02 copy: intro (Then / Now / The outlier; B&O peak $853M, B&O now $402M, Samsung buys Harman $8.35B) and seven deep sections: `then`, `now`, `rhymes`, `consolidation`, `why-it-matters`, `at-a-glance`, `summary`.
2. `production-staging/content/sections/timeline.json` — source: two eras (Then 1978–1991, 4 events; Now 2014–2026, 5 events), three comparison rows (Mass Market Channels, Specialty retail, The Outlier), auto-flip interval.
3. `production-staging/content/sections/overview.json` — "At a Glance": $4.2B premium-audio TAM, 12+ brand acquisitions, 6 proprietary technologies, 50/50 artist split (the TAM and acquisition count are unsourced; see section 5).
4. `production-staging/content/sections/concept-explainer.v2.json` — "Why This Matters": four modules (The Sweet Spot Problem, The Consolidation Opportunity, Artist-First Economics, Retail as Community). `concept-explainer.json` is an empty shell.
5. `production-staging/content/sections/prelude.v5.json` — market framing that precedes the opportunity.
6. `archive/legacy-site/LEGACY-MAP.md` section 8.1 item 10 — the old two-era auto-flip pattern, if you want to carry it over.

### T04 · Consolidation data

1. `production-staging/content/sections/consolidation.json` — eight acquisition rows (acquirer, target brands, `value_usd`, `date`, `type`, `source_url`): five have a disclosed value, three do not (Sony Interactive Entertainment, Bose, Loewe), every `date` is empty and only the Samsung/Harman row has a `source_url`; `independent_heading` and `independent_intro` are empty strings and there is no independents list.
2. `production-staging/site/opportunity/content.json` — deep section `consolidation`: the table as shown (Acquirer, Brands acquired, Value), with a note that dates and links are blank (see R9).
3. `production-staging/content/sections/timeline.json` — the "Now" era events (GoerTek, IAG, HSG and Cosonic consolidation; Krell; B&O) that the table supports.
4. `production-staging/content/sections/footer.json` — `source_text`: the list of sources (B&O annual reports, Samsung/Harman, Bose, Barco, Gentex, Masimo, HSG, Cosonic, Sony, BLS CPI, magazines); reused in `production-staging/site/site.json` as `brand.sources`.
5. `archive/legacy-site/LEGACY-MAP.md` sections 6.2 (consolidation schema) and 8.1 item 13 — how the old table adapted its columns.

### T05 · The technology stack

Files, in order:

1. `production-staging/content/sections/technology.json` — July 14 version: six technologies (full name, tagline, patent status, key capabilities, competitive advantage; l'Art also has the five-stage `codec_pipeline`), the shared `codec_diagram` (Capture, Codec, Decode, Render, Experience), and the `lart_stack` block ("Flawless implementation of stereo").
2. `production-staging/content/sections/technology.v2.json` — July 6 version: adds lines the site does not show (see the note under stack in section 5).
3. `production-staging/site/stack/content.json` — option 03 copy: intro (l'Art, BT'N-Tech, stereOS points; metrics 6 / 5 / <30 Hz) and deep sections `in-one-breath`, `pipeline`, `technologies`, `lart-stages`.
4. `production-staging/content/products/*.json` — each product's `agf_technologies` list says which technologies it carries (table below).
5. `production-staging/assets/ASSETS.md` — board copy that names l'Art codecs, stereOS and the RF transmitter (headings "concept-boards/wasted-real-estate-earbud-case-board.webp" and "concept-boards/stereos-live-to-global-village-case-ad.webp").
6. `archive/legacy-site/LEGACY-MAP.md` section 8.1 item 5 — the old signal-flow strip (IN → stereOS → l'Art → BT'N-Tech → l'espacI/O → FRC41 → No-Nails → OUT).

The six technologies (signal-flow order used by the old site is stereOS, l'Art, BT'N-Tech, l'espacI/O, FRC41, No-Nails; the database lists them in the order below):

| # in `technology.json` | Technology | Full name in database | Tagline | Status (July 14) | Carried by |
|---|---|---|---|---|---|
| 1 | l'Art | l'Art — Acoustic Teleportation | Acoustic teleportation, not surround-sound. | Trade secret | Core-like All-in-One (Small), Core-like All-in-One (Soundbar), The Instrument |
| 2 | stereOS | stereOS — Global OS for Performing Arts | The global operating system for performing arts. | Trade secret | Over-Ear, Core-like All-in-One (Small), Core-like All-in-One (Soundbar), The Instrument, Wasted Real-Estate |
| 3 | BT'N-Tech | BTN-Tech — Bring Tha' Noise Technologies | Bring Tha' Noise Technologies. | Patent pending | Over-Ear, Core-like All-in-One (Small), Core-like All-in-One (Soundbar), The Symphony Macro-System, The Instrument |
| 4 | l'espacI/O | l'espacI/O — Spatial I/O | Room tone, weaponized. | Trade secret | Core-like All-in-One (Small), Core-like All-in-One (Soundbar), The Symphony Macro-System, The Instrument |
| 5 | FRC41 | FRC41 — Front Row Center For One | Front Row Center For One. | Patent pending | Over-Ear, The Instrument, Wasted Real-Estate |
| 6 | No-Nails | No-Nails Engineering Process & Mercy Catch-All | To a hammer, every problem looks like a nail; No engineering domain-hammers allowed. | Trade secret | Core-like All-in-One (Small), Core-like All-in-One (Soundbar), The Symphony Macro-System, The Instrument |

### T06 · The six products

Source of each: `production-staging/content/products/<slug>.json` (the database record, with specs), shown in `production-staging/site/lineup/content.json` as a card in `the-line` and a spec table `spec-<slug>`. Raw rows: `production-staging/content/raw/products.json`. Price, time-to-market (TTM) and COGS are internal planning numbers.

| Product | Category · status | ASP · TTM · COGS | Technologies carried | Tagline (truncated) |
|---|---|---|---|---|
| Over-Ear — Home Centric (`over-ear-home-centric`) | headphone · development | $599–$799 · 4–6 mo · $100–$150 | stereOS, BT'N-Tech, FRC41 | A charging dock supporting 6 pairs of headphones concurrently with an RF connection defaulting to the dock. Single-action clean … |
| Core-like All-in-One (Small) (`core-all-in-one-small`) | speaker · concept | $799 · 8–12 mo · $100–$150 | l'Art, stereOS, BT'N-Tech, l'espacI/O, No-Nails | Physically unobtrusive room-filling speaker. Slightly smaller than the original Core, bigger sound. Matte copper plated … |
| Core-like All-in-One (Soundbar) (`core-all-in-one-soundbar`) | soundbar · concept | $1,199–$1,499 · 8–12 mo · $100–$150 | l'Art, stereOS, BT'N-Tech, l'espacI/O, No-Nails | Primary soundbar in 50–100m² rooms. Higher power than the small variant. Same 8-transducer driver config (4 custom coaxial + 4 LF … |
| The Symphony Macro-System (`symphony-macro-system`) | macro-system · concept | $2,990 · 8–12 mo · $100–$200 | BT'N-Tech, l'espacI/O, No-Nails | A historical rhyme on the mini-system fad of the 80s and 90s. Tall (150cm), under 20cm deep, 36cm wide. True full-range … |
| The Instrument — Flagship Reference (`the-instrument`) | flagship · concept | $5,000–$6,500 · 8–12 mo · not set | l'Art, stereOS, BT'N-Tech, l'espacI/O, FRC41, No-Nails | A pre-amp that presents as an acoustic measurement instrument, an aspirational audiophile reference, AND a mixing/mastering … |
| Wasted Real-Estate (`wasted-real-estate`) | earbud · concept | not set · not set · not set | FRC41, stereOS | Why are AirPod cases filled with plastic? Look at the physical volume when closed — not a whole lot different from a small … |

| Product | Database record | Reference-site card and spec | Images |
|---|---|---|---|
| Over-Ear | `production-staging/content/products/over-ear-home-centric.json` | `production-staging/site/lineup/content.json` ids `the-line` (card) and `spec-over-ear-home-centric` | 4 renders in `production-staging/assets/renders/over-ear-home-centric/` |
| Core-like All-in-One (Small) | `production-staging/content/products/core-all-in-one-small.json` | `production-staging/site/lineup/content.json` ids `the-line` (card) and `spec-core-all-in-one-small` | none |
| Core-like All-in-One (Soundbar) | `production-staging/content/products/core-all-in-one-soundbar.json` | `production-staging/site/lineup/content.json` ids `the-line` (card) and `spec-core-all-in-one-soundbar` | none |
| The Symphony Macro-System | `production-staging/content/products/symphony-macro-system.json` | `production-staging/site/lineup/content.json` ids `the-line` (card) and `spec-symphony-macro-system` | 18 files in `production-staging/assets/renders/symphony-macro-system/` (R1) |
| The Instrument | `production-staging/content/products/the-instrument.json` | `production-staging/site/lineup/content.json` ids `the-line` (card) and `spec-the-instrument` | none |
| Wasted Real-Estate | `production-staging/content/products/wasted-real-estate.json` | `production-staging/site/lineup/content.json` ids `the-line` (card) and `spec-wasted-real-estate` | concept board and ad in `production-staging/assets/concept-boards/`; two CAD case renders in `production-staging/assets/prior-work/` |

Also open: `production-staging/content/sections/business-model.v2.json` (`runway_table`, the six-row cost / price / TTM summary) and `production-staging/content/sections/launch-roadmap.json` (sequence). Option page: `production-staging/site/lineup/content.json` (intro: "Six products. One platform where it pays."; deep ids `the-line`, `renders`, `also-on-the-bench`, six `spec-*`, `runway`). Old-site spec sheet logic: `archive/legacy-site/LEGACY-MAP.md` section 4.11 and 8.1 item 15.

### T07 · The venue

1. `production-staging/site/venue/content.json` — option 05 copy: intro (the three zones as points; one venue per qualifying market, 100% donations to artists, 50/50 broadcast split) and deep sections `zones`, `boards`, `journey`, `customer`, `royalties`, `virtual-ticket`, `financial-model`, `cultural-positioning`.
2. `production-staging/content/sections/venue.json` — source: concept, three zones (Front of House, The Balcony, The Green Room) with journey step, features, atmosphere; customer journey; target customer; royalty structure; virtual ticket; financial model (philosophy, qualification rule, revenue streams); cultural positioning.
3. `production-staging/assets/concept-boards/venue-three-panel-board-front-of-house-balcony-green-room.webp` — three-panel AI board of the zones.
4. `production-staging/assets/concept-boards/venue-bar-stage-photo-with-copy-overlay.webp` — stock-style venue photo with overlay copy.
5. `production-staging/assets/concept-boards/venue-balcony-marble-control-surface-concept.webp` — the Balcony's marble control surface, virtual tickets and live-to-air tiles.
6. `production-staging/assets/section-backgrounds/venue-background.webp` — AI jazz-venue interior with a copper AGF sign (the only section background left).
7. `production-staging/assets/ASSETS.md` — transcribed copy of the three venue boards (headings under "Copy on the boards").
8. `production-staging/content/sections/launch-roadmap.json` — `venue_pilots` (five pilots and their selection criteria) and `production-staging/content/sections/distribution.v2.json` channel type "AGF Flagship Venues".

### T08 · Artist rights

1. `production-staging/site/artists/content.json` — option 06 copy: intro (three ownership tiers as points; 100% stereo master, 50/50 broadcast, 0 cause needed to block) and deep sections `philosophy`, `tiers`, `enforcement`, `revenue-streams`.
2. `production-staging/content/sections/artist-rights.v2.json` — the version the site uses: philosophy, three ownership tiers (Standard Stereo artist-owned; l'Art Patented Version AGF-owned; Broadcast-Mixed Version 50/50), enforcement (device lockout, legal remedies, social deterrent), six revenue streams with splits, plus `revenue_streams_heading`.
3. `production-staging/content/sections/artist-rights.json` — the other row with the same timestamp (no stream heading).
4. `production-staging/content/sections/venue.json` — `royalty_structure` and `virtual_ticket` (the venue's side of the same rights).
5. `archive/legacy-site/schemas/artist-rights.schema.json` and `archive/legacy-site/LEGACY-MAP.md` section 6.2 — field-level definitions.

### T09 · Business model

1. `production-staging/site/business/content.json` — option 07 copy, deep ids `pricing`, `channel`, `revenue-model`, `scaling` (then distribution and positioning, T10 and T11).
2. `production-staging/content/sections/business-model.v2.json` — pricing strategy ("The Budgeted Total Package"), channel approach ("The Bose-Like Third-Party"), runway table (six products), revenue model, scaling timeline and headings.
3. `production-staging/content/sections/business-model.json` — the other row with the same timestamp (lacks `runway_heading` and `scaling_heading`).
4. `production-staging/site/lineup/content.json` — deep section `runway` (table of TTM, COGS, ASP per product) and the six `spec-*` tables (COGS, ASP, TTM, certifications).
5. `production-staging/content/products/*.json` — `business.asp_usd`, `cogs_usd`, `ttm_months`, `certifications`, `cert_cost_estimate_usd`, `tooling_cost_usd`, `target_volume_monthly`.
6. `production-staging/content/sections/overview.json` — headline TAM figure (unsourced).

### T10 · Distribution

1. `production-staging/site/business/content.json` — deep ids `distribution`, `partner-criteria`, `territories`, `channel-types`, `distribution-revenue`.
2. `production-staging/content/sections/distribution.v2.json` — philosophy ("the future bank-roller"), five weighted partner criteria, five territories with priority (North America, Western Europe, Japan, East Asia, Australia / NZ), five channel types (Specialty Hi-Fi, Custom Install, AGF Flagship Venues, Performing-Arts Franchises (Wave 2), D2C / Owners Portal), revenue model.
3. `production-staging/content/sections/distribution.json` — other row, same timestamp (no territories heading).
4. `production-staging/content/sections/business-model.v2.json` — `channel_approach` (partner types and target partners).
5. `archive/legacy-site/LEGACY-MAP.md` section 8.1 item 13 — the old weight-bar and priority-badge patterns.

### T11 · Competitive positioning

1. `production-staging/content/sections/competitive-positioning.json` — intro, six rows (Bang & Olufsen, Krell, Focal, Burmester, Dan D'Agostino, and AGF itself; each with status, price, prestige score, data points, "opening"), summary, and the `_viz_config` for the perceptual map (log price against prestige).
2. `production-staging/site/business/content.json` — deep ids `competitive-positioning` (cards; the chart itself is queued) and `summary` ("The seam").
3. `production-staging/site/opportunity/content.json` — B&O (peak, then decline) and Krell (closed June 2024, reopening) events in `then`, `now` and `rhymes`.
4. `archive/legacy-site/components/positioning-chart.js` — the old perceptual map code; contract in `archive/legacy-site/LEGACY-MAP.md` section 4.1; porting advice in section 8.1 item 1.
5. `production-staging/content/products/*.json` — `competitive_reference` on each product (comparable products, price positioning, key differentiators).

### T12 · Launch roadmap

1. `production-staging/site/roadmap/content.json` — option 08 copy: three phases, 24 months, five venue pilots, 1,000 pieces a month; deep ids `phases`, `pr-levers`, `venue-pilots`, `year-one`, `beyond`.
2. `production-staging/content/sections/launch-roadmap.json` — source: six phase rows (start slot, duration, TTM, rationale, milestones), two PR stunts, venue pilots (count 5), year-one targets, Gantt `_viz_config`.
3. `production-staging/content/sections/business-model.v2.json` — `scaling_timeline` ("Phased rollout", used in `beyond`).
4. `archive/legacy-site/components/roadmap-chart.js` — the old Gantt; contract in `archive/legacy-site/LEGACY-MAP.md` section 4.2; porting advice in section 8.1 item 2.

### T13 · Founder and mentors

1. `production-staging/site/founder/content.json` — option 09 copy: deep ids `milestones`, `prior-work`, `companies`, `mentors`, `now-what`.
2. `production-staging/content/sections/founder.v2.json` — Benjamin Webster, Founder & CEO; domain-depth years; milestones from childhood to AGF's founding; ten mentors (name, contribution, relationship: grandfather in Winnipeg, "old hands" from the teenage years, the first wave of chip-amp designers, Toronto sound-effects editors, David Jaeger, David "Stretch" Quinney, Alan Simmons, Chip Taylor, Justin Kan, Dan D'Agostino); four key companies (NMI Devices, Mass Fidelity, Dolby skunkworks, AGF); call to action ("Request the Deck").
3. `production-staging/content/sections/founder.json` — other row, same timestamp (no headings or CTA keys).
4. `production-staging/assets/prior-work/` and `production-staging/assets/prior-work/mass-fidelity/` — images of earlier products (T21).
5. `production-staging/content/sections/prelude.v5.json` — the founder's "every side of the fence" opening.

### T14 · Standing lines and voice rules

Standing lines: **All Grounds Floating** (strapline under the mark), **Even Rails → Smooth Tracks** (nav tagline), **Measured in silence.** (certificate headline), **Pure signal.** (campaign tagline). Plus the thesis paragraph (T02).

1. `agf-design-system/agf-design-system/README.md` — section "Voice": engineer-who-loves-music tone, every number with its conditions, sentence case, no exclamation marks / emoji / "premium", division-code and product-name format (`AGF // FIELD`, F-1, № F1-00017); names two standing lines and the "Pure signal." tagline.
2. `production-staging/site/site.json` — `brand` block: `strapline`, `nav_tagline` ("Even Rails → Smooth Tracks"), `certificate_line`, `tagline`, portal copy and the "Standing lines" portal note.
3. `production-staging/README.md` — "Collaboration conventions": standing lines are not rewritten, nothing invented, working notes.
4. `production-staging/site/brand/content.json` — deep section `standing-lines` (flagged `_assumed`; note: "design system fixed three of these; the fourth came from the document's header").
5. `production-staging/content/sections/header.json` — origin of "Even Rails → Smooth Tracks" (`tagline`); `production-staging/site/opportunity/content.json` — the same phrase used as the eyebrow of the `rhymes` comparison (it was the comparison heading in the old document, per `production-staging/CONTENT-HARVEST.md` section 3).
6. `agf-design-system/agf-design-system/components/Certificate/README.md` and `agf-design-system/agf-design-system/02-applications.md` ("Packaging and the box") — where "Measured in silence." is used.
7. `agf-design-system/agf-design-system/preview-cover.png` and `agf-design-system/agf-design-system/components/Cover/preview.html` — "Pure signal." on the cover.
8. `production-staging/assets/ASSETS.md` and `production-staging/CONTENT-HARVEST.md` section 5 — other straplines from the AI boards ("Sound Connects Everything.", "Higher fidelity, a broader world.", "Sound moves humanity forward.", and so on); these are draft, not canon.
9. `production-staging/CONTENT-HARVEST.md` section 3 and `archive/legacy-site/LEGACY-MAP.md` section 9.3 — the hard-coded sentences of the old site's voice that survived outside the database.

### T15 · Colour and themes

1. `agf-design-system/agf-design-system/README.md` — section "Colour": three themes (Midnight default, Daylight paper, Air OLED), brass roles (`brass`, `brass-text`, `brass-glow`, `brass-specular`, `brass-hairline`), signal colours, text-contrast rules.
2. `agf-design-system/agf-design-system/tokens.json` — every colour token with its value per theme and usage note (`color.themes`, `color.tokens`).
3. `agf-design-system/agf-design-system/tokens.css` — the same as CSS custom properties; `agf-design-system/agf-design-system/agf.css` is the one file to link (fonts embedded).
4. `agf-design-system/agf-design-system/index.html` — the showcase with the theme switch; contact sheets `agf-design-system/agf-design-system/preview-midnight.png`, `preview-daylight.png`, `preview-air.png`, `preview-cover.png` (same folder).
5. `agf-design-system/agf-design-system/02-applications.md` — "CMF" list: hex values with Pantone and material for each brand colour.
6. `production-staging/site/shared/agf.css` — the copy the reference site uses; `production-staging/site/shared/site.css` composes only tokens.
7. `archive/legacy-site/LEGACY-MAP.md` section 7.4 — table mapping old colour names (`--forrest`, `--gold`, `--taupe`) to the new tokens, and the two same-name conflicts (`--ink`, `--type-micro`).

### T16 · Typography

1. `agf-design-system/agf-design-system/README.md` — section "Typography": Monoton (the mark only), Poiret One (the reserved strapline voice, uppercase, tracked), Commissioner (everything else), the size scale and Commissioner's FLAR / VOLM axes.
2. `agf-design-system/agf-design-system/tokens.json` — `type.groups` (mark-mega 96, mark 48, strapline sizes, mega, display, h3, lede ...) with usage lines; also `tracking`.
3. `agf-design-system/agf-design-system/components/Heading/README.md` and `components/Wordmark/README.md` — the standard headline stack and the lockup.
4. `fonts/` — licensed sources: `fonts/Commissioner/Commissioner-Variable.ttf` (4-axis variable) and nine static weights in `fonts/Commissioner/static/`; `fonts/Monoton/Monoton-Regular.ttf`; `fonts/PoiretOne/PoiretOne-Regular.ttf`; web builds in `fonts/web/*.woff2` (identical to `agf-design-system/agf-design-system/fonts/*.woff2`); licences in `fonts/licenses/OFL-*.txt`.
5. `archive/legacy-site/LEGACY-MAP.md` section 7.4 — old type-scale versus new (including the 16 px versus 11 px `micro` conflict).
6. `production-staging/assets/brand-boards/agf-brand-board-landscape-design-system.png` — early AI typography panel; superseded.

### T17 · Motion

1. `agf-design-system/agf-design-system/03-motion.md` — the whole motion spec: one damped curve `cubic-bezier(0.16, 1, 0.3, 1)`, reveal (rise 24px, 700ms, 60ms stagger), parallax 0.6x, orbital rings 0.5 rpm, stroke draws, meters at 30 fps, 300ms controls, ON AIR pulse, reduced-motion rules.
2. `agf-design-system/agf-design-system/components/bundle.css` — defines `--ease-damped`.
3. `production-staging/site/shared/site.js` — what the reference site implements: reveal on scroll (`data-reveal`), table-of-contents highlight, Notes toggle; `production-staging/site/shared/site.css` has the reveal and reduced-motion rules.
4. `agf-design-system/agf-design-system/components/Hero/README.md` and `components/Readout/README.md` — scroll-reveal / parallax on the hero and the turning rings.
5. `archive/legacy-site/LEGACY-MAP.md` sections 5 and 8.1 item 11 — old scroll behaviours (reveal, counters, scroll progress, hero parallax) and what to retime. Note the legacy ease curve differs from the new one (section 7.4).

### T18 · Logos and icons

1. `agf-design-system/agf-design-system/assets/Logos/` — `agf-mark.svg` (primary mark), `agf-lockup.svg` (mark plus strapline), `agf-seal.svg` (gifts, foils), `floating-ground.svg` (the badge); rules in `assets/Logos/README.md`.
2. `agf-design-system/agf-design-system/assets/Icons/` — ten line icons (mic, headphones, waveform, broadcast, record, play, gain, ground, phantom, spark); rules in `assets/Icons/README.md`.
3. `agf-design-system/agf-design-system/README.md` — section "Marks and assets" (minimum sizes, one badge per object) and `components/Wordmark`, `components/Seal`, `components/FloatingGround` READMEs.
4. `agf-design-system/agf-design-system/preview-marks.png` — contact sheet of mark, lockup, seal and the ten icons.
5. `production-staging/site/shared/logos/` and `production-staging/site/shared/icons/` — identical copies used by the reference site (with their READMEs).

### T19 · Hardware CMF and packaging

1. `agf-design-system/agf-design-system/02-applications.md` — CMF list (colour, material, finish with Pantone and process), hardware rules (faceplate, knobs, the brass ground-lift switch, embedded displays), packaging and the box (certificate, reveal order), gifts.
2. `agf-design-system/agf-design-system/components/Faceplate/README.md`, `components/Sleeve/README.md`, `components/Certificate/README.md`, `components/Knob/README.md`, `components/Meter/README.md` — the hardware and packaging components.
3. `production-staging/assets/brand-boards/agf-packaging-measured-in-silence-card.jpeg` — AI packaging exploration (box lid, certificate card).
4. `production-staging/assets/concepts/material-moods/` — 14 AI material mood images (walnut, copper, marble, glass); each described in `production-staging/assets/renders/renders.json` (product `concepts/material-moods`).
5. `production-staging/assets/concepts/` — wall plates with brass knobs, a marble media console, a copper-wire waveform sculpture; described in `production-staging/assets/ASSETS.md` (section "Concepts").
6. `production-staging/content/products/*.json` — `form_factor` (dimensions, materials, finish, variants) per product.

### T20 · Images of each product

Catalogues: `production-staging/assets/ASSETS.md` and `assets.json` (brand boards, concept boards, concepts, prior work, section backgrounds, seven Symphony PNGs); `production-staging/assets/renders/RENDERS.md` and `renders/renders.json` (96 images: product renders plus relocated Mass Fidelity renders and material moods). `renders.json` `path` fields are authoritative for location.

| Product | Where its images are |
|---|---|
| Over-Ear — Home Centric | `production-staging/assets/renders/over-ear-home-centric/` — 4 files: `over-ear-headphones-matte-black-copper-<view>-<n>.jpg` (front, front three-quarter, earcup close-up, side three-quarter), 1000x1000, on a silver head form. Two unbranded over-ear concept images (`concepts/over-ear-headphones-tan-pad-silver-shell-concept.png`, `concepts/over-ear-headphones-black-red-pair.png`) are catalogued as "not AGF database products". |
| Core-like All-in-One (Small) | none |
| Core-like All-in-One (Soundbar) | none |
| The Symphony Macro-System | `production-staging/assets/renders/symphony-macro-system/` — 18 files in two overlapping sets (R1): 11 `symphony-tower-<finish>-<view>-<n>.jpg` (catalogue: `renders/RENDERS.md`, `renders/renders.json`) and 7 `symphony-tower-<finish>-front.png` / `-driver-closeup.png` (catalogue: `ASSETS.md`, `assets.json`). Related but not catalogued as Symphony: `concepts/home-theatre-green-brass-wall-speakers-usb-audio.webp` (AI room with two tall green-and-brass wall speakers). |
| The Instrument — Flagship Reference | none. The nearest objects are the unassigned desktop amplifier renders below. |
| Wasted Real-Estate | `production-staging/assets/concept-boards/wasted-real-estate-earbud-case-board.webp` (the product board; copy transcribed in `ASSETS.md`), `production-staging/assets/concept-boards/stereos-live-to-global-village-case-ad.webp`, and the Dolby-era CAD cases `production-staging/assets/prior-work/round-earbud-case-with-earbuds-paul-simon-screen.png` and `round-earbud-case-dolby-logo-lid-kod-screen.png`. |
| Objects with renders but no database entry (lineup page "Also on the bench") | `production-staging/assets/renders/studio-microphone/` (7 files, finished renders of a large-diaphragm mic in a shock mount and boom arm), `renders/broadcast-microphone/` (3 grey-box CAD files), `renders/control-surface/` (3 grey-box CAD files, keyboard-format with hinged panel), `renders/desktop-stereo-amp/` (8 files: black and silver faceplates, with and without an AGF logo, rear panels). Plus `production-staging/assets/concepts/keyboard-control-surface-knobs-faders-grey-cad.png`. |
| Not AGF products (earlier company) | Mass Fidelity USB and portable DAC renders: `production-staging/assets/prior-work/mass-fidelity/` (T21). |
| Moods, not products | `production-staging/assets/concepts/material-moods/` (14), `production-staging/assets/concepts/analog-*` (3 wall plates), `marble-media-console-projector-screen-planters.png`, `waveform-sculpture-copper-wire-teal-patina.png`, `agf-usb-audio-dac-copper-knob-walnut-shelf.webp`. |

### T21 · Prior work: Mass Fidelity, Remora, the Dolby case

1. `production-staging/site/founder/content.json` — deep section `prior-work` (four images with captions; note: "Renders carry Mass Fidelity and Dolby marks. Check rights before any of these go public.") and `companies`.
2. `production-staging/content/sections/founder.v2.json` — milestones and key companies (Mass Fidelity 2010s, Core and Relay; Dolby skunkworks mid-2010s).
3. **Mass Fidelity**: `production-staging/assets/prior-work/mass-fidelity/` (46 files: USB DAC variants, angles and finishes; portable DAC; see `renders.json` entries with product `prior-work/mass-fidelity`; RENDERS.md lists them under the heading "mood-boards") plus five files at `production-staging/assets/prior-work/`: `massfidelity-dac-black-copper-slider-render.png`, `massfidelity-usb-audio-dac-black-gold-render.png`, `massfidelity-usb-audio-dac-green-brass-render.jpg`, `usb-audio-dac-copper-knob-rear-ports-render.jpg`, `usb-audio-dac-exploded-assembly-drawing.png`.
4. **Remora** (Dolby behind-the-TV speaker): `production-staging/assets/prior-work/remora-speaker-on-tv-rear-render.png`, `remora-driver-layout-spec-diagram.png` (12 racetrack drivers, 4 subwoofers, 4 passive radiators), `remora-driver-layout-cutaway-render.png`, `remora-exploded-mount-diagram.png`.
5. **Dolby earbud case** (the concept that became Wasted Real-Estate): `production-staging/assets/prior-work/round-earbud-case-with-earbuds-paul-simon-screen.png` and `production-staging/assets/prior-work/round-earbud-case-dolby-logo-lid-kod-screen.png`; then `production-staging/assets/concept-boards/wasted-real-estate-earbud-case-board.webp` and `production-staging/content/products/wasted-real-estate.json`.
6. `production-staging/assets/ASSETS.md` — descriptions and on-image text of all prior-work files; `production-staging/CONTENT-HARVEST.md` section 6 for the original inventory.

### T22 · AI boards and their transcribed copy

AI-generated imagery; text on it is often garbled and the transcriptions mark garbles `[sic]`. Treat as draft, not canon (the design system supersedes the brand boards).

1. `production-staging/assets/ASSETS.md` — heading "Copy on the boards": verbatim transcription for each of the nine boards, then "Copy on other images".
2. Brand boards (`production-staging/assets/brand-boards/`): `agf-brand-board-landscape-design-system.png`, `agf-brand-board-mark-palette-merch.jpeg`, `agf-master-design-system-board-portrait.png`, `agf-packaging-measured-in-silence-card.jpeg`.
3. Concept boards (`production-staging/assets/concept-boards/`): `wasted-real-estate-earbud-case-board.webp` (modes, specs, $299 accessory versus $799 investment), `stereos-live-to-global-village-case-ad.webp`, and the three venue boards (T07).
4. `production-staging/assets/assets.json` — the same descriptions as JSON.
5. `production-staging/CONTENT-HARVEST.md` section 5 — summary of the board copy; section 4 — names fixed by the old site.

### T23 · The old site's visualisations worth re-implementing

Read `archive/legacy-site/LEGACY-MAP.md` section 8.1 ("Worth porting (15)") and the data contracts in its section 4. Fifteen items, with the code to read and the data that now feeds each:

| # | What | Code to read first | Data in this repo |
|---|---|---|---|
| 1 | Competitive perceptual map (log price against prestige, AGF highlighted) | `archive/legacy-site/components/positioning-chart.js` | `production-staging/content/sections/competitive-positioning.json` |
| 2 | Launch roadmap Gantt (swimlanes, typed milestone dots) | `archive/legacy-site/components/roadmap-chart.js` | `production-staging/content/sections/launch-roadmap.json` |
| 3 | Side-by-side product compare overlay with winner highlight and price bar | `archive/legacy-site/components/product-compare.js` | `production-staging/content/sections/comparison-config.json` plus `production-staging/content/products/*.json` |
| 4 | "Build Your System" configurator (signal-chain lanes, companion hints, running total) | `archive/legacy-site/components/system-configurator.js` (split version in `components/system-configurator/`) | `system_config` inside each `production-staging/content/products/*.json` |
| 5 | Technology signal-flow strip | `archive/legacy-site/components/tech-flow.js` | `_viz_config.tech_flow_order` in each product file |
| 6 | Driver arrangement diagram (size-scaled, material-coloured) | `archive/legacy-site/components/driver-diagram.js` | `audio.drivers` in the product files (5 of 6 have drivers) |
| 7 | Power gauge (arc, bar or meter) | `archive/legacy-site/components/power-gauge.js` | `power` in the product files |
| 8 | Frequency-response graphic (only as labelled illustration unless real measurements exist) | `archive/legacy-site/components/freq-response.js` | `audio.frequency_response`; only the Symphony has a range |
| 9 | Connectivity badges and material swatches | `archive/legacy-site/components/connectivity-badges.js`, `components/material-swatches.js` | `connectivity` and `form_factor.materials` in the product files |
| 10 | "History rhymes" two-era comparison with auto-flip | `archive/legacy-site/schema-renderer.js` (`renderTimeline`) and `app/bindings/rhyme-tabs.js` | `production-staging/content/sections/timeline.json` |
| 11 | Scroll choreography (reveal, counters, scroll progress, hero parallax) | `archive/legacy-site/app/bindings/` (`reveal.js`, `counters.js`, `scroll-progress.js`, `hero-parallax.js`) | none (behaviour only; retime to `agf-design-system/agf-design-system/03-motion.md`) |
| 12 | Appendix / "Learn more" progressive disclosure | `archive/legacy-site/schema-renderer.js` (`appendixRef`), `app/bindings/appendix.js` | `appendix` fields (most are empty strings in the export) |
| 13 | Data-table patterns: consolidation table, distribution weight bars, artist/AGF split bar, runway table, venue zones | `archive/legacy-site/schema-renderer.js` (`renderConsolidation`, `renderDistribution`, `renderArtistRights`, `renderBusinessModel`, `renderVenue`) | `consolidation.json`, `distribution.v2.json`, `artist-rights.v2.json`, `business-model.v2.json`, `venue.json` in `production-staging/content/sections/` |
| 14 | Hero lockup and heading system (Monoton mark with Commissioner and Poiret One taglines) | `archive/legacy-site/schema-renderer.js` (`renderHero`, `head`) and `styles/sections/hero.css` | `production-staging/content/sections/hero.json`; the new brand version is `agf-design-system/agf-design-system/components/Wordmark/` and `Hero/` |
| 15 | Product spec sheet: web accordion and print PDF | `archive/legacy-site/schema-renderer.js` (`renderProductCard`), `archive/legacy-site/index.js` (`renderPdfHtml`), `sections/*.js`, `css/*.css.js` | `production-staging/content/products/*.json` and `production-staging/content/sections/pdf-config.json` |

Do-not-port list: `archive/legacy-site/LEGACY-MAP.md` section 8.2 (the in-page editor, nudges, style overrides, runtime plumbing, hidden config rows as page content).

### T24 · The database

1. `agf.db` — SQLite file, tracked in git; four tables: `section_schemas` (22 rows, one per section type, with `schema_json` and `default_data`), `sections` (76 rows), `products` (6 rows), `schema_history` (0 rows). Open read-only (`sqlite3 -readonly agf.db`).
2. `production-staging/content/raw/sections.json` — 39 of the 76 `sections` rows, untouched export (every row, editor keys included). The other 37 rows are all header rows titled "Test Duplicate" and were not exported.
3. `production-staging/content/raw/products.json` — the six `products` rows.
4. `production-staging/content/sections/*.json` and `production-staging/content/products/*.json` — the cleaned export (editor-only keys removed, `_source` block with the row id and timestamps); base name = newest row by `updated_at`, `.v2` to `.v5` = other distinct versions (see rough edge R10).
5. `archive/legacy-site/schemas/*.schema.json` (22 files) — the JSON Schemas stored in `section_schemas`; field tables in `archive/legacy-site/LEGACY-MAP.md` section 6.
6. `archive/legacy-site/LEGACY-MAP.md` sections 9.6 and 10 — data defects in the export and a map of where each page section's data now lives.
7. `production-staging/tools/build-content.py` — the code that reads `content/` and writes the nine `content.json` files (see section 4).

---

## 3. Full file tree

Every tracked file appears once. Image sequences are collapsed as "N files: pattern" with a pointer to the catalogue that lists each one. The archive is collapsed to folder level with counts (details in `archive/legacy-site/LEGACY-MAP.md`). Counts are checked against `git ls-files` (540 files; with this map the count becomes 541).

```text
production-staging/ — the one place for new work (read `README.md` first)
  README.md — what is where, how to run the site, section types the renderer understands, collaboration conventions
  CONTENT-HARVEST.md — pre-recovery inventory (98 lines): story skeleton, recovered fallback copy, fixed names, board copy, image inventory; partly superseded (R7)
  site/ — the reference website (serve with `serve.sh`)
    index.html — portal page shell (18 lines); builds from `site.json` via `shared/site.js`
    site.json — manifest: brand lines (mark, strapline, nav tagline, certificate line, tagline, sources, portal copy and notes) and the nine options in order (slug, number, eyebrow, title, short, summary)
    serve.sh — one-line local server (`python3 -m http.server 8787` from `production-staging/`)
    brand/ — 3 files: `intro.html`, `deep.html` (18-line shells), `content.json` (all copy, the editable source); option 01, "All Grounds Floating"
    opportunity/ — 3 files: `intro.html`, `deep.html` (18-line shells), `content.json` (all copy, the editable source); option 02, "History rhymes"
    stack/ — 3 files: `intro.html`, `deep.html` (18-line shells), `content.json` (all copy, the editable source); option 03, "Six technologies, one signal path"
    lineup/ — 3 files: `intro.html`, `deep.html` (18-line shells), `content.json` (all copy, the editable source); option 04, "The inaugural product line"
    venue/ — 3 files: `intro.html`, `deep.html` (18-line shells), `content.json` (all copy, the editable source); option 05, "A church of the performing arts"
    artists/ — 3 files: `intro.html`, `deep.html` (18-line shells), `content.json` (all copy, the editable source); option 06, "Artists drive their own destiny"
    business/ — 3 files: `intro.html`, `deep.html` (18-line shells), `content.json` (all copy, the editable source); option 07, "The way the money actually works"
    roadmap/ — 3 files: `intro.html`, `deep.html` (18-line shells), `content.json` (all copy, the editable source); option 08, "Sequencing the line"
    founder/ — 3 files: `intro.html`, `deep.html` (18-line shells), `content.json` (all copy, the editable source); option 09, "Twenty-five years in this market"
    shared/ — assets common to every page
      agf.css — byte-identical copy of the design system stylesheet (372 lines, about 181 KB: tokens, three embedded fonts, components)
      site.css — page chrome and section layouts built only from design-system tokens (193 lines)
      site.js — the one renderer for portal, intro and deep pages (241 lines; 13 section types, nav, footer, reveal, TOC highlight, Notes toggle)
      logos/ — 5 files: `README.md` plus `agf-lockup.svg`, `agf-mark.svg`, `agf-seal.svg`, `floating-ground.svg`; identical copies of the design system logos
      icons/ — 11 files: `README.md` plus 10 line icons (broadcast, gain, ground, headphones, mic, phantom, play, record, spark, waveform); identical copies of the design system icons
  content/ — the old site's database exported to JSON (evidence, not the working copy)
    sections/ — one file per section; base name = newest row, `.v2`..`.v5` = other distinct versions (R10); each has a `_source` block (row id, timestamps)
      artist-rights.json — artist rights, row without `revenue_streams_heading`
      artist-rights.v2.json — artist rights: philosophy, three ownership tiers, enforcement, six revenue streams (used by the site)
      business-model.json — business model, row without the runway / scaling headings
      business-model.v2.json — business model: pricing strategy, channel approach, six-row runway table, revenue model, scaling timeline (used)
      comparison-config.json — hidden config: 8 comparison fields, max 3 products (old compare overlay)
      competitive-positioning.json — six competitor rows including AGF, summary, perceptual-map config
      concept-explainer.json — empty shell (415 bytes, title "How It Works", no modules)
      concept-explainer.v2.json — "Why This Matters": four modules (used)
      consolidation.json — eight acquisition rows (five with a disclosed value, all dates empty, one source link); independents block empty
      distribution.json — distribution, row without territory / criteria headings
      distribution.v2.json — distribution: philosophy, five weighted criteria, five territories, five channel types (used)
      footer.json — brand name, tagline, meta line ("Foundational Brand Development Document · 2026 ..."), sources line
      founder.json — founder, row without CTA and heading keys
      founder.v2.json — founder: milestones, ten mentors, four companies, CTA (used)
      header.json — nav row: brand "AGF", tagline "Even Rails → Smooth Tracks", no links
      header.v2.json — nav row with CTA "Request the Deck" linking to `#founder`
      header.v3.json — nav row with all fields empty
      hero.json — hero: headline "All Grounds Floating", thesis paragraph in `subheadline`, orbit background, no metrics
      launch-roadmap.json — six phase rows, two PR stunts, five venue pilots, year-one target, Gantt config
      overview.json — "At a Glance": four headline metrics ($4.2B TAM, 12+, 6, 50/50) and summary
      pdf-config.json — hidden config: PDF export template sections and palette
      pdf-config.v2.json — older version of the PDF export config
      prelude.json — prelude draft (one short line in the first square, hero image in the second)
      prelude.v2.json — prelude draft (one short line in the first square, two images)
      prelude.v3.json — prelude draft with the "quagmire" paragraph
      prelude.v4.json — prelude draft titled "Foundations - Products and Technologies"
      prelude.v5.json — prelude, full three-square version with intro text (used)
      team-note.json — founder interlude "Experience and Timing, meet Preparation and Opportunity"
      technology.json — six technologies, codec diagram, l'Art stack block (July 14; used)
      technology.v2.json — same section, July 6 version (differs in substance)
      tenet.json — six tenets, July 14 version (used for bodies)
      tenet.v2.json — six tenets, July 6 version (used for worked-example titles)
      timeline.json — "History rhymes": two eras (9 events), three comparison rows, flip interval
      venue.json — venue concept, three zones, journey, royalties, virtual ticket, financial model, cultural positioning
    products/ — the six products (name, slug, category, status, tagline, form factor, audio, connectivity, technologies, business, system config)
      core-all-in-one-small.json — Core-like All-in-One (Small), speaker, concept
      core-all-in-one-soundbar.json — Core-like All-in-One (Soundbar), concept
      over-ear-home-centric.json — Over-Ear — Home Centric, headphone with six-pair dock, development
      symphony-macro-system.json — The Symphony Macro-System, tall tower, concept
      the-instrument.json — The Instrument — Flagship Reference, pre-amp, concept
      wasted-real-estate.json — Wasted Real-Estate, earbud case, concept
    raw/ — untouched export, editor keys included
      products.json — the 6 `products` rows (id, name, slug, category, status, display_order, is_visible, `data`)
      sections.json — 39 `sections` rows (the 37 "Test Duplicate" header rows are not included)
  assets/ — every image in the repo, catalogued
    ASSETS.md — catalogue of brand boards, concept boards, concepts, prior work, section backgrounds, seven Symphony PNGs; verbatim transcribed board copy; duplicates; not-found list (204 lines; R6)
    assets.json — the same catalogue as JSON (47 entries; 8 point at removed files, R3)
    brand-boards/ — AI brand boards (superseded by the design system)
      agf-brand-board-landscape-design-system.png — 1536x1024: gold wordmark, "Sound Connects Everything.", early palette, typography panel, UI components, applications
      agf-brand-board-mark-palette-merch.jpeg — 1264x848: outlined wordmark with equaliser bars, type scale, colour swatches, equipment and merch strip
      agf-master-design-system-board-portrait.png — portrait master board: three-division tier system, "The forest holds the gold", PCB trace motifs, telemetry card
      agf-packaging-measured-in-silence-card.jpeg — box lid and "Measured in Silence." calibration card
    concept-boards/ — AI product and venue boards
      stereos-live-to-global-village-case-ad.webp — square ad: earbud case showing "stereOS LIVE to GLOBAL VILLAGE"
      venue-balcony-marble-control-surface-concept.webp — the Balcony: marble and copper control surface above a stage, virtual-ticket tiles
      venue-bar-stage-photo-with-copy-overlay.webp — venue photo with overlaid copy for The Bar & The Stage, The Balcony, The Green Room
      venue-three-panel-board-front-of-house-balcony-green-room.webp — three-panel board of the three venue zones with copy
      wasted-real-estate-earbud-case-board.webp — Wasted Real-Estate product board: modes, specs, "$299 accessory / $799 investment"
    concepts/ — images that are not database products (moods, wall plates, unbranded headphones)
      agf-usb-audio-dac-copper-knob-walnut-shelf.webp — AI render: black "USB Audio" box marked AGF with a copper knob on a walnut shelf
      analog-round-brass-ring-green-graphite-knob.png — AI round in-wall control, brass ring, graphite knob, "ANALOG"
      analog-wall-plate-brass-knob-green-ring-walnut.png — AI walnut wall plate, brass knob on green ring, OLED "ANALOG 144"
      analog-wall-plate-green-panel-wood-frame-brass-knob.png — AI green wall plate in walnut frame with brass knob
      home-theatre-green-brass-wall-speakers-usb-audio.webp — AI home theatre with tall green-and-brass wall speakers and a "USB Audio" box
      keyboard-control-surface-knobs-faders-grey-cad.png — unbranded grey CAD keyboard-format control surface
      marble-media-console-projector-screen-planters.png — AI living room: floating marble console with two drivers, projector screen
      mv2-bundle-plus-white-headphones-stand.png — marketing-style render of two white headphones on a stand, caption "MV2 Bundle+"
      over-ear-headphones-black-red-pair.png — unbranded render of two over-ear headphones, black and red
      over-ear-headphones-tan-pad-silver-shell-concept.png — unbranded render of tan-and-silver over-ear headphones on navy
      waveform-sculpture-copper-wire-teal-patina.png — AI sculpture: copper wire ribbons around a teal waveform
      material-moods/ — 14 files: `concept-<description>-<8 hex>.jpg|jpeg`, 1024x1024 AI material moods (walnut, copper, marble, glass); listed individually in `renders/renders.json` (product `concepts/material-moods`) and `renders/RENDERS.md` (section "mood-boards")
    prior-work/ — founder's earlier products: Mass Fidelity, Remora, Dolby earbud case
      massfidelity-dac-black-copper-slider-render.png — CAD: low black Mass Fidelity DAC with copper slider
      massfidelity-usb-audio-dac-black-gold-render.png — CAD: Mass Fidelity "USB Audio" DAC, black with gold-brass knob
      massfidelity-usb-audio-dac-green-brass-render.jpg — CAD: dark green slab with brass base and knob
      remora-driver-layout-cutaway-render.png — CAD cutaway of the REMORA driver layout
      remora-driver-layout-spec-diagram.png — spec slide: 12 racetrack drivers, 4 subwoofers, 4 passive radiators
      remora-exploded-mount-diagram.png — CAD: REMORA lifted off a TV with VESA mounting lines
      remora-speaker-on-tv-rear-render.png — CAD: black REMORA mounted on the back of a TV
      round-earbud-case-dolby-logo-lid-kod-screen.png — CAD: round earbud case, Dolby logo on lid, screen "KOD / J. Cole"
      round-earbud-case-with-earbuds-paul-simon-screen.png — CAD: round earbud case with earbuds, screen "LATE IN THE EVENING / Paul Simon"
      usb-audio-dac-copper-knob-rear-ports-render.jpg — CAD: USB Audio DAC from the rear, copper knob, connector strip
      usb-audio-dac-exploded-assembly-drawing.png — exploded assembly drawing of the USB Audio box
      mass-fidelity/ — 46 files: `mass-fidelity-usb-dac-<finish>-<view>[-<n>].png|jpg` (USB DAC, 36 files) and `mass-fidelity-portable-dac-<view>-<n>.png` (portable DAC, 10 files); listed individually in `renders/renders.json` (product `prior-work/mass-fidelity`) and `renders/RENDERS.md` (section "mood-boards")
    renders/ — per-product renders and the render catalogue
      RENDERS.md — render catalogue (181 lines): kinds, per-product tables with shown content and sizes; R6
      renders.json — the same as JSON: 96 entries with path, original path, product, kind, description, size
      over-ear-home-centric/ — 4 files: `over-ear-headphones-matte-black-copper-<view>-<n>.jpg`, 1000x1000, finished renders and one close-up
      symphony-macro-system/ — 18 files: 11 `symphony-tower-<finish>-<view>-<n>.jpg` (1920x1083; catalogued in `renders.json`) and 7 `symphony-tower-<finish>-front|driver-closeup.png` (catalogued in `assets.json`); overlapping sets, R1
      studio-microphone/ — 7 files: `studio-mic-<boom-arm|shockmount>-<view>-<n>.jpg`; large-diaphragm mic (not in the product database)
      broadcast-microphone/ — 3 files: `broadcast-mic-greybox-<view>-<n>.png`; grey-box CAD desktop broadcast mic (not in the database)
      control-surface/ — 3 files: `control-surface-greybox-<view>-<n>.png`; grey-box CAD keyboard-format control surface (not in the database)
      desktop-stereo-amp/ — 8 files: `desktop-amp-<black|silver>-<view>[-<logo variant>]-<id>.jpg|jpeg|png`; desktop stereo amplifier, black and silver faceplates (not in the database)
    section-backgrounds/ — old site's section backgrounds, reduced to one file (R3)
      venue-background.webp — 1152x864 AI jazz-venue interior with a copper AGF wall sign; used on the venue page
  tools/
    build-content.py — 661 lines: composes the nine `content.json`, `site.json`, 19 page shells and `serve.sh` from `content/` (run once to scaffold; re-running overwrites hand edits)
agf-design-system/agf-design-system/ — the brand book and design system (open `index.html`)
  README.md — the brand book (65 lines): voice, colour, typography, space and shape, texture, marks, component list
  02-applications.md — divisions, CMF (colour / material / finish), hardware, packaging, gifts, web (52 lines)
  03-motion.md — damped-motion rules (13 lines)
  HOW-TO-USE.md — file guide (14 lines)
  agf.css — the one stylesheet to link: tokens, three embedded fonts, components (372 lines, about 181 KB)
  tokens.json — every token for the three themes, machine-readable (649 lines)
  tokens.css — the tokens as CSS custom properties, fonts referenced by file (146 lines)
  index.html — showcase of every component with a Midnight / Daylight / Air switch (778 lines)
  design-system.json — index for the published Claude artifact (Logos and Icons asset groups); ignore elsewhere
  preview-air.png — 960x1271 contact sheet in the Air theme: badge and seal, Certificate, Knobs, Meters, Nav
  preview-cover.png — 960x888 contact sheet: the Cover ("All Grounds Floating", "Pure signal.") in the three themes
  preview-daylight.png — 960x1342 contact sheet in Daylight: Faceplate, Sleeve, inside-the-lid card, Nav, Hero, Wordmark
  preview-marks.png — 1050x700: mark, lockup, seal and the ten icons
  preview-midnight.png — 960x1323 contact sheet in Midnight: Faceplate, Meters, Sleeve, Nav, Hero
  components/ — 20 folders: 19 documented components (`README.md` + `preview.html`) and Cover (preview only)
    bundle.css — component styles composed from tokens; defines `--ease-damped` (223 lines)
    Badge/ — 2 files: `preview.html` and `README.md`; status pill with lamp: live, brass, nominal, plain
    Button/ — 2 files: `preview.html` and `README.md`; primary (solid brass), secondary (outline), quiet; verb-first labels
    Certificate/ — 2 files: `preview.html` and `README.md`; calibration card in the box: mark, floating-ground badge, "Measured in silence.", unit measurements
    Cover/ — 1 file: `preview.html`; preview only, no README: the 960x288 cover with "All Grounds Floating" and "Pure signal."
    Faceplate/ — 2 files: `preview.html` and `README.md`; hardware front plate: chamfer, screws, legends, lamps, knobs
    FloatingGround/ — 2 files: `preview.html` and `README.md`; the Floating Ground badge (IEC earth symbol in a broken orbital ring)
    Heading/ — 2 files: `preview.html` and `README.md`; headline stack: eyebrow, display, 48px rule, lede
    Hero/ — 2 files: `preview.html` and `README.md`; web hero on surface-deep with trace field, strapline, mega headline, buttons
    Input/ — 2 files: `preview.html` and `README.md`; text input and select wells with label and hint
    Knob/ — 2 files: `preview.html` and `README.md`; rotary control with 21 ticks over a 270 degree sweep
    Meter/ — 2 files: `preview.html` and `README.md`; segmented level meter, thirty segments in the three signal colours
    Nav/ — 2 files: `preview.html` and `README.md`; 72px bar: small mark, up to five links, hairline
    Panel/ — 2 files: `preview.html` and `README.md`; Card (raised surface) and glass Panel
    Readout/ — 2 files: `preview.html` and `README.md`; one measured number with unit and label over turning orbital rings
    Rule/ — 2 files: `preview.html` and `README.md`; dividers at hairline, rule and bold weights; trace variant
    Seal/ — 2 files: `preview.html` and `README.md`; round seal: two rings, sixty ticks, the mark
    Sleeve/ — 2 files: `preview.html` and `README.md`; outer packaging sleeve with trace field, lockup, seal
    SpecTable/ — 2 files: `preview.html` and `README.md`; parameter / value+unit / conditions table
    TraceField/ — 2 files: `preview.html` and `README.md`; the PCB-trace overlay pattern with grain
    Wordmark/ — 2 files: `preview.html` and `README.md`; the lockup: AGF in Monoton over "All Grounds Floating" in Poiret One
  assets/
    Logos/ — 5 files: `README.md`, `agf-mark.svg`, `agf-lockup.svg`, `agf-seal.svg`, `floating-ground.svg` (all brass)
    Icons/ — 11 files: `README.md` and 10 line icons (mic, headphones, waveform, broadcast, record, play, gain, ground, phantom, spark)
  fonts/ — 3 files: `Commissioner-Variable.woff2`, `Monoton-Regular.woff2`, `PoiretOne-Regular.woff2` (identical to `fonts/web/`)
archive/legacy-site/ — the retired schema-driven site; read `LEGACY-MAP.md` instead of the code (215 files)
  LEGACY-MAP.md — 1,588 lines: architecture, every module, component data contracts, 22 schema tables, CSS layer and token comparison, "worth porting" (15) and "do not port" lists, defects, content map (sections 1 to 10)
  README.md — README of the PDF spec-sheet package (not the website)
  index.html — the site shell (empty `<main id="app">`, loads the monoliths)
  index.js — PDF: `renderPdfHtml(product, pdfConfig)`
  helpers.js — PDF helpers: esc, md, fmtRange, fmtUSD, sectionCfg
  schema-renderer.js — live monolith renderer (1,992 lines): one renderer per section schema
  schema-renderer.js.broken — older revision of the renderer (parses; superseded, not syntactically broken)
  editor.js — live in-page CMS monolith (5,458 lines); not to be ported
  editor.js.broken — older revision of the editor (parses; superseded)
  vitest.config.js — test config stub; `tests/` folder absent
  app/ — 23 files: live orchestrator (11 files in `app/`: ES modules api, mount, renderer, style-manager, toast, utils, data-refresh, nav, cleanup, index and a README) and `app/bindings/` (12 files: 11 behaviours — reveal, counters, rhyme-tabs, appendix, hero-parallax, scroll-progress, product-expand, smooth-scroll, hamburger, active-nav, pcb-toggle — plus index.js)
  components/ — 16 files: ten visualisation components (`positioning-chart`, `roadmap-chart`, `product-compare`, `system-configurator`, `freq-response`, `driver-diagram`, `tech-flow`, `power-gauge`, `connectivity-badges`, `material-swatches`) plus the unloaded split `system-configurator/` (6 files)
  schema-renderer/ — 32 files: unloaded split extraction of the renderer (8 root files, `renderers/` 19, `product/` 5)
  editor/ — 23 files: unloaded split extraction of the editor (21 modules plus `LOAD_ORDER.md`, `EXTRACT_REPORT.txt`)
  schemas/ — 22 files: `<section>.schema.json`, JSON Schema for each section type plus `product` and `cut-sheet`
  sections/ — 10 files: PDF section renderers (audio-specs, business-metrics, connectivity, footer, form-factor, header, hero-image, overview, technologies, index)
  css/ — 11 files: PDF stylesheet partials as JS modules plus `index.js` assembler
  styles/ — 67 files: site CSS: `index.css`, `_manifest.json` and 9 sub-folders of partials (core, layout, sections 22, compare, configurator, viz, feedback, util, editor 12)
  assets/Commissioner/README.txt — the Google Fonts download readme; the only file left in `assets/` (R4)
fonts/ — licensed source fonts
  Commissioner/Commissioner-Variable.ttf — 4-axis variable font (FLAR, VOLM, slnt, wght)
  Commissioner/static/ — 9 files: `Commissioner-<Thin|ExtraLight|Light|Regular|Medium|SemiBold|Bold|ExtraBold|Black>.ttf`
  Monoton/Monoton-Regular.ttf — the mark face
  PoiretOne/PoiretOne-Regular.ttf — the strapline face
  licenses/ — 3 files: `OFL-Commissioner.txt`, `OFL-Monoton.txt`, `OFL-PoiretOne.txt`
  web/ — 3 files: woff2 builds of the three faces
agf.db — the SQLite database the content was exported from (T24)
```

---

## 4. The nine site options

Built by `production-staging/tools/build-content.py` (661 lines) from `production-staging/content/`. "Sections files" are `production-staging/content/sections/<name>.json`; "Products" are `production-staging/content/products/<slug>.json`. The generator's own hand-written text (intro points, metrics, quotes, portal copy, figure picks and some labels) sits in the script itself; the database fields feed the rest. `site.json` also draws `brand.sources` from `footer.json` and `brand.portal_lede` from `hero.json`.

| Slug | No. | Title (manifest) | Intro headline | Deep sections | Deep section ids (type) | Sections files (`production-staging/content/sections/`) | Products | Images shown |
|---|---|---|---|---|---|---|---|---|
| `brand` | 01 | The Brand — All Grounds Floating | When you listen to music, you're hearing your power supply. | 7 | `thesis` (prose), `prelude` (prose), `lineage` (prose), `tenets` (cards), `boards` (figures), `standing-lines` (list), `divisions` (cards) | `hero.json` (thesis), `prelude.v5.json`, `team-note.json`, `tenet.json`, `tenet.v2.json` | none | 2 brand boards |
| `opportunity` | 02 | The Opportunity — History rhymes | Hundreds of brands, decades apart, one safe harbor. | 7 | `then` (timeline), `now` (timeline), `rhymes` (compare), `consolidation` (table), `why-it-matters` (cards), `at-a-glance` (metrics), `summary` (prose) | `timeline.json`, `consolidation.json`, `concept-explainer.v2.json`, `overview.json` | none | none |
| `stack` | 03 | The Stack — Six technologies, one signal path | Flawless implementation of stereo. Everything else is gravy. | 4 | `in-one-breath` (prose), `pipeline` (pipeline), `technologies` (cards), `lart-stages` (pipeline) | `technology.json`, `technology.v2.json` (patent-status comparison only) | none (technologies are text only here) | none |
| `lineup` | 04 | The Lineup — The inaugural product line | Six products. One platform where it pays. | 10 | `the-line` (cards), `renders` (figures), `also-on-the-bench` (figures), `spec-over-ear-home-centric` (spec), `spec-core-all-in-one-small` (spec), `spec-core-all-in-one-soundbar` (spec), `spec-symphony-macro-system` (spec), `spec-the-instrument` (spec), `spec-wasted-real-estate` (spec), `runway` (table) | `business-model.v2.json` (`runway_table` only) | all six: `over-ear-home-centric`, `core-all-in-one-small`, `core-all-in-one-soundbar`, `symphony-macro-system`, `the-instrument`, `wasted-real-estate` | 6 renders (4 Symphony, 2 Over-Ear), the Wasted Real-Estate board, 5 "on the bench" renders |
| `venue` | 05 | The Venue — A church of the performing arts | The venue. A church of the performing arts. | 8 | `zones` (cards), `boards` (figures), `journey` (steps), `customer` (prose), `royalties` (cards), `virtual-ticket` (cards), `financial-model` (list), `cultural-positioning` (cards) | `venue.json` | none | 2 concept boards, `section-backgrounds/venue-background.webp` |
| `artists` | 06 | Artist Rights — Artists drive their own destiny | Artists drive their own destiny. | 4 | `philosophy` (prose), `tiers` (cards), `enforcement` (cards), `revenue-streams` (table) | `artist-rights.v2.json` | none | none |
| `business` | 07 | The Business — The way the money actually works | Numbers, runway, and the way the money actually works. | 11 | `pricing` (cards), `channel` (cards), `revenue-model` (prose), `scaling` (prose), `distribution` (prose), `partner-criteria` (table), `territories` (table), `channel-types` (cards), `distribution-revenue` (prose), `competitive-positioning` (cards), `summary` (prose) | `business-model.v2.json`, `distribution.v2.json`, `competitive-positioning.json` | none | none |
| `roadmap` | 08 | The Roadmap — Sequencing the line | Three phases, one shared platform where it pays. | 5 | `phases` (timeline), `pr-levers` (cards), `venue-pilots` (prose), `year-one` (prose), `beyond` (prose) | `launch-roadmap.json`, `business-model.v2.json` (`scaling_timeline` only) | none | none |
| `founder` | 09 | The Founder — Twenty-five years in this market | Twenty-five years in this market, longer if you count the garage sales. | 5 | `milestones` (timeline), `prior-work` (figures), `companies` (cards), `mentors` (table), `now-what` (prose) | `founder.v2.json` | none | 4 prior-work images |

Per option the folder `production-staging/site/<slug>/` holds `intro.html`, `deep.html` (page shells) and `content.json`. Manifest order, numbers, eyebrows, titles and summaries live in `production-staging/site/site.json` (`options`); reorder or rename there.

Not used by the generator at all: `header.json`, `header.v2.json`, `header.v3.json` (the nav tagline is typed into the script), `comparison-config.json`, `pdf-config.json`, `pdf-config.v2.json`, and the older versions `artist-rights.json`, `business-model.json`, `concept-explainer.json`, `distribution.json`, `founder.json`, `prelude.json` to `prelude.v4.json`. `tenet.v2.json` and `technology.v2.json` are used only as secondary sources inside the tenets and technologies cards.

---

## 5. Open questions carried in the content

Compiled with a script from every `note` and `_assumed` field in the nine `production-staging/site/*/content.json` files (nested ones included). These are the working notes the site shows by default. Delete a `note` key when its section is signed off. 25 `note` fields and 3 `_assumed` flags appear in total; the table gives each with its option slug and section id (`intro` means the option's intro page; `deep` means the deep page's lede block).

Extraction one-liner (run from `production-staging/site`; it lists every `note` and `_assumed` line per option, and the section ids in the table below were then resolved by walking the JSON):

```sh
python3 -I -c 'import glob,re;[print(f.split("/")[0],m[:90]) for f in sorted(glob.glob("*/content.json")) for m in re.findall(r"\"(?:note|_assumed)\": [^\n]*",open(f).read())]'
```

### 5.1 Notes and assumed flags

| Option | Section id | Field | Text (verbatim) |
|---|---|---|---|
| `brand` | `intro` | `note` | Intro copy on this page is lifted from the hero, team note and tenets sections of the document. The three-point framing (name, posture, model) is an editorial choice for the site. |
| `brand` | `thesis` | `note` | This is the hero subheadline from the document, verbatim. It doubles as the origin of the name and as the pitch for BT'N-Tech. |
| `brand` | `tenets (card 6)` | `note` | Two versions of this tenet's key insight exist in the document: "Choose violence." (July 14) and "Know where to push, and how to present it to a global market that eats new entrants for breakfast." (July 6). The shorter one is shown; say which you want. |
| `brand` | `tenets` | `note` | Bodies are the first-person July 14 version. Worked-example titles come from the July 6 version. Both versions are kept in content/sections/tenet.json and tenet.v2.json. |
| `brand` | `standing-lines` | `_assumed` | true: the section title shows an "assumed" badge (the line was drafted for the site, not lifted from the document) |
| `brand` | `standing-lines` | `note` | The design system fixed three of these; the fourth came from the document's header. Confirm or cut. |
| `brand` | `divisions` | `_assumed` | true: the section title shows an "assumed" badge (the line was drafted for the site, not lifted from the document) |
| `brand` | `divisions` | `note` | Open question from the brand page brief: keep the three codes, rename them, or drop them for the document's own framing? |
| `opportunity` | `consolidation` | `note` | Dates and source links are blank for all but the Harman transaction in the document. Worth filling before this goes public. |
| `opportunity` | `at-a-glance` | `note` | The $4.2B TAM and the "12+" acquisitions count come from the document's At-a-Glance block without a cited source. Treat as unverified until sourced. |
| `stack` | `technologies (card 1)` | `note` | Patent status differs between document versions: Patented (July 6) versus Trade secret (July 14). Shown as the newer one. This must be settled before publication. |
| `stack` | `technologies` | `note` | Capabilities and advantages are the July 14 version. The July 6 version (content/sections/technology.v2.json) adds a few lines worth considering: Sony America's California R&D had similar tech and 'the marketing guys completely ruined it'; No-Nails lists beryllium-alloy HF in the dustcap position and light final-stage DSP; FRC41's effect is described as moving to a pair of high-end speakers in the sweet spot. |
| `lineup` | `renders` | `note` | No renders exist yet for the Core-like all-in-ones or the Instrument. The Symphony folder holds two overlapping render sets (numbered JPGs from product-renders, transparent PNGs from the old site); both are kept until you pick. |
| `lineup` | `also-on-the-bench` | `_assumed` | true: the section title shows an "assumed" badge (the line was drafted for the site, not lifted from the document) |
| `lineup` | `also-on-the-bench` | `note` | Decide whether these are products, the l'Art Production line, or explorations. They are shown so nothing is lost; cutting is one line in content.json. |
| `lineup` | `spec-over-ear-home-centric` | `note` | V1: 6-pair dock with RF default to dock, single-action BT clean pairing, remembers 6 paired devices, native USB-C high-res A2D + native 3.5mm analog. **V2 refactor in 8–12 months** ($120K tooling). Certifications budgeted at **~$30K combined (ETL/FCC/CE)** per SKU. |
| `lineup` | `spec-core-all-in-one-small` | `note` | Electronics 80% (power supply + l'Art module selection). Mechanical 0%+ (ID fine-tune, tooling, CFM). Physical UI 90%. Software 70%+. ETL pre-approved PS path. Certifications budgeted at **~$30K combined (ETL/FCC/CE)**. |
| `lineup` | `spec-core-all-in-one-soundbar` | `note` | Shared tooling with small variant. Mid-sandwich price position in the runway. Certifications budgeted at **~$30K combined (ETL/FCC/CE)** per SKU. |
| `lineup` | `spec-symphony-macro-system` | `note` | CoGS ~$200 at low-1000s; refactors to <$100. **PR stunt: Symphony submitted for review at $29,990 first, corrected post-submission to $2,990 retail** — anchor the price ceiling, then drop the ladder. NAD 3020 anchor: $89 in 1978 ≈ $432 in 2026 — the bargain that minted a global brand. Certifications budgeted at **~$30K combined (ETL/FCC/CE)** per SKU. |
| `lineup` | `spec-the-instrument` | `note` | Companions: 2000W GaN mono-block, Gowin FPGA processor, transmission-line sub. Pro tier UI empowers live-mixing techs to submit innovations (royalty-paid). Krell — the original high-current halo competitor — closed Jun 2024 (Rondi D'Agostino's passing) and is reopening through 2025. The vacuum is real. |
| `lineup` | `spec-wasted-real-estate` | `note` | Y1 target: 1,000 pcs/month globally with 100+ retail partners (100pcs/mo in 2 PoC venues). Comparable: Focal's flagship reference hits 1,000pcs/mo with focused rep firm. Certifications budgeted at **~$30K combined (ETL/FCC/CE)** per SKU. |
| `lineup` | `runway` | `note` | Internal planning table. Decide whether COGS stays on any public page. |
| `venue` | `boards` | `note` | All venue imagery is AI-generated mood work. Fine for discussion, not for publication. |
| `business` | `competitive-positioning` | `note` | The document renders these on a perceptual map (log price versus prestige). That chart is on the list for the next pass; the cards carry the same data. |
| `roadmap` | `deep` | `note` | The document drew this as a 24-month Gantt with milestone markers for PR stunts, venue pilots and volume targets. The Gantt is queued for the next pass; the timeline below carries the same months. |
| `founder` | `prior-work` | `note` | Renders carry Mass Fidelity and Dolby marks. Check rights before any of these go public. |
| `founder` | `mentors` | `note` | Named people on a public page need their consent or a public record. Flag any name that should stay internal. |
| `founder` | `now-what` | `note` | The document's CTA was 'Request the Deck' with a placeholder address. The real contact is still an open question. |

### 5.2 Related: `metrics_note` fields (a different key, shown under metrics)

| Option | Where | Text (verbatim) |
|---|---|---|
| `brand` | `intro` | Hero metrics on this page are structural counts, not measurements. Real measurements with conditions belong on the Stack and Lineup pages. |
| `stack` | `intro` | The Symphony figure is a design target from the document, not a measurement yet. |
| `lineup` | `intro` | Prices, COGS and tooling figures are internal planning numbers from the document and are flagged as such in the deep dive. |

### 5.3 Questions that are open in the content but not written as notes

These appear in the sections' own text or in the data, and are repeated in section 6 where they are defects:

- Which of the two conflicting l'Art patent statuses is true (R13).
- Whether to keep or rename the three division codes (HEAR / FIELD / AIR) (listed above under brand / divisions).
- Whether COGS, tooling and certification figures survive to a public site (lineup / runway; `production-staging/README.md`).
- Whether the four extra objects with renders (studio microphone, broadcast microphone, control surface, desktop amplifier) are products, the l'Art Production line, or explorations (lineup / also-on-the-bench).
- The real contact address for "Request the Deck" (founder / now-what).

---

## 6. Known rough edges

Numbered so other sections can refer to them. Each says where to look.

### Images and catalogues

**R1. The Symphony render folder holds two overlapping sets.** `production-staging/assets/renders/symphony-macro-system/` has 18 files: 11 numbered JPGs (1920x1083, from the former `product-renders/`; catalogued in `renders/RENDERS.md` and `renders/renders.json`) and 7 PNGs named `symphony-tower-<finish>-front.png` or `-driver-closeup.png` (994 to 1116 px wide, from the old site's screenshots; catalogued only in `ASSETS.md` and `assets.json`). Both sets show the same slim tower in overlapping finishes (walnut, copper, green with brass or copper, black with brass trim or ring). `RENDERS.md` ("Note: files already present...") calls the PNGs "transparent-background" and says they are not described there; `ASSETS.md` does describe them, and the corner pixels of all seven PNGs are opaque mauve-grey (RGBA mode, alpha 255), so they do not appear to be transparent. The lineup page's note on `renders` says both sets are kept "until you pick". The lineup page currently shows three of the PNGs and one JPG.

**R2. Four of the six products have no product render.** `core-all-in-one-small`, `core-all-in-one-soundbar`, `the-instrument` have no images anywhere; `wasted-real-estate` has only the AI concept board, the "stereOS live to global village" ad and two Dolby-era CAD case renders in `prior-work/`. `renders.json` and `RENDERS.md` list the empty slugs. The lineup page notes "No product photography exists yet."

**R3. `section-backgrounds/` has been reduced to one file.** Eight files were byte-identical duplicates of images kept under `concepts/`, `prior-work/` or `venue-background.webp` itself, and were removed after a sha256 check. `ASSETS.md` and `assets.json` were pruned to match (39 entries) after this map was first written; the duplicates list in `ASSETS.md` records the pairings.

**R4. The archive's one remaining non-code asset.** `archive/legacy-site/assets/Commissioner/README.txt` (the Google Fonts download readme) is the only file left under `archive/legacy-site/assets/`; the other 22 font and licence files were dropped in commit `03a1e31` because they duplicated `fonts/`. As a result the archived stylesheet `archive/legacy-site/styles/core/fonts.css` still points at `../../assets/Commissioner/...`, `../../assets/Monoton/...` and `../../assets/PoiretOne-Regular/...`, which no longer exist, so the archived site would render without the brand fonts unless those URLs are repointed to `fonts/`.

**R5. `LEGACY-MAP.md` is slightly out of date on its own header.** `archive/legacy-site/LEGACY-MAP.md` sections 1.1 and 1.2 say 236 files moved, "nothing deleted" and "nothing committed". Since commit `03a1e31` the archive holds 215 files and the duplicate fonts are deleted. Everything else in it was written against the code as it stands.

**R6. Catalogue inconsistencies.**
- `production-staging/assets/ASSETS.md` section "Not found / ambiguous" says there is no headphones-on-head-form image and nothing was placed in `renders/over-ear-home-centric/`; that folder now holds four (`RENDERS.md`: matte black with copper, on a silver mannequin head).
- `production-staging/assets/renders/RENDERS.md` has a section "mood-boards" with 60 images and a count table row "mood-boards (relocated...)"; there is no `mood-boards` folder. Those images now live in `assets/prior-work/mass-fidelity/` (46) and `assets/concepts/material-moods/` (14); use the `path` and `product` fields in `renders/renders.json`.
- Every "Original path" column in both catalogues refers to folders that no longer exist (`site/assets/screenshots/`, `site/assets/sections/`, `product-renders/`, root `AGF.png` and so on). They record provenance only.
- `ASSETS.md` section "Duplicates" lists files that no longer exist (see R3).

**R7. `production-staging/CONTENT-HARVEST.md` is partly superseded.** Its banner says the database was recovered; sections 1 to 6 remain accurate as an inventory but cite the old layout (`site/`, `product-renders/`, root images), and section 7 "Known gaps" has been resolved by `content/`.

**R8. Rights and provenance of imagery.** All venue imagery and all board and concept images are AI-generated mood work (the venue note says "fine for discussion, not for publication"); `prior-work/` renders carry Mass Fidelity, REMORA and Dolby marks (founder note: "check rights before any of these go public"); one concept image shows a "SOTA" TV logo and another a "Dolby" mark. Text on AI boards is frequently garbled; the master design-system board has garbled hex values (`ASSETS.md` marks them `[sic]`), so take hex values from `tokens.json`, not from boards.

### Content and database

**R9. The database export has gaps.** `production-staging/content/sections/consolidation.json` has empty `independent_heading` and `independent_intro` and no list of surviving independent brands; every acquisition `date` is empty and only the Harman row has a `source_url` (the working note under opportunity / consolidation says dates are blank "for all but the Harman transaction"; in the data all eight dates are blank). `wasted-real-estate.json` has no ASP, TTM or COGS (only a monthly volume target of 1,000); `the-instrument.json` has no COGS. The competitive-positioning table includes AGF itself as a row (prestige 90, average price $3,000), a self-score. The overview figures "$4.2B TAM" and "12+ brand acquisitions" have no cited source.

**R10. Which database version is "current" is not always the base file.** `production-staging/README.md` says the base file is newest and `.v2`, `.v3` older, which is true by `updated_at`, but several versions share one timestamp and `archive/legacy-site/LEGACY-MAP.md` section 9.6 explains the tie-break was arbitrary. `build-content.py` therefore deliberately uses these versions:

| Section | Base file | Used by the site | Why (from the files) |
|---|---|---|---|
| artist-rights | `artist-rights.json` | `artist-rights.v2.json` | same timestamp; v2 carries `revenue_streams_heading` |
| business-model | `business-model.json` | `business-model.v2.json` | same timestamp; v2 adds `runway_heading`, `scaling_heading` |
| distribution | `distribution.json` | `distribution.v2.json` | same timestamp; v2 adds heading keys |
| founder | `founder.json` | `founder.v2.json` | same timestamp; v2 adds CTA and heading keys |
| concept-explainer | `concept-explainer.json` (an empty shell, 415 bytes) | `concept-explainer.v2.json` | only v2 holds the four "Why This Matters" modules |
| prelude | `prelude.json` | `prelude.v5.json` | v5 is the full three-square version; v1 to v4 are earlier drafts (v4 titled "Foundations - Products and Technologies") |
| tenet | `tenet.json` (July 14) | both | bodies from base, worked-example titles from `.v2` (July 6) |
| technology | `technology.json` (July 14) | both | base shown; `.v2` used to flag the patent-status conflict |

**R11. Test rows in the database.** `agf.db` `sections` has 76 rows; 37 are header rows titled "Test Duplicate" (all `2026-07-06 08:21:02`), not exported. The exported `header` rows have empty `nav_links`; `header.v2.json` holds the "Request the Deck" call to action; `header.v3.json` has only empty strings. The two hidden config rows (`comparison-config`, `pdf-config`) are configuration for the old compare overlay and PDF export, not page content.

**R12. Numbering and ordering.** The database titles number sections 01 to 12 (01 Opportunity, 02 Consolidation, 03 Tenets, 04 Venue, 05 Stack, 06 Lineup, 07 Business, 08 Founder, 09 Distribution, 10 Artist Rights, 11 Competitive Positioning, 12 Launch Roadmap), which does not match either the old display order or the new nine options (01 Brand ... 09 Founder). Roadmap phase titles in `launch-roadmap.json` read "Phase 1, 2, 2, 2, 3, 3" for six rows.

**R13. Naming and wording conflicts inside the content.**
- The technology is written **BT'N-Tech** in products, most site copy and `technology.v2.json`, but `technology.json` names it `BTN-Tech` (full name "Bring Tha' Noise Technologies"), and the BT'N-Tech card on `production-staging/site/stack/deep.html` (`content.json`, `technologies`) carries "BTN-Tech" as eyebrow and title while the rest of that page says "BT'N-Tech".
- l'Art's patent status is "Patented" in the July 6 version and "Trade secret" in the July 14 version (the site shows the newer one and flags it).
- Tenet 6's key insight has two wordings ("Choose violence." versus a longer line); the site shows the shorter one.
- The standing-lines list and the three division codes are flagged `_assumed` for confirmation.

**R14. Visuals the documents had that the reference site does not yet draw.** The competitive perceptual map and the 24-month Gantt are "queued for the next pass" (notes under business / competitive-positioning and roadmap); the site shows cards and a timeline instead. The renderer's `quote` and `html` section types are defined but no deep section uses them.

### Site and design system

**R15. Reference-site limits.** Midnight theme only (no Daylight or Air page variants); requires a local server (`file://` fails); pages are 18-line shells that rely entirely on `site.js` (no content without JavaScript); every page footer repeats the long sources line from `site.json` (`brand.sources`).

**R16. Design-system housekeeping.** `agf-design-system/agf-design-system/components/Cover/` has a `preview.html` but no `README.md` and is not in the README's list of 19 components (the 19 are the READMEs). `design-system.json` is an index for a published artifact and can be ignored. `components/Hero/README.md` says content reveals with "600ms, ease-out" while `03-motion.md` (and `production-staging/site/shared/site.css`) use 700ms on the damped curve and say nothing uses ease-out or ease-in-out; treat `03-motion.md` as the rule. `components/bundle.css` uses tokens but does not define them (use `agf.css`, which embeds tokens and fonts, or pair `bundle.css` with `tokens.css`). The reference site's copies of `agf.css`, logos and icons must be refreshed by hand if the design system changes (rule 2 in section 1.3).

### Archive

**R17. The archive is two programs glued together, and its defects are catalogued.** `archive/legacy-site/README.md`, `index.js`, `helpers.js`, `sections/` and `css/` belong to the PDF spec-sheet renderer, not the website. `index.html` loads the monolith `schema-renderer.js` and `editor.js`; the split trees `schema-renderer/`, `editor/` and `components/system-configurator/` are never loaded. The live renderer cannot draw `overview` or `concept-explainer` (only the unloaded split tree can). The `.broken` files parse and are older revisions, not broken code. `vitest.config.js` points to a `tests/` folder that does not exist. Full list: `archive/legacy-site/LEGACY-MAP.md` section 9 (9.1 wiring and dead code, 9.2 the `.broken` files, 9.3 hard-coded fallback copy, 9.4 renderer bugs, 9.5 component bugs, 9.6 data defects).

**R18. Old token names clash with the new ones.** Legacy `--ink` is dark text while the new `--ink` is light text in Midnight; legacy `--type-micro` is 16 px while the new `micro` is 11 px; legacy `--taupe` and `--obsidian-2` have no new equivalent; several legacy colour pairs fail contrast (full list in `archive/legacy-site/LEGACY-MAP.md` section 7.4).
