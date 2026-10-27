/* ==========================================================================
   AGF · system-configurator.js
   "Build Your System" — interactive product combination tool.
   Reads window.SystemConfigurator usage; relationships are 100% schema-driven
   from each product's data.system_config (companions, connection_types, role).
   ========================================================================== */
(function (global) {
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

  // ---------- main API ----------------------------------------------------
  let _state = null;

  function init(container, products) {
    const list = (products || []).filter((p) => p && p.data && p.data.system_config);
    if (!list.length) return;
    close();
    _state = {
      container: container || document.body,
      products: list,
      bySlug: Object.fromEntries(list.map((p) => [p.slug, p])),
      selected: new Set(),
      onKey: null,
    };
    mount();
  }

  function close() {
    if (!_state) return;
    if (_state.onKey) document.removeEventListener('keydown', _state.onKey);
    const root = document.getElementById('agf-configurator');
    if (root) root.remove();
    document.body.classList.remove('configurator-open');
    _state = null;
  }

  function mount() {
    document.body.classList.add('configurator-open');
    const root = document.createElement('div');
    root.id = 'agf-configurator';
    root.className = 'configurator-overlay';
    root.innerHTML = shellHTML();
    _state.container.appendChild(root);
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
    _state.onKey = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', _state.onKey);
    // Click-outside on the dim grain layer also closes
    root.querySelector('.configurator-grain').addEventListener('click', close);
    root.querySelector('.configurator-sidebar').addEventListener('click', (e) => {
      const card = e.target.closest('[data-card-slug]');
      if (!card) return;
      toggle(card.getAttribute('data-card-slug'));
    });
  }

  function toggle(slug) {
    if (_state.selected.has(slug)) _state.selected.delete(slug);
    else _state.selected.add(slug);
    render();
  }

  // ---------- render ------------------------------------------------------
  function render() {
    const root = document.getElementById('agf-configurator');
    if (!root) return;
    const companionHints = computeCompanionHints();
    renderCards(root.querySelector('[data-side="cards"]'), companionHints);
    renderChain(root.querySelector('[data-side="chain"]'));
    renderSynergy(root.querySelector('[data-side="synergy"] .synergy-pills'));
    renderPrice(root.querySelector('[data-side="price"]'));
  }

  // Union of companion slugs of currently-selected products that aren't selected yet.
  function computeCompanionHints() {
    const hints = new Set();
    _state.selected.forEach((slug) => {
      const p = _state.bySlug[slug];
      const cs = (configOf(p).companions) || [];
      cs.forEach((c) => { if (!_state.selected.has(c) && _state.bySlug[c]) hints.add(c); });
    });
    return hints;
  }

  function renderCards(host, hints) {
    if (!host) return;
    const html = _state.products.map((p) => {
      const sel = _state.selected.has(p.slug);
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

  // SVG signal-chain visualization. Lanes laid out left→right by role; nodes
  // stacked vertically per lane. Connections drawn between selected pairs.
  function renderChain(host) {
    if (!host) return;
    const { lanes, accessory } = laneLayout(_state.products);
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
        const cy = padY + 40 + (H - padY * 2 - 40) * (stack === 1 ? 0.4 : (j / (stack - 1)));
        positions[p.slug] = { x: cx, y: cy };
        nodes += nodeSVG(p, cx, cy);
      });
    });
    // Accessory row beneath the chain
    if (accessory.items.length) {
      const cy = H - 36;
      const step = (W - padX * 2) / Math.max(accessory.items.length, 1);
      accessory.items.forEach((p, i) => {
        const cx = padX + step * i + step / 2;
        positions[p.slug] = { x: cx, y: cy };
        nodes += nodeSVG(p, cx, cy, true);
      });
      laneHeaders += `<text class="lane-label" x="${padX}" y="${cy - 36}" text-anchor="start">Accessories</text>`;
    }

    // Edges — only between currently-selected products
    let edges = '';
    _state.selected.forEach((slug) => {
      const p = _state.bySlug[slug];
      const ct = (configOf(p).connection_types) || [];
      ct.forEach((c) => {
        if (!_state.selected.has(c.target_slug)) return;
        if (!positions[slug] || !positions[c.target_slug]) return;
        // Avoid duplicate (a→b and b→a) by ordering slug pair.
        if (slug > c.target_slug) return;
        edges += edgeSVG(positions[slug], positions[c.target_slug], c.connection);
      });
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
    const sel = _state.selected.has(p.slug);
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

  function renderSynergy(host) {
    if (!host) return;
    const techs = new Set();
    _state.selected.forEach((slug) => {
      const p = _state.bySlug[slug];
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
    _state.selected.forEach((slug) => { total += priceOf(_state.bySlug[slug]); });
    host.querySelector('.price-value').textContent = fmtUSD(total);
    const n = _state.selected.size;
    host.querySelector('.price-meta').textContent = `${n} product${n === 1 ? '' : 's'} selected`;
  }

  // Public API
  global.SystemConfigurator = { init, close };
})(window);
