/* ==========================================================================
   AGF · system-configurator/constants
   Pure data, config maps, utility functions, and lane layout. Owns namespace init — must load first.
   Extracted verbatim from site/components/system-configurator.js by
   A-sysconfigurator.extract.py. Function bodies are byte-identical;
   only `_state` → `SC._state` wiring is applied (see header).
   ========================================================================== */
(function (SC) {
  'use strict';

  // Role lanes — left → right signal flow. Unknown roles fall through to 'end'.
  const ROLE_ORDER = ['source', 'processor', 'amplifier', 'output'];
  const ROLE_LABEL = {
    source: 'Source', processor: 'Processor', amplifier: 'Amplifier',
    output: 'Output', accessory: 'Accessory',
  };
  // Wireless protocols draw dashed lines; wired draw solid.
  const WIRELESS = new Set(['BT', 'RF', 'WiFi']);

  const esc = (v) => String(v == null ? '' : v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  function priceOf(p) {
    const a = p.data && p.data.business && p.data.business.asp_usd;
    return (a && typeof a.min === 'number') ? a.min : 0;
  }
  function fmtUSD(n) {
    if (!n) return '$0';
    if (n >= 1000) return '$' + (n / 1000).toFixed(n % 1000 ? 1 : 0) + 'K';
    return '$' + n;
  }
  function roleOf(p) {
    return (p.data && p.data.system_config && p.data.system_config.system_role) || 'accessory';
  }
  function configOf(p) { return (p.data && p.data.system_config) || {}; }

  // Group products by role lane in defined order; unknown roles appended,
  // accessory rendered as a separate row beneath the chain.
  function laneLayout(products) {
    const lanes = ROLE_ORDER.map((role) => ({ role, items: [] }));
    const accessory = { role: 'accessory', items: [] };
    const extras = {};
    products.forEach((p) => {
      const r = roleOf(p);
      if (r === 'accessory') accessory.items.push(p);
      else {
        const lane = lanes.find((l) => l.role === r);
        if (lane) lane.items.push(p);
        else (extras[r] = extras[r] || { role: r, items: [] }).items.push(p);
      }
    });
    Object.values(extras).forEach((l) => lanes.push(l));
    return { lanes: lanes.filter((l) => l.items.length), accessory };
  }

  // ─── Exports ────────────────────────────────────────
  SC.constants = {
    ROLE_ORDER, ROLE_LABEL, WIRELESS,
    esc, priceOf, fmtUSD, roleOf, configOf, laneLayout,
  };
})(window.AGF.SystemConfig = window.AGF.SystemConfig || {});
