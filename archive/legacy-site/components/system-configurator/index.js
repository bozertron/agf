/* ==========================================================================
   AGF · system-configurator/index
   Entry point: namespace init, render() orchestrator with per-sub-renderer error boundaries, public API export. Generated (not verbatim) except render() body.
   Extracted verbatim from site/components/system-configurator.js by
   A-sysconfigurator.extract.py. Function bodies are byte-identical;
   only `_state` → `SC._state` wiring is applied (see header).
   ========================================================================== */
(function (global) {
  'use strict';
  global.AGF = global.AGF || {};
  var SC = global.AGF.SystemConfig = global.AGF.SystemConfig || {};
  if (!SC.constants) {
    console.error('[SystemConfigurator] constants module missing — abort init');
    return;
  }

  // render() orchestrator — extracted from source lines 151-160.
  // MODIFIED (this is the error-tracking win): each sub-renderer is
  // wrapped in its own try/catch so one failure doesn't kill the
  // others. Calls route through the namespace (SC.cards.*, etc.).
  function render() {
    const root = document.getElementById('agf-configurator');
    if (!root) return;
    const hints = SC.footer.computeCompanionHints();
    const calls = [
      ['cards',   () => SC.cards.renderCards(root.querySelector('[data-side=\x22cards\x22]'), hints)],
      ['chain',   () => SC.chain.renderChain(root.querySelector('[data-side=\x22chain\x22]'))],
      ['synergy', () => SC.footer.renderSynergy(root.querySelector('[data-side=\x22synergy\x22] .synergy-pills'))],
      ['price',   () => SC.footer.renderPrice(root.querySelector('[data-side=\x22price\x22]'))],
    ];
    for (const [label, fn] of calls) {
      try { fn(); }
      catch (err) {
        console.error('[SystemConfigurator:render:' + label + ']', err);
        // ERROR-HOOK (polish): mirror into the shared app error buffer so
        // the wider AGF shell can surface configurator failures in its
        // diagnostics. Logging itself is guarded so it can never throw.
        try {
          global.AGF._errors = global.AGF._errors || [];
          global.AGF._errors.push({ scope: 'SystemConfigurator:render:' + label, err: String((err && err.stack) || err) });
        } catch (_) { /* never let error-logging itself throw */ }
      }
    }
  }
  SC.render = render;

  // ─── Public API (mirrors original source line 313) ──────────────
  if (SC.lifecycle) {
    global.SystemConfigurator = { init: SC.lifecycle.init, close: SC.lifecycle.close };
  } else {
    console.error('[SystemConfigurator] lifecycle module not loaded — '
      + 'ensure load order: constants -> lifecycle -> render-cards -> '
      + 'render-chain -> render-footer -> index');
  }
})(window);
