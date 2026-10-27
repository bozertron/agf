# stereOS — wordmark and brand rules

stereOS is the operating system of All Grounds Floating: the platform every sound-first AGF device runs, in four editions, and the thing third parties adopt. It is spelled with the last two letters in capitals, always. This package holds its wordmark, its monogram and the rules for using them beside AGF and Globl Radio. The cross-brand plan is in `../BRAND-INTEGRATION.md`; everything about colour, type, space and motion that is not stated here is AGF's.

**Open `index.html` to see it.** It links the Globl Radio stylesheet (which carries AGF's), so the preview needs the sibling packages beside it.

## The wordmark

It is constructed, not typeset. Each letter is a single spine stroked as five parallel lines, with a band of 22 units at an x-height of 100 (five 2-unit lines, four 3-unit gaps). That is the inline language of the AGF mark in Monoton and of the Globl Radio monogram, so the three marks read as one family without a rule being written. The **O is the Globl Radio ring**: five concentric circles. Nothing crosses, because lines in the Globl Radio mark meet, stop or merge and never cross: the t's stem is continuous and ends in a hooked foot, with its two arms stopping one gap short of the stem; the e's bowl is continuous, with its bar starting on the innermost line and running flush to the outer edge, as the bar of the G does; the r's shoulder leaves the stem. The lowercase letters are geometric, built on circles; the S is one continuous spine of two bowls tangent at the waist.

- `assets/Logos/stereos-wordmark.svg` — the wordmark. 160px or 40 mm minimum; below that the lines close up.
- `assets/Logos/stereos-os.svg` — the OS monogram, the ring and the S alone, for app icons, boot screens and etching, 48px or 12 mm and above.
- Each in brass (`#B8860B`) for dark grounds, ink (`-ink`, `#0E1612`) for paper, bone (`-bone`, `#E9E2D4`) for reversing out of photography under a scrim. One colour per mark; never two, never a gradient, never rotated, never the five lines in five colours.
- Clear space is one band (22 units at the drawn size) on every side; the stave may run behind it only on a `surface-deep` band.
- **The type form.** Under 160px, and in all running text, the name is set in Commissioner: *stere* at weight 300, *OS* at weight 600, no space, no small caps. In eyebrows it is still *stereOS*, never uppercased.
- Regenerate with `python3 -I build/build.py`; the geometry is in the script, so a change to the band or the letter widths is one edit.

## Editions

Four editions, one wordmark. The edition travels as a code after the mark in the AGF division style, `stereOS // HOME`, set in `eyebrow` style in `brass-text` on the wordmark's baseline, and in prose as *stereOS embedded*, *stereOS mobile*, *stereOS Home*, *stereOS Pro*.

| Edition | What it is |
|---|---|
| embedded | The RTOS for sound-first devices with little or no screen: over-ear headphones and their dock, the earbud case. |
| mobile | Linux, licensed in by vehicle makers of every kind, from cars to boats to off-road to the high-end boom box. |
| Home | Linux, the flagship consumer edition. Not a desktop: it is what guarantees the box running the house is a world-class sound system. |
| Pro | Standard in all AGF broadcast equipment and the Balcony. The capture end of acoustic teleportation. |

## Voice colour

stereOS's own colour is AGF's **signal-nominal**: lock, sync, online, a clean boot. It colours the system's states on screens and LEDs, never the wordmark, which is always brass, ink or bone. Native theme is **Air**: an OS lives on OLEDs and true black.

## Beside the other two

- **Endorsement**, fixed: the wordmark, a hairline, the small AGF mark and *The operating system of All Grounds Floating* in `caption`.
- **Ingredient badge**: a hairline box, *runs* in micro caps, the wordmark at 84px, optionally the edition code. The only family mark that may sit on a product AGF did not make, and always the smallest mark on it.
- **The family line**: AGF, Globl Radio, stereOS on one baseline, same ink, hairlines between. The stereOS cap height equals the AGF cap height; the GR ring stands 2.6 cap heights tall.
- **Capture to couch**: stereOS Pro at the venue, Globl Radio in between, stereOS Home or embedded at home. That chain, and only that chain, is called acoustic teleportation.

Proposed and awaiting sign-off: the reserved line *Sound first*.
