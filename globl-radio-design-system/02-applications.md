# Applications

Where Globl Radio leaves the stylesheet. The spine is AGF's (brass, the three faces, the trace, the badge); Globl Radio brings the stave, the ring and the live lamp, and the places are different: a player, a venue, a ticket.

## The player

- Runs the **Air** theme always, including inside a Midnight page: the player is a `surface-deep` band wrapped in `data-theme="air"` so the stream sits on true black.
- Layout is the Player component: artwork at the left, artist in `body-strong`, venue · city · local time beneath in `caption` tabular, the OnAir state, the play control, and the waveform on a single stave below. The stave is the only texture in the player.
- The play control is the one round control on the page. It fills brass on hover; when the stream is on air it is `live`, and that is the only live control on the screen.
- Listener count, when shown, is a Readout over the ring, with its conditions: *4,212 listening · 38 countries · as of 21:14 EDT*. No count without a time.
- Video, when present, sits above the player in a 16:9 frame under a hairline, with no overlay chrome on the picture. Lower thirds belong to the broadcast, not the player.

## Venue surfaces

- **ON AIR signage** at the Balcony and the Green Room: a 3 mm `live` lamp behind frosted acrylic, the word in pale-stone silkscreen, the ring etched beside it. The lamp is lit by the broadcast chain, never by a timer.
- **The Balcony console** carries the ring at 24 mm etched into anodise above the "live to air" countdown, and the countdown is the Countdown component on an OLED in the Air theme.
- **Front of House screens** (the bar) show the schedule only: tonight, next, and the venue's local time. No marketing on the walls; the room is the brand surface.
- **Venue cards** on the site are one per venue, with the venue's name, city and local time, tonight's act and the state of the stream. One venue per market, so the list is short and is never a grid of more than six.

## The virtual ticket

- The Ticket component is the Certificate's sibling: a `surface-deep` card with gilded edges (a `border-rule` in `brass`, a hairline outline standing 4px off it), the monogram top-left, the ring top-right, one Poiret One line in `brass-glow` (the artist's name), then the facts in a three-column list: venue and city, date and local time, the holder. A dashed hairline tears off the stub, which carries the serial in Poiret One and the artist's credit line.
- The **permanent all-access pass** for AGF hardware owners is the same card in `brass-glow` edges with *All access · in perpetuity* as its strapline and the owner's serial from their calibration certificate as its number. The pass and the certificate are the same object in two uses.
- Printed tickets run Daylight on bone stock with the monogram in ink; the stub is perforated, not dashed.
- Pricing on a ticket is the artist's price, set in `data-small`, with *set by the artist* beneath it in `caption`. The split is never on the ticket; the credit line is.

## Broadcast graphics

- **Lower thirds** on the broadcast mix: a `surface-deep` bar at the lower left with a single stave running through it, artist in `body-strong` in bone, venue · city · local time in `caption`, the ring at the right edge. In and out on the damped curve, never a wipe.
- **The title card** before a stream: the monogram at `--xl` on `surface-deep` with the stave, the artist's name in Poiret One, and the countdown. The AGF endorsement sits bottom-right.
- **Thumbnails and social**: the monogram or the ring in brass on `surface-deep` with the stave; the artist's name; never the live lamp on a still image, because a still cannot be live.

## Hardware

- The **Wasted Real-Estate** case's broadcast mode and the **Instrument**'s pro tier show the ring on their OLEDs: five rings at 48px, the outer ring dashed and turning while a stream is on air, `live` while live, brass while arming, `ink-faint` idle. The ON AIR state on a hardware screen is the ring plus the word, never the word alone.
- The ring is etched at 8 mm on the case lid beside the Floating Ground badge, in the same brass.

## Print and gifts

- A Globl Radio press sheet or ticket runs Daylight: bone stock, ink monogram, one brass foil hit on the ring.
- Gifts carry the ring, not the monogram: a 24 mm brass disc with the five rings milled in relief, a bone enamel pin with the rings in brass. The monogram belongs to the venue door and the ticket.

## Web

- The site runs Midnight with the player in Air; Daylight for ticket pages when printed.
- Page spine: Nav (monogram at 32px), a Hero on `surface-deep` with the stave and no trace field, the Player, VenueCards on `surface-raised`, the Schedule, a Readout row over the ring, and a `surface-deep` footer with the endorsement and the Floating Ground badge.
- The hero headline steps 96 → 72 → 48 as AGF's does; the stave pitch stays at 6px at every width and the group pitch drops to 48px under 640px.
