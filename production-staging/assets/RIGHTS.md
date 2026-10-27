# Image rights register

Status of every file under `production-staging/assets/` (133 files) for public use. Proposed, not legal advice; the founder decides. Written 2026-10-27 against repo map item R8. Nothing in the image library was moved or edited.

## Rules

Status is set by rule, from the file's origin and what is visible on it. Where two rules apply the stricter outcome is shown (order: do not publish, internal only, needs clearance, publishable), and the other issue is named in the "why" column.

1. **AI-generated boards, moods, venue scenes and concept images: internal only.** They are unlicensed generator output (several carry a generator watermark or a generator filename) and their text is often garbled. The venue note on the site already says "fine for discussion, not for publication".
2. **Founder CAD renders of AGF products: publishable, labelled "in development".** Greybox renders are included; they are CAD, and must carry the same label.
3. **Anything showing a Mass Fidelity, massFIDELITY, REMORA, Dolby or other third-party mark: needs clearance.** This is applied to the whole prior-work set, including views where the mark is not legible, because the product itself is the founder's prior-company design and the founder page note says "check rights before any of these go public". Real artist names and album art on screens, and the PS Audio plate on the headphones, are treated as third-party marks.
4. **The Globl Radio designer's artwork: publishable** (credited to Melvin Galapon, `globl-radio-design-system/README.md`). That artwork is not in this library; see "Not in this register" at the end.
5. **Screenshots of third-party material: do not publish** when the image is plainly another party's marketing material and nothing shows AGF holds rights. When the source is simply unrecorded (no mark, no author), it is **needs clearance** until the source is identified.
6. Where the catalogue description did not settle the question, the image was opened. Files opened: all four over-ear renders, MV2 Bundle+, all other `concepts/` and `prior-work/` images, the five concept boards, the brand boards, and contact sheets of every other folder. Marks on `prior-work/mass-fidelity/` views are taken from the catalogue wording; the status there does not depend on the mark being legible.

"Origin" values: AI-generated | founder CAD render | designer artwork | screenshot of third-party material. Prior-work CAD is labelled founder CAD render but is the prior company's product, not an AGF product, so rule 2 does not apply to it.

## Register

### Brand boards (4)

Folder `production-staging/assets/brand-boards/`. 4 internal only.

| Path (under `assets/`) | Origin | Third-party marks visible | Status | Why |
|---|---|---|---|---|
| `brand-boards/agf-brand-board-landscape-design-system.png` | AI-generated | none | **internal only** | AI-generated brand board; generator output, text on it not reliable. Take tokens from tokens.json, not the board. |
| `brand-boards/agf-brand-board-mark-palette-merch.jpeg` | AI-generated | none | **internal only** | AI-generated brand board; generator output, hex values and type callouts not reliable. |
| `brand-boards/agf-master-design-system-board-portrait.png` | AI-generated | none | **internal only** | AI-generated board with visibly garbled text and hex values ([sic] in ASSETS.md); generator output. |
| `brand-boards/agf-packaging-measured-in-silence-card.jpeg` | AI-generated | none | **internal only** | AI-generated packaging shot; generator output. Its serial, noise-floor and THD+N figures are invented, so it could read as a real spec if published. |

### Concept boards (5)

Folder `production-staging/assets/concept-boards/`. 5 internal only.

| Path (under `assets/`) | Origin | Third-party marks visible | Status | Why |
|---|---|---|---|---|
| `concept-boards/stereos-live-to-global-village-case-ad.webp` | AI-generated | none (stereOS and AGF are own marks) | **internal only** | AI-generated ad board; generator output and copy not verified. |
| `concept-boards/venue-balcony-marble-control-surface-concept.webp` | AI-generated | none confirmed; "maestro 100s" nameplate partly legible | **internal only** | AI-generated venue render (REPO-MAP R8; venue note: fine for discussion, not for publication). Invented ticket and countdown tiles. |
| `concept-boards/venue-bar-stage-photo-with-copy-overlay.webp` | AI-generated | none (l'Art Production is an own line) | **internal only** | Catalogue calls it a stock-style photo; viewed and it reads as AI-generated (garbled-style overlay copy). Even if it is a stock photo, no licence is on file. Venue note: not for publication. |
| `concept-boards/venue-three-panel-board-front-of-house-balcony-green-room.webp` | AI-generated | none | **internal only** | AI-generated venue board; venue note: fine for discussion, not for publication. |
| `concept-boards/wasted-real-estate-earbud-case-board.webp` | AI-generated | Dolby logo on case screen; Lattice-Semi named in copy; Paul Simon track on screen | **internal only** | AI-generated board. Internal-only rule governs; it would also need clearance for the Dolby mark and the artist name if ever promoted. |

### Concepts (11)

Folder `production-staging/assets/concepts/`. 7 internal only, 1 publishable, 1 do not publish, 2 needs clearance.

| Path (under `assets/`) | Origin | Third-party marks visible | Status | Why |
|---|---|---|---|---|
| `concepts/agf-usb-audio-dac-copper-knob-walnut-shelf.webp` | AI-generated | none (AGF on front edge) | **internal only** | AI-generated; unlicensed generator output. |
| `concepts/analog-round-brass-ring-green-graphite-knob.png` | AI-generated | none | **internal only** | AI-generated; unlicensed generator output; OLED and label text is generator text. |
| `concepts/analog-wall-plate-brass-knob-green-ring-walnut.png` | AI-generated | none | **internal only** | AI-generated; unlicensed generator output; OLED and label text is generator text. |
| `concepts/analog-wall-plate-green-panel-wood-frame-brass-knob.png` | AI-generated | none | **internal only** | AI-generated; unlicensed generator output; OLED and label text is generator text. |
| `concepts/home-theatre-green-brass-wall-speakers-usb-audio.webp` | AI-generated | "SOTA" logo on the TV | **internal only** | AI-generated room; internal-only rule governs. The SOTA TV mark would also need clearance or removal if ever promoted. Same bytes as section-backgrounds/prelude-hero.webp (copy not present on disk). |
| `concepts/keyboard-control-surface-knobs-faders-grey-cad.png` | founder CAD render | none | **publishable** | Unbranded grey CAD of the keyboard-format control surface; viewed and it is the same model as renders/control-surface/*. Publishable as "in development"; product status shown as assumed on the lineup page. |
| `concepts/marble-media-console-projector-screen-planters.png` | AI-generated | none | **internal only** | AI-generated; unlicensed generator output. |
| `concepts/mv2-bundle-plus-white-headphones-stand.png` | screenshot of third-party material | "MV2 Bundle+" caption (another product's name) | **do not publish** | Viewed: marketing-style image of white headphones on a charging stand, captioned "MV2 Bundle+", filed as a screenshot. Nothing indicates AGF made it or holds rights. Moves to needs clearance only if the founder can show it is his own prior-company marketing. Same bytes as section-backgrounds/prelude-hero.png (copy not present on disk). |
| `concepts/over-ear-headphones-black-red-pair.png` | screenshot of third-party material | none visible | **needs clearance** | Filed from a screenshot; no brand marking, but no source, author or generator is recorded, so neither AGF ownership nor AI origin is established. Identify the source first; if it is reference material from another maker it becomes do not publish. |
| `concepts/over-ear-headphones-tan-pad-silver-shell-concept.png` | screenshot of third-party material | none visible | **needs clearance** | Filed from a screenshot; no brand marking, but source and author are not recorded and the design may be another maker's product. Same bytes as section-backgrounds/prelude-square-1.png (copy not present on disk). Identify the source first. |
| `concepts/waveform-sculpture-copper-wire-teal-patina.png` | AI-generated | none | **internal only** | AI-generated; original filename ends "nanobananapro" (generator output). |

### Concepts / material moods (14)

Folder `production-staging/assets/concepts/material-moods/`. 14 internal only.

| Path (under `assets/`) | Origin | Third-party marks visible | Status | Why |
|---|---|---|---|---|
| `concepts/material-moods/concept-backlit-marble-panel-walnut-frame-cylinder-c2111963.jpg` | AI-generated | none (small generator watermark bottom-left) | **internal only** | AI-generated material mood; carries the generator watermark. Not a product render. |
| `concepts/material-moods/concept-copper-knob-marble-walnut-macro-1363a689.jpg` | AI-generated | none (small generator watermark bottom-left) | **internal only** | AI-generated material mood; carries the generator watermark. Not a product render. |
| `concepts/material-moods/concept-glass-case-marble-tree-sculpture-afbb0e15.jpeg` | AI-generated | none (small generator watermark bottom-left) | **internal only** | AI-generated material mood; carries the generator watermark. Not a product render. |
| `concepts/material-moods/concept-glass-cube-copper-piping-6f82205a.jpeg` | AI-generated | none (small generator watermark bottom-left) | **internal only** | AI-generated material mood; carries the generator watermark. Not a product render. |
| `concepts/material-moods/concept-glass-dome-cream-tentacle-cables-5da38c28.jpeg` | AI-generated | none (small generator watermark bottom-left) | **internal only** | AI-generated material mood; carries the generator watermark. Not a product render. |
| `concepts/material-moods/concept-glass-dome-walnut-copper-circuitry-06dd7cc9.jpeg` | AI-generated | none (small generator watermark bottom-left) | **internal only** | AI-generated material mood; carries the generator watermark. Not a product render. |
| `concepts/material-moods/concept-glass-sphere-copper-wire-loops-9ed8eb75.jpeg` | AI-generated | none (small generator watermark bottom-left) | **internal only** | AI-generated material mood; carries the generator watermark. Not a product render. |
| `concepts/material-moods/concept-marble-cabinet-copper-knob-rows-9fda7216.jpg` | AI-generated | none (small generator watermark bottom-left) | **internal only** | AI-generated material mood; carries the generator watermark. Not a product render. |
| `concepts/material-moods/concept-marble-inset-twin-copper-cylinders-8bf14bd3.jpg` | AI-generated | none (small generator watermark bottom-left) | **internal only** | AI-generated material mood; carries the generator watermark. Not a product render. |
| `concepts/material-moods/concept-marble-slab-copper-barrel-inset-fc16c2e6.jpg` | AI-generated | none (small generator watermark bottom-left) | **internal only** | AI-generated material mood; carries the generator watermark. Not a product render. |
| `concepts/material-moods/concept-twin-marble-copper-columns-walnut-plinth-9dcc8dfa.jpg` | AI-generated | none (small generator watermark bottom-left) | **internal only** | AI-generated material mood; carries the generator watermark. Not a product render. |
| `concepts/material-moods/concept-walnut-copper-column-corner-closeup-e73823b6.jpg` | AI-generated | none (small generator watermark bottom-left) | **internal only** | AI-generated material mood; carries the generator watermark. Not a product render. |
| `concepts/material-moods/concept-walnut-marble-base-lit-copper-tubes-bc39217f.jpg` | AI-generated | none (small generator watermark bottom-left) | **internal only** | AI-generated material mood; carries the generator watermark. Not a product render. |
| `concepts/material-moods/concept-walnut-panel-marble-inlay-twin-copper-cylinders-cd660305.jpg` | AI-generated | none (small generator watermark bottom-left) | **internal only** | AI-generated material mood; carries the generator watermark. Not a product render. |

### Prior work (9)

Folder `production-staging/assets/prior-work/`. 9 needs clearance.

| Path (under `assets/`) | Origin | Third-party marks visible | Status | Why |
|---|---|---|---|---|
| `prior-work/massfidelity-dac-black-copper-slider-render.png` | founder CAD render | massFIDELITY printed on top | **needs clearance** | Founder prior-company product (not an AGF product), shows the massFIDELITY mark. |
| `prior-work/massfidelity-usb-audio-dac-black-gold-render.png` | founder CAD render | massFIDELITY on front edge | **needs clearance** | Founder prior-company product, shows the massFIDELITY mark. DISPLAYED on the founder page. |
| `prior-work/remora-driver-layout-cutaway-render.png` | founder CAD render | REMORA | **needs clearance** | Shows the REMORA mark; prior-work product, not AGF. Same bytes as two section-backgrounds files not on disk. |
| `prior-work/remora-driver-layout-spec-diagram.png` | founder CAD render | REMORA named in the spec text | **needs clearance** | Spec slide naming Remora; prior-work product. DISPLAYED on the founder page. |
| `prior-work/remora-exploded-mount-diagram.png` | founder CAD render | REMORA | **needs clearance** | Shows the REMORA mark; prior-work product. Same bytes as two section-backgrounds files not on disk. |
| `prior-work/remora-speaker-on-tv-rear-render.png` | founder CAD render | REMORA; the TV is a generic flat screen, no TV brand seen | **needs clearance** | Shows the REMORA mark; prior-work product. DISPLAYED on the founder page. |
| `prior-work/round-earbud-case-dolby-logo-lid-kod-screen.png` | founder CAD render | Dolby double-D on lid; "KOD / J. Cole" with album art on screen | **needs clearance** | Dolby mark plus a real artist, track and cover art. The case itself is the AGF earbud concept. |
| `prior-work/round-earbud-case-with-earbuds-paul-simon-screen.png` | founder CAD render | "Late in the Evening / Paul Simon" on screen, small album thumbnail | **needs clearance** | No brand logo, but a real artist and track name and album art on screen need clearance. DISPLAYED on the founder page. |
| `prior-work/usb-audio-dac-exploded-assembly-drawing.png` | founder CAD render | small multicolour "EP" logo stamp bottom-left (owner not identified) | **needs clearance** | Viewed: exploded drawing of the prior-company USB Audio box with an unidentified "EP" stamp. Confirm who owns the drawing and the logo. |

### Prior work / Mass Fidelity (46)

Folder `production-staging/assets/prior-work/mass-fidelity/`. 46 needs clearance.

| Path (under `assets/`) | Origin | Third-party marks visible | Status | Why |
|---|---|---|---|---|
| `prior-work/mass-fidelity/mass-fidelity-portable-dac-angle-closeup-labels-ports-522.png` | founder CAD render | massFIDELITY wordmark (per catalogue) | **needs clearance** | Founder prior-company (massFIDELITY) product, not an AGF product; the set carries the massFIDELITY mark. Finish study or view of the same product. |
| `prior-work/mass-fidelity/mass-fidelity-portable-dac-angle-port-end-526.png` | founder CAD render | massFIDELITY wordmark (per catalogue) | **needs clearance** | Founder prior-company (massFIDELITY) product, not an AGF product; the set carries the massFIDELITY mark. Finish study or view of the same product. |
| `prior-work/mass-fidelity/mass-fidelity-portable-dac-angle-port-end-light-bg-527.png` | founder CAD render | massFIDELITY wordmark (per catalogue) | **needs clearance** | Founder prior-company (massFIDELITY) product, not an AGF product; the set carries the massFIDELITY mark. Finish study or view of the same product. |
| `prior-work/mass-fidelity/mass-fidelity-portable-dac-copper-slot-control-closeup-528.png` | founder CAD render | massFIDELITY wordmark (per catalogue) | **needs clearance** | Founder prior-company (massFIDELITY) product, not an AGF product; the set carries the massFIDELITY mark. Finish study or view of the same product. |
| `prior-work/mass-fidelity/mass-fidelity-portable-dac-top-labels-full-legend-521.png` | founder CAD render | massFIDELITY wordmark (per catalogue) | **needs clearance** | Founder prior-company (massFIDELITY) product, not an AGF product; the set carries the massFIDELITY mark. Finish study or view of the same product. |
| `prior-work/mass-fidelity/mass-fidelity-portable-dac-top-labels-full-legend-ports-523.png` | founder CAD render | massFIDELITY wordmark (per catalogue) | **needs clearance** | Founder prior-company (massFIDELITY) product, not an AGF product; the set carries the massFIDELITY mark. Finish study or view of the same product. |
| `prior-work/mass-fidelity/mass-fidelity-portable-dac-top-labels-usb-in-se-out-519.png` | founder CAD render | massFIDELITY wordmark (per catalogue) | **needs clearance** | Founder prior-company (massFIDELITY) product, not an AGF product; the set carries the massFIDELITY mark. Finish study or view of the same product. |
| `prior-work/mass-fidelity/mass-fidelity-portable-dac-top-labels-usb-in-se-out-ports-520.png` | founder CAD render | massFIDELITY wordmark (per catalogue) | **needs clearance** | Founder prior-company (massFIDELITY) product, not an AGF product; the set carries the massFIDELITY mark. Finish study or view of the same product. |
| `prior-work/mass-fidelity/mass-fidelity-portable-dac-top-plain-no-labels-524.png` | founder CAD render | massFIDELITY wordmark (per catalogue) | **needs clearance** | Founder prior-company (massFIDELITY) product, not an AGF product; the set carries the massFIDELITY mark. Finish study or view of the same product. |
| `prior-work/mass-fidelity/mass-fidelity-portable-dac-top-plain-no-labels-ports-525.png` | founder CAD render | massFIDELITY wordmark (per catalogue) | **needs clearance** | Founder prior-company (massFIDELITY) product, not an AGF product; the set carries the massFIDELITY mark. Finish study or view of the same product. |
| `prior-work/mass-fidelity/mass-fidelity-usb-dac-angle.png` | founder CAD render | massFIDELITY wordmark (per catalogue) | **needs clearance** | Founder prior-company (massFIDELITY) product, not an AGF product; the set carries the massFIDELITY mark. Finish study or view of the same product. |
| `prior-work/mass-fidelity/mass-fidelity-usb-dac-black-gold-knob-angle-163.jpg` | founder CAD render | massFIDELITY product; wordmark not confirmed on this view | **needs clearance** | Founder prior-company (massFIDELITY) product, not an AGF product; the set carries the massFIDELITY mark. Finish study or view of the same product. |
| `prior-work/mass-fidelity/mass-fidelity-usb-dac-black-gold-knob-ui-labels-angle-162.jpg` | founder CAD render | massFIDELITY product; wordmark not confirmed on this view | **needs clearance** | Founder prior-company (massFIDELITY) product, not an AGF product; the set carries the massFIDELITY mark. Finish study or view of the same product. |
| `prior-work/mass-fidelity/mass-fidelity-usb-dac-blue-acrylic-pink-top-silver-knob-angle-172.jpg` | founder CAD render | massFIDELITY product; wordmark not confirmed on this view | **needs clearance** | Founder prior-company (massFIDELITY) product, not an AGF product; the set carries the massFIDELITY mark. Finish study or view of the same product. |
| `prior-work/mass-fidelity/mass-fidelity-usb-dac-blue-acrylic-pink-top-silver-knob-angle-small-173.jpg` | founder CAD render | massFIDELITY product; wordmark not confirmed on this view | **needs clearance** | Founder prior-company (massFIDELITY) product, not an AGF product; the set carries the massFIDELITY mark. Finish study or view of the same product. |
| `prior-work/mass-fidelity/mass-fidelity-usb-dac-bottom.png` | founder CAD render | massFIDELITY wordmark (per catalogue) | **needs clearance** | Founder prior-company (massFIDELITY) product, not an AGF product; the set carries the massFIDELITY mark. Finish study or view of the same product. |
| `prior-work/mass-fidelity/mass-fidelity-usb-dac-charcoal-copper-knob-angle-221.jpg` | founder CAD render | massFIDELITY product; wordmark not confirmed on this view | **needs clearance** | Founder prior-company (massFIDELITY) product, not an AGF product; the set carries the massFIDELITY mark. Finish study or view of the same product. |
| `prior-work/mass-fidelity/mass-fidelity-usb-dac-charcoal-copper-knob-angle-alt-222.jpg` | founder CAD render | massFIDELITY product; wordmark not confirmed on this view | **needs clearance** | Founder prior-company (massFIDELITY) product, not an AGF product; the set carries the massFIDELITY mark. Finish study or view of the same product. |
| `prior-work/mass-fidelity/mass-fidelity-usb-dac-charcoal-copper-knob-angle-alt-small-223.jpg` | founder CAD render | massFIDELITY product; wordmark not confirmed on this view | **needs clearance** | Founder prior-company (massFIDELITY) product, not an AGF product; the set carries the massFIDELITY mark. Finish study or view of the same product. |
| `prior-work/mass-fidelity/mass-fidelity-usb-dac-charcoal-copper-knob-angle-small-220.jpg` | founder CAD render | massFIDELITY product; wordmark not confirmed on this view | **needs clearance** | Founder prior-company (massFIDELITY) product, not an AGF product; the set carries the massFIDELITY mark. Finish study or view of the same product. |
| `prior-work/mass-fidelity/mass-fidelity-usb-dac-charcoal-copper-knob-low-side-angle-225.jpg` | founder CAD render | massFIDELITY product; wordmark not confirmed on this view | **needs clearance** | Founder prior-company (massFIDELITY) product, not an AGF product; the set carries the massFIDELITY mark. Finish study or view of the same product. |
| `prior-work/mass-fidelity/mass-fidelity-usb-dac-charcoal-copper-knob-rear-ports-angle-224.jpg` | founder CAD render | massFIDELITY product; wordmark not confirmed on this view | **needs clearance** | Founder prior-company (massFIDELITY) product, not an AGF product; the set carries the massFIDELITY mark. Finish study or view of the same product. |
| `prior-work/mass-fidelity/mass-fidelity-usb-dac-charcoal-gold-knob-ui-label-plan-159.jpg` | founder CAD render | massFIDELITY product; wordmark not confirmed on this view | **needs clearance** | Founder prior-company (massFIDELITY) product, not an AGF product; the set carries the massFIDELITY mark. Finish study or view of the same product. |
| `prior-work/mass-fidelity/mass-fidelity-usb-dac-dark-marble-copper-veins-copper-knob-angle-190.jpg` | founder CAD render | massFIDELITY product; wordmark not confirmed on this view | **needs clearance** | Founder prior-company (massFIDELITY) product, not an AGF product; the set carries the massFIDELITY mark. Finish study or view of the same product. |
| `prior-work/mass-fidelity/mass-fidelity-usb-dac-dark-marble-copper-veins-copper-knob-angle-alt-192.jpg` | founder CAD render | massFIDELITY product; wordmark not confirmed on this view | **needs clearance** | Founder prior-company (massFIDELITY) product, not an AGF product; the set carries the massFIDELITY mark. Finish study or view of the same product. |
| `prior-work/mass-fidelity/mass-fidelity-usb-dac-dark-marble-copper-veins-copper-knob-angle-alt-small-193.jpg` | founder CAD render | massFIDELITY product; wordmark not confirmed on this view | **needs clearance** | Founder prior-company (massFIDELITY) product, not an AGF product; the set carries the massFIDELITY mark. Finish study or view of the same product. |
| `prior-work/mass-fidelity/mass-fidelity-usb-dac-dark-marble-copper-veins-copper-knob-angle-small-191.jpg` | founder CAD render | massFIDELITY product; wordmark not confirmed on this view | **needs clearance** | Founder prior-company (massFIDELITY) product, not an AGF product; the set carries the massFIDELITY mark. Finish study or view of the same product. |
| `prior-work/mass-fidelity/mass-fidelity-usb-dac-front.png` | founder CAD render | massFIDELITY wordmark (per catalogue) | **needs clearance** | Founder prior-company (massFIDELITY) product, not an AGF product; the set carries the massFIDELITY mark. Finish study or view of the same product. |
| `prior-work/mass-fidelity/mass-fidelity-usb-dac-green-gold-base-gold-knob-angle-184.jpg` | founder CAD render | massFIDELITY product; wordmark not confirmed on this view | **needs clearance** | Founder prior-company (massFIDELITY) product, not an AGF product; the set carries the massFIDELITY mark. Finish study or view of the same product. |
| `prior-work/mass-fidelity/mass-fidelity-usb-dac-green-gold-base-gold-knob-angle-small-185.jpg` | founder CAD render | massFIDELITY product; wordmark not confirmed on this view | **needs clearance** | Founder prior-company (massFIDELITY) product, not an AGF product; the set carries the massFIDELITY mark. Finish study or view of the same product. |
| `prior-work/mass-fidelity/mass-fidelity-usb-dac-green-marble-top-black-knob-angle-164.jpg` | founder CAD render | massFIDELITY product; wordmark not confirmed on this view | **needs clearance** | Founder prior-company (massFIDELITY) product, not an AGF product; the set carries the massFIDELITY mark. Finish study or view of the same product. |
| `prior-work/mass-fidelity/mass-fidelity-usb-dac-green-pink-top-gold-knob-angle-186.jpg` | founder CAD render | massFIDELITY product; wordmark not confirmed on this view | **needs clearance** | Founder prior-company (massFIDELITY) product, not an AGF product; the set carries the massFIDELITY mark. Finish study or view of the same product. |
| `prior-work/mass-fidelity/mass-fidelity-usb-dac-green-pink-top-gold-knob-angle-small-187.jpg` | founder CAD render | massFIDELITY product; wordmark not confirmed on this view | **needs clearance** | Founder prior-company (massFIDELITY) product, not an AGF product; the set carries the massFIDELITY mark. Finish study or view of the same product. |
| `prior-work/mass-fidelity/mass-fidelity-usb-dac-greybox-angle-178.jpg` | founder CAD render | massFIDELITY product; wordmark not confirmed on this view | **needs clearance** | Founder prior-company (massFIDELITY) product, not an AGF product; the set carries the massFIDELITY mark. Untextured clay model, still the prior company's design. |
| `prior-work/mass-fidelity/mass-fidelity-usb-dac-greybox-angle-small-179.jpg` | founder CAD render | massFIDELITY product; wordmark not confirmed on this view | **needs clearance** | Founder prior-company (massFIDELITY) product, not an AGF product; the set carries the massFIDELITY mark. Untextured clay model, still the prior company's design. |
| `prior-work/mass-fidelity/mass-fidelity-usb-dac-greybox-charcoal-angle-217.jpg` | founder CAD render | massFIDELITY product; wordmark not confirmed on this view | **needs clearance** | Founder prior-company (massFIDELITY) product, not an AGF product; the set carries the massFIDELITY mark. Untextured clay model, still the prior company's design. |
| `prior-work/mass-fidelity/mass-fidelity-usb-dac-greybox-charcoal-angle-small-216.jpg` | founder CAD render | massFIDELITY product; wordmark not confirmed on this view | **needs clearance** | Founder prior-company (massFIDELITY) product, not an AGF product; the set carries the massFIDELITY mark. Untextured clay model, still the prior company's design. |
| `prior-work/mass-fidelity/mass-fidelity-usb-dac-left-side.png` | founder CAD render | massFIDELITY wordmark (per catalogue) | **needs clearance** | Founder prior-company (massFIDELITY) product, not an AGF product; the set carries the massFIDELITY mark. Finish study or view of the same product. |
| `prior-work/mass-fidelity/mass-fidelity-usb-dac-marble-sides-dark-top-copper-knob-angle-199.jpg` | founder CAD render | massFIDELITY wordmark (per catalogue) | **needs clearance** | Founder prior-company (massFIDELITY) product, not an AGF product; the set carries the massFIDELITY mark. Finish study or view of the same product. |
| `prior-work/mass-fidelity/mass-fidelity-usb-dac-marble-sides-dark-top-copper-knob-angle-small-198.jpg` | founder CAD render | massFIDELITY product; wordmark not confirmed on this view | **needs clearance** | Founder prior-company (massFIDELITY) product, not an AGF product; the set carries the massFIDELITY mark. Finish study or view of the same product. |
| `prior-work/mass-fidelity/mass-fidelity-usb-dac-rear-panel.png` | founder CAD render | massFIDELITY wordmark (per catalogue) | **needs clearance** | Founder prior-company (massFIDELITY) product, not an AGF product; the set carries the massFIDELITY mark. Finish study or view of the same product. |
| `prior-work/mass-fidelity/mass-fidelity-usb-dac-right-side.png` | founder CAD render | massFIDELITY wordmark (per catalogue) | **needs clearance** | Founder prior-company (massFIDELITY) product, not an AGF product; the set carries the massFIDELITY mark. Catalogue notes this view was inferred from siblings, not opened. |
| `prior-work/mass-fidelity/mass-fidelity-usb-dac-top.png` | founder CAD render | massFIDELITY wordmark (per catalogue) | **needs clearance** | Founder prior-company (massFIDELITY) product, not an AGF product; the set carries the massFIDELITY mark. Finish study or view of the same product. |
| `prior-work/mass-fidelity/mass-fidelity-usb-dac-white-sides-gold-knob-angle-208.jpg` | founder CAD render | massFIDELITY product; wordmark not confirmed on this view | **needs clearance** | Founder prior-company (massFIDELITY) product, not an AGF product; the set carries the massFIDELITY mark. Finish study or view of the same product. |
| `prior-work/mass-fidelity/mass-fidelity-usb-dac-white-sides-gold-knob-angle-alt-210.jpg` | founder CAD render | massFIDELITY product; wordmark not confirmed on this view | **needs clearance** | Founder prior-company (massFIDELITY) product, not an AGF product; the set carries the massFIDELITY mark. Finish study or view of the same product. |
| `prior-work/mass-fidelity/mass-fidelity-usb-dac-white-sides-gold-knob-angle-small-209.jpg` | founder CAD render | massFIDELITY product; wordmark not confirmed on this view | **needs clearance** | Founder prior-company (massFIDELITY) product, not an AGF product; the set carries the massFIDELITY mark. Finish study or view of the same product. |

### Section backgrounds (1)

Folder `production-staging/assets/section-backgrounds/`. 1 internal only.

| Path (under `assets/`) | Origin | Third-party marks visible | Status | Why |
|---|---|---|---|---|
| `section-backgrounds/venue-background.webp` | AI-generated | none (AGF sign is own mark) | **internal only** | AI-generated venue interior; venue note: not for publication. DISPLAYED on the venue page. Identical to venue-figure.webp (not on disk). |

### Renders / symphony-macro-system (18)

Folder `production-staging/assets/renders/symphony-macro-system/`. 18 publishable.

| Path (under `assets/`) | Origin | Third-party marks visible | Status | Why |
|---|---|---|---|---|
| `renders/symphony-macro-system/symphony-tower-black-brass-ring-driver-closeup.png` | founder CAD render | none | **publishable** | Founder CAD render of the Symphony Macro-System, render pair from the old site screenshots (PNG). Publish as "in development". |
| `renders/symphony-macro-system/symphony-tower-black-brass-ring-front-angle-67.jpg` | founder CAD render | none | **publishable** | Founder CAD render of the Symphony Macro-System, numbered render (JPG). Publish as "in development". |
| `renders/symphony-macro-system/symphony-tower-black-brass-ring-front-angle-alt-69.jpg` | founder CAD render | none | **publishable** | Founder CAD render of the Symphony Macro-System, numbered render (JPG). Publish as "in development". |
| `renders/symphony-macro-system/symphony-tower-black-brass-ring-woofer-closeup-68.jpg` | founder CAD render | none | **publishable** | Founder CAD render of the Symphony Macro-System, numbered render (JPG). Publish as "in development". |
| `renders/symphony-macro-system/symphony-tower-black-brass-trim-brass-ring-front-angle-66.jpg` | founder CAD render | none | **publishable** | Founder CAD render of the Symphony Macro-System, numbered render (JPG). Publish as "in development". |
| `renders/symphony-macro-system/symphony-tower-black-brass-trim-front-angle-61.jpg` | founder CAD render | none | **publishable** | Founder CAD render of the Symphony Macro-System, numbered render (JPG). Publish as "in development". |
| `renders/symphony-macro-system/symphony-tower-black-brass-trim-woofer-closeup-60.jpg` | founder CAD render | none | **publishable** | Founder CAD render of the Symphony Macro-System, numbered render (JPG). Publish as "in development". |
| `renders/symphony-macro-system/symphony-tower-copper-driver-closeup.png` | founder CAD render | none | **publishable** | Founder CAD render of the Symphony Macro-System, render pair from the old site screenshots (PNG). Publish as "in development". |
| `renders/symphony-macro-system/symphony-tower-copper-front-woofer-closeup-71.jpg` | founder CAD render | none | **publishable** | Founder CAD render of the Symphony Macro-System, numbered render (JPG). Publish as "in development". |
| `renders/symphony-macro-system/symphony-tower-copper-front.png` | founder CAD render | none | **publishable** | Founder CAD render of the Symphony Macro-System, render pair from the old site screenshots (PNG). Publish as "in development". |
| `renders/symphony-macro-system/symphony-tower-green-brass-driver-closeup.png` | founder CAD render | none | **publishable** | Founder CAD render of the Symphony Macro-System, render pair from the old site screenshots (PNG). Publish as "in development". |
| `renders/symphony-macro-system/symphony-tower-green-brass-front.png` | founder CAD render | none | **publishable** | Founder CAD render of the Symphony Macro-System, render pair from the old site screenshots (PNG). Publish as "in development". |
| `renders/symphony-macro-system/symphony-tower-green-copper-front-angle-99.jpg` | founder CAD render | none | **publishable** | Founder CAD render of the Symphony Macro-System, numbered render (JPG). Publish as "in development". |
| `renders/symphony-macro-system/symphony-tower-green-copper-woofer-closeup-100.jpg` | founder CAD render | none | **publishable** | Founder CAD render of the Symphony Macro-System, numbered render (JPG). Publish as "in development". |
| `renders/symphony-macro-system/symphony-tower-walnut-driver-closeup.png` | founder CAD render | none | **publishable** | Founder CAD render of the Symphony Macro-System, render pair from the old site screenshots (PNG). Publish as "in development". |
| `renders/symphony-macro-system/symphony-tower-walnut-front-angle-101.jpg` | founder CAD render | none | **publishable** | Founder CAD render of the Symphony Macro-System, numbered render (JPG). Publish as "in development". |
| `renders/symphony-macro-system/symphony-tower-walnut-front.png` | founder CAD render | none | **publishable** | Founder CAD render of the Symphony Macro-System, render pair from the old site screenshots (PNG). Publish as "in development". |
| `renders/symphony-macro-system/symphony-tower-walnut-woofer-closeup-102.jpg` | founder CAD render | none | **publishable** | Founder CAD render of the Symphony Macro-System, numbered render (JPG). Publish as "in development". |

### Renders / over-ear-home-centric (4)

Folder `production-staging/assets/renders/over-ear-home-centric/`. 2 publishable, 2 needs clearance.

| Path (under `assets/`) | Origin | Third-party marks visible | Status | Why |
|---|---|---|---|---|
| `renders/over-ear-home-centric/over-ear-headphones-matte-black-copper-earcup-closeup-136.jpg` | founder CAD render | none visible on this view | **publishable** | Founder CAD render, publishable as "in development". Caveat: the same model carries a PS Audio plate in 135 and 139, so confirm with the founder that the headphone design is AGF's. |
| `renders/over-ear-home-centric/over-ear-headphones-matte-black-copper-front-133.jpg` | founder CAD render | none visible on this view | **publishable** | Founder CAD render, publishable as "in development". Caveat: the same model carries a PS Audio plate in 135 and 139, so confirm with the founder that the headphone design is AGF's. |
| `renders/over-ear-home-centric/over-ear-headphones-matte-black-copper-front-three-quarter-135.jpg` | founder CAD render | same PS Audio plate, small, on the right cup yoke (seen at 4x crop) | **needs clearance** | Viewed: the small plate on the far cup is the PS Audio mark. DISPLAYED on the lineup page. Re-render without the plate or clear it. |
| `renders/over-ear-home-centric/over-ear-headphones-matte-black-copper-side-three-quarter-139.jpg` | founder CAD render | "PS AUDIO" logo plate on the cup (read at full size) | **needs clearance** | Viewed: logo plate on the ear cup reads PS AUDIO. Catalogue only says "logo plate". Re-render without the plate or clear it. |

### Renders / studio-microphone (7)

Folder `production-staging/assets/renders/studio-microphone/`. 7 publishable.

| Path (under `assets/`) | Origin | Third-party marks visible | Status | Why |
|---|---|---|---|---|
| `renders/studio-microphone/studio-mic-boom-arm-front-full-200.jpg` | founder CAD render | AGF "A" mark on the crossbar | **publishable** | Founder CAD render, publishable as "in development"; product is not in the database and is shown as assumed on the lineup page. |
| `renders/studio-microphone/studio-mic-boom-arm-rear-full-199.jpg` | founder CAD render | AGF "A" mark on the crossbar | **publishable** | Founder CAD render, publishable as "in development"; product is not in the database and is shown as assumed on the lineup page. |
| `renders/studio-microphone/studio-mic-boom-arm-side-angle-dark-bg-203.jpg` | founder CAD render | AGF "A" mark on the crossbar | **publishable** | Founder CAD render, publishable as "in development"; product is not in the database and is shown as assumed on the lineup page. |
| `renders/studio-microphone/studio-mic-shockmount-front-angle-202.jpg` | founder CAD render | AGF "A" mark on the crossbar | **publishable** | Founder CAD render, publishable as "in development"; product is not in the database and is shown as assumed on the lineup page. |
| `renders/studio-microphone/studio-mic-shockmount-front-angle-closeup-197.jpg` | founder CAD render | AGF "A" mark on the crossbar | **publishable** | Founder CAD render, publishable as "in development"; product is not in the database and is shown as assumed on the lineup page. |
| `renders/studio-microphone/studio-mic-shockmount-front-closeup-201.jpg` | founder CAD render | AGF "A" mark on the crossbar | **publishable** | Founder CAD render, publishable as "in development"; product is not in the database and is shown as assumed on the lineup page. |
| `renders/studio-microphone/studio-mic-shockmount-rear-closeup-198.jpg` | founder CAD render | AGF "A" mark on the crossbar | **publishable** | Founder CAD render, publishable as "in development"; product is not in the database and is shown as assumed on the lineup page. |

### Renders / broadcast-microphone (3)

Folder `production-staging/assets/renders/broadcast-microphone/`. 3 publishable.

| Path (under `assets/`) | Origin | Third-party marks visible | Status | Why |
|---|---|---|---|---|
| `renders/broadcast-microphone/broadcast-mic-greybox-front-3.png` | founder CAD render | AGF logo on the control panel | **publishable** | Founder grey-box (untextured) CAD, publishable as "in development"; product is not in the database and is shown as assumed on the lineup page. |
| `renders/broadcast-microphone/broadcast-mic-greybox-front-angle-1.png` | founder CAD render | AGF logo on the control panel | **publishable** | Founder grey-box (untextured) CAD, publishable as "in development"; product is not in the database and is shown as assumed on the lineup page. |
| `renders/broadcast-microphone/broadcast-mic-greybox-side-2.png` | founder CAD render | AGF logo on the control panel | **publishable** | Founder grey-box (untextured) CAD, publishable as "in development"; product is not in the database and is shown as assumed on the lineup page. |

### Renders / control-surface (3)

Folder `production-staging/assets/renders/control-surface/`. 3 publishable.

| Path (under `assets/`) | Origin | Third-party marks visible | Status | Why |
|---|---|---|---|---|
| `renders/control-surface/control-surface-greybox-angle-1.png` | founder CAD render | none | **publishable** | Founder grey-box (untextured) CAD, publishable as "in development"; product is not in the database and is shown as assumed on the lineup page. |
| `renders/control-surface/control-surface-greybox-side-hinged-panel-3.png` | founder CAD render | none | **publishable** | Founder grey-box (untextured) CAD, publishable as "in development"; product is not in the database and is shown as assumed on the lineup page. |
| `renders/control-surface/control-surface-greybox-top-plan-2.png` | founder CAD render | none | **publishable** | Founder grey-box (untextured) CAD, publishable as "in development"; product is not in the database and is shown as assumed on the lineup page. |

### Renders / desktop-stereo-amp (8)

Folder `production-staging/assets/renders/desktop-stereo-amp/`. 8 publishable.

| Path (under `assets/`) | Origin | Third-party marks visible | Status | Why |
|---|---|---|---|---|
| `renders/desktop-stereo-amp/desktop-amp-black-front-65.jpg` | founder CAD render | none | **publishable** | Founder CAD render, publishable as "in development"; product is not in the database and is shown as assumed on the lineup page. |
| `renders/desktop-stereo-amp/desktop-amp-black-rear-panel-66.jpg` | founder CAD render | none | **publishable** | Founder CAD render, publishable as "in development"; product is not in the database and is shown as assumed on the lineup page. |
| `renders/desktop-stereo-amp/desktop-amp-silver-front-agf-logo-ground-symbol-wvnl.jpeg` | founder CAD render | AGF logo (own mark) | **publishable** | Founder CAD render, publishable as "in development"; product is not in the database and is shown as assumed on the lineup page. |
| `renders/desktop-stereo-amp/desktop-amp-silver-front-agf-logo-large-lb.jpeg` | founder CAD render | AGF logo (own mark) | **publishable** | Founder CAD render, publishable as "in development"; product is not in the database and is shown as assumed on the lineup page. |
| `renders/desktop-stereo-amp/desktop-amp-silver-front-agf-logo-small-jr.png` | founder CAD render | AGF logo (own mark) | **publishable** | Founder CAD render, publishable as "in development"; product is not in the database and is shown as assumed on the lineup page. |
| `renders/desktop-stereo-amp/desktop-amp-silver-front-agf-logo-topleft-sm.jpeg` | founder CAD render | AGF logo (own mark) | **publishable** | Founder CAD render, publishable as "in development"; product is not in the database and is shown as assumed on the lineup page. |
| `renders/desktop-stereo-amp/desktop-amp-silver-front-plain-no-logo.jpg` | founder CAD render | none | **publishable** | Founder CAD render, publishable as "in development"; product is not in the database and is shown as assumed on the lineup page. |
| `renders/desktop-stereo-amp/desktop-amp-silver-rear-panel.jpg` | founder CAD render | none | **publishable** | Founder CAD render, publishable as "in development"; product is not in the database and is shown as assumed on the lineup page. |

## Counts per status

| Status | Files |
|---|---|
| publishable | 42 |
| internal only | 31 |
| needs clearance | 59 |
| do not publish | 1 |
| **Total** | **133** |

By origin and status:

| Origin | Status | Files |
|---|---|---|
| AI-generated | internal only | 31 |
| founder CAD render | needs clearance | 57 |
| founder CAD render | publishable | 42 |
| screenshot of third-party material | do not publish | 1 |
| screenshot of third-party material | needs clearance | 2 |

## Files the site currently displays

From `"src": "assets/` in `production-staging/site/*/content.json` (21 references, 21 distinct files).

| Page | File | Status | Flag |
|---|---|---|---|
| brand | `brand-boards/agf-packaging-measured-in-silence-card.jpeg` | internal only | NOT PUBLISHABLE |
| brand | `brand-boards/agf-master-design-system-board-portrait.png` | internal only | NOT PUBLISHABLE |
| founder | `prior-work/massfidelity-usb-audio-dac-black-gold-render.png` | needs clearance | NOT PUBLISHABLE |
| founder | `prior-work/remora-speaker-on-tv-rear-render.png` | needs clearance | NOT PUBLISHABLE |
| founder | `prior-work/remora-driver-layout-spec-diagram.png` | needs clearance | NOT PUBLISHABLE |
| founder | `prior-work/round-earbud-case-with-earbuds-paul-simon-screen.png` | needs clearance | NOT PUBLISHABLE |
| lineup | `renders/symphony-macro-system/symphony-tower-walnut-front.png` | publishable |  |
| lineup | `renders/symphony-macro-system/symphony-tower-copper-front.png` | publishable |  |
| lineup | `renders/symphony-macro-system/symphony-tower-green-brass-front.png` | publishable |  |
| lineup | `renders/symphony-macro-system/symphony-tower-black-brass-trim-front-angle-61.jpg` | publishable |  |
| lineup | `renders/over-ear-home-centric/over-ear-headphones-matte-black-copper-front-three-quarter-135.jpg` | needs clearance | NOT PUBLISHABLE |
| lineup | `renders/over-ear-home-centric/over-ear-headphones-matte-black-copper-earcup-closeup-136.jpg` | publishable |  |
| lineup | `concept-boards/wasted-real-estate-earbud-case-board.webp` | internal only | NOT PUBLISHABLE |
| lineup | `renders/studio-microphone/studio-mic-shockmount-front-angle-202.jpg` | publishable |  |
| lineup | `renders/broadcast-microphone/broadcast-mic-greybox-front-angle-1.png` | publishable |  |
| lineup | `renders/control-surface/control-surface-greybox-angle-1.png` | publishable |  |
| lineup | `renders/desktop-stereo-amp/desktop-amp-black-front-65.jpg` | publishable |  |
| lineup | `renders/desktop-stereo-amp/desktop-amp-silver-front-agf-logo-small-jr.png` | publishable |  |
| venue | `concept-boards/venue-three-panel-board-front-of-house-balcony-green-room.webp` | internal only | NOT PUBLISHABLE |
| venue | `concept-boards/venue-balcony-marble-control-surface-concept.webp` | internal only | NOT PUBLISHABLE |
| venue | `section-backgrounds/venue-background.webp` | internal only | NOT PUBLISHABLE |

Displayed: 21. Publishable: 10. Flagged: 11.

Flagged files, by page:

- **brand**: `brand-boards/agf-packaging-measured-in-silence-card.jpeg` (internal only); `brand-boards/agf-master-design-system-board-portrait.png` (internal only)
- **founder**: `prior-work/massfidelity-usb-audio-dac-black-gold-render.png` (needs clearance); `prior-work/remora-speaker-on-tv-rear-render.png` (needs clearance); `prior-work/remora-driver-layout-spec-diagram.png` (needs clearance); `prior-work/round-earbud-case-with-earbuds-paul-simon-screen.png` (needs clearance)
- **lineup**: `renders/over-ear-home-centric/over-ear-headphones-matte-black-copper-front-three-quarter-135.jpg` (needs clearance); `concept-boards/wasted-real-estate-earbud-case-board.webp` (internal only)
- **venue**: `concept-boards/venue-three-panel-board-front-of-house-balcony-green-room.webp` (internal only); `concept-boards/venue-balcony-marble-control-surface-concept.webp` (internal only); `section-backgrounds/venue-background.webp` (internal only)

## Not in this register

- The Globl Radio artwork (`gr-mark.svg`, `gr-lockup.svg`, icons) lives in `globl-radio-design-system/assets/`, not in this library, so it has no rows. The README credits Melvin Galapon (monogram drawn in 2016, from his Illustrator file) but does not record a commission, assignment or licence. Rule 4 treats it as publishable; keep the signed agreement with it.
- Removed duplicates: `prior-work/massfidelity-usb-audio-dac-green-brass-render.jpg` and `prior-work/usb-audio-dac-copper-knob-rear-ports-render.jpg` were deleted as byte-identical (sha256) to `prior-work/mass-fidelity/mass-fidelity-usb-dac-green-gold-base-gold-knob-angle-small-185.jpg` and `prior-work/mass-fidelity/mass-fidelity-usb-dac-charcoal-copper-knob-rear-ports-angle-224.jpg`, which keep their rows above (needs clearance). Neither deleted file was displayed on the site.
- `ASSETS.md` heading "Section backgrounds (9)" and its Duplicates list name eight files that are not on disk (`prelude-hero.png`, `prelude-hero.webp`, `prelude-square-1.png`, `prelude-square.png`, `concept-explainer-background.png`, `cut-sheet-hero.png`, `overview-background.png`, `venue-figure.webp`). Each is byte-identical to a file registered above and takes that file's status.
