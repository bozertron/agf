/**
 * css/specs.css.js — .agf-spec-dl, .agf-driver-table.
 * CSS content is a verbatim slice of the original buildCss() template.
 * Generated function wrapper is additive wiring only.
 */
export default function specsCss(palette, fontStack) {
  return `/* Spec DL — variable column count */
    .agf-spec-dl {
      display: grid;
      gap: 0 24pt;
      margin: 0;
      padding: 0;
    }
    .agf-cols-1 { grid-template-columns: 1fr; }
    .agf-cols-2 { grid-template-columns: 1fr 1fr; }
    .agf-cols-3 { grid-template-columns: 1fr 1fr 1fr; }
    .agf-spec-row {
      display: grid;
      grid-template-columns: 0.9fr 1.4fr;
      gap: 8pt;
      padding: 5pt 0;
      border-bottom: 1px solid rgba(0,0,0,0.08);
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .agf-spec-row dt {
      font-size: 8pt;
      font-weight: 700;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: ${palette.primary};
      margin: 0;
      align-self: center;
    }
    .agf-spec-row dd {
      font-size: 10pt;
      font-weight: 400;
      margin: 0;
      color: ${palette.text};
    }

    /* Drivers table */
    .agf-driver-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 12pt;
      font-size: 9.5pt;
    }
    .agf-driver-table thead th {
      text-align: left;
      font-size: 7.5pt;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      font-weight: 700;
      color: ${palette.primary};
      padding: 6pt 8pt;
      border-bottom: 1.5px solid ${palette.primary};
    }
    .agf-driver-table tbody td {
      padding: 6pt 8pt;
      border-bottom: 1px dotted rgba(0,0,0,0.18);
    }
    .agf-driver-table tbody tr:nth-child(odd) td {
      background: rgba(184, 134, 11, 0.04);
    }

    `;
}
