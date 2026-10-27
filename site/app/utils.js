/**
 * utils.js
 * Generic DOM/data helpers: $, $$, escapeHTML, resolveDotPath.
 *
 * Auto-extracted from site/app.js by A-app.extract.py.
 * Function bodies are VERBATIM — no logic changes.
 * Module tag: [agf:utils]
 */

// --- dollar helpers -------------------------------------------------------
// The original IIFE defined `$` and `$$` as one-liners. Exported under the
// stable identifiers `dollar` / `dollarAll` and re-aliased to `$` / `$$` on
// export, so every importing module's source stays byte-identical to the
// original (they call `$` / `$$` by those names).
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

export function escapeHTML(s) {
  return String(s || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Resolve a dot-path like "tenets.0.appendix" on a data object
export function resolveDotPath(obj, path) {
  if (!obj || !path) return '';
  const parts = path.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length; i++) {
    const k = parts[i];
    if (cur == null || typeof cur !== 'object') return '';
    if (Array.isArray(cur)) {
      const idx = parseInt(k, 10);
      if (isNaN(idx) || idx < 0 || idx >= cur.length) return '';
      cur = cur[idx];
    } else {
      cur = cur[k];
    }
  }
  return typeof cur === 'string' ? cur : '';
}
