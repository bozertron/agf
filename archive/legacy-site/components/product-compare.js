/* ==========================================================================
   AGF · components/product-compare.js
   Schema-driven side-by-side product comparison overlay.
   window.ProductCompare.init(container, products, config)
   ========================================================================== */
(function () {
  'use strict';

  const SVG_NS = 'http://www.w3.org/2000/svg';
  // Brass/gold/moss palette for overlaid curves — paired with brand tokens.
  const CURVE_COLORS = ['#B8860B', '#D4A234', '#A89880', '#6B7A6F', '#7AB48A'];

  // ---------- helpers ------------------------------------------------------
  function esc(v) {
    if (v === null || v === undefined) return '';
    return String(v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function resolvePath(obj, path) {
    if (!obj || !path) return undefined;
    return String(path).split('.').reduce((acc, k) => {
      if (acc === null || acc === undefined) return undefined;
      return acc[k];
    }, obj);
  }

  function fmtUSD(n) {
    if (typeof n !== 'number' || !isFinite(n)) return '';
    if (n >= 1e6) return '$' + Math.round(n / 1e6) + 'M';
    if (n >= 1e3) return '$' + Math.round(n / 1e3) + 'K';
    return '$' + n;
  }

  // Numeric "weight" used for highlight_winner. Returns NaN if not comparable.
  function numericWeight(value, format) {
    if (value === null || value === undefined) return NaN;
    if (format === 'range_hz' && typeof value === 'object') {
      const lo = Number(value.low_hz);
      const hi = Number(value.high_hz);
      if (isFinite(lo) && isFinite(hi)) return hi - lo;
      return NaN;
    }
    if (format === 'currency_range' && typeof value === 'object') {
      const lo = Number(value.min);
      const hi = Number(value.max);
      if (isFinite(lo) && isFinite(hi)) return (lo + hi) / 2;
      if (isFinite(lo)) return lo;
      return NaN;
    }
    if (format === 'array_count') {
      return Array.isArray(value) ? value.length : NaN;
    }
    if (typeof value === 'number') return value;
    if (typeof value === 'string' && value.trim() !== '' && !isNaN(Number(value))) {
      return Number(value);
    }
    return NaN;
  }

  function formatValue(value, format) {
    if (value === null || value === undefined || value === '') return '—';
    switch (format) {
      case 'range_hz':
        if (typeof value === 'object') {
          const lo = value.low_hz != null ? value.low_hz : '?';
          const hi = value.high_hz != null ? value.high_hz : '?';
          const tol = value.tolerance_db ? ' ±' + value.tolerance_db + 'dB' : '';
          return lo + '–' + hi + ' Hz' + tol;
        }
        return String(value);
      case 'db':
        return value + ' dB';
      case 'percent':
        return value + '%';
      case 'currency_range':
        if (typeof value === 'object') {
          if (value.min != null && value.max != null && value.min !== value.max) {
            return '$' + value.min + '–$' + value.max;
          }
          if (value.min != null) return '$' + value.min;
        }
        if (typeof value === 'number') return fmtUSD(value);
        return String(value);
      case 'array_count':
        if (Array.isArray(value)) {
          if (!value.length) return '—';
          const labels = value.map((it) => {
            if (typeof it === 'string') return it;
            if (it && typeof it === 'object') return it.protocol || it.name || it.type || '';
            return String(it);
          }).filter(Boolean);
          return value.length + ' · ' + labels.join(', ');
        }
        return String(value);
      case 'number':
        return typeof value === 'number' ? String(value) : esc(value);
      case 'text':
      default:
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value);
    }
  }

  // Determine winning index for a row given numeric weights and direction.
  function findWinner(weights, higherWins) {
    let bestIdx = -1;
    let bestVal = higherWins ? -Infinity : Infinity;
    weights.forEach((w, i) => {
      if (!isFinite(w)) return;
      if (higherWins ? w > bestVal : w < bestVal) {
        bestVal = w;
        bestIdx = i;
      }
    });
    return bestIdx;
  }

  // ---------- builders -----------------------------------------------------
  function buildHeader(products) {
    const cells = products.map((p, i) => {
      const d = (p && p.data) || {};
      const cat = d.category || p.category || '';
      const name = d.name || p.name || '';
      return `
        <div class="cmp-col-head" style="--cmp-curve:${CURVE_COLORS[i % CURVE_COLORS.length]}">
          <span class="cmp-col-mark">P · ${String(i + 1).padStart(2, '0')}</span>
          <h4>${esc(name)}</h4>
          <span class="cmp-col-cat">${esc(cat)}</span>
        </div>`;
    }).join('');
    return `
      <div class="cmp-grid-row cmp-grid-headrow">
        <div class="cmp-row-label cmp-row-label-empty">SPECIMEN</div>
        ${cells}
      </div>`;
  }

  function buildRows(products, fields, highlightWinner) {
    return fields.map((field) => {
      const values = products.map((p) => resolvePath((p && p.data) || {}, field.path));
      const weights = values.map((v) => numericWeight(v, field.format));
      const winnerIdx = highlightWinner && field.higher_wins !== undefined
        ? findWinner(weights, !!field.higher_wins)
        : -1;

      const cells = values.map((v, i) => {
        const isWinner = i === winnerIdx;
        return `
          <div class="cmp-cell ${isWinner ? 'compare-highlight' : ''}">
            <span class="cmp-cell-val">${esc(formatValue(v, field.format))}</span>
            ${isWinner ? '<span class="cmp-cell-mark" aria-label="best">▲</span>' : ''}
          </div>`;
      }).join('');

      return `
        <div class="cmp-grid-row">
          <div class="cmp-row-label">
            <span class="cmp-row-label-text">${esc(field.label)}</span>
            ${field.higher_wins !== undefined ? `<span class="cmp-row-dir">${field.higher_wins ? '▲ higher' : '▼ lower'}</span>` : ''}
          </div>
          ${cells}
        </div>`;
    }).join('');
  }

  function buildFreqOverlay(products) {
    const candidates = products
      .map((p, i) => ({ p, i, fr: resolvePath((p && p.data) || {}, 'audio.frequency_response') }))
      .filter((x) => x.fr && (x.fr.low_hz != null || x.fr.high_hz != null));
    if (candidates.length < 2) return '';

    const logScale = (f) => (Math.log10(f) - Math.log10(20)) / (Math.log10(20000) - Math.log10(20)) * 1000;
    const dbRange = 12;
    const dbScale = (db) => 160 - (db / dbRange * 140);

    const grid = [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000].map((f) => {
      const x = logScale(f);
      const label = f >= 1000 ? (f / 1000) + 'k' : String(f);
      return `<line x1="${x}" y1="20" x2="${x}" y2="280" stroke="#2a4a3a" stroke-width="0.4" opacity="0.3"/>
              <text x="${x}" y="300" text-anchor="middle" font-size="10" fill="#888" font-family="Commissioner, sans-serif" letter-spacing="0.05em">${label}</text>`;
    }).join('');

    const dbGrid = [-12, -6, 0, 6, 12].map((db) => {
      const y = dbScale(db);
      return `<line x1="0" y1="${y}" x2="1000" y2="${y}" stroke="${db === 0 ? '#888' : '#2a4a3a'}" stroke-width="${db === 0 ? 0.6 : 0.4}" stroke-dasharray="${db === 0 ? '6 4' : ''}" opacity="${db === 0 ? 0.7 : 0.3}"/>`;
    }).join('');

    const curves = candidates.map((c) => {
      const color = CURVE_COLORS[c.i % CURVE_COLORS.length];
      const lo = Math.max(c.fr.low_hz || 20, 20);
      const hi = Math.min(c.fr.high_hz || 20000, 20000);
      const tol = c.fr.tolerance_db || 3;
      const lowX = logScale(lo);
      const highX = logScale(hi);
      const points = [];
      for (let i = 0; i <= 60; i++) {
        const t = i / 60;
        const x = lowX + t * (highX - lowX);
        let db = 0;
        if (t < 0.08) db = -((0.08 - t) / 0.08) * dbRange * 0.85;
        else if (t > 0.92) db = -((t - 0.92) / 0.08) * dbRange * 0.65;
        else db = Math.sin(t * 9.4 + c.i) * tol * 0.28 + Math.sin(t * 21 + c.i * 1.3) * tol * 0.12;
        points.push({ x, y: dbScale(db) });
      }
      let d = 'M ' + points[0].x + ' ' + points[0].y;
      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1], curr = points[i];
        const cpx = (prev.x + curr.x) / 2;
        d += ' C ' + cpx + ' ' + prev.y + ', ' + cpx + ' ' + curr.y + ', ' + curr.x + ' ' + curr.y;
      }
      return `<path d="${d}" stroke="${color}" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"/>`;
    }).join('');

    const legend = candidates.map((c) => {
      const color = CURVE_COLORS[c.i % CURVE_COLORS.length];
      const name = (c.p.data && c.p.data.name) || c.p.name || '';
      return `<span class="cmp-legend-item"><span class="cmp-legend-swatch" style="background:${color}"></span>${esc(name)}</span>`;
    }).join('');

    return `
      <div class="compare-freq-overlay">
        <div class="cmp-section-head">
          <span class="cmp-section-mark">FR · OVERLAY</span>
          <span class="cmp-section-title">Frequency Response · 20Hz → 20kHz</span>
        </div>
        <svg viewBox="0 0 1000 320" preserveAspectRatio="xMidYMid meet" class="cmp-freq-svg" role="img" aria-label="Overlaid frequency response">
          ${dbGrid}${grid}${curves}
        </svg>
        <div class="cmp-legend">${legend}</div>
      </div>`;
  }

  function buildPriceBar(products) {
    const rows = products.map((p, i) => {
      const v = resolvePath((p && p.data) || {}, 'business.asp_usd');
      let mid = NaN, label = '—';
      if (v && typeof v === 'object') {
        const lo = Number(v.min), hi = Number(v.max);
        if (isFinite(lo) && isFinite(hi)) {
          mid = (lo + hi) / 2;
          label = (lo === hi) ? fmtUSD(lo) : fmtUSD(lo) + '–' + fmtUSD(hi);
        } else if (isFinite(lo)) { mid = lo; label = fmtUSD(lo); }
      } else if (typeof v === 'number') { mid = v; label = fmtUSD(v); }
      return { p, i, mid, label };
    }).filter((r) => isFinite(r.mid));

    if (!rows.length) return '';
    const max = Math.max.apply(null, rows.map((r) => r.mid));
    const bars = rows.map((r) => {
      const pct = Math.max(2, (r.mid / max) * 100);
      const color = CURVE_COLORS[r.i % CURVE_COLORS.length];
      const name = (r.p.data && r.p.data.name) || r.p.name || '';
      return `
        <div class="cmp-pb-row">
          <span class="cmp-pb-name">${esc(name)}</span>
          <span class="cmp-pb-track">
            <span class="cmp-pb-fill" style="width:${pct}%;background:${color}"></span>
          </span>
          <span class="cmp-pb-val">${esc(r.label)}</span>
        </div>`;
    }).join('');

    return `
      <div class="compare-price-bar">
        <div class="cmp-section-head">
          <span class="cmp-section-mark">PRICE · ASP</span>
          <span class="cmp-section-title">Average Selling Price (USD)</span>
        </div>
        <div class="cmp-pb-rows">${bars}</div>
      </div>`;
  }

  // Fallback grid when no config is supplied: dump all audio.* leaves.
  function buildFallback(products) {
    const keys = new Set();
    products.forEach((p) => {
      const a = ((p && p.data) || {}).audio || {};
      Object.keys(a).forEach((k) => keys.add(k));
    });
    const fields = Array.from(keys).map((k) => ({
      path: 'audio.' + k,
      label: k.replace(/_/g, ' '),
      format: 'text',
    }));
    return buildRows(products, fields, false);
  }

  // ---------- mount --------------------------------------------------------
  let _escHandler = null;
  function close() {
    const overlay = document.querySelector('.compare-overlay');
    if (overlay) overlay.remove();
    document.body.classList.remove('compare-locked');
    if (_escHandler) {
      document.removeEventListener('keydown', _escHandler);
      _escHandler = null;
    }
  }

  function init(container, products, config) {
    if (!container) container = document.body;
    if (!Array.isArray(products) || products.length < 2) return;

    const cfg = config || {};
    const fields = Array.isArray(cfg.comparison_fields) ? cfg.comparison_fields : null;
    const max = Math.max(2, Math.min(cfg.max_compare || 3, 5));
    const visible = products.slice(0, max);
    const cols = visible.length;
    const highlightWinner = cfg.highlight_winner !== false;

    // Pre-existing overlay? close first.
    close();

    const overlay = document.createElement('div');
    overlay.className = 'compare-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Compare products');

    const rowsHTML = fields && fields.length
      ? buildRows(visible, fields, highlightWinner)
      : buildFallback(visible);

    overlay.innerHTML = `
      <div class="compare-overlay-backdrop" data-cmp-dismiss="1"></div>
      <div class="compare-overlay-panel" style="--cmp-cols:${cols}">
        <header class="compare-overlay-head">
          <div class="cmp-head-mark">
            <span class="cmp-head-eyebrow">CMP · ${String(cols).padStart(2, '0')}</span>
            <h3>Compare Products</h3>
            <span class="cmp-head-sub">Side-by-side · schema-driven</span>
          </div>
          <button type="button" class="compare-overlay-close" aria-label="Close comparison">
            <span aria-hidden="true">✕</span>
          </button>
        </header>
        <div class="compare-overlay-body">
          <div class="compare-grid" style="--cmp-cols:${cols}">
            ${buildHeader(visible)}
            ${rowsHTML}
          </div>
          ${cfg.overlay_freq_curves !== false ? buildFreqOverlay(visible) : ''}
          ${cfg.show_price_bar !== false ? buildPriceBar(visible) : ''}
        </div>
      </div>`;

    container.appendChild(overlay);
    document.body.classList.add('compare-locked');

    // Wire close interactions
    overlay.querySelector('.compare-overlay-close').addEventListener('click', close);
    overlay.querySelector('.compare-overlay-backdrop').addEventListener('click', close);
    _escHandler = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', _escHandler);

    // Trigger reveal animation on next frame
    requestAnimationFrame(() => overlay.classList.add('is-open'));
  }

  window.ProductCompare = { init, close };
})();
