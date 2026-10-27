/**
 * bindings/counters.js
 * Animated number counters with easing.
 *
 * Auto-extracted from site/app.js by A-app.extract.py.
 * Function bodies are VERBATIM — no logic changes.
 * Import/export wiring is generated; only the IIFE wrapper was dropped.
 */

import { $ as $, $$ as $$ } from '../utils.js';
import { addManagedListener as addManagedListener, _bound } from '../cleanup.js';

  const TAG = '[agf:bind:counters]';
  function _track(err, ctx) { console.error(TAG, ctx || '', err); try { if (window.AGF && window.AGF._errors) window.AGF._errors.push({ tag: TAG, message: (ctx ? ctx + ': ' : '') + (err && err.message || String(err)) }); } catch (_) {} }

  // 3. Counters
  function bindCounters() {
    try {
    const counters = $$('[data-count]');
    if (!('IntersectionObserver' in window)) {
      counters.forEach((c) => {
        c.textContent = c.getAttribute('data-count');
      });
      return;
    }
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseFloat(el.getAttribute('data-count'));
        const start = performance.now();
        function step(now) {
          const t = Math.min(1, (now - start) / 1200);
          const eased = 1 - Math.pow(1 - t, 3);
          const value = Math.round(target * eased);
          el.textContent = value;
          if (t < 1) requestAnimationFrame(step);
          else el.textContent = target;
        }
        requestAnimationFrame(step);
        cio.unobserve(el);
      });
    }, { threshold: 0.4 });
    counters.forEach((c) => cio.observe(c));
    _bound.observers.push(cio);
    } catch (err) { _track(err); }
  }

export { bindCounters };
