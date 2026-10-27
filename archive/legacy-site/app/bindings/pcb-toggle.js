/**
 * bindings/pcb-toggle.js
 * PCB motif class toggle.
 *
 * Auto-extracted from site/app.js by A-app.extract.py.
 * Function bodies are VERBATIM — no logic changes.
 * Import/export wiring is generated; only the IIFE wrapper was dropped.
 */

import { $ as $, $$ as $$ } from '../utils.js';
import { addManagedListener as addManagedListener } from '../cleanup.js';

  const TAG = '[agf:bind:pcb-toggle]';
  function _track(err, ctx) { console.error(TAG, ctx || '', err); try { if (window.AGF && window.AGF._errors) window.AGF._errors.push({ tag: TAG, message: (ctx ? ctx + ': ' : '') + (err && err.message || String(err)) }); } catch (_) {} }

  // 9. PCB motif toggle
  function bindPCBToggle() {
    try {
    const btn = $('#pcbToggle');
    if (!btn) return;
    const handler = () => {
      const on = document.body.classList.toggle('is-pcb');
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    };
    addManagedListener(btn, 'click', handler);
    } catch (err) { _track(err); }
  }

export { bindPCBToggle };
