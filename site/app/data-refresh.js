/**
 * data-refresh.js
 * Edit-mode live reload: refreshAll, refreshSection, refreshProducts.
 *
 * Auto-extracted from site/app.js by A-app.extract.py.
 * Function bodies are VERBATIM — no logic changes.
 * Import/export wiring is generated; only the IIFE wrapper was dropped.
 */

import { API, fetchJSON, loadAll } from './api.js';
import { buildPageHTML, renderHeaderFooter } from './renderer.js';
import { bindAll } from './mount.js';
import { applyAllStyleOverrides, applySectionStyleOverrides } from './style-manager.js';
import { toast } from './toast.js';
import { state } from './cleanup.js';
import { $ as $, $$ as $$ } from './utils.js';

  const TAG = '[agf:refresh]';
  function _track(err, ctx) { console.error(TAG, ctx || '', err); try { if (window.AGF && window.AGF._errors) window.AGF._errors.push({ tag: TAG, message: (ctx ? ctx + ': ' : '') + (err && err.message || String(err)) }); } catch (_) {} }

  // ---------- public API for edit mode (Task 6) --------------------------
  async function refreshAll() {
    try {
      await loadAll();
    const app = $('#app');
    app.innerHTML = buildPageHTML();
    renderHeaderFooter();
    applyAllStyleOverrides();
    bindAll();
    if (window.AGFEditor && window.AGFEditor.rebind) window.AGFEditor.rebind();
    toast('Site refreshed.', 'success');
    } catch (err) { _track(err, 'refreshAll'); toast('Refresh failed: ' + (err && err.message || err), 'error'); }
  }


  async function refreshSection(id) {
    try {
      const s = await fetchJSON(`${API.sections}/${id}`);
      const idx = state.sections.findIndex((x) => x.id === id);
      if (idx >= 0) state.sections[idx] = s; else state.sections.push(s);
      // Re-render in place — find the [data-section-id] node and replace.
      const node = document.querySelector(`[data-section-id="${id}"]`);
      const tmp = document.createElement('div');
      tmp.innerHTML = window.SchemaRenderer.renderSection(s);
      const fresh = tmp.firstElementChild;
      if (node && fresh) {
        node.replaceWith(fresh);
        applySectionStyleOverrides(fresh);
        bindAll();
        if (window.AGFEditor && window.AGFEditor.rebind) window.AGFEditor.rebind();
      } else {
        await refreshAll();
      }
      toast('Section saved.', 'success');
    } catch (err) {
      _track(err, 'refreshSection');
      toast('Refresh failed: ' + err.message, 'error');
    }
  }


  async function refreshProducts() {
    try {
      const products = await fetchJSON(API.products);
      state.products = products
        .filter((p) => p.is_visible !== false)
        .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
      const node = document.querySelector('#products');
      if (node) {
        const tmp = document.createElement('div');
        tmp.innerHTML = window.SchemaRenderer.renderProductsBlock(state.products);
        const fresh = tmp.firstElementChild;
        if (fresh) {
          node.replaceWith(fresh);
          applyAllStyleOverrides();
          bindAll();
          if (window.AGFEditor && window.AGFEditor.rebind) window.AGFEditor.rebind();
        }
      } else {
        await refreshAll();
      }
      toast('Products refreshed.', 'success');
    } catch (err) {
      _track(err, 'refreshProducts');
      toast('Refresh failed: ' + err.message, 'error');
    }
  }

export { refreshAll, refreshSection, refreshProducts };
