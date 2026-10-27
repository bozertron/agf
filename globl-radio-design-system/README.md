> *Live to the global village.*

Globl Radio is the live-music streaming service of All Grounds Floating: the broadcast-mixed performances captured at AGF venues, delivered as virtual tickets to anyone, anywhere, with the permanent all-access pass that comes with AGF hardware. It is a service of the brand, not a brand of its own, so it inherits the AGF system whole and adds exactly four things: one voice (**live**), one texture (**the stave**), one shape (**the ring**) and the components a live service needs. If a page could be an AGF page with a Globl Radio mark on it, that is what it should be.

Globl Radio runs on stereOS, the AGF operating system: stereOS Pro captures at the venue, Globl Radio carries the stream, stereOS Home or embedded renders it at home. That chain is what the brand document calls acoustic teleportation, and the cross-brand rules are in `../BRAND-INTEGRATION.md`.

The name drops the *a* on purpose. The global village was coined in Toronto; Globl Radio is that idea with a stage in it: one room, broadcast everywhere, and the artist paid.

Use the files as follows: `globl.css` is `agf.css` plus the Globl Radio layer in one file (fonts embedded, works from `file://`); `globl-layer.css` is the layer alone for pages that already load `agf.css`; `tokens.json` and `tokens.css` carry only the additions, every other token is AGF's; `assets/Logos/` holds the monogram, lockup and ring as finished SVG in brass, ink and bone; `assets/Icons/` adds four line icons to AGF's ten; `components/` has the previews and READMEs. Sections 02 and 03 cover applications and motion.

## The mark

The monogram was drawn by Melvin Galapon in 2016: a **G** and an **R** built from five parallel lines, inside five concentric rings, with the leg of the R running out of the letter and into the rings. It is the same language as the AGF mark, Monoton's inline letterforms, and that is why the two sit together without a rule being written: both are signal drawn as parallel lines.

Read it the way the brand reads it. Five lines are a stave. The leg of the R is the signal leaving the room. The rings are the broadcast. One drawing says *music, live, sent*.

- **Monogram** (`gr-mark.svg`): the G, the R and the rings. The primary mark. 72px or 20 mm minimum; below that the five lines close into solid strokes and the drawing becomes a coin, which is acceptable at 48px and not below.
- **Lockup** (`gr-lockup.svg`): the monogram with GLOBL RADIO set inside the rings beneath the letters, in the designer's outlined capitals. 160px or 40 mm minimum, because the wordmark is small inside the ring. Below that, the monogram alone.
- **Ring** (`gr-ring.svg`, `gr-ring-small.svg`): five concentric hairlines derived from the monogram's rings, without the letters. The small-size and status form: app icons, favicons, the live indicator, list bullets. Five rings from 48px, three rings from 24px, one ring with a lamp at 16px. The ring is a derived mark, not the designer's drawing; it never replaces the monogram where the monogram fits.
- All marks ship in **brass** (`#B8860B`) for dark grounds, **ink** (obsidian `#0E1612`) for paper, and **bone** (`#E9E2D4`) for reversing out of photography under a `scrim`. Recolour by inlining the SVG and setting `fill`. Never two colours in one mark, never the five lines in five colours, never outlined, shadowed, gradiented or rotated. The monogram is artwork: GR is never set in type, and Monoton is never used for it.
- Clear space is one ring width (the distance from the outer ring to the inner ring) on every side.
- **The endorsement**: wherever Globl Radio appears for the first time on a surface, the AGF mark stands beside it with a hairline between them and the caption *A live service of All Grounds Floating*. After that the monogram stands alone.

## Voice

AGF's voice, with a venue in it. Short declaratives. The engineer who loves music is now standing at the back of the room.

- Every stream travels with its conditions, as every AGF number does: **artist · venue · city · local time**. "Live" on its own is advertising; "Live · The Balcony, Toronto · 21:00 EDT" is a fact. Time is always the venue's local time with its zone, and the viewer's own time beside it when they differ.
- Live is a state, not an adjective. Something is live, was live, or goes live at a time. Never "live-streamed experience", never "immersive", never "exclusive". The exclusivity is the room; the stream is the opposite of it.
- The artist is named first, before the venue, before AGF. Credits are written the way the contract is: **the stereo master is the artist's; the broadcast mix is shared 50/50, in perpetuity**. That line appears on every ticket and every recording page.
- Sentence case everywhere except eyebrows, badges and ON AIR, which are uppercase by style. No exclamation marks, no emoji, no countdown hype. A countdown is a clock.
- Standing lines, drawn from the stereOS concept board and proposed here for sign-off: **"Live to the global village."** (the strapline under the lockup, set in Poiret One like AGF's) and **"Live, anywhere. Heard, everywhere."** (the campaign line). "ON AIR" is the only other reserved word; it is a lamp, not a headline.

## Colour

Globl Radio runs the three AGF themes unchanged and chooses between them by surface, not by taste:

- **Air** is Globl Radio's native state. The player, the schedule and anything that runs while a performance is on use the OLED calibration: obsidian ground, true black on hardware, so the venue's darkness is the ground and the stream is the light in it.
- **Midnight** for the service's site, marketing and the owners' portal, where it sits beside AGF // HEAR and AGF // FIELD pages.
- **Daylight** for printed tickets, press and manuals.

Brass remains the conductor: links, rules, the mark, the play control, the stave. Globl Radio adds one voice:

- **`live`** (`#E0523A`) is AGF's `signal-clip`, promoted from a status to the sub-brand's second voice. It is the only second colour any AGF surface carries, and it is permitted here because in a live service *live* is a true status. `live-glow` is its lit state, `live-text` the readable word on dark grounds (`#F28B76` in Midnight and Air, `#A8341F` on paper), `live-hairline` the trace, `on-live` the text on a live fill, `shadow-live` the lamp's glow.
- Live appears **only where something is live now**: the ON AIR lamp, the live ring, the live row in a schedule, the play control while a stream is on air, the countdown at zero. It never decorates. A "Watch live" button is brass until the stream is live, then it is the only live button on the page. A page with nothing live on it has no live colour on it.
- Before a performance is live, its state is `brass` (*goes live at*); after, it is `ink-faint` (*was live*). Nominal and hot keep their AGF meanings on meters.
- Every live pair holds 4.5:1 on its ground in every theme: `live-text` on `surface`, `on-live` on `live`.

## Typography

AGF's three faces, same ranking, two additions to the rules:

- **Monoton** stays AGF's alone. It never sets GR, Globl, Radio or anything else on a Globl Radio surface. The AGF mark appears in Monoton only in the endorsement.
- **Poiret One** is the reserved voice here too. The Globl Radio strapline, the headline on a ticket, and nothing else. One line per screen.
- **Commissioner** carries everything, with one habit added: **times, dates, serials and counts are always tabular** (`agf-tnum`, `"FLAR" 0, "VOLM" 0`) because a schedule, a countdown and a ticket are columns of numbers. Local time is set in `data-small` or `caption` with its zone in `ink-faint`.
- The wordmark GLOBL RADIO inside the lockup is outlined artwork from the designer's file. In running text the name is *Globl Radio* in Commissioner, in eyebrows GLOBL RADIO at `eyebrow` tracking.

## Space, shape, line

AGF's grid, radii and three line weights, unchanged. Two shapes are added to the short list of round things: the **ring** and the **play control** (a 48px circle with a `border-rule` in brass that fills on hover). A ticket is `radius-2` like a certificate, with one dashed hairline where the stub tears.

## Texture

- **The stave** replaces the trace field as Globl Radio's signature. Five hairlines in `brass` at a 6px pitch, grouped at 72px, lying horizontally across a `surface-deep` band at `opacity-stave`. It is the mark's five lines laid flat. A stave is never angled, never curved, never carries a second pattern, and never sits over Daylight surfaces or photography. The `gr-stave--one` form is a single stave used as a rule or as the grid behind a waveform.
- **The waveform** is the performance drawn on the stave: a 2px `brass-glow` stroke with a 25%-to-transparent fill beneath it, the same rule as an AGF OLED frequency curve. It is an illustration of signal, not a measurement, and the README of the Waveform component says so. Its live head is one `live` dot.
- **Grain** and the **orbital rings** keep their AGF roles. Globl Radio's ring takes over the orbital rings' job behind a Readout when the number is a live count (listeners, minutes to air).
- One texture per surface, as always. A hero with a venue photograph drops the stave.

## Components

Marks: Monogram, Lockup, Endorsement, Ring. Status: OnAir, Countdown. Texture: Stave, Waveform. Service: Player, Schedule, VenueCard, Ticket, Credit. Everything else, Button, Heading, Rule, Panel, Meter, Readout, Badge, Input, Nav, SpecTable, comes from AGF unchanged, and the Nav gains one rule: Globl Radio's nav carries the monogram at 32px where AGF's carries the small mark, and the endorsement sits in the footer.

Each component's README says what the consumer provides and what it must not do; the previews are the reference rendering and the showcase (`index.html`) shows them in all three themes.
