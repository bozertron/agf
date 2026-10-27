/* AGF perceptual map: section type "chart-perceptual".
 * Registers window.AGF_RENDERERS["chart-perceptual"] (section) => html.
 * Inline SVG, log-scaled x, linear y, brand tokens only (CSS variables), no gradients, no animation.
 * Two geometries (wide / narrow) are emitted; a container query shows the one that fits so type stays 12 to 13px.
 * Labels are placed greedily from a fixed candidate list, so the layout is deterministic and does not overlap.
 */
(function () {
  'use strict';

  var H = window.AGF_RENDER_HELPERS || {};
  var esc = H.esc || function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  var STYLE_ID = 'chart-perceptual-style';
  var CSS = [
    '.chart-perceptual{container-type:inline-size;margin:0;max-width:760px}',
    '.chart-perceptual__svg{display:block;width:100%;height:auto;overflow:visible}',
    '.chart-perceptual__svg--narrow{display:none;max-width:480px}',
    '@container (max-width:480px){',
    '.chart-perceptual__svg--wide{display:none}',
    '.chart-perceptual__svg--narrow{display:block}',
    '}',
    '.chart-perceptual__grid{stroke:var(--brass-hairline);stroke-width:1;fill:none}',
    '.chart-perceptual__axis{stroke:var(--brass-hairline);stroke-width:1.5;fill:none}',
    '.chart-perceptual__tick{font-family:var(--font-sans);font-size:12px;fill:var(--ink-faint)}',
    '.chart-perceptual__title{font-family:var(--font-sans);font-size:11px;font-weight:500;letter-spacing:.18em;text-transform:uppercase;fill:var(--ink-faint)}',
    '.chart-perceptual__ring{fill:none;stroke:var(--brass-hairline);stroke-width:1}',
    '.chart-perceptual__dot{fill:var(--ink-muted)}',
    '.chart-perceptual__ring--hl{stroke:var(--brass-glow);stroke-width:1.5}',
    '.chart-perceptual__dot--hl{fill:var(--brass);stroke:var(--brass-glow);stroke-width:2}',
    '.chart-perceptual__leader{stroke:var(--brass-hairline);stroke-width:1;fill:none}',
    '.chart-perceptual__brand{font-family:var(--font-sans);font-size:13px;fill:var(--ink-muted)}',
    '.chart-perceptual__brand--hl{fill:var(--brass-text);font-weight:600}',
    '.chart-perceptual__status{font-family:var(--font-sans);font-size:12px;fill:var(--ink-faint)}',
    '@media (forced-colors:active){.chart-perceptual__dot{fill:CanvasText}.chart-perceptual__dot--hl{fill:Highlight;stroke:Highlight}}'
  ].join('\n');

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var st = document.createElement('style');
    st.id = STYLE_ID;
    st.textContent = CSS;
    (document.head || document.documentElement).appendChild(st);
  }
  injectStyle();

  function num(v, d) { v = Number(v); return isFinite(v) ? v : d; }
  function r1(n) { return Math.round(n * 10) / 10; }

  function money(n) {
    if (n >= 1e6) return '$' + (n / 1e6) + 'M';
    if (n >= 1000) return '$' + (n / 1000) + 'K';
    return '$' + n;
  }

  // Rough Commissioner width: 0.58em per character is slightly generous, which keeps boxes safe.
  function tw(s, fs) { return String(s).length * fs * 0.58; }

  function overlap(a, b, pad) {
    pad = pad || 0;
    return a.x0 < b.x1 + pad && a.x1 + pad > b.x0 && a.y0 < b.y1 + pad && a.y1 + pad > b.y0;
  }

  function nearestPoint(b, x, y) {
    return { x: Math.min(Math.max(x, b.x0), b.x1), y: Math.min(Math.max(y, b.y0), b.y1) };
  }
  function dist(b, x, y) {
    var n = nearestPoint(b, x, y), dx = n.x - x, dy = n.y - y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  function inBox(b, x, y, pad) {
    return x > b.x0 - pad && x < b.x1 + pad && y > b.y0 - pad && y < b.y1 + pad;
  }
  function ccw(a, b, c) { return (c.y - a.y) * (b.x - a.x) > (b.y - a.y) * (c.x - a.x); }
  function cross(s1, s2) {
    return ccw(s1.a, s2.a, s2.b) !== ccw(s1.b, s2.a, s2.b) && ccw(s1.a, s1.b, s2.a) !== ccw(s1.a, s1.b, s2.b);
  }
  // Points along a segment, skipping the first `skip` px (the dot itself).
  function samples(seg, skip) {
    var out = [], len = Math.sqrt(Math.pow(seg.b.x - seg.a.x, 2) + Math.pow(seg.b.y - seg.a.y, 2)) || 1;
    for (var t = skip / len; t <= 1; t += 6 / len) out.push({ x: seg.a.x + (seg.b.x - seg.a.x) * t, y: seg.a.y + (seg.b.y - seg.a.y) * t });
    return out;
  }

  function geometry(kind) {
    return kind === 'wide'
      ? { W: 600, H: 350, ml: 36, mr: 14, mt: 48, mb: 50, r: 6 }
      : { W: 360, H: 430, ml: 32, mr: 12, mt: 48, mb: 50, r: 5 };
  }

  function build(kind, pts, xa, ya, uid) {
    var g = geometry(kind);
    var pw = g.W - g.ml - g.mr, ph = g.H - g.mt - g.mb;
    var lmin = Math.log10(xa.min), lmax = Math.log10(xa.max);
    function X(v) { return g.ml + (Math.log10(Math.min(Math.max(v, xa.min), xa.max)) - lmin) / (lmax - lmin) * pw; }
    function Y(v) { return g.mt + ph - (Math.min(Math.max(v, ya.min), ya.max) - ya.min) / (ya.max - ya.min) * ph; }

    var o = [];
    o.push('<svg class="chart-perceptual__svg chart-perceptual__svg--' + kind + '" viewBox="0 0 ' + g.W + ' ' + g.H +
      '" width="100%" role="img" aria-labelledby="' + uid + '-t-' + kind + '" focusable="false">');
    o.push('<title id="' + uid + '-t-' + kind + '">' + esc(summary(pts)) + '</title>');

    // Grid: y at 0/25/50/75/100 of range, x at powers of ten inside the range.
    var yticks = [];
    for (var i = 0; i <= 4; i++) yticks.push(ya.min + (ya.max - ya.min) * i / 4);
    yticks.forEach(function (t) {
      var y = r1(Y(t));
      o.push('<line class="chart-perceptual__grid" x1="' + g.ml + '" x2="' + (g.W - g.mr) + '" y1="' + y + '" y2="' + y + '"/>');
      o.push('<text class="chart-perceptual__tick" x="' + (g.ml - 8) + '" y="' + (y + 4) + '" text-anchor="end">' + esc(Math.round(t)) + '</text>');
    });
    var xticks = [];
    for (var k = Math.ceil(lmin); k <= Math.floor(lmax); k++) xticks.push(Math.pow(10, k));
    xticks.forEach(function (t) {
      var x = r1(X(t));
      o.push('<line class="chart-perceptual__grid" x1="' + x + '" x2="' + x + '" y1="' + g.mt + '" y2="' + (g.mt + ph) + '"/>');
      o.push('<text class="chart-perceptual__tick" x="' + x + '" y="' + (g.mt + ph + 18) + '" text-anchor="middle">' + esc(money(t)) + '</text>');
    });
    o.push('<line class="chart-perceptual__axis" x1="' + g.ml + '" x2="' + (g.W - g.mr) + '" y1="' + (g.mt + ph) + '" y2="' + (g.mt + ph) + '"/>');
    o.push('<line class="chart-perceptual__axis" x1="' + g.ml + '" x2="' + g.ml + '" y1="' + g.mt + '" y2="' + (g.mt + ph) + '"/>');

    // Axis titles as eyebrows. The y title sits horizontally above the axis; x title centred below the ticks.
    var yTitle = String(ya.label || 'Prestige'), xTitle = String(xa.label || 'Price');
    o.push('<text class="chart-perceptual__title" x="' + g.ml + '" y="14">' + esc(yTitle) + '</text>');
    o.push('<text class="chart-perceptual__title" x="' + r1(g.ml + pw / 2) + '" y="' + (g.H - 6) + '" text-anchor="middle">' + esc(xTitle) + '</text>');

    // Place labels. Obstacles: every dot (with ring) and the y-axis title.
    var obstacles = pts.map(function (p) {
      var cx = X(p.price_usd_avg), cy = Y(p.prestige_score);
      p._cx = cx; p._cy = cy;
      return { x0: cx - g.r - 4, y0: cy - g.r - 4, x1: cx + g.r + 4, y1: cy + g.r + 4 };
    });
    var placed = [{ x0: g.ml, y0: 2, x1: g.ml + tw(yTitle.toUpperCase(), 11) * 1.35, y1: 18 }];
    var bounds = { x0: g.ml + 2, x1: g.W - 4, y0: 24, y1: g.mt + ph - 2 };
    var dists = [g.r + 7, g.r + 22, g.r + 40, g.r + 62, g.r + 86, g.r + 120];
    var dirs = ['e', 'w', 'n', 's', 'ne', 'nw', 'se', 'sw', 'sl', 'sr', 'nl', 'nr'];

    function candidates(p, w, h) {
      var list = [];
      dists.forEach(function (d) {
        dirs.forEach(function (dir) {
          var dd = (dir.length === 2) ? d * 0.72 : d, x0, y0, anchor;
          if (dir === 'e') { x0 = p._cx + d; y0 = p._cy - h / 2; anchor = 'start'; }
          else if (dir === 'w') { x0 = p._cx - d - w; y0 = p._cy - h / 2; anchor = 'end'; }
          else if (dir === 'n') { x0 = Math.min(Math.max(p._cx - w / 2, bounds.x0), bounds.x1 - w); y0 = p._cy - d - h; anchor = 'middle'; }
          else if (dir === 's') { x0 = Math.min(Math.max(p._cx - w / 2, bounds.x0), bounds.x1 - w); y0 = p._cy + d; anchor = 'middle'; }
          else if (dir === 'sl' || dir === 'sr' || dir === 'nl' || dir === 'nr') {
            // Below/above, with the box hanging off the left (l: box ends near the dot) or right (r: box starts near the dot).
            x0 = dir.charAt(1) === 'l' ? p._cx + 14 - w : p._cx - 14;
            y0 = dir.charAt(0) === 's' ? p._cy + d : p._cy - d - h;
            anchor = dir.charAt(1) === 'l' ? 'end' : 'start';
          }
          else {
            var sx = dir.indexOf('e') >= 0 ? 1 : -1, sy = dir.indexOf('s') >= 0 ? 1 : -1;
            x0 = sx > 0 ? p._cx + dd : p._cx - dd - w;
            y0 = sy > 0 ? p._cy + dd : p._cy - dd - h;
            anchor = sx > 0 ? 'start' : 'end';
          }
          var box = { x0: x0, y0: y0, x1: x0 + w, y1: y0 + h, anchor: anchor, d: d, dir: dir };
          if (box.x0 < bounds.x0 || box.x1 > bounds.x1 || box.y0 < bounds.y0 || box.y1 > bounds.y1) return;
          for (var j = 0; j < obstacles.length; j++) if (overlap(box, obstacles[j], 0)) return;
          if (d > g.r + 10) {
            var n = nearestPoint(box, p._cx, p._cy), vx = n.x - p._cx, vy = n.y - p._cy, len = Math.sqrt(vx * vx + vy * vy) || 1;
            box.seg = { a: { x: p._cx + vx / len * (g.r + 5), y: p._cy + vy / len * (g.r + 5) }, b: n };
            // A leader must not run through another dot.
            var smp = samples(box.seg, 0);
            for (var k2 = 0; k2 < pts.length; k2++) {
              if (pts[k2] === p) continue;
              for (var q = 0; q < smp.length; q++) if (Math.abs(smp[q].x - pts[k2]._cx) < g.r + 3 && Math.abs(smp[q].y - pts[k2]._cy) < g.r + 3) { box.thru = true; k2 = pts.length; break; }
            }
          } else {
            // Unleadered labels must sit visibly closer to their own dot than to any other.
            var own = dist(box, p._cx, p._cy);
            for (var k3 = 0; k3 < pts.length; k3++) if (pts[k3] !== p && dist(box, pts[k3]._cx, pts[k3]._cy) < own + 14) box.amb = true;
          }
          list.push(box);
        });
      });
      return list;
    }

    var info = pts.map(function (p) {
      var status = p.status ? String(p.status) : '';
      var w = Math.max(tw(p.brand, 13) * (p.highlight ? 1.08 : 1), status ? tw(status, 12) : 0);
      return { w: w, h: status ? 31 : 17 };
    });
    var cands = pts.map(function (p, i) { return candidates(p, info[i].w, info[i].h); });
    // Most constrained label first (highlight always first); ties fall back to data order, so the result is deterministic.
    var order = pts.map(function (p, i) { return i; }).sort(function (a, b) {
      return (pts[b].highlight ? 1 : 0) - (pts[a].highlight ? 1 : 0) || cands[a].length - cands[b].length || a - b;
    });

    var out = {}, leaderSegs = [];
    order.forEach(function (i) {
      var chosen = null, best = Infinity;
      for (var c = 0; c < cands[i].length; c++) {
        var box = cands[i][c], bad = false, score = box.d + (box.amb ? 120 : 0) + (box.thru ? 200 : 0);
        for (var j = 0; j < placed.length && !bad; j++) if (overlap(box, placed[j], 4)) bad = true;
        for (var l = 0; l < leaderSegs.length && !bad; l++) {
          var ls = leaderSegs[l];
          if (samples(ls, 0).some(function (pt) { return inBox(box, pt.x, pt.y, 3); })) score += 300;
          if (box.seg && cross(box.seg, ls)) score += 150;
        }
        if (box.seg && !bad) {
          for (var m = 1; m < placed.length; m++) {
            if (samples(box.seg, 2).some(function (pt) { return inBox(placed[m], pt.x, pt.y, 3); })) score += 300;
          }
        }
        if (!bad && score < best) { best = score; chosen = box; }
      }
      chosen = chosen || cands[i][0];
      if (chosen) { placed.push(chosen); out[i] = chosen; if (chosen.seg) leaderSegs.push(chosen.seg); }
    });

    // Leaders first (under dots), then dots, then text.
    var dotsSvg = [], textSvg = [], leaders = [];
    pts.forEach(function (p, i) {
      var cx = r1(p._cx), cy = r1(p._cy), hl = !!p.highlight;
      var tip = p.brand + ': ' + money(p.price_usd_avg) + ' average price, prestige ' + p.prestige_score + (p.status ? ', ' + p.status : '');
      dotsSvg.push('<g><title>' + esc(tip) + '</title>' +
        '<circle class="chart-perceptual__ring' + (hl ? ' chart-perceptual__ring--hl' : '') + '" cx="' + cx + '" cy="' + cy + '" r="' + (g.r + (hl ? 5 : 3)) + '"/>' +
        '<circle class="chart-perceptual__dot' + (hl ? ' chart-perceptual__dot--hl' : '') + '" cx="' + cx + '" cy="' + cy + '" r="' + g.r + '"/></g>');
      var b = out[i];
      if (!b) return;
      if (b.d > g.r + 10) {
        var nx = Math.min(Math.max(p._cx, b.x0), b.x1), ny = Math.min(Math.max(p._cy, b.y0), b.y1);
        var vx = nx - p._cx, vy = ny - p._cy, len = Math.sqrt(vx * vx + vy * vy) || 1;
        var sr = g.r + (hl ? 6 : 4);
        leaders.push('<line class="chart-perceptual__leader" x1="' + r1(p._cx + vx / len * sr) + '" y1="' + r1(p._cy + vy / len * sr) +
          '" x2="' + r1(nx) + '" y2="' + r1(ny) + '"/>');
      }
      var tx = b.anchor === 'start' ? b.x0 : b.anchor === 'end' ? b.x1 : (b.x0 + b.x1) / 2;
      var hasStatus = !!p.status;
      textSvg.push('<text class="chart-perceptual__brand' + (hl ? ' chart-perceptual__brand--hl' : '') + '" x="' + r1(tx) + '" y="' + r1(b.y0 + 12) + '" text-anchor="' + b.anchor + '">' + esc(p.brand) + '</text>');
      if (hasStatus) textSvg.push('<text class="chart-perceptual__status" x="' + r1(tx) + '" y="' + r1(b.y0 + 27) + '" text-anchor="' + b.anchor + '">' + esc(p.status) + '</text>');
    });
    o.push(leaders.join(''), dotsSvg.join(''), textSvg.join(''));
    o.push('</svg>');
    return o.join('');
  }

  function summary(pts) {
    return 'Perceptual map of average flagship price (log scale) against prestige score. ' +
      pts.map(function (p) {
        return p.brand + ', ' + money(p.price_usd_avg) + ', prestige ' + p.prestige_score;
      }).join('; ') + '.';
  }

  var counter = 0;

  function render(s) {
    injectStyle();
    var xa = { min: num(s.x && s.x.min, 500), max: num(s.x && s.x.max, 250000), label: s.x && s.x.label };
    var ya = { min: num(s.y && s.y.min, 0), max: num(s.y && s.y.max, 100), label: s.y && s.y.label };
    if (!(xa.min > 0) || xa.max <= xa.min) { xa.min = 500; xa.max = 250000; }
    if (ya.max <= ya.min) { ya.min = 0; ya.max = 100; }
    var pts = (s.points || []).filter(function (p) {
      return p && p.brand && isFinite(Number(p.price_usd_avg)) && Number(p.price_usd_avg) > 0 && isFinite(Number(p.prestige_score));
    }).map(function (p) {
      return { brand: String(p.brand), price_usd_avg: Number(p.price_usd_avg), prestige_score: Number(p.prestige_score), status: p.status || '', highlight: !!p.highlight };
    });
    if (!pts.length) return '';
    var uid = 'chart-perceptual-' + (++counter);
    return '<figure class="chart-perceptual">' +
      build('wide', pts, xa, ya, uid) + build('narrow', pts, xa, ya, uid) + '</figure>';
  }

  window.AGF_RENDERERS = window.AGF_RENDERERS || {};
  window.AGF_RENDERERS['chart-perceptual'] = render;
})();
