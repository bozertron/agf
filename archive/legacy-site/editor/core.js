/* ========================================================================
 * site/editor/core.js
 * Purpose: Generic DOM/API utilities and shared constants
 * Module tag (Phase 2): [agf:core]
 *
 * EXTRACTED VERBATIM from site/editor.js by A-editor.extract.py on 2026-06-27T03:23:12.075099+00:00.
 * Function bodies are byte-identical to the source. Do NOT hand-edit logic;
 * edit the source and re-run the extractor.
 *
 * ========================================================================
 * REQUIRED IMPORTS (wire in Phase 2 — see A-editor.md §3.1):
 *   window.AGF.toast (toast delegates to it) — already global, no import
 *   Exports: $, $$, API, toast, escapeHTML, el, humanize, deepClone,
 *             setNestedField, shortId, cssAttrEscape
 *
 * ========================================================================
 * ERROR-TRACKING HOOKS (Phase 2 — uncomment + apply):
 *   api() non-2xx (editor.js ~54): emit structured log {method,url,status,body} before throw (chunk-1)
 *
 * Suggested module-local log helpers (uncomment in Phase 2):
 *   const TAG  = '[agf:core]';
 *   const log  = (...a) => console.log(TAG, ...a);
 *   const warn = (...a) => console.warn(TAG, ...a);
 *   const err  = (...a) => console.error(TAG, ...a);
 */

// === TAG SCAFFOLD (activated in Phase-2 polish pass) =========================
// NOTE: these are module-local consts valid under ES-module wiring (Strategy A).
// For Strategy-B concatenation, strip this block (see LOAD_ORDER.md).
  const TAG  = '[agf:core]';
  const log  = (...a) => console.log(TAG, ...a);
  const warn = (...a) => console.warn(TAG, ...a);
  const err  = (...a) => console.error(TAG, ...a);

/* --- state/constants: constants: $, $$, API endpoint map (editor.js lines 14-20) --- */
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const API = {
    sections: '/api/sections',
    products: '/api/products',
    schemas:  '/api/schemas',
  };

/* --- function toast (editor.js lines 32-38) --- */
  function toast(msg, type) {
    if (window.AGF && typeof window.AGF.toast === 'function') {
      window.AGF.toast(msg, type || 'info');
    } else {
      console.warn('[toast:' + (type || 'info') + ']', msg);
    }
  }

/* --- function api (editor.js lines 40-65) --- */
  async function api(method, url, body) {
    const opts = {
      method,
      headers: { 'Accept': 'application/json' },
    };
    if (body !== undefined) {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(body);
    }
    const res = await fetch(url, opts);
    if (res.status === 204) return null;
    const ct = res.headers.get('content-type') || '';
    const payload = ct.includes('application/json') ? await res.json() : await res.text();
    if (!res.ok) {
      const msg = (payload && payload.error) ? payload.error : ('HTTP ' + res.status);
      throw new Error(msg);
    }
    return payload;
  }

  // Fresh-GET reconcile for convention fields (any `_`-prefixed key such as
  // _style_overrides / _background_image). Used by every save path so a
  // form-open snapshot can never clobber a concurrent edit to a convention
  // field. Only FILLS GAPS: keys already present on `merged` win (the user's
  // current edit). A failed reconcile GET aborts the save (no silent clobber).
  // `hostType` is 'section' (hostIdOrSlug = id) or 'product' (= slug).

/* --- function escapeHTML (editor.js lines 88-92) --- */
  function escapeHTML(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

/* --- function el (editor.js lines 94-120) --- */
  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach((k) => {
        const v = attrs[k];
        if (v === undefined || v === null || v === false) return;
        if (k === 'class') node.className = v;
        else if (k === 'html') node.innerHTML = v;
        else if (k === 'text') node.textContent = v;
        else if (k.startsWith('on') && typeof v === 'function') {
          node.addEventListener(k.slice(2).toLowerCase(), v);
        } else {
          node.setAttribute(k, v === true ? '' : v);
        }
      });
    }
    if (children) {
      (Array.isArray(children) ? children : [children]).forEach((c) => {
        if (c == null || c === false) return;
        node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
      });
    }
    return node;
  }

  // Resolve a JSON-Schema property descriptor to its effective shape, taking
  // the first non-null option from oneOf/anyOf if present.

/* --- function humanize (editor.js lines 155-159) --- */
  function humanize(key) {
    return String(key || '')
      .replace(/[_-]+/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

/* --- function deepClone (editor.js lines 666-670) --- */
  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  // Read a value at a dot-path (numeric segments = array indices).

/* --- function setNestedField (editor.js lines 3461-3485) --- */
  function setNestedField(obj, path, value) {
    var parts = path.split('.');
    var cur = obj;
    for (var i = 0; i < parts.length - 1; i++) {
      if (cur[parts[i]] === undefined || cur[parts[i]] === null) return;
      cur = cur[parts[i]];
    }
    var lastKey = parts[parts.length - 1];
    if (value === null) {
      delete cur[lastKey];
    } else {
      cur[lastKey] = value;
    }
  }

  /**
   * resolveEnhanceKey(el, container)
   * Derives a stable override key for the given enhanced element, mirroring
   * the key logic used by openEnhancePanel. Sets data-enh-field (or
   * data-enh-selector) on the element as a side effect so subsequent calls —
   * including after a re-render — are O(1) and the stable key survives.
   *
   * Returns the derived key string (empty string if none could be derived).
   * Produces IDENTICAL keys to the original openEnhancePanel logic.
   */

/* --- function shortId (editor.js lines 1617-1626) --- */
  function shortId() {
    return 'b_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6);
  }

  /**
   * Best-effort cleanup of an uploaded asset via the DELETE /api/upload endpoint
   * (locked-down: path allowlist + containment check). Used on figure
   * replace/remove and on save-failure so no orphaned files accumulate.
   * Never throws — failures are warned and swallowed (cleanup is best-effort).
   */

/* --- function cssAttrEscape (editor.js lines 3745-3753) --- */
  function cssAttrEscape(str) {
    return String(str).replace(/(["\\])/g, '\\$1');
  }

