/* ==========================================================================
   AGF · components/driver-diagram.js
   Driver-arrangement diagram. Circles sized to driver size_mm, stacked by
   role (tweeter top, full-range/coaxial middle, woofer bottom).
   Materials map to brand-aligned hues.
   window.DriverDiagram.render(container, productData)
   ========================================================================== */
(function () {
  'use strict';

  const SVG_NS = 'http://www.w3.org/2000/svg';

  // Tweeter highest, then mids, then woofers — diagram reads top→bottom.
  const TYPE_ORDER = {
    tweeter: 0,
    'balanced-armature': 1,
    electrostatic: 1,
    planar: 2,
    'full-range': 3,
    dynamic: 3,
    coaxial: 3,
    woofer: 4,
  };

  function materialColor(material) {
    const m = (material || '').toLowerCase();
    if (m.includes('beryllium')) return { fill: '#E8C56A', stroke: '#B8860B', glyph: '#7a5a0b' };
    if (m.includes('aluminum') || m.includes('alloy')) return { fill: '#cfd1cc', stroke: '#8a8c87', glyph: '#3a3c37' };
    if (m.includes('paper') || m.includes('composite') || m.includes('cone')) return { fill: '#A89880', stroke: '#6e6048', glyph: '#3a3024' };
    if (m.includes('lf')) return { fill: '#6f8478', stroke: '#3a4a3e', glyph: '#1a2a1e' };
    if (m.includes('custom')) return { fill: '#b8a070', stroke: '#776035', glyph: '#3a2e15' };
    return { fill: '#9da89a', stroke: '#4a5a52', glyph: '#1a2a22' };
  }

  function el(tag, attrs) {
    const node = document.createElementNS(SVG_NS, tag);
    if (attrs) for (const k in attrs) node.setAttribute(k, attrs[k]);
    return node;
  }

  function render(container, productData) {
    if (!container || !productData) return;
    const config = productData._viz_config || {};
    if (config.show_driver_diagram === false) return;
    const drivers = productData.audio && productData.audio.drivers;
    if (!Array.isArray(drivers) || drivers.length === 0) return;

    const wrap = document.createElement('div');
    wrap.className = 'driver-wrap';
    const cap = document.createElement('div');
    cap.className = 'driver-caption';
    cap.innerHTML = `
      <span class="driver-caption-mark">DR · 02</span>
      <span class="driver-caption-title">Driver Arrangement</span>
      <span class="driver-caption-sub">${drivers.reduce((s, d) => s + (d.quantity || 1), 0)} transducers</span>
    `;
    wrap.appendChild(cap);

    // Sort drivers by role
    const sorted = drivers.slice().sort((a, b) =>
      (TYPE_ORDER[a.type] !== undefined ? TYPE_ORDER[a.type] : 99) -
      (TYPE_ORDER[b.type] !== undefined ? TYPE_ORDER[b.type] : 99)
    );

    const VB_W = 460, VB_H = 60 + sorted.length * 90;
    const svg = el('svg', {
      viewBox: `0 0 ${VB_W} ${VB_H}`,
      preserveAspectRatio: 'xMidYMid meet',
      class: 'driver-diagram',
      role: 'img',
      'aria-label': 'Driver arrangement diagram',
    });

    // Optional enclosure outline
    const enclosure = productData.audio && productData.audio.enclosure;
    if (enclosure && enclosure.type) {
      svg.appendChild(el('rect', {
        x: 8, y: 8, width: 168, height: VB_H - 16, rx: 8, ry: 8,
        fill: 'none', stroke: '#2a4a3a', 'stroke-width': '1', 'stroke-dasharray': '4 5',
      }));
      const eLbl = el('text', {
        x: 16, y: 24, 'font-size': '9', fill: '#6b7d6b',
        'font-family': 'Commissioner, sans-serif', 'letter-spacing': '0.18em',
      });
      eLbl.textContent = ('ENCLOSURE · ' + enclosure.type).toUpperCase();
      svg.appendChild(eLbl);
      if (enclosure.tuning_hz) {
        const tLbl = el('text', {
          x: 168, y: VB_H - 14, 'text-anchor': 'end',
          'font-size': '9', fill: '#888',
          'font-family': 'Commissioner, sans-serif', 'letter-spacing': '0.1em',
        });
        tLbl.textContent = `Tuned ${enclosure.tuning_hz}Hz`;
        svg.appendChild(tLbl);
      }
    }

    // Layout each driver row inside the enclosure column (x: 8..176)
    const colCenterX = 92;
    sorted.forEach((dr, idx) => {
      const rowY = 50 + idx * 90 + 30;
      // Size scaling: 8mm → r=10, 220mm → r=38. Default if no size.
      let radius;
      if (dr.size_mm) {
        const t = Math.max(0, Math.min(1, (dr.size_mm - 8) / (220 - 8)));
        radius = 10 + t * 28;
      } else {
        radius = 16;
      }
      const colors = materialColor(dr.material);
      const qty = dr.quantity || 1;

      // Up to 3 drivers shown; if more, show 3 and "×N" badge
      const shown = Math.min(qty, 3);
      const totalW = shown * (radius * 2) + (shown - 1) * 8;
      const startX = colCenterX - totalW / 2 + radius;

      for (let i = 0; i < shown; i++) {
        const cx = startX + i * (radius * 2 + 8);
        // Outer cone ring
        svg.appendChild(el('circle', {
          cx, cy: rowY, r: radius,
          fill: colors.fill, stroke: colors.stroke, 'stroke-width': '1.4',
        }));
        // Surround
        svg.appendChild(el('circle', {
          cx, cy: rowY, r: radius * 0.78,
          fill: 'none', stroke: colors.stroke, 'stroke-width': '0.8', opacity: '0.6',
        }));
        // Voice coil / dust cap
        svg.appendChild(el('circle', {
          cx, cy: rowY, r: radius * 0.32,
          fill: colors.glyph, stroke: colors.stroke, 'stroke-width': '0.6',
        }));
        // Center pin highlight
        svg.appendChild(el('circle', {
          cx: cx - radius * 0.1, cy: rowY - radius * 0.1, r: radius * 0.07,
          fill: '#fff', opacity: '0.45',
        }));
      }

      // Qty overflow badge
      if (qty > shown) {
        const bx = colCenterX + totalW / 2 - radius + 2;
        const t = el('text', {
          x: bx + 18, y: rowY - radius + 4,
          'font-size': '10', fill: '#B8860B',
          'font-family': 'Commissioner, sans-serif', 'font-weight': '600',
        });
        t.textContent = '×' + qty;
        svg.appendChild(t);
      }

      // Right-side label rail
      const railX = 200;
      // Connector line
      svg.appendChild(el('line', {
        x1: 184, y1: rowY, x2: railX - 6, y2: rowY,
        stroke: '#2a4a3a', 'stroke-width': '0.6', opacity: '0.5',
      }));
      // Type/qty
      const t1 = el('text', {
        x: railX, y: rowY - 6,
        'font-size': '12', fill: '#B8860B',
        'font-family': 'Commissioner, sans-serif', 'font-weight': '600',
        'letter-spacing': '0.04em',
      });
      t1.textContent = `${qty}× ${dr.type || 'driver'}${dr.size_mm ? ' · ' + dr.size_mm + 'mm' : ''}`;
      svg.appendChild(t1);
      // Material
      const t2 = el('text', {
        x: railX, y: rowY + 9,
        'font-size': '10', fill: '#9aa899',
        'font-family': 'Commissioner, sans-serif',
        'letter-spacing': '0.06em',
      });
      t2.textContent = (dr.material || '').trim() || '—';
      svg.appendChild(t2);
    });

    wrap.appendChild(svg);
    container.appendChild(wrap);
  }

  window.DriverDiagram = { render };
})();
