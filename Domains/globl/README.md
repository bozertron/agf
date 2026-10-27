# Domains/globl

The original deliverables from the Globl Radio logo designer (2016): Illustrator EPS files and two JPG previews (`globl-logo.jpg`, `globl-logo-wo.jpg`).

## Files

- `3-logofinal-mark02.1.eps`, `3-logofinal-mark02.2.eps`: the final mark artwork, rich black on white. These are the designer's originals.
- `globl-logo.jpg`, `globl-logo-wo.jpg`: preview renders.

## Removed

`3-logofinal-mark03.1.eps` and `3-logofinal-mark03.2.eps` were deleted (about 3 MB). They were the same artwork as mark02.1 and mark02.2 reversed to white on a black page rectangle. The path geometry (every `mo`/`li`/`cv`/`cp` path, in order, including the page rectangle) was verified identical to mark02.1 and mark02.2 respectively, so they carried no new information. The reversed versions are available as SVG (`gr-mark-bone.svg`, `gr-lockup-bone.svg`). The files remain recoverable from git history.

## Where the conversions live

The SVG conversions (mark, lockup and ring, in default, ink and bone variants) and byte-identical copies of the two source EPS files are in `globl-radio-design-system/assets/Logos/` (EPS in `source/`).

Note: EPS is binary and does not delta-compress in git, so only chosen iterations should be committed.
