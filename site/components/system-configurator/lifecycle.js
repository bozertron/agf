/* ==========================================================================
   AGF · system-configurator/lifecycle
   State machine + DOM lifecycle: _state, init, close, mount, shellHTML, bindEvents, toggle. Owns SC._state.
   Extracted verbatim from site/components/system-configurator.js by
   A-sysconfigurator.extract.py. Function bodies are byte-identical;
   only `_state` → `SC._state` wiring is applied (see header).
   ========================================================================== */
(function (SC) {
  'use strict';
  // namespace guard — SC === window.AGF.SystemConfig
  if (!SC) throw new Error('[SystemConfigurator:lifecycle] namespace missing — load constants.js first');

  // ---------- main API ----------------------------------------------------
  // POLISH-FIX: extraction script double-prefixed the declaration
  // (`SC.SC._state`); corrected to `SC._state`. Owned by lifecycle; other
  // modules read SC._state.
  SC._state = null;

  function init(container, products) {
    const list = (products || []).filter((p) => p && p.data && p.data.system_config);
    // ERROR-HOOK (bug #3 fix): surface the silent no-op when callers pass
    // products without system_config, instead of returning quietly.
    if (!list.length) {
      console.warn('[SystemConfigurator:init] no products with system_config — configurator will not open');
      return;
    }
    close();
    SC._state = {
      container: container || document.body,
      products: list,
      bySlug: Object.fromEntries(list.map((p) => [p.slug, p])),
      selected: new Set(),
      onKey: null,
    };
    mount();
  }

  function close() {
    if (!SC._state) return;
    // ERROR-HOOK (bug #2 fix): guard listener teardown so a throw here
    // can't strand SC._state.onKey or skip the DOM cleanup below.
    if (SC._state.onKey) {
      try { document.removeEventListener('keydown', SC._state.onKey); }
      catch (err) { console.error('[SystemConfigurator:close] keydown listener teardown failed', err); }
    }
    const root = document.getElementById('agf-configurator');
    if (root) root.remove();
    document.body.classList.remove('configurator-open');
    SC._state = null;
  }

  function mount() {
    // ERROR-HOOK (bug #1 fix — highest-impact): idempotency guard. Tear
    // down any orphaned #agf-configurator left by a prior mount before
    // creating a new root, so rapid re-mounts can't stack overlays.
    const existing = document.getElementById('agf-configurator');
    if (existing) {
      console.warn('[SystemConfigurator:mount] replacing existing #agf-configurator root');
      existing.remove();
    }
    document.body.classList.add('configurator-open');
    const root = document.createElement('div');
    root.id = 'agf-configurator';
    root.className = 'configurator-overlay';
    root.innerHTML = shellHTML();
    SC._state.container.appendChild(root);
    bindEvents(root);
    render();
    requestAnimationFrame(() => root.classList.add('is-open'));
  }

  function shellHTML() {
    return `
      <div class="configurator-grain" aria-hidden="true"></div>
      <div class="configurator-frame">
        <header class="configurator-header">
          <div>
            <p class="configurator-eyebrow">System Configurator · 06.5</p>
            <h2 class="configurator-title">Build Your <em>System</em>.</h2>
          </div>
          <button type="button" class="configurator-close" aria-label="Close configurator">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 6l12 12M18 6L6 18"/></svg>
          </button>
        </header>
        <div class="configurator-layout">
          <aside class="configurator-sidebar" data-side="cards"></aside>
          <main class="configurator-stage">
            <div class="configurator-legend" aria-hidden="true">
              <span class="lg-item"><span class="lg-dot lg-wired"></span>Wired</span>
              <span class="lg-item"><span class="lg-dot lg-wireless"></span>Wireless</span>
              <span class="lg-item"><span class="lg-dot lg-companion"></span>Companion</span>
            </div>
            <div class="system-chain" data-side="chain"></div>
          </main>
        </div>
        <footer class="configurator-footer">
          <div class="configurator-foot-col synergy-indicator" data-side="synergy">
            <p class="foot-kind">Technology Synergy</p>
            <div class="synergy-pills"></div>
          </div>
          <div class="configurator-foot-col price-total" data-side="price">
            <p class="foot-kind">Total · ASP min</p>
            <p class="price-value">$0</p>
            <p class="price-meta">0 products selected</p>
          </div>
        </footer>
      </div>`;
  }

  function bindEvents(root) {
    root.querySelector('.configurator-close').addEventListener('click', close);
    SC._state.onKey = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', SC._state.onKey);
    // Click-outside on the dim grain layer also closes
    root.querySelector('.configurator-grain').addEventListener('click', close);
    root.querySelector('.configurator-sidebar').addEventListener('click', (e) => {
      const card = e.target.closest('[data-card-slug]');
      if (!card) return;
      toggle(card.getAttribute('data-card-slug'));
    });
  }

  function toggle(slug) {
    // ERROR-HOOK (bug #8 fix): reject unknown slugs so a malformed
    // data-card-slug can't inject phantom entries that silently break
    // edge drawing downstream.
    if (!slug || !SC._state.bySlug[slug]) {
      console.warn('[SystemConfigurator:toggle] unknown slug', slug);
      return;
    }
    if (SC._state.selected.has(slug)) SC._state.selected.delete(slug);
    else SC._state.selected.add(slug);
    render();
  }

  // ─── Exports ────────────────────────────────────────
  // _state lives on SC so other modules can read it.
  SC.lifecycle = { init, close, mount, shellHTML, bindEvents, toggle };
})(window.AGF.SystemConfig = window.AGF.SystemConfig || {});
