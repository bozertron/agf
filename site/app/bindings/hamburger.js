/**
 * bindings/hamburger.js
 * Off-canvas nav drawer (hamburger).
 *
 * Auto-extracted from site/app.js by A-app.extract.py.
 * Function bodies are VERBATIM — no logic changes.
 * Import/export wiring is generated; only the IIFE wrapper was dropped.
 */

import { $ as $, $$ as $$ } from '../utils.js';
import { addManagedListener as addManagedListener } from '../cleanup.js';

  const TAG = '[agf:bind:hamburger]';
  function _track(err, ctx) { console.error(TAG, ctx || '', err); try { if (window.AGF && window.AGF._errors) window.AGF._errors.push({ tag: TAG, message: (ctx ? ctx + ': ' : '') + (err && err.message || String(err)) }); } catch (_) {} }

  // 11. Hamburger menu toggle for off-canvas drawer
  function bindHamburger() {
    try {
    const btn = $('#navHamburger');
    const drawer = $('#navDrawer');
    const overlay = $('#navDrawerOverlay');
    if (!btn || !drawer || !overlay) return;

    function openDrawer() {
      drawer.classList.add('is-open');
      overlay.classList.add('is-open');
      btn.classList.add('is-open');
    }
    function closeDrawer() {
      drawer.classList.remove('is-open');
      overlay.classList.remove('is-open');
      btn.classList.remove('is-open');
    }
    addManagedListener(btn, 'click', () => {
      if (drawer.classList.contains('is-open')) closeDrawer();
      else openDrawer();
    });
    addManagedListener(overlay, 'click', closeDrawer);
    // Close drawer when a link is clicked
    addManagedListener(drawer, 'click', (e) => {
      if (e.target.tagName === 'A') closeDrawer();
    });
    } catch (err) { _track(err); }
  }

export { bindHamburger };
