/* ==========================================================================
   AGF · components/tech-flow.js
   Horizontal signal-flow chain of agf_technologies, ordered by tech_flow_order.
   Rounded boxes with arrow connectors — moss/gold instrument styling.
   window.TechFlow.render(container, productData)
   ========================================================================== */
(function () {
  'use strict';

  const SVG_NS = 'http://www.w3.org/2000/svg';

  function el(tag, attrs) {
    const node = document.createElementNS(SVG_NS, tag);
    if (attrs) for (const k in attrs) node.setAttribute(k, attrs[k]);
    return node;
  }

  function render(container, productData) {
    if (!container || !productData) return;
    const config = productData._viz_config || {};
    if (config.show_tech_flow === false) return;
    const techs = productData.agf_technologies;
    if (!Array.isArray(techs) || techs.length === 0) return;

    const order = Array.isArray(config.tech_flow_order) && config.tech_flow_order.length
      ? config.tech_flow_order
      : ['stereOS', "l'Art", "BT'N-Tech", "l'espacI/O", 'FRC41', 'No-Nails'];

    // Filter order to techs present in the product
    const set = new Set(techs);
    const chain = order.filter((t) => set.has(t));
    // Append any tech the product has but isn't in order (fallback)
    techs.forEach((t) => { if (!chain.includes(t)) chain.push(t); });
    if (!chain.length) return;

    const wrap = document.createElement('div');
    wrap.className = 'tech-flow-wrap';
    const cap = document.createElement('div');
    cap.className = 'tech-flow-caption';
    cap.innerHTML = `
      <span class="tech-flow-caption-mark">TF · 03</span>
      <span class="tech-flow-caption-title">Signal Flow</span>
      <span class="tech-flow-caption-sub">${chain.length} stage${chain.length === 1 ? '' : 's'}</span>
    `;
    wrap.appendChild(cap);

    const VB_W = 900, VB_H = 120;
    const svg = el('svg', {
      viewBox: `0 0 ${VB_W} ${VB_H}`,
      preserveAspectRatio: 'xMidYMid meet',
      class: 'tech-flow-diagram',
      role: 'img',
      'aria-label': 'Technology signal flow',
    });

    // Defs: arrowhead marker
    const defs = el('defs');
    const marker = el('marker', {
      id: 'tf-arrow', viewBox: '0 0 10 10',
      refX: '8', refY: '5', markerWidth: '6', markerHeight: '6',
      orient: 'auto-start-reverse',
    });
    marker.appendChild(el('path', {
      d: 'M 0 0 L 10 5 L 0 10 Z',
      fill: '#B8860B',
    }));
    defs.appendChild(marker);
    svg.appendChild(defs);

    // INPUT → [boxes] → OUTPUT
    const labels = ['IN', ...chain, 'OUT'];
    const boxH = 44;
    const sideMargin = 16;
    const usableW = VB_W - sideMargin * 2;
    const slotW = usableW / labels.length;

    // Horizontal rail
    svg.appendChild(el('line', {
      x1: sideMargin + 4, y1: VB_H / 2, x2: VB_W - sideMargin - 4, y2: VB_H / 2,
      stroke: '#2a4a3a', 'stroke-width': '1', 'stroke-dasharray': '2 4', opacity: '0.5',
    }));

    labels.forEach((label, i) => {
      const cx = sideMargin + slotW * i + slotW / 2;
      const cy = VB_H / 2;
      const isTerm = i === 0 || i === labels.length - 1;
      const w = Math.min(slotW - 14, isTerm ? 64 : 130);

      // Box
      svg.appendChild(el('rect', {
        x: cx - w / 2, y: cy - boxH / 2,
        width: w, height: boxH, rx: 6, ry: 6,
        fill: isTerm ? '#0f2a1f' : '#1a3a2a',
        stroke: isTerm ? '#3a5a4a' : '#B8860B',
        'stroke-width': isTerm ? '0.8' : '1.2',
      }));

      // Index pip (top-left small mark)
      if (!isTerm) {
        svg.appendChild(el('circle', {
          cx: cx - w / 2 + 7, cy: cy - boxH / 2 + 7, r: 1.6,
          fill: '#B8860B',
        }));
      }

      // Label
      const t = el('text', {
        x: cx, y: cy + 4,
        'text-anchor': 'middle',
        'font-size': isTerm ? '11' : '13',
        fill: isTerm ? '#6b7d6b' : '#f4ecd8',
        'font-family': 'Commissioner, sans-serif',
        'font-weight': isTerm ? '500' : '600',
        'letter-spacing': isTerm ? '0.18em' : '0.04em',
      });
      t.textContent = label;
      svg.appendChild(t);

      // Stage number (subtle, below boxes)
      if (!isTerm) {
        const sn = el('text', {
          x: cx, y: cy + boxH / 2 + 14,
          'text-anchor': 'middle',
          'font-size': '8.5', fill: '#6b7d6b',
          'font-family': 'Commissioner, sans-serif',
          'letter-spacing': '0.22em',
        });
        sn.textContent = 'STAGE ' + String(i).padStart(2, '0');
        svg.appendChild(sn);
      }
    });

    // Connector arrows between boxes
    for (let i = 0; i < labels.length - 1; i++) {
      const cxA = sideMargin + slotW * i + slotW / 2;
      const cxB = sideMargin + slotW * (i + 1) + slotW / 2;
      const wA = Math.min(slotW - 14, (i === 0) ? 64 : 130);
      const wB = Math.min(slotW - 14, (i === labels.length - 2) ? 64 : 130);
      const x1 = cxA + wA / 2;
      const x2 = cxB - wB / 2;
      svg.appendChild(el('line', {
        x1, y1: VB_H / 2, x2: x2 - 2, y2: VB_H / 2,
        stroke: '#B8860B', 'stroke-width': '1.4',
        'marker-end': 'url(#tf-arrow)',
      }));
    }

    wrap.appendChild(svg);
    container.appendChild(wrap);
  }

  window.TechFlow = { render };
})();
