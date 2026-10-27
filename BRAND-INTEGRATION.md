# Brand integration plan: AGF, stereOS, Globl Radio

How the three names relate, what each one is allowed to mean, and where each one appears. Written 2026-10-27 against the recovered brand document, the AGF design system, the Globl Radio package and the stereOS brand package. Each brand's own book governs its details; this document governs the seams between them.

## 1. The architecture in one paragraph

**All Grounds Floating (AGF)** is the masterbrand: the company, the hardware, the venues, the voice. **stereOS** is the platform brand: the operating system every sound-first AGF device runs, in four editions, and the thing third parties adopt. **Globl Radio** is the service brand: the live-music stream from AGF venues, delivered as virtual tickets. The three exist as three because of one signal path: stereOS Pro at the venue captures, Globl Radio carries, stereOS Home or embedded renders at home. That path, owned end to end, is what the document calls acoustic teleportation, and it is the only reason a customer ever needs to hold all three names at once.

| | AGF | stereOS | Globl Radio |
|---|---|---|---|
| Kind | Masterbrand | Platform (ingredient and product) | Service |
| Relationship | Parent | "The operating system of All Grounds Floating" | "A live service of All Grounds Floating" |
| Mark | AGF in Monoton | Constructed five-line wordmark; the OS monogram | Five-line GR monogram in five rings; the ring |
| Reserved line | All Grounds Floating · Measured in silence. · Pure signal. | Sound first (proposed) | Live to the global village. · Live, anywhere. Heard, everywhere. (proposed) |
| Voice colour | brass, the conductor | signal-nominal, the lock | live, the moment |
| Native theme | Midnight | Air | Air for the player, Midnight for the site |
| Texture | Trace field | None of its own; it is a UI, not a surface | The stave |
| Appears on | Everything | Boot screens, badges, spec sheets, adopters' products | The player, tickets, venue signage, broadcast graphics |

## 2. Naming and spelling

- **stereOS** is always written with the last two letters in capitals and the first five in lower case, in every context including sentence starts and headlines. It is never "Stereos", "StereOS" or "STEREOS". In running text it is set in Commissioner with the OS at weight 600 (the type form); as a mark it is the constructed wordmark.
- **Editions** are *stereOS embedded*, *stereOS mobile*, *stereOS Home* and *stereOS Pro* in prose (Home and Pro capitalised as the document writes them; embedded and mobile lower case as descriptors). As lockups and codes they follow the AGF division style: `stereOS // EMBEDDED`, `stereOS // MOBILE`, `stereOS // HOME`, `stereOS // PRO`.
- **Globl Radio** keeps its missing *a*. It is never "Global Radio" or "GloblRadio". The abbreviation GR is only the monogram, never written.
- **AGF** division codes remain `AGF // HEAR`, `AGF // FIELD`, `AGF // AIR`. stereOS editions are not divisions and never take the AGF prefix.
- "Acoustic teleportation" is l'Art's claim in the document and is used only for the full Pro → Globl Radio → Home chain, never for a single device.

## 3. What each name is allowed to claim

- **AGF** claims the hardware, the measurement and the venue: the box, the certificate, the room. It never claims to be an OS or a service.
- **stereOS** claims the behaviour: what the box does, how it locks and syncs, how it talks to the other boxes, what a third party gets when they adopt it. It is the only one of the three that appears on products AGF did not make. It never claims the sound of a specific AGF product and never claims the artist's content.
- **Globl Radio** claims the moment and the artist: who is playing, where, at what local time, and under what terms. It never claims the technology; when the stream sounds like the room, the credit line says stereOS and l'Art did it.

## 4. The marks together

- **The family line** (preview in `stereos-brand/index.html`): AGF, Globl Radio, stereOS on one baseline, hairlines between them, all in the same ink. Used once, on the company site's footer, in the press kit, and on the venue's back wall. Everywhere else, at most two marks share a surface.
- **Pairings that are allowed:** AGF + stereOS (a product and its OS: packaging, spec sheet, boot screen); AGF + Globl Radio (the endorsement: the service's first appearance on a surface); stereOS + an adopter's brand (the ingredient badge). Globl Radio + stereOS appear together only in the capture-to-couch diagram and on the virtual ticket's credit line.
- **Endorsement lines**, fixed: *A live service of All Grounds Floating* under Globl Radio; *The operating system of All Grounds Floating* under stereOS. Both set in `caption`, `ink-faint`, beside the small AGF mark with a hairline between.
- **The ingredient badge**: a hairline `radius-4` box with *runs* in micro caps, the stereOS wordmark at 84px, and optionally the edition code. It is the only AGF-family mark that may sit on a non-AGF product, and it is always the smallest mark on that product.
- **Sizes on a shared baseline:** stereOS cap height equals the AGF Monoton cap height; the GR ring stands 2.6 cap heights tall so its internal letters match. Nothing in the family is ever set in Monoton except AGF.

## 5. Colour: three voices from tokens that already exist

AGF's system defined three signal colours and one accent. The family uses them without adding any:

- **brass** is every brand's drawing ink and AGF's voice.
- **live** (`signal-clip`) is Globl Radio's voice, only where something is on air now.
- **signal-nominal** is stereOS's voice: lock, sync, online, a clean boot. It colours the OS's states on screens and LEDs, never the wordmark. Daylight's darker nominal (`#163822`) keeps it legible on paper.

A surface therefore shows at most brass plus one voice. A Globl Radio player running on stereOS Home shows live for the stream and nominal for the lock, and that is the one case where both voices appear, each on its own fact.

## 6. Where each appears, surface by surface

| Surface | AGF | stereOS | Globl Radio |
|---|---|---|---|
| Hardware front plate | Etched mark, the ground-lift switch | Nothing | Nothing |
| Hardware rear plate / inside lid | Trace field, serial | *runs stereOS // HOME* etched beside the Floating Ground badge | Ring etched only on broadcast-capable devices |
| Boot screen (OLED, Air theme) | Nothing | OS monogram, then the wordmark, then the nominal lock state | Nothing |
| Device UI | Nothing | The chrome: nominal for states, brass for controls | The player and ticket when live content is on |
| Packaging | Sleeve, certificate | *runs stereOS* badge on the spec panel | The all-access pass card for owners |
| Company site | Nav, hero, footer with the family line | The Stack page and a stereOS page per edition | Its own section, endorsed once at the top |
| Venue | Door, Green Room, certificate wall | The Balcony's console runs Pro; its screens show the OS states | ON AIR signage, schedule screens, ticket QR at the bar |
| Broadcast graphics | Nothing | Nothing | Lower thirds, title card, countdown |
| Third-party product | Nothing | Ingredient badge, boot screen, OS chrome | Player, if the adopter licenses the service |
| Press and investor documents | Cover, family line in the footer | The Stack, the business model | The venue and artist-rights sections |

## 7. The stereOS editions and the products

| Edition | Kernel | Runs on | In the lineup |
|---|---|---|---|
| embedded | RTOS | Sound-first devices with little or no screen | Over-Ear dock, Wasted Real-Estate case |
| mobile | Linux | Vehicles of every kind and high-end portable systems, licensed in | None of AGF's own; the adoption business of years 3 to 5 |
| Home | Linux, the flagship | The box that runs the house and happens to be a world-class sound system | The Instrument (audiophile mode), both Core-likes, the Symphony's electronics |
| Pro | Linux | All AGF broadcast equipment and the Balcony | The Instrument (pro and measurement modes), the l'Art Production line |

The document's posture holds for every edition: locked kernel and IP enclaves, open application space, adopters take the application-specific implementation rather than the codec, and the artist's entitlements are enforced on the device.

## 8. Open items

1. **The stereOS reserved line.** *Sound first* is proposed from your own description ("sound first or sound forward devices"). Confirm or replace.
2. **Edition spelling.** Home and Pro capitalised, embedded and mobile not, following your message. Say if all four should match.
3. **Whether Globl Radio runs on stereOS Home only or on any stereOS edition.** The chain diagram assumes Home or embedded at the couch.
4. **The adopter badge on vehicles.** *runs stereOS* is drawn; whether a car maker's dash shows the wordmark or only the type form is their call and should be in the licence.
5. **Patent posture for stereOS** is "trade secret" in the document, unlike l'Art's unresolved status. Confirm it stays so before the stereOS page is public.
