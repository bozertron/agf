> *The forest holds the gold.*

All Grounds Floating makes audio equipment in three divisions: **AGF // HEAR** (consumer: reference amplifiers, DACs, headphones), **AGF // FIELD** (professional capture: preamplifiers, field recorders, microphones) and **AGF // AIR** (broadcast: network audio, clocks, consoles). A floating ground isolates a circuit from the noise of common earth; the brand is that idea made visible. Its surfaces are the layers of a premium printed circuit board: deep emerald solder mask, immersion-gold traces, warm stone silkscreen. Everything in this system should feel like laboratory telemetry that has been given to a jeweller.

Use the files as follows: `tokens.json` is the source of every colour, type style, space, radius, border and opacity; `components/bundle.css` composes them into the classes the previews use; `assets/Logos/` holds the mark, lockup, seal and Floating Ground badge as finished SVG; `assets/Icons/` the line icons; `fonts/` the three faces. Sections 02 and 03 cover applications and motion.

## Voice

- Write like an engineer who loves music, not a marketer who loves adjectives. Short declaratives. "Transformer-balanced. Galvanically isolated. Quiet enough that the room becomes the loudest thing in the chain."
- Every number travels with its conditions. "-129 dBu" is advertising; "-129 dBu, 150 Ω, 20 Hz-20 kHz, A-weighted" is a measurement. The Readout, SpecTable and Certificate components enforce this.
- Sentence case everywhere except the strapline, eyebrows, micro labels and badges, which are uppercase by style. No exclamation marks. No emoji. No "premium", "ultimate" or "revolutionary": the specification does that work.
- Division codes are written `AGF // FIELD` with two slashes and spaces, and the divisions are always ordered Hear, Field, Air. Products are a letter and a number: F-1, H-7, A-16. Series units carry a number: № F1-00017.
- Address the reader as "you" only in instructions. Elsewhere speak about the equipment.
- Two standing lines belong to the brand and are not rewritten: **"All Grounds Floating"** (the strapline under the mark) and **"Measured in silence."** (the certificate headline). "Pure signal." is the tagline for campaigns.

## Colour

Three themes. **Midnight** is the brand's native state and the default: `surface` is the deepest forest, `surface-raised` the forest floor, `surface-lifted` moss, `surface-sunken` the grove. **Daylight** is the paper theme (bone `surface`, `obsidian` ink) for manuals, packaging interiors, certificates in print and bright web sections. **Air** is the OLED calibration for AGF // AIR hardware screens and broadcast UI: `obsidian` ground, `surface-sunken` nearly black, everything else as Midnight. A band that must stay dark in any theme (footer, hero, faceplate, sleeve) is `surface-deep` and is wrapped in `data-theme="midnight"` so every token inside resolves dark.

- Text is `ink` on any surface; `ink-muted` for ledes and secondary copy on `surface`, `surface-raised` and `surface-sunken`; `ink-faint` for captions and eyebrows on the same three. In Midnight only `ink` and `brass-glow` sit on `surface-lifted`. Every pair named here holds 4.5:1 in every theme (tokens.json notes the grounds per token).
- Brass is the only accent and it is a conductor, not a paint. `brass` is the fill (primary button, bold rules, the mark on dark grounds, needles). `brass-text` is the word (links, active nav, units, accent eyebrows). `brass-glow` is the hover, the lit tick, the lamp. `brass-specular` is a 1px highlight and nothing more. `brass-hairline` is the trace: dividers, borders, table rules, the PCB field. Text on a brass fill is `on-brass`, never white.
- `forest` is the brand green as a solid: Daylight headlines, swatches, packaging fields. In Midnight it is a surface.
- `moss` is decorative: disabled, tick marks, placeholder. It fails AA as text on every ground and is never body or caption.
- Three signal colours carry every status in the system, on screen and on hardware LEDs: `signal-nominal` (below -12 dBFS, lock, sync, online), `signal-hot` (to 0 dBFS, warning), `signal-clip` (clip, error, ON AIR; aliased as `live`). Nominal and clip differ by 3:1 in lightness in every theme, and a status always carries a word or a scale as well. Text on a signal fill is `on-signal`. No other greens or reds.
- Focus is `focus-ring`: a 2px gap in the ground colour, then a solid 2px ring. Meaningful borders (inputs, selection) are `line-strong`; decorative ones are `brass-hairline`.
- No gradients except the fill under an OLED frequency curve (brass-glow at 25% to transparent); no pure white, no pure black, no blue LEDs.

## Typography

Three faces, strictly ranked.

- **Monoton** is the mark and only the mark. `mark-mega` 96px, `mark` 48px, `mark-small` 24px; nothing smaller on screen (the stacked lines close up), 8 mm cap height in print. Only the letters AGF, or a model number on a faceplate (01, MKII). Never a word, never outlined, never on a photograph without a `scrim`. On hardware Monoton is never printed: it is photo-etched brass, milled relief or laser-etched into anodise.
- **Poiret One** is the reserved voice: the strapline under the mark and the single most important line on a page or object. `strapline-hero` 40px, `strapline` 24px, `strapline-small` 16px, always uppercase and tracked 0.3em; never below 16px on screen or 14pt in print because the strokes are hairlines; only in `brass`, `brass-glow` or `ink-on-deep-muted` on dark grounds, or `brass-text` and `forest` on paper. One Poiret One line per screen, at most.
- **Commissioner** is everything else, from 11px micro labels to 96px mega. Display weights are thin (200-300) so the brass mark stays the heaviest object on the page; UI and data weights are 400-600. Editorial headlines may set `"FLAR" 30` to flare the terminals toward Poiret One; UI and data lock `"FLAR" 0, "VOLM" 0` and use tabular figures so meters, prices and spec columns align.

The scale: `mega` 96 · `display` 48 · `h3` 32 · `lede` 24 · `body` 16 · `small` 14 · `caption` 13 · `eyebrow` 12 · `micro` 11, with `data-mega`, `data` and `data-small` for numbers. Leading is 1.05 on display sizes and 1.55 on body. Headlines break at the thought, not the measure; ledes stay under 60 characters a line. The standard stack is the Heading component: eyebrow, display, 48px rule, lede.

## Space, shape, line

- An 8px grid with one 4px micro-step: `space-4` through `space-120`. 4-8 inside controls, 16-32 inside components, 48-64 between elements, 80-120 between sections.
- Radii are barely there: `radius-2` inputs and segments, `radius-4` buttons and badges, `radius-8` cards and panels, `radius-pill` for status badges only. Nothing else is round except dials, lamps, vias and the seal.
- Three line weights like drafting pens: `border-hairline` 1px (`brass-hairline`), `border-rule` 2px (`brass`), `border-bold` 3px (`brass`). Rules are full-bleed within their container or exactly `space-48` wide.
- Depth comes from surface steps and hairlines. `shadow-panel` only under glass that floats over imagery; `shadow-glow` only on a lit lamp, a hovered primary button or a clipping segment. Cards on a flat surface cast no shadow and take no coloured left border.

## Texture

- **The trace field** (TraceField component) is the signature: hairline brass traces that bend only at 45°, run in parallel pairs 4px apart where they can, and terminate in vias (a 6px ring with a hollow centre). It tiles over `surface-deep` at `opacity-trace` and never over Daylight surfaces, paper interiors or `surface-raised`. On hardware it is screen-printed on rear panels and inside lids, or blind-debossed into packaging, never on a front plate.
- **Grain** (`agf-grain`, `opacity-grain`) softens every photograph and every large dark field: 0.04 over faces, 0.06 by default, 0.08 over flat colour.
- **Orbital rings** sit behind a Readout or a vectorscope: concentric `brass-hairline` circles with one dashed `brass` ring turning at 0.5 rpm.
- **Glass** (Panel component) is `glass` plus `blur-glass` with a hairline border, used only where it overlaps imagery or the trace field.
- One texture per surface. A hero with photography drops the trace field; a trace field never carries a second pattern.

## Marks and assets

- `assets/Logos/agf-mark.svg` — the letters AGF set in Monoton outlines, brass. The primary mark.
- `assets/Logos/agf-lockup.svg` — mark with the strapline in Poiret One justified to its width. For print and anywhere the mark is 64px or wider; below that use the mark alone.
- `assets/Logos/agf-seal.svg` — two rings, sixty dial ticks and the mark: for gifts, foils, debossing, etching. 24 mm or 72px minimum.
- `assets/Logos/floating-ground.svg` — the Floating Ground badge: the IEC earth symbol in a broken orbital ring. Once on every object, beside the ground-lift switch on hardware, in every footer.
- `assets/Icons/` — ten single-ink line icons at a 1.5px stroke on a 24px grid (mic, headphones, waveform, broadcast, record, play, gain, ground, phantom, spark). Extend the set at the same stroke and grid; no filled icons, no emoji. Icons are brass or `ink-faint` and sit at 16, 20 or 24px.

All four marks are delivered in brass; recolour by inlining the SVG and setting its strokes and fills, or by using the `.agf-wordmark` live type for the mark and lockup on screen.

## Components

Brand: Wordmark, Seal, FloatingGround. Actions: Button. Text: Heading. Layout: Rule. Surfaces: Panel, TraceField. Instruments: Meter, Knob, Readout. Status: Badge. Forms: Input. Navigation: Nav. Data: SpecTable. Applications: Faceplate, Sleeve, Certificate, Hero. Each component's README says what the consumer provides and what it must not do; the previews are the reference rendering in all three themes.
