/**
 * bindings/reveal.js
 * IntersectionObserver-based reveal-on-scroll.
 *
 * Auto-extracted from site/app.js by A-app.extract.py.
 * Function bodies are VERBATIM — no logic changes.
 * Import/export wiring is generated; only the IIFE wrapper was dropped.
 */

import { $ as $, $$ as $$ } from '../utils.js';
import { addManagedListener as addManagedListener, _bound } from '../cleanup.js';

  const TAG = '[agf:bind:reveal]';
  function _track(err, ctx) { console.error(TAG, ctx || '', err); try { if (window.AGF && window.AGF._errors) window.AGF._errors.push({ tag: TAG, message: (ctx ? ctx + ': ' : '') + (err && err.message || String(err)) }); } catch (_) {} }

  // 2. Reveal-on-scroll
  function bindRevealObserver() {
    try {
    const targets = $$('[data-reveal]');
    if (!('IntersectionObserver' in window)) {
      targets.forEach((el) => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    targets.forEach((el) => io.observe(el));
    _bound.observers.push(io);
    } catch (err) { _track(err); }
  }

export { bindRevealObserver };
