/**
 * css/overview.css.js — .agf-overview-grid, prose, aside.
 * CSS content is a verbatim slice of the original buildCss() template.
 * Generated function wrapper is additive wiring only.
 */
export default function overviewCss(palette, fontStack) {
  return `/* Overview */
    .agf-overview-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 18pt;
      align-items: start;
    }
    .agf-overview-prose p { margin: 0 0 8pt; font-size: 10.5pt; }
    .agf-overview-aside {
      background: rgba(31, 74, 45, 0.04);
      border-left: 2px solid ${palette.accent};
      padding: 10pt 12pt;
    }
    .agf-overview-aside .agf-eyebrow { color: ${palette.primary}; margin-bottom: 6pt; }
    .agf-mini-dl > div {
      display: grid;
      grid-template-columns: 1fr 1.5fr;
      gap: 6pt;
      padding: 4pt 0;
      border-bottom: 1px dotted rgba(0,0,0,0.12);
      font-size: 9pt;
    }
    .agf-mini-dl > div:last-child { border-bottom: 0; }
    .agf-mini-dl dt { font-weight: 600; color: ${palette.primary}; margin: 0; }
    .agf-mini-dl dd { margin: 0; color: ${palette.text}; }

    `;
}
