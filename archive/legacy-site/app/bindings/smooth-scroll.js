/**
 * bindings/smooth-scroll.js
 * Smooth-scroll anchors with fixed-nav offset.
 *
 * Auto-extracted from site/app.js by A-app.extract.py.
 * Function bodies are VERBATIM — no logic changes.
 * Import/export wiring is generated; only the IIFE wrapper was dropped.
 */

import { $ as $, $$ as $$ } from '../utils.js';
import { addManagedListener as addManagedListener } from '../cleanup.js';

  const TAG = '[agf:bind:smooth-scroll]';
  function _track(err, ctx) { console.error(TAG, ctx || '', err); try { if (window.AGF && window.AGF._errors) window.AGF._errors.push({ tag: TAG, message: (ctx ? ctx + ': ' : '') + (err && err.message || String(err)) }); } catch (_) {} }

  // 7. Smooth scroll for in-page anchors (offset for fixed nav)
  function bindSmoothScroll() {
    try {
    const nav = $('#nav');
    $$('a[href^="#"]').forEach((a) => {
      const handler = (e) => {
        const id = a.getAttribute('href');
        if (id === '#' || id.length < 2) return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        const navHeight = nav ? nav.offsetHeight : 0;
        const y = target.getBoundingClientRect().top + window.scrollY - navHeight + 1;
        window.scrollTo({ top: y, behavior: 'smooth' });
      };
      addManagedListener(a, 'click', handler);
    });
    } catch (err) { _track(err); }
  }

export { bindSmoothScroll };
