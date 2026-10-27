/**
 * bindings/hero-parallax.js
 * Hero orbit parallax with rAF pause when off-screen.
 *
 * Auto-extracted from site/app.js by A-app.extract.py.
 * Function bodies are VERBATIM — no logic changes.
 * Import/export wiring is generated; only the IIFE wrapper was dropped.
 */

import { $ as $, $$ as $$ } from '../utils.js';
import { addManagedListener as addManagedListener, _bound } from '../cleanup.js';

  const TAG = '[agf:bind:hero-parallax]';
  function _track(err, ctx) { console.error(TAG, ctx || '', err); try { if (window.AGF && window.AGF._errors) window.AGF._errors.push({ tag: TAG, message: (ctx ? ctx + ': ' : '') + (err && err.message || String(err)) }); } catch (_) {} }

  // 8. Hero orbit parallax (site-001 fix: pause rAF when hero is off-screen)
  function bindHeroParallax() {
    try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const heroSection = document.querySelector('#hero') || document.querySelector('.hero');
    const orbits = $$('.hero-orbits .o');
    if (!orbits.length) return;
    let px = 0, py = 0;
    let running = false;

    const onMouseMove = (e) => {
      px = ((e.clientX / window.innerWidth) - 0.5) * 16;
      py = ((e.clientY / window.innerHeight) - 0.5) * 16;
    };
    addManagedListener(window, 'mousemove', onMouseMove, { passive: true });

    function loop() {
      if (!running) return;
      orbits.forEach((o, i) => {
        const f = (i + 1) * 0.4;
        o.style.translate = (px * f) + 'px ' + (py * f) + 'px';
      });
      _bound.heroRafId = requestAnimationFrame(loop);
    }

    function startLoop() {
      if (running) return;
      running = true;
      _bound.heroRafId = requestAnimationFrame(loop);
    }

    function stopLoop() {
      running = false;
      if (_bound.heroRafId != null) {
        cancelAnimationFrame(_bound.heroRafId);
        _bound.heroRafId = null;
      }
    }

    // Use IntersectionObserver to only run when hero is visible
    if (heroSection && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) startLoop();
          else stopLoop();
        });
      }, { threshold: 0 });
      io.observe(heroSection);
      _bound.heroObserver = io;
    } else {
      // Fallback: just start the loop (no hero element found to observe)
      startLoop();
    }
    } catch (err) { _track(err); }
  }

export { bindHeroParallax };
