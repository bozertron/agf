/* ==========================================================================
   AGF · components/power-gauge.js
   Power gauge — arc (default), bar, or native meter style.
   Shows battery_life_hours when available, else wall_power_watts.
   window.PowerGauge.render(container, productData)
   ========================================================================== */
(function () {
  'use strict';

  const SVG_NS = 'http://www.w3.org/2000/svg';

  function el(tag, attrs) {
    const node = document.createElementNS(SVG_NS, tag);
    if (attrs) for (const k in attrs) node.setAttribute(k, attrs[k]);
    return node;
  }

  // Build an SVG arc path (semicircle) from start angle → end angle (radians)
  function arcPath(cx, cy, r, startA, endA) {
    const sx = cx + r * Math.cos(startA);
    const sy = cy + r * Math.sin(startA);
    const ex = cx + r * Math.cos(endA);
    const ey = cy + r * Math.sin(endA);
    const large = (endA - startA) > Math.PI ? 1 : 0;
    return `M ${sx} ${sy} A ${r} ${r} 0 ${large} 1 ${ex} ${ey}`;
  }

  function pickMetric(power) {
    if (!power) return null;
    if (typeof power.battery_life_hours === 'number') {
      return { kind: 'battery', value: power.battery_life_hours, unit: 'hr', max: 60, label: 'Battery life' };
    }
    if (typeof power.wall_power_watts === 'number') {
      const max = power.wall_power_watts > 200 ? 2400 : 300;
      return { kind: 'mains', value: power.wall_power_watts, unit: 'W', max, label: 'Wall power' };
    }
    if (typeof power.standby_watts === 'number') {
      return { kind: 'standby', value: power.standby_watts, unit: 'W', max: 5, label: 'Standby' };
    }
    return null;
  }

  function renderArc(metric) {
    const value = Math.max(0, Math.min(metric.value, metric.max));
    const pct = value / metric.max;

    const cont = document.createElement('div');
    cont.className = 'power-gauge-container power-gauge-arc';

    const svg = el('svg', {
      viewBox: '0 0 220 140',
      class: 'power-gauge-svg',
      role: 'img',
      'aria-label': `${metric.label}: ${metric.value}${metric.unit}`,
    });

    const cx = 110, cy = 116, r = 84;
    const start = Math.PI; // 180°
    const end = 2 * Math.PI; // 360° (top semicircle)

    // Tick marks (every ~30 degrees)
    for (let i = 0; i <= 8; i++) {
      const a = start + (end - start) * (i / 8);
      const x1 = cx + (r + 4) * Math.cos(a);
      const y1 = cy + (r + 4) * Math.sin(a);
      const x2 = cx + (r + (i % 2 === 0 ? 11 : 6)) * Math.cos(a);
      const y2 = cy + (r + (i % 2 === 0 ? 11 : 6)) * Math.sin(a);
      svg.appendChild(el('line', {
        x1, y1, x2, y2,
        stroke: '#3a5a4a', 'stroke-width': i % 2 === 0 ? '1.2' : '0.6',
      }));
    }

    // Background arc
    svg.appendChild(el('path', {
      d: arcPath(cx, cy, r, start, end),
      class: 'gauge-arc-bg',
    }));

    // Active arc — animate via stroke-dashoffset
    const totalLen = Math.PI * r;
    const activeEnd = start + (end - start) * pct;
    const active = el('path', {
      d: arcPath(cx, cy, r, start, end),
      class: 'gauge-arc-active',
      'stroke-dasharray': `${totalLen}`,
      'stroke-dashoffset': `${totalLen}`,
    });
    svg.appendChild(active);

    // Needle pivot
    svg.appendChild(el('circle', {
      cx, cy, r: 5, fill: '#0f2a1f', stroke: '#B8860B', 'stroke-width': '1.2',
    }));

    // Big value
    const v = el('text', {
      x: cx, y: cy - 20, 'text-anchor': 'middle',
      'font-family': 'Commissioner, sans-serif',
      'font-size': '32', 'font-weight': '700',
      fill: '#B8860B', 'letter-spacing': '-0.02em',
    });
    v.textContent = String(metric.value);
    svg.appendChild(v);

    // Unit
    const u = el('text', {
      x: cx, y: cy - 4, 'text-anchor': 'middle',
      'font-family': 'Commissioner, sans-serif',
      'font-size': '10', fill: '#9aa899', 'letter-spacing': '0.32em',
    });
    u.textContent = metric.unit.toUpperCase();
    svg.appendChild(u);

    cont.appendChild(svg);

    const lbl = document.createElement('div');
    lbl.className = 'power-gauge-label';
    lbl.innerHTML = `<span class="pg-mark">PW · 05</span> <span>${metric.label}</span>`;
    cont.appendChild(lbl);

    // Trigger animation on first paint
    requestAnimationFrame(() => {
      active.setAttribute('stroke-dashoffset', String(totalLen - totalLen * pct));
    });

    return cont;
  }

  function renderBar(metric) {
    const value = Math.max(0, Math.min(metric.value, metric.max));
    const pct = (value / metric.max) * 100;

    const cont = document.createElement('div');
    cont.className = 'power-gauge-container power-gauge-bar';
    cont.innerHTML = `
      <div class="pg-bar-head">
        <span class="pg-mark">PW · 05</span>
        <span class="pg-bar-label">${metric.label}</span>
        <span class="pg-bar-value">${metric.value}<em>${metric.unit}</em></span>
      </div>
      <div class="pg-bar-track" role="progressbar" aria-valuenow="${value}" aria-valuemax="${metric.max}">
        <div class="pg-bar-fill" style="width:0%"></div>
        <div class="pg-bar-ticks" aria-hidden="true">
          <span></span><span></span><span></span><span></span><span></span>
        </div>
      </div>
      <div class="pg-bar-foot">
        <span>0</span><span>${metric.max}${metric.unit}</span>
      </div>
    `;
    requestAnimationFrame(() => {
      const fill = cont.querySelector('.pg-bar-fill');
      if (fill) fill.style.width = pct + '%';
    });
    return cont;
  }

  function renderMeter(metric) {
    const cont = document.createElement('div');
    cont.className = 'power-gauge-container power-gauge-meter';
    const safeVal = Math.max(0, Math.min(metric.value, metric.max));
    cont.innerHTML = `
      <div class="pg-meter-head">
        <span class="pg-mark">PW · 05</span>
        <span class="pg-meter-label">${metric.label}</span>
      </div>
      <meter min="0" max="${metric.max}" low="${metric.max * 0.25}" high="${metric.max * 0.75}" optimum="${metric.max * 0.85}" value="${safeVal}"></meter>
      <div class="pg-meter-foot">
        <span class="pg-meter-value">${metric.value}<em>${metric.unit}</em></span>
        <span class="pg-meter-max">/ ${metric.max}${metric.unit}</span>
      </div>
    `;
    return cont;
  }

  function render(container, productData) {
    if (!container || !productData) return;
    const config = productData._viz_config || {};
    if (config.show_power_gauge === false) return;
    const metric = pickMetric(productData.power);
    if (!metric) return;

    const style = config.gauge_style || 'arc';
    let node;
    if (style === 'bar') node = renderBar(metric);
    else if (style === 'meter') node = renderMeter(metric);
    else node = renderArc(metric);

    container.appendChild(node);
  }

  window.PowerGauge = { render };
})();
