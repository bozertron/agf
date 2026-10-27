/**
 * api.js
 * API route constants, fetchJSON, loadAll.
 *
 * Auto-extracted from site/app.js by A-app.extract.py.
 * Function bodies are VERBATIM — no logic changes.
 * Import/export wiring is generated; only the IIFE wrapper was dropped.
 */

import { state } from './cleanup.js';

  const TAG = '[agf:api]';
  function _track(err, ctx) { console.error(TAG, ctx || '', err); try { if (window.AGF && window.AGF._errors) window.AGF._errors.push({ tag: TAG, message: (ctx ? ctx + ': ' : '') + (err && err.message || String(err)) }); } catch (_) {} }

  const API = {
    sections: '/api/sections',
    products: '/api/products',
    schemas:  '/api/schemas',
  };


  // ---------- fetch -------------------------------------------------------
  async function fetchJSON(url) {
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error(`${url} → ${res.status} ${res.statusText}`);
    return res.json();
  }


  async function loadAll() {
    const [sections, products] = await Promise.all([
      fetchJSON(API.sections).catch((e) => { _track(e, 'sections'); return []; }),
      fetchJSON(API.products).catch((e) => { _track(e, 'products'); return []; }),
    ]);
    state.sections = (sections || [])
      .filter((s) => s.is_visible !== false)
      .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    state.products = (products || [])
      .filter((p) => p.is_visible !== false)
      .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  }

export { API, fetchJSON, loadAll };
