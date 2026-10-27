# AGF content harvest

> **Update, same day:** the old site's database (`agf.db`, pushed to `main`) has been recovered and exported. Everything section 7 below listed as missing is now in `content/`:
>
> - `content/sections/<schema>.json` is the newest version of each section, with editor-only keys (style overrides, nudges, background settings) stripped. Where the database held more than one distinct version, the older ones are `<schema>.v2.json`, `.v3.json` and so on; the two tenet versions and the two technology versions differ in substance and both are kept.
> - `content/products/<slug>.json` is each of the six products.
> - `content/raw/` is the untouched export (every row, editor keys included) for reference.
>
> Sections 1 to 6 below still describe what the repo held before the database arrived and remain accurate as an inventory of images and fixed names.

What survived from the old site, what was lost, and what the new standalone pages can draw on. Compiled 2026-10-27 from `site/`, `product-renders/`, the root images and the design system in `agf-design-system/`.

## 1. What the old site actually was

- A schema-driven single page: `site/index.html` is an empty shell. Every section was rendered by `schema-renderer/` from rows in a server database (the comment in the HTML says "Populated by app.js from header section in DB"). The server, seed file and database are **not in this repo** (the extract reports point at `/home/bozertron/0.1-Audio-AGF-BP/server/`).
- So the prose, numbers, tenets, competitor data, roadmap phases and product specs were in that database. The repo holds only the **structure** (22 JSON schemas), a handful of **hard-coded fallback strings**, and **screenshots and renders**.
- If the old `server/` folder or its SQLite file still exists on your machine, exporting it recovers everything at once. Until then, this document is the harvest.

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

Renders in `product-renders/` (grey-box CAD and finished renders, all usable as "in development" imagery):

| Folder | What it shows |
|---|---|
| `amp-no-bg/`, `amp-w-bg/`, `silver-amp-stereo-dt/`, `dt-amp-shortie/` | A desktop stereo amplifier, walnut cheeks, black or silver faceplate, brass hardware; rear panel with RCA in/out and IEC inlet |
| `mic/` | Large-diaphragm microphone in a wire shock mount with the AGF triangle mark |
| `gotham-broadcast/` | Desktop broadcast microphone on a weighted base with XLR and lamp |
| `portable-daw/` | Keyboard-format control surface with 16 encoders, 16 faders and 8 knobs |
| `broadcast-eb/` | Earbud case concept with knurled brass knob and OLED (the "Wasted Real-Estate" object) |
| `oe-hf-studio/` | Over-ear headphones with copper accents on a head form |
| `media-1/` | Mood boards: copper knob on marble, waveform sculpture |
| root `untitled.*.jpg` | Floor-standing speaker tower in walnut, copper and forest-green finishes |

Screenshots in `site/assets/screenshots/`: the Remora behind-the-TV speaker (12 racetrack drivers, 4 subwoofers, 4 passive radiators), Mass Fidelity USB DAC renders, an in-wall "ANALOG" brass-and-green volume control, a marble media console, the venue concept boards, two headphone concepts, and three AI brand boards. `AGF.png`, `AGF1.png` and `pic.jpeg`, `pic1.jpeg` at the root are brand boards and a packaging shot (certificate "Measured in Silence", brass cable, trace-field box).

Fonts are in `fonts/` with OFL licences. The design system's `agf.css` embeds them, so pages built on it work from `file://`.

## 7. Known gaps

Everything in section 2 that is not in sections 3 to 5 is missing: the six tenets, founder milestones and mentors, the competitor table, acquisitions, the roadmap phases and dates, pricing and COGS, territories, the artist-rights tiers, the venue financial model, and every product's specification. Those are the questions to answer category by category.
