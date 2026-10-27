/**
 * bindings/scroll-progress.js
 * Scroll progress bar + nav scroll state.
 *
 * Auto-extracted from site/app.js by A-app.extract.py.
 * Function bodies are VERBATIM — no logic changes.
 * Import/export wiring is generated; only the IIFE wrapper was dropped.
 */

import { $ as $, $$ as $$ } from '../utils.js';
import { addManagedListener as addManagedListener } from '../cleanup.js';

  // 1. Scroll progress + nav state
  function bindScrollProgress() {
    const progress = $('#scrollProgress');
    const nav = $('#nav');
    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
        if (progress) progress.style.width = pct + '%';
        if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 30);
        ticking = false;
      });
    }
    addManagedListener(window, 'scroll', onScroll, { passive: true });
    onScroll();
  }

export { bindScrollProgress };
