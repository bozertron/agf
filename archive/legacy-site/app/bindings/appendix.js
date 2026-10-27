/**
 * bindings/appendix.js
 * Appendix popup modal on click.
 *
 * Auto-extracted from site/app.js by A-app.extract.py.
 * Function bodies are VERBATIM — no logic changes.
 * Import/export wiring is generated; only the IIFE wrapper was dropped.
 */

import { $ as $, $$ as $$, resolveDotPath as resolveDotPath } from '../utils.js';
import { addManagedListener as addManagedListener, state as state } from '../cleanup.js';

  const TAG = '[agf:bind:appendix]';
  function _track(err, ctx) { console.error(TAG, ctx || '', err); try { if (window.AGF && window.AGF._errors) window.AGF._errors.push({ tag: TAG, message: (ctx ? ctx + ': ' : '') + (err && err.message || String(err)) }); } catch (_) {} }

  // 10. Appendix popup: click "*Learn more in Appendix*" to view
  function bindAppendixLinks() {
    try {
    const app = $('#app');
    if (!app) return;
    const handler = function (e) {
      const ref = e.target.closest('.appendix-ref');
      if (!ref) return;
      const sectionId = ref.getAttribute('data-appendix-for');
      const appendixKey = ref.getAttribute('data-appendix-key');
      if (!sectionId) return;

      // Resolve appendix text — supports section-level and per-item (dot-path) keys
      let appendixText = '';

      if (sectionId.startsWith('product:')) {
        // Product card appendix
        const slug = sectionId.replace('product:', '');
        const product = state.products.find((p) => p.slug === slug);
        if (product && product.data) {
          appendixText = appendixKey
            ? resolveDotPath(product.data, appendixKey + '.appendix')
            : (product.data.appendix || '');
        }
      } else {
        // Section appendix
        const sec = state.sections.find((s) => s.id === sectionId);
        if (!sec || !sec.data) return;
        if (appendixKey) {
          appendixText = resolveDotPath(sec.data, appendixKey + '.appendix');
        } else {
          appendixText = sec.data.appendix || '';
        }
      }

      if (!appendixText) return;

      // Render markdown via SchemaRenderer helper
      const md = (window.SchemaRenderer && window.SchemaRenderer.helpers && window.SchemaRenderer.helpers.md)
        ? window.SchemaRenderer.helpers.md
        : (s) => String(s || '').replace(/</g, '&lt;').replace(/\n/g, '<br>');
      const html = md(appendixText);
      // Build popup
      const overlay = document.createElement('div');
      overlay.className = 'appendix-popup';
      const content = document.createElement('div');
      content.className = 'appendix-popup-content';
      content.innerHTML = '<h4>Appendix</h4><div class="appendix-popup-body">' + html + '</div>' +
        '<div class="appendix-popup-actions"><button class="btn-apx-close" type="button">Close</button></div>';
      overlay.appendChild(content);
      // Close on backdrop click
      overlay.addEventListener('click', function (ev) {
        if (ev.target === overlay) overlay.remove();
      });
      // Close button
      content.querySelector('.btn-apx-close').addEventListener('click', function () {
        overlay.remove();
      });
      document.body.appendChild(overlay);
    };
    addManagedListener(app, 'click', handler);
    } catch (err) { _track(err); }
  }

export { bindAppendixLinks };
