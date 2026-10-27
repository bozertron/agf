/**
 * css/base.css.js — @page / reset / body / .agf-doc.
 * CSS content is a verbatim slice of the original buildCss() template.
 * Generated function wrapper is additive wiring only.
 */
export default function baseCss(palette, fontStack) {
  return `
    @page { margin: 0; }
    *, *::before, *::after { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      background: #FFFFFF;
      color: ${palette.text};
      font-family: ${fontStack};
      font-size: 10.5pt;
      line-height: 1.5;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    body {
      padding: 0.35in 0.55in 0.4in;
    }
    .agf-doc { position: relative; }

    `;
}
