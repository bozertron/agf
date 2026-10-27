/**
 * bindings/product-expand.js
 * Product card expand/collapse + spec groups.
 *
 * Auto-extracted from site/app.js by A-app.extract.py.
 * Function bodies are VERBATIM — no logic changes.
 * Import/export wiring is generated; only the IIFE wrapper was dropped.
 */

import { $ as $, $$ as $$ } from '../utils.js';
import { addManagedListener as addManagedListener } from '../cleanup.js';

  const TAG = '[agf:bind:product-expand]';
  function _track(err, ctx) { console.error(TAG, ctx || '', err); try { if (window.AGF && window.AGF._errors) window.AGF._errors.push({ tag: TAG, message: (ctx ? ctx + ': ' : '') + (err && err.message || String(err)) }); } catch (_) {} }

  // 6. Product cards: expand the spec sheet, plus collapsible spec groups.
  function bindProductExpand() {
    try {
    $$('.product-expand-btn').forEach((btn) => {
      const handler = () => {
        const card = btn.closest('.product-card');
        if (!card) return;
        const open = card.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        btn.querySelector('.px-arrow').textContent = open ? '↑' : '↓';
        // Auto-expand the first group when first opened.
        if (open) {
          const first = card.querySelector('.pspec-group');
          if (first && !first.classList.contains('is-open')) {
            first.classList.add('is-open');
            const head = first.querySelector('.pspec-group-head');
            if (head) head.setAttribute('aria-expanded', 'true');
            const tog = first.querySelector('.pspec-toggle');
            if (tog) tog.textContent = '−';
          }
        }
      };
      addManagedListener(btn, 'click', handler);
    });
    $$('.pspec-group-head').forEach((head) => {
      const handler = () => {
        const group = head.closest('.pspec-group');
        if (!group) return;
        const open = group.classList.toggle('is-open');
        head.setAttribute('aria-expanded', open ? 'true' : 'false');
        const tog = head.querySelector('.pspec-toggle');
        if (tog) tog.textContent = open ? '−' : '+';
      };
      addManagedListener(head, 'click', handler);
    });
    } catch (err) { _track(err); }
  }

export { bindProductExpand };
