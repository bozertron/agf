/**
 * css/form-factor.css.js — .agf-variants, confidential-shade.
 * CSS content is a verbatim slice of the original buildCss() template.
 * Generated function wrapper is additive wiring only.
 */
export default function form_factorCss(palette, fontStack) {
  return `/* Variants */
    .agf-variants { margin-top: 14pt; }
    .agf-variants .agf-eyebrow {
      color: ${palette.primary};
      margin: 0 0 6pt;
    }
    .agf-variant-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .agf-variant-list li {
      display: grid;
      grid-template-columns: 0.9fr 1.6fr auto;
      gap: 12pt;
      padding: 5pt 0;
      border-bottom: 1px dotted rgba(0,0,0,0.16);
      font-size: 9.5pt;
    }
    .agf-variant-name { font-weight: 700; color: ${palette.primary}; }
    .agf-variant-diff { color: rgba(0,0,0,0.7); }
    .agf-variant-asp  { color: ${palette.accent}; font-weight: 700; }

    /* Business / confidential shade */
    .agf-confidential-shade {
      background:
        linear-gradient(180deg, rgba(184,134,11,0.06) 0%, rgba(184,134,11,0.02) 100%);
      border-left: 2px solid ${palette.accent};
      padding: 14pt 16pt 10pt;
      margin-left: -4pt;
      margin-right: -4pt;
    }
    .agf-business-dl .agf-spec-row dt { color: ${palette.accent}; }

    `;
}
