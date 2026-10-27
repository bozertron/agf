/**
 * css/footer.css.js — .agf-footer, .agf-mute.
 * CSS content is a verbatim slice of the original buildCss() template.
 * Generated function wrapper is additive wiring only.
 */
export default function footerCss(palette, fontStack) {
  return `/* Footer */
    .agf-footer {
      margin-top: 22pt;
      padding-top: 10pt;
    }
    .agf-confidential {
      display: flex;
      align-items: center;
      gap: 7pt;
      font-size: 7.5pt;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: ${palette.accent};
      font-weight: 700;
      margin: 0 0 8pt;
    }
    .agf-confidential-dot {
      width: 6pt;
      height: 6pt;
      background: ${palette.accent};
      display: inline-block;
      border-radius: 999px;
    }
    .agf-footer-rule {
      height: 1px;
      background: ${palette.primary};
      opacity: 0.6;
      margin-bottom: 8pt;
    }
    .agf-footer-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      font-size: 7.5pt;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: rgba(0,0,0,0.7);
      font-weight: 500;
    }
    .agf-footer-slug {
      color: ${palette.primary};
      font-weight: 700;
    }

    .agf-mute { color: rgba(0,0,0,0.5); font-style: italic; }
  `;
}
