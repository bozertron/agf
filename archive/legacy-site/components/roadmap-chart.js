/* ==========================================================================
   AGF · roadmap-chart.js
   Self-contained CSS-Grid Gantt / table renderer. ALL config from
   data._viz_config. window.RoadmapChart.render(container, data).
   ========================================================================== */
(function (global) {
  'use strict';

  const esc = (v) => v == null ? '' : String(v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  const stripMd = (s) => String(s || '').replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1');

  const slotLabel = (i, unit) => {
    if (unit === 'quarters') return 'Q' + i;
    if (unit === 'weeks') return 'W' + i;
    return 'M' + i;
  };

  function tableFallback(data) {
    const rows = (data.phases || []).map((p) => `
      <tr>
        <td>${esc(p.product || p.title || '')}</td>
        <td>${esc(p.ttm || '')}</td>
        <td>${esc(p.start_slot ?? '—')}</td>
        <td>${esc(p.duration_slots ?? '—')}</td>
        <td>${esc((p.products || []).join(', '))}</td>
      </tr>`).join('');
    return `
      <div class="roadmap-chart roadmap-table">
        <table class="roadmap-data-table">
          <thead><tr><th>Phase</th><th>TTM</th><th>Start</th><th>Duration</th><th>Products</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  }

  function gantt(data, cfg) {
    const total = Math.max(1, +cfg.total_slots || 24);
    const phases = Array.isArray(data.phases) ? data.phases : [];
    const milestoneTypes = Array.isArray(cfg.milestone_types) ? cfg.milestone_types : [];
    const colorFor = (key) => {
      const m = milestoneTypes.find((t) => t.key === key);
      return m ? m.color : '#bbb';
    };

    const headerCells = ['<div class="roadmap-header-label"></div>']
      .concat(Array.from({ length: total }, (_, i) => `<div class="roadmap-header-label">${esc(slotLabel(i + 1, cfg.time_unit))}</div>`))
      .join('');

    const rows = phases.map((p, idx) => {
      const start = Math.max(1, Math.min(total, +p.start_slot || 1));
      const dur = Math.max(1, Math.min(total - start + 1, +p.duration_slots || 1));
      const colStart = start + 1;
      const grad = `linear-gradient(90deg, ${esc(cfg.bar_gradient_start)}, ${esc(cfg.bar_gradient_end)})`;
      const milestones = (p.milestones || [])
        .filter((m) => m && typeof m === 'object' && typeof m.slot === 'number')
        .map((m) => {
          const rel = (m.slot - start) / Math.max(1, dur);
          const left = Math.max(0, Math.min(1, rel)) * 100;
          return `<span class="milestone" style="position:absolute;left:calc(${left}% - var(--space-xs));background:${esc(colorFor(m.type))}" data-mtype="${esc(m.type || '')}" data-mlabel="${esc(m.label || '')}" title="${esc(m.label || m.type || '')}"></span>`;
        }).join('');
      return `
        <div class="roadmap-swimlane">
          <div class="swimlane-label">${esc(p.product || p.title || ('Phase ' + (idx + 1)))}</div>
          <div class="roadmap__bar"
               data-phase-idx="${idx}"
               style="grid-column: ${colStart} / span ${dur}; background: ${grad};">
            <span class="bar-label">${esc(p.title || p.product || '')}</span>
            ${milestones}
          </div>
        </div>`;
    }).join('');

    const todayMarker = cfg.show_today_marker
      ? `<div class="today-marker" data-today-marker style="grid-column: 2 / span 1; grid-row: 1 / -1;"></div>`
      : '';

    const legend = milestoneTypes.length
      ? `<div class="roadmap-legend">
          ${milestoneTypes.map((m) => `<span class="legend-item"><span class="legend-dot" style="background:${esc(m.color)}"></span>${esc(m.label)}</span>`).join('')}
        </div>`
      : '';

    return `
      <div class="roadmap-chart" role="img" aria-label="Launch roadmap Gantt chart">
        ${legend}
        <div class="roadmap-grid"
             style="grid-template-columns: ${esc(cfg.label_column_width)} repeat(${total}, minmax(var(--space-xl), 1fr));">
          ${headerCells}
          ${rows}
          ${todayMarker}
        </div>
        <div class="roadmap-tooltip-host"></div>
      </div>`;
  }

  function bindInteractions(container, data, cfg) {
    if (!cfg.enable_hover) return;
    const host = container.querySelector('.roadmap-tooltip-host');
    if (!host) return;
    const phases = data.phases || [];

    const tip = (html, x, y) => {
      host.innerHTML = `<div class="roadmap-tooltip" style="left:${x + 16}px; top:${y + 16}px;">${html}</div>`;
    };
    const clear = () => { host.innerHTML = ''; };

    container.querySelectorAll('.roadmap__bar').forEach((bar) => {
      bar.addEventListener('mousemove', (e) => {
        const p = phases[+bar.dataset.phaseIdx]; if (!p) return;
        const html = `
          <strong>${esc(p.title || p.product || '')}</strong>
          <div>${esc(p.ttm || '')}</div>
          <div style="margin-top:var(--space-2xs)">${esc(stripMd(p.rationale || ''))}</div>`;
        tip(html, e.clientX, e.clientY);
      });
      bar.addEventListener('mouseleave', clear);
    });

    container.querySelectorAll('.milestone').forEach((m) => {
      m.addEventListener('mousemove', (e) => {
        e.stopPropagation();
        const html = `<strong>${esc(m.dataset.mlabel || m.dataset.mtype)}</strong><div>${esc(m.dataset.mtype)}</div>`;
        tip(html, e.clientX, e.clientY);
      });
      m.addEventListener('mouseleave', clear);
    });
  }

  function positionTodayMarker(container, cfg) {
    if (!cfg.show_today_marker) return;
    // Place today marker at slot 3 by default (relative position into the timeline).
    const grid = container.querySelector('.roadmap-grid');
    const marker = container.querySelector('[data-today-marker]');
    if (!grid || !marker) return;
    const total = Math.max(1, +cfg.total_slots || 24);
    const todaySlot = Math.min(total, Math.max(1, Math.round(total * 0.15)));
    marker.style.gridColumn = `${todaySlot + 1} / span 1`;
  }

  function render(container, data) {
    if (!container) return;
    const d = data || {};
    const cfg = d._viz_config;
    if (!cfg || cfg.chart_type === 'table') { container.innerHTML = tableFallback(d); return; }
    container.innerHTML = gantt(d, cfg);
    positionTodayMarker(container, cfg);
    bindInteractions(container, d, cfg);
  }

  global.RoadmapChart = { render };
})(window);
