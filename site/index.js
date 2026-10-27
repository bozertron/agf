/**
 * product-pdf/index.js — package entry / orchestrator.
 *
 * renderPdfHtml() is extracted VERBATIM from the original
 * server/templates/product-pdf.js (no logic changes). The generated
 * imports below resolve the symbols that were module-local in the
 * source: SECTION_RENDERERS, buildCss, esc.
 */

import { SECTION_RENDERERS } from './sections/index.js';
import { buildCss } from './css/index.js';
import { esc } from './helpers.js';

export function renderPdfHtml(product, pdfConfig) {
  const cfgRoot = pdfConfig || {};
  const palette = {
    primary: (cfgRoot.brand_colors && cfgRoot.brand_colors.primary) || '#1F4A2D',
    accent:  (cfgRoot.brand_colors && cfgRoot.brand_colors.accent)  || '#B8860B',
    text:    (cfgRoot.brand_colors && cfgRoot.brand_colors.text)    || '#1A1A1A',
  };
  const fontFamily = cfgRoot.font_family || 'Commissioner';

  // Resolve template_sections. If pdfConfig didn't supply one, render the
  // canonical default so the endpoint still produces a sensible document.
  const sections = Array.isArray(cfgRoot.template_sections) && cfgRoot.template_sections.length
    ? cfgRoot.template_sections
    : [
        { key: 'header',           enabled: true, show_logo: true, background_color: palette.primary },
        { key: 'hero_image',       enabled: true },
        { key: 'overview',         enabled: true },
        { key: 'audio_specs',      enabled: true, columns: 2 },
        { key: 'connectivity',     enabled: true },
        { key: 'technologies',     enabled: true, format: 'badges' },
        { key: 'form_factor',      enabled: true },
        { key: 'business_metrics', enabled: true, audience: 'investor' },
        { key: 'footer',           enabled: true, confidentiality_notice: true },
      ];

  const body = sections
    .filter((s) => s && s.enabled !== false && SECTION_RENDERERS[s.key])
    .map((s) => SECTION_RENDERERS[s.key](product, s, palette, cfgRoot))
    .filter(Boolean)
    .join('\n');

  const title = `${(product.data && product.data.name) || product.name || 'Product'} · Spec Sheet`;
  const css = buildCss(palette, fontFamily);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${esc(title)}</title>
  <style>${css}</style>
</head>
<body>
  <main class="agf-doc">${body}</main>
</body>
</html>`;
}

export default renderPdfHtml;
