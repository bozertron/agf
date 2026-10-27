/* ==========================================================================
   AGF · system-configurator/render-footer
   Companion-hint computation + footer sections (technology synergy pills, running price total).
   Extracted verbatim from site/components/system-configurator.js by
   A-sysconfigurator.extract.py. Function bodies are byte-identical;
   only `_state` → `SC._state` wiring is applied (see header).
   ========================================================================== */
(function (SC) {
  'use strict';
  // namespace guard — SC === window.AGF.SystemConfig
  if (!SC) throw new Error('[SystemConfigurator:render-footer] namespace missing — load constants.js first');

  const { esc, priceOf, fmtUSD, configOf } = SC.constants;
  // Union of companion slugs of currently-selected products that aren't selected yet.
  function computeCompanionHints() {
    const hints = new Set();
    SC._state.selected.forEach((slug) => {
      const p = SC._state.bySlug[slug];
      const cs = (configOf(p).companions) || [];
      cs.forEach((c) => { if (!SC._state.selected.has(c) && SC._state.bySlug[c]) hints.add(c); });
    });
    return hints;
  }

  function renderSynergy(host) {
    if (!host) return;
    const techs = new Set();
    SC._state.selected.forEach((slug) => {
      const p = SC._state.bySlug[slug];
      ((p.data && p.data.agf_technologies) || []).forEach((t) => techs.add(t));
    });
    if (!techs.size) {
      host.innerHTML = `<span class="synergy-empty">— select products to see shared technologies —</span>`;
      return;
    }
    host.innerHTML = Array.from(techs)
      .map((t) => `<span class="synergy-pill">${esc(t)}</span>`).join('');
  }

  function renderPrice(host) {
    if (!host) return;
    let total = 0;
    SC._state.selected.forEach((slug) => { total += priceOf(SC._state.bySlug[slug]); });
    host.querySelector('.price-value').textContent = fmtUSD(total);
    const n = SC._state.selected.size;
    host.querySelector('.price-meta').textContent = `${n} product${n === 1 ? '' : 's'} selected`;
  }

  // ─── Exports ────────────────────────────────────────
  SC.footer = { computeCompanionHints, renderSynergy, renderPrice };
})(window.AGF.SystemConfig = window.AGF.SystemConfig || {});
