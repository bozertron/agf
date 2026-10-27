/**
 * css/technologies.css.js — .agf-tech-badges, tech-list/table.
 * CSS content is a verbatim slice of the original buildCss() template.
 * Generated function wrapper is additive wiring only.
 */
export default function technologiesCss(palette, fontStack) {
  return `/* Technologies */
    .agf-tech-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 6pt 8pt;
    }
    .agf-tech-badge {
      display: inline-block;
      padding: 5pt 11pt 4pt;
      border: 1px solid ${palette.primary};
      color: ${palette.primary};
      font-size: 9pt;
      font-weight: 600;
      letter-spacing: 0.06em;
      border-radius: 999px;
      background: rgba(31, 74, 45, 0.04);
    }
    .agf-tech-list {
      margin: 0;
      padding: 0 0 0 16pt;
    }
    .agf-tech-list li {
      padding: 3pt 0;
      font-size: 10pt;
    }
    .agf-tech-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 9.5pt;
    }
    .agf-tech-table th, .agf-tech-table td {
      text-align: left;
      padding: 6pt 8pt;
      border-bottom: 1px solid rgba(0,0,0,0.12);
    }
    .agf-tech-table th {
      color: ${palette.primary};
      font-size: 7.5pt;
      letter-spacing: 0.22em;
      text-transform: uppercase;
    }

    `;
}
