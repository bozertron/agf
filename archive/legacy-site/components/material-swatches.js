/* ==========================================================================
   AGF · components/material-swatches.js
   Swatch grid for materials, color_options, and finish — name-to-color
   mapping informs the chip; finish (when present) leads as primary.
   window.MaterialSwatches.render(container, productData)
   ========================================================================== */
(function () {
  'use strict';

  // Map keywords in name → CSS background. Returns gradient + label color.
  function chipFor(name) {
    const n = (name || '').toLowerCase();
    if (n.includes('matte copper') || n.includes('copper plat')) return { bg: 'linear-gradient(135deg,#c46a2a 0%,#7d3a14 60%,#2a1207 100%)', tone: 'warm' };
    if (n.includes('copper')) return { bg: 'linear-gradient(135deg,#d49460 0%,#a05a28 60%,#3a1a08 100%)', tone: 'warm' };
    if (n.includes('obsidian')) return { bg: 'linear-gradient(135deg,#1a1a22 0%,#0a0a10 100%)', tone: 'cool' };
    if (n.includes('beryllium')) return { bg: 'linear-gradient(135deg,#f0e0a8 0%,#b89a4a 60%,#5a4218 100%)', tone: 'warm' };
    if (n.includes('mass-loaded') || n.includes('alloy') || n.includes('aluminum')) return { bg: 'linear-gradient(135deg,#dadcd6 0%,#9a9c97 60%,#3a3c37 100%)', tone: 'cool' };
    if (n.includes('leather')) return { bg: 'linear-gradient(135deg,#7a4a2a 0%,#3a2010 100%)', tone: 'warm' };
    if (n.includes('memory-foam') || n.includes('foam')) return { bg: 'linear-gradient(135deg,#3a3a3a 0%,#1a1a1a 100%)', tone: 'cool' };
    if (n.includes('paper') || n.includes('pre-primed')) return { bg: 'linear-gradient(135deg,#f0e8d4 0%,#cab98a 100%)', tone: 'warm' };
    if (n.includes('transmission-line') || n.includes('cabinet')) return { bg: 'linear-gradient(135deg,#3a2818 0%,#1a0e08 100%)', tone: 'warm' };
    if (n.includes('cone')) return { bg: 'linear-gradient(135deg,#a89880 0%,#5a4830 100%)', tone: 'warm' };
    if (n.includes('semiconductor') || n.includes('silicon')) return { bg: 'linear-gradient(135deg,#5a6a78 0%,#1a242c 100%)', tone: 'cool' };
    if (n.includes('chassis') || n.includes('machined')) return { bg: 'linear-gradient(135deg,#b8b8b8 0%,#4a4a4a 100%)', tone: 'cool' };
    if (n.includes('ui')) return { bg: 'linear-gradient(135deg,#1a3a2a 0%,#0a1a14 100%)', tone: 'cool' };
    if (n.includes('matte')) return { bg: 'linear-gradient(135deg,#3a3a3a 0%,#1a1a1a 100%)', tone: 'cool' };
    // Generic moss/brass fallback
    return { bg: 'linear-gradient(135deg,#2a4a3a 0%,#1a3a2a 100%)', tone: 'cool' };
  }

  function makeSwatch(name, kind) {
    const c = chipFor(name);
    const card = document.createElement('div');
    card.className = 'swatch-card swatch-' + (c.tone);
    if (kind === 'finish') card.classList.add('swatch-primary');
    const safe = String(name == null ? '' : name)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    card.innerHTML = `
      <div class="swatch-color" style="background:${c.bg}"></div>
      <div class="swatch-meta">
        <span class="swatch-kind">${kind}</span>
        <span class="swatch-label">${safe}</span>
      </div>
    `;
    return card;
  }

  function render(container, productData) {
    if (!container || !productData) return;
    const config = productData._viz_config || {};
    if (config.show_material_swatches === false) return;
    const f = productData.form_factor;
    if (!f) return;

    const items = [];
    if (f.finish) items.push({ name: f.finish, kind: 'finish' });
    (f.materials || []).forEach((m) => items.push({ name: m, kind: 'material' }));
    (f.color_options || []).forEach((c) => items.push({ name: c, kind: 'color' }));

    if (!items.length) return;

    const wrap = document.createElement('div');
    wrap.className = 'material-swatches-wrap';

    const cap = document.createElement('div');
    cap.className = 'material-swatches-caption';
    cap.innerHTML = `
      <span class="ms-mark">MT · 06</span>
      <span class="ms-title">Materials &amp; Finish</span>
      <span class="ms-sub">${items.length} sample${items.length === 1 ? '' : 's'}</span>
    `;
    wrap.appendChild(cap);

    const grid = document.createElement('div');
    grid.className = 'material-swatches';
    items.forEach((it) => grid.appendChild(makeSwatch(it.name, it.kind)));
    wrap.appendChild(grid);

    container.appendChild(wrap);
  }

  window.MaterialSwatches = { render };
})();
