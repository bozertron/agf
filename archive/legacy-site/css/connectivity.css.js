/**
 * css/connectivity.css.js — .agf-conn-grid + sub-components.
 * CSS content is a verbatim slice of the original buildCss() template.
 * Generated function wrapper is additive wiring only.
 */
export default function connectivityCss(palette, fontStack) {
  return `/* Connectivity */
    .agf-conn-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 18pt;
    }
    .agf-conn-col .agf-eyebrow {
      color: ${palette.primary};
      margin-bottom: 6pt;
    }
    .agf-conn-list {
      list-style: none;
      margin: 0;
      padding: 0;
    }
    .agf-conn-list li {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 4pt 12pt;
      padding: 5pt 0;
      border-bottom: 1px dotted rgba(0,0,0,0.18);
    }
    .agf-conn-proto {
      font-weight: 700;
      color: ${palette.text};
      grid-column: 1;
    }
    .agf-conn-meta {
      font-size: 9pt;
      color: rgba(0,0,0,0.62);
      grid-column: 2;
    }
    .agf-conn-extras { margin-top: 12pt; }

    `;
}
