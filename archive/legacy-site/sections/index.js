/**
 * sections/index.js — section dispatch table + error-isolating wrapper.
 * Generated wiring (dispatch table body is verbatim from source).
 *
 * ERROR TRACKING (polish pass): safeRender() catches per-section failures,
 * logs them via the TAG scaffold (`[product-pdf]`, greppable) tagged with
 * section key + product slug, and emits an HTML comment marker so one
 * broken section never aborts the whole PDF.
 *
 * HOOK SITES: safeRender() below is the single Layer-1 error boundary for
 * all 9 renderers. See ../HOOKS.md for the full manifest.
 */

// TAG scaffold — single source of truth for log/marker prefixes in this
// module. Output bytes are unchanged vs. the inline-string version; this
// just makes the hook greppable (`grep -rn TAG .`).
const TAG = '[product-pdf]';

import { renderHeader } from './header.js';
import { renderHeroImage } from './hero-image.js';
import { renderOverview } from './overview.js';
import { renderAudioSpecs } from './audio-specs.js';
import { renderConnectivity } from './connectivity.js';
import { renderTechnologies } from './technologies.js';
import { renderFormFactor } from './form-factor.js';
import { renderBusinessMetrics } from './business-metrics.js';
import { renderFooter } from './footer.js';

const SECTION_RENDERERS = {
  header:           renderHeader,
  hero_image:       renderHeroImage,
  overview:         renderOverview,
  audio_specs:      renderAudioSpecs,
  connectivity:     renderConnectivity,
  technologies:     renderTechnologies,
  form_factor:      renderFormFactor,
  business_metrics: renderBusinessMetrics,
  footer:           renderFooter,
};

// ---------- main HTML shell -------------------------------------------------

/**
 * Build the document-level CSS string.
 * Pulled out of the body interpolation so the brand colors and font family
 * can be substituted cleanly without escape gymnastics.
 */

/**
 * Render every enabled section with per-section error isolation.
 * Returns the joined HTML body string.
 */
export function renderAllSections(product, sections, palette, pdfConfig) {
  return sections
    .filter((s) => s && s.enabled !== false && SECTION_RENDERERS[s.key])
    .map((s) => safeRender(s.key, SECTION_RENDERERS[s.key], product, s, palette, pdfConfig))
    .filter(Boolean)
    .join('\n');
}

function safeRender(key, renderer, product, cfg, palette, pdfConfig) {
  try {
    return renderer(product, cfg, palette, pdfConfig);
  } catch (err) {
    const slug = (product && product.slug) || '?';
    console.error(TAG + ' section "' + key + '" failed for product "' + slug + '":', err);
    const msg = (err && err.message) ? err.message : String(err);
    return '<!-- ' + TAG + ' section "' + key + '" render error: ' + msg + ' -->';
  }
}

export { SECTION_RENDERERS };
