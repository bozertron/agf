/* ==========================================================================
   AGF · system-configurator/render-cards
   Sidebar product card rendering.
   Extracted verbatim from site/components/system-configurator.js by
   A-sysconfigurator.extract.py. Function bodies are byte-identical;
   only `_state` → `SC._state` wiring is applied (see header).
   ========================================================================== */
(function (SC) {
  'use strict';
  // namespace guard — SC === window.AGF.SystemConfig
  if (!SC) throw new Error('[SystemConfigurator:render-cards] namespace missing — load constants.js first');

  const { esc, priceOf, fmtUSD, roleOf, ROLE_LABEL } = SC.constants;
  function renderCards(host, hints) {
    if (!host) return;
    const html = SC._state.products.map((p) => {
      const sel = SC._state.selected.has(p.slug);
      const hint = hints.has(p.slug);
      const role = roleOf(p);
      const cls = ['configurator-card', sel ? 'is-selected' : '', hint ? 'companion-hint' : ''].filter(Boolean).join(' ');
      return `
        <button type="button" class="${cls}" data-card-slug="${esc(p.slug)}" aria-pressed="${sel ? 'true' : 'false'}">
          <span class="cc-role">${esc(ROLE_LABEL[role] || role)}</span>
          <span class="cc-name">${esc(p.data.name || p.name)}</span>
          <span class="cc-meta">
            <span class="cc-price">${fmtUSD(priceOf(p))}</span>
            <span class="cc-toggle">${sel ? '✓ in system' : '+ add'}</span>
          </span>
        </button>`;
    }).join('');
    host.innerHTML = html;
  }

  // ─── Exports ────────────────────────────────────────
  SC.cards = { renderCards };
})(window.AGF.SystemConfig = window.AGF.SystemConfig || {});
