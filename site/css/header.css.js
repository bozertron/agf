/**
 * css/header.css.js — .agf-header + sub-components.
 * CSS content is a verbatim slice of the original buildCss() template.
 * Generated function wrapper is additive wiring only.
 */
export default function headerCss(palette, fontStack) {
  return `/* ---------- Header ---------- */
    .agf-header {
      color: #FFFFFF;
      padding: 28pt 32pt 22pt;
      margin: 0 0 22pt;
      position: relative;
      overflow: hidden;
      page-break-after: avoid;
      break-after: avoid;
    }
    .agf-header::before {
      content: "";
      position: absolute;
      inset: 0;
      background:
        repeating-linear-gradient(
          135deg,
          rgba(255,255,255,0.04) 0,
          rgba(255,255,255,0.04) 1px,
          transparent 1px,
          transparent 28px);
      pointer-events: none;
    }
    .agf-header-grid {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24pt;
    }
    .agf-mark {
      display: flex;
      align-items: center;
      gap: 10pt;
    }
    .agf-mark-letters {
      font-weight: 700;
      letter-spacing: 0.18em;
      font-size: 14pt;
    }
    .agf-mark-rule {
      width: 28pt;
      height: 1px;
      background: ${palette.accent};
      display: inline-block;
    }
    .agf-mark-tag {
      font-weight: 200;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      font-size: 7.5pt;
      opacity: 0.92;
    }
    .agf-header-meta { text-align: right; }
    .agf-eyebrow {
      font-size: 7.5pt;
      letter-spacing: 0.28em;
      text-transform: uppercase;
      font-weight: 600;
      margin: 0;
      color: inherit;
    }
    .agf-eyebrow-mute { opacity: 0.6; margin-top: 3pt; font-weight: 400; }

    .agf-header-title {
      margin-top: 22pt;
      position: relative;
      z-index: 1;
    }
    .agf-display {
      font-weight: 200;
      font-size: 38pt;
      line-height: 1.02;
      margin: 0 0 6pt;
      letter-spacing: -0.01em;
    }
    .agf-tagline {
      font-weight: 300;
      font-style: italic;
      font-size: 12pt;
      margin: 0;
      max-width: 90%;
      opacity: 0.92;
    }
    .agf-header-rule {
      margin-top: 22pt;
      display: flex;
      gap: 6pt;
    }
    .agf-header-rule span {
      height: 2px;
      background: ${palette.accent};
      display: block;
    }
    .agf-header-rule span:nth-child(1) { width: 36pt; }
    .agf-header-rule span:nth-child(2) { width: 12pt; opacity: 0.7; }
    .agf-header-rule span:nth-child(3) { width: 4pt;  opacity: 0.5; }

    `;
}
