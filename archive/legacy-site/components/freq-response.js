/* ==========================================================================
   AGF · components/freq-response.js
   Frequency-response curve · log X (20Hz–20kHz), linear Y (±dB).
   Aesthetic: instrument-panel — moss grid, brass curve, dashed 0dB datum.
   window.FreqResponse.render(container, productData)
   ========================================================================== */
(function () {
  'use strict';

  const SVG_NS = 'http://www.w3.org/2000/svg';

  // Unique ID counter to prevent SVG ID collisions across multiple cards (site-005 fix)
  let _instanceId = 0;

  function el(tag, attrs) {
    const node = document.createElementNS(SVG_NS, tag);
    if (attrs) {
      for (const k in attrs) node.setAttribute(k, attrs[k]);
    }
    return node;
  }

  function render(container, productData) {
    if (!container || !productData) return;
    const config = productData._viz_config || {};
    if (config.show_freq_response === false) return;
    const audio = productData.audio;
    if (!audio || !audio.frequency_response) return;

    const color = config.freq_response_color || '#B8860B';
    const dbRange = config.freq_response_db_range || 12;
    const fr = audio.frequency_response;

    // Unique gradient ID per instance (site-005 fix)
    const gradId = 'frGrad-' + (++_instanceId);

    // Wrapper with caption rail
    const wrap = document.createElement('div');
    wrap.className = 'freq-wrap';

    const cap = document.createElement('div');
    cap.className = 'freq-caption';
    cap.innerHTML = `
      <span class="freq-caption-mark">FR · 01</span>
      <span class="freq-caption-title">Frequency Response</span>
      <span class="freq-caption-sub">${fr.low_hz || 20}Hz – ${(fr.high_hz || 20000) >= 1000 ? ((fr.high_hz || 20000) / 1000) + 'kHz' : (fr.high_hz || 20000) + 'Hz'} · ±${fr.tolerance_db || 3}dB</span>
    `;
    wrap.appendChild(cap);

    const svg = el('svg', {
      viewBox: '0 0 1000 320',
      preserveAspectRatio: 'xMidYMid meet',
      class: 'freq-chart',
      role: 'img',
      'aria-label': 'Frequency response curve',
    });

    // Helpers
    const logScale = (freq) => (Math.log10(freq) - Math.log10(20)) / (Math.log10(20000) - Math.log10(20)) * 1000;
    const dbScale = (db) => 160 - (db / dbRange * 140);

    // Defs: gradient for area fill
    const defs = el('defs');
    const grad = el('linearGradient', { id: gradId, x1: '0', y1: '0', x2: '0', y2: '1' });
    grad.appendChild(el('stop', { offset: '0%', 'stop-color': color, 'stop-opacity': '0.22' }));
    grad.appendChild(el('stop', { offset: '100%', 'stop-color': color, 'stop-opacity': '0' }));
    defs.appendChild(grad);
    svg.appendChild(defs);

    // dB grid lines (horizontal)
    const dbTicks = [-12, -6, -3, 0, 3, 6, 12].filter((d) => Math.abs(d) <= dbRange);
    dbTicks.forEach((db) => {
      const y = dbScale(db);
      svg.appendChild(el('line', {
        x1: 0, y1: y, x2: 1000, y2: y,
        stroke: db === 0 ? '#888' : '#2a4a3a',
        'stroke-width': db === 0 ? '0.6' : '0.4',
        ...(db === 0 ? { 'stroke-dasharray': '6 4' } : {}),
        opacity: db === 0 ? '0.7' : '0.35',
      }));
      // dB label on right rail
      const t = el('text', {
        x: 994, y: y - 3, 'text-anchor': 'end',
        'font-size': '9', fill: '#6b7d6b', 'font-family': 'Commissioner, sans-serif',
        'letter-spacing': '0.08em',
      });
      t.textContent = (db > 0 ? '+' : '') + db + 'dB';
      svg.appendChild(t);
    });

    // Frequency grid lines
    const freqs = [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000];
    freqs.forEach((f) => {
      const x = logScale(f);
      svg.appendChild(el('line', {
        x1: x, y1: 20, x2: x, y2: 280,
        stroke: '#2a4a3a', 'stroke-width': '0.4', opacity: '0.3',
      }));
      const t = el('text', {
        x: x, y: 300, 'text-anchor': 'middle',
        'font-size': '10', fill: '#888',
        'font-family': 'Commissioner, sans-serif',
        'letter-spacing': '0.05em',
      });
      t.textContent = f >= 1000 ? (f / 1000) + 'k' : String(f);
      svg.appendChild(t);
    });

    // Axis label
    const axisLabel = el('text', {
      x: 500, y: 316, 'text-anchor': 'middle',
      'font-size': '8.5', fill: '#6b7d6b',
      'font-family': 'Commissioner, sans-serif',
      'letter-spacing': '0.24em',
    });
    axisLabel.textContent = 'HERTZ';
    svg.appendChild(axisLabel);

    // Curve generation
    const lowX = logScale(Math.max(fr.low_hz || 20, 20));
    const highX = logScale(Math.min(fr.high_hz || 20000, 20000));
    const tolerance = fr.tolerance_db || 3;

    // Tolerance band (passband window)
    svg.appendChild(el('rect', {
      x: lowX, y: dbScale(tolerance),
      width: highX - lowX, height: dbScale(-tolerance) - dbScale(tolerance),
      fill: color, opacity: '0.07', rx: '2',
    }));
    // Tolerance band edges
    svg.appendChild(el('line', {
      x1: lowX, y1: dbScale(tolerance), x2: highX, y2: dbScale(tolerance),
      stroke: color, 'stroke-width': '0.6', 'stroke-dasharray': '2 3', opacity: '0.5',
    }));
    svg.appendChild(el('line', {
      x1: lowX, y1: dbScale(-tolerance), x2: highX, y2: dbScale(-tolerance),
      stroke: color, 'stroke-width': '0.6', 'stroke-dasharray': '2 3', opacity: '0.5',
    }));

    // Curve points: roll-offs at edges + slight passband ripple
    const points = [];
    for (let i = 0; i <= 60; i++) {
      const t = i / 60;
      const x = lowX + t * (highX - lowX);
      let db = 0;
      if (t < 0.08) db = -((0.08 - t) / 0.08) * dbRange * 0.85;
      else if (t > 0.92) db = -((t - 0.92) / 0.08) * dbRange * 0.65;
      else {
        // Subtle musical ripple — character, not noise
        db = Math.sin(t * 9.4) * tolerance * 0.28 + Math.sin(t * 21) * tolerance * 0.12;
      }
      points.push({ x, y: dbScale(db) });
    }

    // Smooth Bezier path
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1], curr = points[i];
      const cpx = (prev.x + curr.x) / 2;
      d += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
    }

    // Filled area under curve (extend down to baseline at 0dB+ band edge)
    const baselineY = dbScale(-dbRange);
    const areaD = d + ` L ${points[points.length - 1].x} ${baselineY} L ${points[0].x} ${baselineY} Z`;
    svg.appendChild(el('path', {
      d: areaD, fill: 'url(#' + gradId + ')', 'stroke': 'none',
    }));

    // Glow under curve
    svg.appendChild(el('path', {
      d, stroke: color, 'stroke-width': '4', fill: 'none',
      opacity: '0.18',
    }));

    // Main curve
    const curve = el('path', {
      d, stroke: color, 'stroke-width': '2.2', fill: 'none',
      'stroke-linecap': 'round', 'stroke-linejoin': 'round',
    });
    curve.classList.add('freq-curve');
    svg.appendChild(curve);

    // Endpoint dots
    svg.appendChild(el('circle', {
      cx: points[0].x, cy: points[0].y, r: 3,
      fill: '#1a3a2a', stroke: color, 'stroke-width': '1.2',
    }));
    svg.appendChild(el('circle', {
      cx: points[points.length - 1].x, cy: points[points.length - 1].y, r: 3,
      fill: '#1a3a2a', stroke: color, 'stroke-width': '1.2',
    }));

    wrap.appendChild(svg);
    container.appendChild(wrap);
  }

  window.FreqResponse = { render };
})();
