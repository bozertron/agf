# AGF content harvest

> **Recovered:** the old site's database (`agf.db`, now at the repo root) has been recovered and exported. Everything section 7 below listed as missing is now in `production-staging/content/`:
>
> - `content/sections/<schema>.json` is the newest version of each section, with editor-only keys (style overrides, nudges, background settings) stripped. Where the database held more than one distinct version, the older ones are `<schema>.v2.json`, `.v3.json` and so on; the two tenet versions and the two technology versions differ in substance and both are kept.
> - `content/products/<slug>.json` is each of the six products.
> - `content/raw/` is the untouched export (every exported row, editor keys included) for reference. The 37 "Test Duplicate" header rows in the database were not exported.
>
> **Layout note:** this inventory was written before the repo was reorganised. Paths below have been updated to the current layout: the old `site/` is now `archive/legacy-site/`; the screenshots, section images and root brand boards are catalogued under `production-staging/assets/` (see `assets/ASSETS.md`); `product-renders/` is now `production-staging/assets/renders/` (see `assets/renders/RENDERS.md`). Sections 3 to 5 (recovered copy, fixed names, board copy) are unchanged and remain the record of what survived outside the database; sections 1, 2 and 6 describe the pre-recovery repo.

What survived from the old site, what was lost, and what the new standalone pages can draw on. Compiled 2026-10-27 from the old site (now `archive/legacy-site/`), the product renders (now `production-staging/assets/renders/`), the root images (now `production-staging/assets/brand-boards/`) and the design system in `agf-design-system/agf-design-system/`.

## 1. What the old site actually was

- A schema-driven single page: `archive/legacy-site/index.html` is an empty shell. Every section was rendered by `archive/legacy-site/schema-renderer/` from rows in a server database (the comment in the HTML says "Populated by app.js from header section in DB"). When this inventory was written the server, seed file and database were **not in the repo** (the extract reports point at `/home/bozertron/0.1-Audio-AGF-BP/server/`); the database has since arrived as `agf.db` at the repo root (see the banner).
- So the prose, numbers, tenets, competitor data, roadmap phases and product specs were in that database. At that point the repo held only the **structure** (22 JSON schemas, now in `archive/legacy-site/schemas/`), a handful of **hard-coded fallback strings**, and **screenshots and renders**.
- Exporting the database recovered everything at once: see `production-staging/content/`. Sections 3 to 5 of this document remain the record of what survived without it.

## 2. Story skeleton (from the schemas)

The old site told the story in this order and with these building blocks. Field lists are the schema's own, so they are a good checklist of what the DB content covered.

| # | Section | What it held |
|---|---|---|
| — | Header / Hero | Monoton mark, Commissioner headline, Poiret strapline, subheadline, proof-point metrics, orbit or static or video background, PCB motif toggle |
| — | Prelude | Title, three visual squares, summary |
| — | Overview | Headline, summary, metrics, highlights, optional image |
| 0x | Founder | Name, title, years of domain depth, milestones (year, event, company, significance), mentors (name, contribution, relationship), key companies (role, years, outcome) |
| 0x | Operating tenets | Six tenets: title, anchor phrase, body, worked example, key insight |
| 0x | Timeline / "History rhymes" | Two eras, events per era, comparison rows (category, era 1, era 2, insight), auto-flip between then and now |
| 0x | Consolidation | Industry M&A table (acquirer, target, value, date, type, source) and the independent brands that survived (name, specialty, founded) |
| 0x | Competitive positioning | Per competitor: tier, status (dominant / struggling / closed / reopening / ceiling / premium-fill), key data points, AGF positioning, the "opening", prestige score and average flagship price for a perceptual map |
| 0x | Technology moat | Six named technologies, each with full name, tagline, patent status, capabilities, codec pipeline stages, competitive advantage; plus a shared codec diagram and the "l'Art stack" block |
| 06 | The Lineup (products) | Per product: category, description, drivers, amplifier class, DAC type, crossover, enclosure, wireless, which AGF technologies it carries, status (concept → shipping), ASP and COGS, system role (source / processor / amplifier / output / accessory), companions and connection types; visualisations for frequency response, driver diagram, tech flow, connectivity, power gauge, material swatches; a compare overlay and a system configurator |
| 0x | Venue / retail experience | Concept, zones (name, tagline, features, atmosphere, journey step), customer journey, target customer, royalty structure (broadcast split, stereo ownership, artist blocking rights), virtual ticket (concept, pricing, owner perks), financial model (one per qualifying market, revenue streams), cultural positioning (movement, anti-pattern) |
| 0x | Artist rights | Philosophy, ownership tiers (Founder / Resident / Guest style, artist and AGF share), enforcement (device lockout, legal remedies, social deterrent), revenue streams with splits |
| 0x | Distribution | Philosophy, weighted partner criteria, revenue model, territories with priority, channel types (Specialty Hi-Fi, D2C, Custom Install) with approach |
| 0x | Business model | Pricing philosophy and model name, channel approach and target partners, per-product runway table (TTM, COGS range, ASP range), revenue model, scaling timeline |
| 0x | Launch roadmap | Phases (title, TTM, products, rationale, milestones) as a Gantt, PR stunts with timing, venue pilots (count, criteria), year-one targets (global units per month, anchor reference) |
| — | Team note | Short prose interlude |
| — | Cut sheet / Concept explainer | Generic photo + benefits and reason-list modules |
| — | Footer | Mark, tagline, meta line, source citations |

## 3. Copy recovered verbatim

Hard-coded fallbacks in the renderers. Short, but they are the only sentences of the old voice that survived.

- Page title: "AGF — All Grounds Floating · Foundational Brand Development". Meta description: "A strategic move into the global audio & consumer technology markets. Audio is the tip of the spear; other premium segments become viable as the brand establishes itself."
- Footer meta: "Foundational Brand Development Document · 2026 · Internal & Investor Distribution".
- Founder section title: "Twenty-five years in this market, longer if you count the garage sales."
- Tenets deck: "Twenty-five years of compounding, distilled. Each tenet is a constraint that creates leverage — and a load-bearing rule that protects the others."
- Timeline title: "History does not repeat. It rhymes." Comparison heading: "Even Rails → Smooth Tracks".
- Technology deck: "Technologies presented as real product opportunities, and as announcements to potential third-party early adopters. Each layer compounds the others." Subtitle: "Foundational technology, single-source."
- l'Art stack body: "Quadrophonic failed. Surround-sound failed. Dolby Atmos is financially dominant in cinemas but a niche at home. Mono, mixed mono, and stereo have dominated from inception to current day. The opportunity has 'the fine art of good enough' written all over it."
- Lineup (section 06, "The Lineup", "Inaugural product line."): "Optimized for time-to-market on a full line that stands up to scrutiny from channel interest. The lower price categories are filled with third-party partner product; we move upward and land our flagship just above Focal's consumer offering ($5K USD)."
- Venue title: "The venue. A church of the performing arts."
- Artist rights: "Artist Rights — artists drive their own destiny."
- Distribution: "Distribution — the future bank-roller."
- Business model: "The Budgeted Total Package" and "Numbers, runway, and the way the money actually works."
- Competitive positioning: "Competitive Positioning — where AGF lands." Launch: "Launch Roadmap — sequencing the line."
- Closing CTA: "Channel introductions. Distribution relationships. Capital partner conversations. The first flagship venue. The first six Tenet-aligned hires. The first l'Art-recorded performance." Button: "Request the deck" (mailto placeholder `hello@agf.brand`).

## 4. Names that are fixed by the old site

- Technologies (product schema enum, in signal-flow order): **stereOS, l'Art, BT'N-Tech, l'espacI/O, FRC41, No-Nails**. Nothing else about them survived except "l'Art Production line" (the venue balcony is its "inaugural home") and "l'Art codecs" / "l'Art codec suite" on the earbud-case concept board.
- Product categories: headphone, speaker, flagship, accessory, earbud, macro-system, soundbar. Status ladder: concept, development, prototype, production, shipping.
- System roles: source, processor, amplifier, output, accessory. Connections: RF, BT, USB-C, WiFi, analog, digital-coax.
- Venue zones from the concept board: Front of House (The Bar · The Stage), The Balcony (Pro Hardware · Pro Software), The Green Room (Consumer Product · Hidden; appointment only). Royalties: broadcast-mixed performances split with the artist; the artist owns the stereo capture and can block broadcast. Virtual tickets with a permanent all-access pass for hardware owners.
- Competitor references: Focal (flagship benchmark at about $5K), "Wasted Real-Estate vs Focal flagship" as the year-one anchor.

## 5. Copy from the concept boards (AI-generated boards, so treat as draft, not canon)

- Straplines that appeared: "Sound Connects Everything.", "Higher fidelity, a broader world.", "Capture · Create · Broadcast · Beyond", "Sound moves humanity forward.", "Engineered for what's real.", "People. Places. Ideas. All Grounds Floating.", "A clearer tomorrow sounds brighter." The design system since fixed the standing lines as **"All Grounds Floating"**, **"Measured in silence."** and the campaign tagline **"Pure signal."**
- "Wasted Real-Estate" earbud case concept: "The case should be the smartest part of the system." Modes: DJ (cue in one ear, mix in the other), Broadcast (go live anywhere, capture venue and artist rights), Voice filter, Hearing support (self-tuned profiles, no prescription), RF TX and AUX out, turn the stream around (RX mode makes the case a field recorder). "Not a $299 accessory. A $799 investment in your sound. The gateway to the stereOS live artist ecosystem." Spec list on the board: Bluetooth 5.4 + LE Audio, l'Art codec suite, RF transmitter (24-bit / 96 kHz), 3.5 mm + USB-C, 6-mic array, 48 h system battery, Lattice-Semi FPGA + DSP, iOS / Android / desktop app.
- stereOS board: "Live, anywhere. Heard, everywhere." "stereOS puts your sound in the moment, and in the world. Live to air. Live to app. No limits." "One case. One vision. Endless possibilities."

## 6. Visual assets

Every image is now catalogued, with a descriptive file name, a description, the original path it came from and its pixel size. Two catalogues, each with a machine-readable twin:

- **`production-staging/assets/ASSETS.md`** (and `assets/assets.json`) covers everything except product renders, and also holds the verbatim copy transcribed from the AI boards. It replaces the old `site/assets/screenshots/`, `site/assets/sections/` and the four root images.
- **`production-staging/assets/renders/RENDERS.md`** (and `renders/renders.json`) covers the 96 renders that were in `product-renders/` (including the loose `untitled.*.jpg` files at the old root).

Current folders (all under `production-staging/assets/`):

| Folder | What it holds |
|---|---|
| `brand-boards/` | The four AI brand boards and packaging shot from the repo root (`AGF.png`, `AGF1.png`, `pic.jpeg`, `pic1.jpeg`), now `agf-brand-board-landscape-design-system.png`, `agf-master-design-system-board-portrait.png`, `agf-brand-board-mark-palette-merch.jpeg` and `agf-packaging-measured-in-silence-card.jpeg` (certificate "Measured in Silence", brass cable, trace-field box) |
| `concept-boards/` | The five boards that carry copy: the Wasted Real-Estate earbud case board, the stereOS "Live to Global Village" case ad, and three venue boards |
| `prior-work/` | Earlier products: the Remora behind-the-TV speaker (12 racetrack drivers, 4 subwoofers, 4 passive radiators), the Dolby round earbud case, Mass Fidelity USB DAC renders; `prior-work/mass-fidelity/` holds 46 more Mass Fidelity renders (USB DAC and portable DAC) |
| `concepts/` | Unbranded or AI concept imagery: in-wall "ANALOG" brass-and-green volume controls, a marble media console, a copper-wire waveform sculpture, two headphone concepts, a keyboard-format control surface in grey CAD; `concepts/material-moods/` has 14 walnut, copper, marble and glass mood images |
| `section-backgrounds/` | The one surviving old-site section background (`venue-background.webp`) |
| `renders/<product>/` | Renders by product: `over-ear-home-centric/`, `symphony-macro-system/` (the floor-standing walnut, copper and forest-green tower, formerly the root `untitled.*.jpg` files), `studio-microphone/`, `broadcast-microphone/`, `control-surface/` and `desktop-stereo-amp/` (walnut-cheeked stereo amplifier, black or silver faceplate, rear panel with RCA in/out and IEC inlet) |

Mapping from the old render folders, for reading the earlier text of this document: `mic/` is `studio-microphone/`; `gotham-broadcast/` is `broadcast-microphone/`; `portable-daw/` is `control-surface/`; `oe-hf-studio/` is `over-ear-home-centric/`; `silver-amp-stereo-dt/` and `dt-amp-shortie/` are `desktop-stereo-amp/`; `media-1/` is `concepts/material-moods/`. The old `amp-no-bg/`, `amp-w-bg/` and `broadcast-eb/` turned out, once catalogued, to hold massFIDELITY renders (USB DAC and portable DAC from the founder's earlier company), not AGF objects, and now live in `prior-work/mass-fidelity/`. The Wasted Real-Estate earbud case exists only as the concept board and the two Dolby-era CAD cases, not as a finished AGF render.

Fonts are in `fonts/` (repo root) with OFL licences in `fonts/licenses/`. The design system's `agf-design-system/agf-design-system/agf.css` embeds them, so pages built on it work from `file://`.

## 7. Known gaps (resolved)

**Resolved.** When this inventory was written, everything in section 2 that is not in sections 3 to 5 was missing: the six tenets, founder milestones and mentors, the competitor table, acquisitions, the roadmap phases and dates, pricing and COGS, territories, the artist-rights tiers, the venue financial model, and every product's specification. The database was then recovered and exported, and all of it is now in `production-staging/content/`:

- `content/sections/` has one JSON file per section (tenets, founder, timeline, consolidation, competitive positioning, technology, venue, artist rights, distribution, business model, launch roadmap and the rest), with older database versions kept as `.v2.json` and later.
- `content/products/` has the six products with their specifications, pricing and COGS.
- `content/raw/` is the untouched export.

Some questions stay open inside that content itself (blank dates and links in the consolidation table, an unsourced market-size figure, internal numbers to vet before a public site). They are listed in `REPO-MAP.md` section 5, not here.
