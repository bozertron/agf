/**
 * helpers.js — utility functions for the product PDF template.
 * Verbatim extraction from server/templates/product-pdf.js.
 * Extracted by A-product-pdf.extract.py.
 */

// ---- esc ----
const esc = (v) => {
  if (v === null || v === undefined) return '';
  return String(v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

// ---- md ----
const md = (s) => {
  if (!s) return '';
  let out = esc(s);
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  out = out.replace(/\n\n+/g, '</p><p>');
  out = out.replace(/\n/g, '<br/>');
  return out;
};

// ---- fmtRange ----
const fmtRange = (rng) => {
  if (!rng) return '';
  if (rng.min === undefined && rng.max === undefined) return '';
  if (rng.min === rng.max || rng.max === undefined) return String(rng.min);
  return rng.min + '–' + rng.max;
};

// ---- fmtUSD ----
const fmtUSD = (n) => {
  if (typeof n !== 'number' || !isFinite(n)) return '';
  if (n >= 1e9) return '$' + (n / 1e9).toFixed(n % 1e9 === 0 ? 0 : 1) + 'B';
  if (n >= 1e6) return '$' + Math.round(n / 1e6) + 'M';
  if (n >= 1e3) return '$' + Math.round(n / 1e3) + 'K';
  return '$' + n;
};

// Resolve a section config object from the pdf-config by key. Always returns
// an object so callers can safely destructure with defaults.

// ---- sectionCfg ----
function sectionCfg(pdfConfig, key) {
  const list = (pdfConfig && Array.isArray(pdfConfig.template_sections))
    ? pdfConfig.template_sections
    : [];
  return list.find((s) => s && s.key === key) || null;
}

// ---------- per-section partials -------------------------------------------

// ---- exports ----
export { esc };
export { md };
export { fmtRange };
export { fmtUSD };
export { sectionCfg };
