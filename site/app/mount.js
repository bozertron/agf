/**
 * mount.js
 * Page lifecycle orchestrator: mount() and bindAll().
 *
 * Auto-extracted from site/app.js by A-app.extract.py.
 * Function bodies are VERBATIM — no logic changes.
 * Import/export wiring is generated; only the IIFE wrapper was dropped.
 */

import { loadAll } from './api.js';
import { buildPageHTML, renderHeaderFooter } from './renderer.js';
import { applyAllStyleOverrides } from './style-manager.js';
import { unbindAll } from './cleanup.js';
import { $ as $, $$ as $$, escapeHTML } from './utils.js';
import { bindScrollProgress, bindRevealObserver, bindCounters, bindRhymeTabs, bindProductExpand, bindSmoothScroll, bindHeroParallax, bindPCBToggle, bindActiveNav, bindAppendixLinks, bindHamburger } from './bindings/index.js';

  const TAG = '[agf:mount]';
  function _track(err, ctx) { console.error(TAG, ctx || '', err); try { if (window.AGF && window.AGF._errors) window.AGF._errors.push({ tag: TAG, message: (ctx ? ctx + ': ' : '') + (err && err.message || String(err)) }); } catch (_) {} }

  // ---------- mount + bind -----------------------------------------------
  async function mount() {
    const app = $('#app');
    if (!app) return;
    app.setAttribute('aria-busy', 'true');

    try {
      await loadAll();
      app.innerHTML = buildPageHTML();
      renderHeaderFooter();
      applyAllStyleOverrides();
      bindAll();
      app.setAttribute('aria-busy', 'false');
    } catch (err) {
      _track(err, 'mount');
      app.innerHTML = `<section class="section">
        <div class="section-head">
          <p class="eyebrow">Connection error</p>
          <h2 class="section-title">Unable to load brand content.</h2>
          <p class="section-deck">Make sure the API server is running on the same origin. Details: ${escapeHTML(err.message)}</p>
        </div>
      </section>`;
      app.setAttribute('aria-busy', 'false');
    }
  }


  // ---------- interactions binding ---------------------------------------
  function bindAll() {
    unbindAll(); // Remove old listeners before re-binding (site-002 fix)
    bindScrollProgress();
    bindRevealObserver();
    bindCounters();
    bindRhymeTabs();
    bindProductExpand();
    bindSmoothScroll();
    bindHeroParallax();
    bindPCBToggle();
    bindActiveNav();
    bindAppendixLinks();
  }

export { mount, bindAll };
