/**
 * css/block.css.js — .agf-block, .agf-block-eyebrow.
 * CSS content is a verbatim slice of the original buildCss() template.
 * Generated function wrapper is additive wiring only.
 */
export default function blockCss(palette, fontStack) {
  return `/* ---------- Generic block ---------- */
    .agf-block {
      margin: 0 0 18pt;
      padding: 0 4pt;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .agf-block-eyebrow {
      font-size: 7.5pt;
      letter-spacing: 0.32em;
      text-transform: uppercase;
      font-weight: 700;
      color: ${palette.primary};
      margin: 0 0 10pt;
      padding-bottom: 6pt;
      border-bottom: 1px solid ${palette.primary};
      display: inline-block;
      min-width: 60%;
    }
    .agf-block-eyebrow-accent {
      color: ${palette.accent};
      border-bottom-color: ${palette.accent};
    }

    `;
}
