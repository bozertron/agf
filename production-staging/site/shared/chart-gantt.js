/* AGF chart-gantt: a month-grid Gantt as inline SVG.
   Registers window.AGF_RENDERERS["chart-gantt"]. Section shape:
   { type, id, eyebrow, title, lede, months, unit,
     rows: [{ label, title, start, duration, milestones: [{ type: pr|venue|target, slot, label }] }], note }
   Colour comes only from the AGF CSS variables, so Midnight, Daylight and Air all work.
   Bars are brass at reduced opacity with a brass hairline edge; marker type is carried by
   shape (ring, diamond, tick) and a legend, never by colour. No animation; hover/focus
   reveals a marker label with a short opacity fade that is dropped under reduced motion. */
(function () {
  'use strict';

  var STYLE_ID = 'chart-gantt-style';

  var CSS = [
    '.chart-gantt{margin:var(--space-24,24px) 0 0}',
    '.chart-gantt__scroll{overflow-x:auto;overflow-y:hidden;border:1px solid var(--brass-hairline);border-radius:var(--radius-8,8px);background:var(--surface-raised)}',
    '.chart-gantt__scroll:focus-visible{outline:2px solid var(--focus-ring);outline-offset:2px}',
    '.chart-gantt__svg{display:block;width:100%;height:auto}',
    '.chart-gantt__svg text{font-family:var(--font-sans,"Commissioner","Helvetica Neue",Arial,sans-serif);font-variant-numeric:tabular-nums}',
    '.chart-gantt__grid{stroke:var(--brass-hairline);stroke-opacity:.7;stroke-width:1;fill:none}',
    '.chart-gantt__year{stroke:var(--brass);stroke-opacity:.55;stroke-width:1;fill:none}',
    '.chart-gantt__rule{stroke:var(--brass-hairline);stroke-width:1;fill:none}',
    '.chart-gantt__tick-label{font-size:12px;fill:var(--ink-faint);text-anchor:middle}',
    '.chart-gantt__axis-label{font-size:12px;fill:var(--ink-faint);letter-spacing:.08em;text-transform:uppercase}',
    '.chart-gantt__row-label{font-size:13px;font-weight:500;fill:var(--ink)}',
    '.chart-gantt__row-tag{font-size:12px;fill:var(--ink-faint)}',
    '.chart-gantt__bar{fill:var(--brass);fill-opacity:.28;stroke:var(--brass);stroke-width:1}',
    '.chart-gantt__bar-text{font-size:12px;font-weight:500;fill:var(--ink)}',
    '.chart-gantt__m{cursor:default;outline:none}',
    '.chart-gantt__m-hit{fill:transparent;stroke:none}',
    '.chart-gantt__m-halo{fill:none;stroke:var(--surface);stroke-width:5;stroke-linecap:round}',
    '.chart-gantt__m-ring{fill:var(--surface);stroke:var(--brass-text);stroke-width:2}',
    '.chart-gantt__m-diamond{fill:var(--brass-text);stroke:var(--surface);stroke-width:1.5}',
    '.chart-gantt__m-tick{fill:none;stroke:var(--brass-text);stroke-width:3;stroke-linecap:round}',
    '.chart-gantt__ml{font-size:13px;font-weight:600;fill:var(--ink);paint-order:stroke;stroke:var(--surface);stroke-width:5px;stroke-linejoin:round;opacity:0;pointer-events:none;transition:opacity .12s}',
    '.chart-gantt__m:hover .chart-gantt__ml,.chart-gantt__m:focus .chart-gantt__ml,.chart-gantt__m:focus-visible .chart-gantt__ml{opacity:1}',
    '.chart-gantt__m:focus-visible .chart-gantt__m-hit{stroke:var(--focus-ring);stroke-width:2}',
    '.chart-gantt__legend{display:flex;flex-wrap:wrap;align-items:center;gap:8px 24px;margin:var(--space-16,16px) 0 0;padding:0;list-style:none;font-size:13px;color:var(--ink-muted)}',
    '.chart-gantt__legend li{display:inline-flex;align-items:center;gap:8px}',
    '.chart-gantt__legend svg{width:18px;height:18px;flex:none;overflow:visible}',
    '.chart-gantt__legend .chart-gantt__swatch{fill:var(--brass);fill-opacity:.28;stroke:var(--brass);stroke-width:1}',
    '.chart-gantt__hint{margin:var(--space-8,8px) 0 0;font-size:12px;color:var(--ink-faint)}',
    '.chart-gantt__hint--scroll{display:none}',
    '@media (max-width:699px){.chart-gantt__hint--scroll{display:block}}',
    '.chart-gantt__table{margin:var(--space-16,16px) 0 0;font-size:13px;color:var(--ink-muted)}',
    '.chart-gantt__table summary{cursor:pointer;color:var(--brass-text);font-weight:500}',
    '.chart-gantt__table summary:focus-visible{outline:2px solid var(--focus-ring);outline-offset:2px}',
    '.chart-gantt__table-wrap{overflow-x:auto;margin-top:var(--space-8,8px)}',
    '.chart-gantt__table table{border-collapse:collapse;width:100%;min-width:560px}',
    '.chart-gantt__table th,.chart-gantt__table td{padding:6px 12px 6px 0;text-align:left;vertical-align:top;border-bottom:1px solid var(--brass-hairline);font-variant-numeric:tabular-nums}',
    '.chart-gantt__table th{font-size:12px;font-weight:600;color:var(--ink-faint);letter-spacing:.06em;text-transform:uppercase}',
    '@media (prefers-reduced-motion:reduce){.chart-gantt__ml{transition:none}}'
  ].join('\n');

  // One shape per type; the words are the legend vocabulary.
  var TYPES = {
    pr: { word: 'PR lever', shape: 'ring' },
    venue: { word: 'Venue pilot', shape: 'diamond' },
    target: { word: 'Volume target', shape: 'tick' }
  };
  var ORDER = ['pr', 'venue', 'target'];

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  // Marker glyph centred on (0,0), in px of the chart's own coordinates.
  function glyph(shape) {
    if (shape === 'diamond') return '<polygon class="chart-gantt__m-diamond" points="0,-7 7,0 0,7 -7,0"/>';
    if (shape === 'tick') return '<line class="chart-gantt__m-halo" x1="0" y1="-11" x2="0" y2="11"/><line class="chart-gantt__m-tick" x1="0" y1="-10" x2="0" y2="10"/>';
    return '<circle class="chart-gantt__m-ring" r="5.5"/>';
  }

  function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }
  function num(v, d) { v = Number(v); return isFinite(v) ? v : d; }

  function render(s) {
    var H = window.AGF_RENDER_HELPERS || {};
    var esc = H.esc || function (v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
    injectStyle();

    var months = Math.max(1, Math.round(num(s.months, 24)));
    var unit = s.unit || 'Month';
    var rows = Array.isArray(s.rows) ? s.rows : [];
    var uid = 'chart-gantt-' + String(s.id || 'chart').replace(/[^a-z0-9_-]/gi, '');

    // Geometry (SVG user units == CSS px at the chart's natural width).
    var LABEL_W = 168, CELL = 30, PAD_R = 12, HEAD_H = 34, ROW_H = 46, BAR_H = 24, PAD_B = 6;
    var plotW = months * CELL;
    var W = LABEL_W + plotW + PAD_R;
    var H2 = HEAD_H + rows.length * ROW_H + PAD_B;
    var x0 = LABEL_W;
    var xAt = function (m) { return x0 + m * CELL; }; // left edge of month m+1

    var g = '';
    // Month grid + header numbers.
    for (var m = 0; m <= months; m++) {
      var cls = (m > 0 && m < months && m % 12 === 0) ? 'chart-gantt__year' : 'chart-gantt__grid';
      g += '<line class="' + cls + '" x1="' + xAt(m) + '" y1="' + (HEAD_H - 4) + '" x2="' + xAt(m) + '" y2="' + (H2 - PAD_B) + '"/>';
      if (m < months) g += '<text class="chart-gantt__tick-label" x="' + (xAt(m) + CELL / 2) + '" y="' + (HEAD_H - 12) + '">' + (m + 1) + '</text>';
    }
    g += '<text class="chart-gantt__axis-label" x="0" y="' + (HEAD_H - 12) + '">' + esc(unit) + '</text>';

    var used = {};
    var tableRows = '';

    rows.forEach(function (r, i) {
      var top = HEAD_H + i * ROW_H;
      var cy = top + ROW_H / 2;
      var start = clamp(Math.round(num(r.start, 1)), 1, months);
      var dur = clamp(Math.round(num(r.duration, 1)), 1, months - start + 1);
      var end = start + dur - 1;
      var bx = xAt(start - 1), bw = dur * CELL;
      var title = r.title || r.label || '';
      var tag = /^Phase\s/i.test(title) ? title.split(/\s+[—–-]\s+/)[0] : '';
      var range = unit + (dur > 1 ? 's ' + start + '–' + end : ' ' + start);

      g += '<line class="chart-gantt__rule" x1="0" y1="' + (top + ROW_H) + '" x2="' + (W - PAD_R) + '" y2="' + (top + ROW_H) + '"/>';
      if (tag) {
        g += '<text class="chart-gantt__row-label" x="0" y="' + (cy - 2) + '">' + esc(r.label || title) + '</text>';
        g += '<text class="chart-gantt__row-tag" x="0" y="' + (cy + 13) + '">' + esc(tag) + '</text>';
      } else {
        g += '<text class="chart-gantt__row-label" x="0" y="' + (cy + 4) + '">' + esc(r.label || title) + '</text>';
      }
      g += '<g><title>' + esc(title + ' — ' + range) + '</title>'
        + '<rect class="chart-gantt__bar" x="' + bx + '" y="' + (cy - BAR_H / 2) + '" width="' + bw + '" height="' + BAR_H + '" rx="2"/>'
        + '<text class="chart-gantt__bar-text" x="' + (bx + 8) + '" y="' + (cy + 4) + '">' + esc(unit.charAt(0) + start + '–' + unit.charAt(0) + end) + '</text></g>';

      var ms = (Array.isArray(r.milestones) ? r.milestones : []).filter(function (k) { return k && typeof k === 'object' && isFinite(Number(k.slot)); });
      var msText = [];
      ms.forEach(function (k) {
        var t = TYPES[k.type] || { word: String(k.type || 'Milestone'), shape: 'ring' };
        used[TYPES[k.type] ? k.type : '_other'] = t;
        var slot = clamp(Math.round(Number(k.slot)), 1, months);
        var mx = xAt(slot - 1) + CELL / 2;
        var label = String(k.label || t.word);
        var estW = label.length * 7.4 + 8;
        var flip = mx + 12 + estW > W - 4;
        var lx = flip ? -12 : 12;
        g += '<g class="chart-gantt__m" tabindex="0" transform="translate(' + mx + ' ' + cy + ')" role="img" aria-label="' + esc(t.word + ', ' + unit + ' ' + slot + ': ' + label) + '">'
          + '<circle class="chart-gantt__m-hit" r="13"/>' + glyph(t.shape)
          + '<text class="chart-gantt__ml" x="' + lx + '" y="4"' + (flip ? ' text-anchor="end"' : '') + '>' + esc(label) + '</text></g>';
        msText.push(esc(t.word + ': ' + label + ' (' + unit.toLowerCase() + ' ' + slot + ')'));
      });

      tableRows += '<tr><td>' + esc(r.label || '') + '</td><td>' + esc(title) + '</td><td>' + start + '–' + end + '</td><td>' + (msText.join('<br>') || '—') + '</td></tr>';
    });

    var svg = '<svg class="chart-gantt__svg" viewBox="0 0 ' + W + ' ' + H2 + '" style="min-width:' + W + 'px" role="group" aria-labelledby="' + uid + '-t ' + uid + '-d" xmlns="http://www.w3.org/2000/svg">'
      + '<title id="' + uid + '-t">' + esc(s.title || 'Gantt chart') + '</title>'
      + '<desc id="' + uid + '-d">' + esc(rows.length + ' rows across ' + months + ' ' + unit.toLowerCase() + 's. The table view below lists every row and milestone.') + '</desc>'
      + g + '</svg>';

    var legend = '<ul class="chart-gantt__legend" aria-label="Legend">'
      + '<li><svg viewBox="-9 -9 18 18" aria-hidden="true"><rect class="chart-gantt__swatch" x="-8" y="-5" width="16" height="10" rx="2"/></svg>Phase span</li>'
      + ORDER.concat(used._other ? ['_other'] : []).filter(function (k) { return used[k] || (k !== '_other' && !rows.length); }).map(function (k) {
        var t = used[k] || TYPES[k];
        return '<li><svg viewBox="-9 -9 18 18" aria-hidden="true">' + glyph(t.shape) + '</svg>' + esc(t.word) + '</li>';
      }).join('')
      + '</ul>';

    return '<div class="chart-gantt">'
      + '<div class="chart-gantt__scroll" role="region" tabindex="0" aria-label="' + esc((s.title || 'Gantt chart') + ', scrollable') + '">' + svg + '</div>'
      + legend
      + '<p class="chart-gantt__hint">Hover or focus a marker for its label.</p>'
      + '<p class="chart-gantt__hint chart-gantt__hint--scroll">Scroll the chart sideways to see all ' + months + ' ' + esc(unit.toLowerCase()) + 's.</p>'
      + '<details class="chart-gantt__table"><summary>Table view</summary><div class="chart-gantt__table-wrap"><table>'
      + '<thead><tr><th>Lane</th><th>Phase</th><th>' + esc(unit) + 's</th><th>Milestones</th></tr></thead><tbody>' + tableRows + '</tbody></table></div></details>'
      + '</div>';
  }

  window.AGF_RENDERERS = window.AGF_RENDERERS || {};
  window.AGF_RENDERERS['chart-gantt'] = render;
})();
