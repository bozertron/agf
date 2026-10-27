/* ==========================================================================
   AGF · system-configurator/render-chain
   SVG signal-chain visualization: lane layout, node rendering, edge drawing. The most complex piece (~94 lines) — isolated for error-tracking granularity.
   Extracted verbatim from site/components/system-configurator.js by
   A-sysconfigurator.extract.py. Function bodies are byte-identical;
   only `_state` → `SC._state` wiring is applied (see header).
   ========================================================================== */
(function (SC) {
  'use strict';
  // namespace guard — SC === window.AGF.SystemConfig
  if (!SC) throw new Error('[SystemConfigurator:render-chain] namespace missing — load constants.js first');

  const { esc, configOf, laneLayout, ROLE_LABEL, WIRELESS } = SC.constants;
  // SVG signal-chain visualization. Lanes laid out left→right by role; nodes
  // stacked vertically per lane. Connections drawn between selected pairs.
  function renderChain(host) {
    if (!host) return;
    const { lanes, accessory } = laneLayout(SC._state.products);
    const W = 880, H = 420;
    const padX = 80, padY = 60;
    const laneCount = Math.max(lanes.length, 1);
    const laneW = (W - padX * 2) / laneCount;
    const positions = {}; // slug → {x,y}

    // Lane headers
    let laneHeaders = '';
    let nodes = '';
    lanes.forEach((lane, i) => {
      const cx = padX + laneW * i + laneW / 2;
      laneHeaders += `<text class="lane-label" x="${cx}" y="36" text-anchor="middle">${esc(ROLE_LABEL[lane.role] || lane.role)}</text>`;
      laneHeaders += `<text class="lane-num" x="${cx}" y="18" text-anchor="middle">${String(i + 1).padStart(2, '0')}</text>`;
      const stack = lane.items.length;
      lane.items.forEach((p, j) => {
        // ERROR-HOOK (applied during polish): isolate per-node failures so
        // one malformed product can't blank the entire SVG chain.
        try {
          const cy = padY + 40 + (H - padY * 2 - 40) * (stack === 1 ? 0.4 : (j / (stack - 1)));
          positions[p.slug] = { x: cx, y: cy };
          nodes += nodeSVG(p, cx, cy);
        } catch (err) {
          console.error('[SystemConfigurator:chain] lane node render failed for', p && p.slug, err);
        }
      });
    });
    // Accessory row beneath the chain
    if (accessory.items.length) {
      const cy = H - 36;
      const step = (W - padX * 2) / Math.max(accessory.items.length, 1);
      accessory.items.forEach((p, i) => {
        try {
          const cx = padX + step * i + step / 2;
          positions[p.slug] = { x: cx, y: cy };
          nodes += nodeSVG(p, cx, cy, true);
        } catch (err) {
          console.error('[SystemConfigurator:chain] accessory node render failed for', p && p.slug, err);
        }
      });
      laneHeaders += `<text class="lane-label" x="${padX}" y="${cy - 36}" text-anchor="start">Accessories</text>`;
    }

    // Edges — only between currently-selected products
    let edges = '';
    SC._state.selected.forEach((slug) => {
      // ERROR-HOOK: isolate per-product edge computation so one bad
      // product can't abort the whole edge set.
      try {
        const p = SC._state.bySlug[slug];
        const ct = (configOf(p).connection_types) || [];
        ct.forEach((c) => {
          if (!SC._state.selected.has(c.target_slug)) return;
          if (!positions[slug] || !positions[c.target_slug]) return;
          // Avoid duplicate (a→b and b→a) by ordering slug pair.
          if (slug > c.target_slug) return;
          edges += edgeSVG(positions[slug], positions[c.target_slug], c.connection);
        });
      } catch (err) {
        console.error('[SystemConfigurator:chain] edge render failed for', slug, err);
      }
    });

    host.innerHTML = `
      <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" class="chain-svg" role="img" aria-label="Signal chain">
        <defs>
          <pattern id="chainGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0 L0 0 L0 40" fill="none" stroke="rgba(184,134,11,0.06)" stroke-width="0.5"/>
          </pattern>
        </defs>
        <rect width="${W}" height="${H}" fill="url(#chainGrid)"/>
        ${laneHeaders}
        ${edges}
        ${nodes}
      </svg>`;
  }

  function nodeSVG(p, cx, cy, accessory) {
    const sel = SC._state.selected.has(p.slug);
    const cls = ['chain-node', sel ? 'is-on' : 'is-off', accessory ? 'is-accessory' : ''].filter(Boolean).join(' ');
    const name = (p.data.name || p.name || '').replace(/—.*$/, '').trim();
    const w = accessory ? 110 : 140, h = accessory ? 38 : 64;
    return `
      <g class="${cls}" transform="translate(${cx - w / 2} ${cy - h / 2})">
        <rect class="node-bg" width="${w}" height="${h}" rx="3" ry="3"/>
        <rect class="node-frame" x="3" y="3" width="${w - 6}" height="${h - 6}" rx="2" ry="2"/>
        <circle class="node-pin pin-l" cx="0" cy="${h / 2}" r="3"/>
        <circle class="node-pin pin-r" cx="${w}" cy="${h / 2}" r="3"/>
        <text class="node-name" x="${w / 2}" y="${h / 2 + 4}" text-anchor="middle">${esc(name)}</text>
      </g>`;
  }

  function edgeSVG(a, b, conn) {
    const wireless = WIRELESS.has(conn);
    const cls = 'system-connection ' + (wireless ? 'is-wireless' : 'is-wired');
    // Cubic bezier so lines flow even when end points share an axis
    const dx = (b.x - a.x) * 0.5;
    const path = `M${a.x},${a.y} C${a.x + dx},${a.y} ${b.x - dx},${b.y} ${b.x},${b.y}`;
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2 - 8;
    return `
      <g class="${cls}">
        <path d="${path}" />
        <rect class="conn-tag-bg" x="${mx - 22}" y="${my - 10}" width="44" height="18" rx="2"/>
        <text class="conn-tag" x="${mx}" y="${my + 3}" text-anchor="middle">${esc(conn)}</text>
      </g>`;
  }

  // ─── Exports ────────────────────────────────────────
  SC.chain = { renderChain, nodeSVG, edgeSVG };
  // ERROR-HOOK (APPLIED during polish): per-node + per-edge generation is
  //   wrapped in try/catch inside renderChain() so one malformed product
  //   can't blank the whole SVG. Log prefix: '[SystemConfigurator:chain]'.
})(window.AGF.SystemConfig = window.AGF.SystemConfig || {});
