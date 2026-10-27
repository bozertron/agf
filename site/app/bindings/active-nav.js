/**
 * bindings/active-nav.js
 * Intersection-based active nav link highlighting.
 *
 * Auto-extracted from site/app.js by A-app.extract.py.
 * Function bodies are VERBATIM — no logic changes.
 * Import/export wiring is generated; only the IIFE wrapper was dropped.
 */

import { $ as $, $$ as $$ } from '../utils.js';
import { addManagedListener as addManagedListener, _bound } from '../cleanup.js';

  const TAG = '[agf:bind:active-nav]';
  function _track(err, ctx) { console.error(TAG, ctx || '', err); try { if (window.AGF && window.AGF._errors) window.AGF._errors.push({ tag: TAG, message: (ctx ? ctx + ': ' : '') + (err && err.message || String(err)) }); } catch (_) {} }

  // 5. Active nav section tracking
  function bindActiveNav() {
    try {
    const navLinks = $$('.nav-links a');
    if (!navLinks.length || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach((a) => {
            const href = a.getAttribute('href');
            a.classList.toggle('is-active', href === '#' + id);
          });
        }
      });
    }, { rootMargin: '-20% 0px -60% 0px', threshold: 0.05 });
    // Observe all rendered section containers
    $$('section[id]').forEach((s) => io.observe(s));
    _bound.observers.push(io);
    } catch (err) { _track(err); }
  }

export { bindActiveNav };
