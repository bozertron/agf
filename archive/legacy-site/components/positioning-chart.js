/* ==========================================================================
   AGF · positioning-chart.js
   Self-contained perceptual-map / table / bar-chart renderer.
   All styling/layout configuration is read from data._viz_config — nothing
   is hardcoded. window.PositioningChart.render(container, data).
   ========================================================================== */
(function (global) {
  'use strict';

  const esc = (v) => v == null ? '' : String(v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  const fmtUSD = (n) => {
    if (typeof n !== 'number' || !isFinite(n)) return '—';
    if (n >= 1e6) return '$' + (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
    if (n >= 1e3) return '$' + (n / 1e3).toFixed(n % 1e3 === 0 ? 0 : 1) + 'K';
    return '$' + n;
  };

  const isAGF = (c) => /^agf\b/i.test(c.brand || '');

  const stripMd = (s) => String(s || '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1');

  // Map a data value to [0,1] using linear or log scale (clamped).
  function project(value, min, max, scale) {
    if (typeof value !== 'number' || !isFinite(value)) return 0.5;
    if (scale === 'log') {
      const safe = Math.max(value, Math.max(min, 1));
      const lo = Math.log10(Math.max(min, 1));
      const hi = Math.log10(Math.max(max, lo + 1));
      return Math.max(0, Math.min(1, (Math.log10(safe) - lo) / (hi - lo)));
    }
    return Math.max(0, Math.min(1, (value - min) / (max - min)));
  }

  function tableFallback(data) {
    const rows = (data.competitors || []).map((c) => `
      <tr${isAGF(c) ? ' class="is-agf"' : ''}>
        <td>${esc(c.brand || '')}</td>
        <td>${esc(c.category || '')}</td>
        <td>${esc(c.status || '')}</td>
        <td>${typeof c.price_usd_avg === 'number' ? esc(fmtUSD(c.price_usd_avg)) : '—'}</td>
        <td>${typeof c.prestige_score === 'number' ? esc(c.prestige_score) : '—'}</td>
      </tr>`).join('');
    return `
      <div class="positioning-chart positioning-table">
        <table class="positioning-data-table">
          <thead><tr><th>Brand</th><th>Category</th><th>Status</th><th>Price (avg)</th><th>Prestige</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  }

  function barChart(data, cfg) {
    const xField = cfg.x_axis.field;
    const max = (data.competitors || []).reduce((m, c) => Math.max(m, +c[xField] || 0), 0) || 1;
    const rows = (data.competitors || []).map((c) => {
      const v = +c[xField] || 0;
      const pct = (v / max) * 100;
      const fill = isAGF(c) ? cfg.highlight_color : cfg.competitor_color;
      return `
        <div class="pbar-row">
          <span class="pbar-label">${esc(c.brand)}</span>
          <span class="pbar-track"><span class="pbar-fill" style="width:${pct}%;background:${esc(fill)}"></span></span>
          <span class="pbar-value">${esc(fmtUSD(v))}</span>
        </div>`;
    }).join('');
    return `<div class="positioning-chart positioning-bars">${rows}</div>`;
  }

  function perceptualMap(data, cfg) {
    const W = 1000, H = 600;
    const PAD = { top: 40, right: 40, bottom: 70, left: 90 };
    const innerW = W - PAD.left - PAD.right;
    const innerH = H - PAD.top - PAD.bottom;
    const xCfg = cfg.x_axis, yCfg = cfg.y_axis;
    const competitors = Array.isArray(data.competitors) ? data.competitors : [];

    // Axis ticks
    const xTicks = xCfg.scale === 'log'
      ? [1000, 5000, 25000, 100000, 250000].filter((t) => t >= xCfg.min && t <= xCfg.max)
      : Array.from({ length: 5 }, (_, i) => xCfg.min + ((xCfg.max - xCfg.min) * i / 4));
    const yTicks = Array.from({ length: 5 }, (_, i) => yCfg.min + ((yCfg.max - yCfg.min) * i / 4));

    const grid = cfg.show_grid ? [
      ...xTicks.map((t) => {
        const x = PAD.left + project(t, xCfg.min, xCfg.max, xCfg.scale) * innerW;
        return `<line x1="${x}" x2="${x}" y1="${PAD.top}" y2="${PAD.top + innerH}" stroke="rgba(26,58,42,0.08)" stroke-width="1"/>`;
      }),
      ...yTicks.map((t) => {
        const y = PAD.top + innerH - project(t, yCfg.min, yCfg.max, yCfg.scale) * innerH;
        return `<line x1="${PAD.left}" x2="${PAD.left + innerW}" y1="${y}" y2="${y}" stroke="rgba(26,58,42,0.08)" stroke-width="1"/>`;
      }),
    ].join('') : '';

    const axisLabels = cfg.show_labels ? `
      ${xTicks.map((t) => {
        const x = PAD.left + project(t, xCfg.min, xCfg.max, xCfg.scale) * innerW;
        return `<text x="${x}" y="${PAD.top + innerH + 22}" text-anchor="middle" class="pmap-tick">${esc(fmtUSD(t))}</text>`;
      }).join('')}
      ${yTicks.map((t) => {
        const y = PAD.top + innerH - project(t, yCfg.min, yCfg.max, yCfg.scale) * innerH;
        return `<text x="${PAD.left - 12}" y="${y + 4}" text-anchor="end" class="pmap-tick">${esc(t)}</text>`;
      }).join('')}
      <text x="${PAD.left + innerW / 2}" y="${H - 18}" text-anchor="middle" class="pmap-axis">${esc(xCfg.label)} →</text>
      <text x="${24}" y="${PAD.top + innerH / 2}" text-anchor="middle" class="pmap-axis" transform="rotate(-90 24 ${PAD.top + innerH / 2})">${esc(yCfg.label)} →</text>
    ` : '';

    const dots = competitors.map((c, i) => {
      const xv = +c[xCfg.field], yv = +c[yCfg.field];
      if (!isFinite(xv) || !isFinite(yv)) return '';
      const cx = PAD.left + project(xv, xCfg.min, xCfg.max, xCfg.scale) * innerW;
      const cy = PAD.top + innerH - project(yv, yCfg.min, yCfg.max, yCfg.scale) * innerH;
      const fill = isAGF(c) ? cfg.highlight_color : cfg.competitor_color;
      const cls = 'brand-dot' + (cfg.enable_animation ? ' animate' : '') + (isAGF(c) ? ' is-agf' : '');
      const label = cfg.show_labels
        ? `<text x="${cx}" y="${cy - cfg.dot_radius - 8}" text-anchor="middle" class="pmap-brand">${esc(c.brand)}</text>`
        : '';
      return `
        <g class="brand-group" data-idx="${i}">
          <circle class="${cls}" cx="${cx}" cy="${cy}" r="${cfg.dot_radius}"
                  fill="${esc(fill)}" fill-opacity="0.85" stroke="${esc(fill)}" stroke-width="2"/>
          ${label}
        </g>`;
    }).join('');

    return `
      <div class="positioning-chart positioning-map">
        <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Competitive perceptual map">
          <rect x="${PAD.left}" y="${PAD.top}" width="${innerW}" height="${innerH}" fill="rgba(184,134,11,0.02)" stroke="rgba(26,58,42,0.15)" stroke-width="1"/>
          ${grid}
          ${axisLabels}
          ${dots}
        </svg>
        <div class="positioning-detail-host"></div>
      </div>`;
  }

  function bindInteractions(container, data, cfg) {
    const host = container.querySelector('.positioning-detail-host');
    if (!host) return;
    const competitors = data.competitors || [];
    let stuck = null;

    const cardHTML = (c) => `
      <div class="positioning-detail-card" role="dialog">
        <h4>${esc(c.brand)}</h4>
        <p class="detail-cat">${esc(c.category || '')}</p>
        <div class="detail-stats">
          <span>${esc(fmtUSD(+c.price_usd_avg))}</span>
          <span>Prestige ${esc(c.prestige_score ?? '—')}</span>
        </div>
        <p class="detail-pos">${esc(stripMd(c.agf_positioning || c.opening || ''))}</p>
      </div>`;

    const show = (idx, sticky) => {
      const c = competitors[idx]; if (!c) return;
      host.innerHTML = cardHTML(c);
      const card = host.firstElementChild;
      card.dataset.sticky = sticky ? '1' : '0';
      const g = container.querySelector(`.brand-group[data-idx="${idx}"]`);
      if (g) {
        const r = g.getBoundingClientRect();
        const hr = host.getBoundingClientRect();
        card.style.left = (r.left - hr.left + r.width + 14) + 'px';
        card.style.top = (r.top - hr.top - 8) + 'px';
      }
    };
    const hide = () => { if (!stuck) host.innerHTML = ''; };

    container.querySelectorAll('.brand-group').forEach((g) => {
      g.addEventListener('mouseenter', () => { if (stuck == null) show(+g.dataset.idx, false); });
      g.addEventListener('mouseleave', hide);
      g.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = +g.dataset.idx;
        if (stuck === idx) { stuck = null; hide(); }
        else { stuck = idx; show(idx, true); }
      });
    });

    // site-006 fix: store keydown handler and remove on container cleanup
    const onKeydown = (e) => {
      if (e.key === 'Escape' && stuck != null) { stuck = null; host.innerHTML = ''; }
    };
    document.addEventListener('keydown', onKeydown);

    // Provide a cleanup method on the container so the chart can be torn down
    container._posChartCleanup = () => {
      document.removeEventListener('keydown', onKeydown);
    };

    container.addEventListener('click', (e) => {
      if (!e.target.closest('.brand-group') && !e.target.closest('.positioning-detail-card')) {
        stuck = null; host.innerHTML = '';
      }
    });
  }

  function render(container, data) {
    if (!container) return;
    // Clean up previous instance's global listeners (site-006 fix)
    if (container._posChartCleanup) {
      container._posChartCleanup();
      container._posChartCleanup = null;
    }
    const d = data || {};
    const cfg = d._viz_config;
    if (!cfg) { container.innerHTML = tableFallback(d); return; }
    const type = cfg.chart_type || 'perceptual-map';
    if (type === 'table')     { container.innerHTML = tableFallback(d); return; }
    if (type === 'bar-chart') { container.innerHTML = barChart(d, cfg); return; }
    container.innerHTML = perceptualMap(d, cfg);
    bindInteractions(container, d, cfg);
  }

  global.PositioningChart = { render };
})(window);
