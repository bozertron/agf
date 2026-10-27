/* AGF reference site — one renderer for the portal, the nine intro pages and the nine deep dives.
   Reads ../site.json (the manifest of options) and ./content.json (this option's copy),
   builds nav, page body and footer from them. No dependencies. */
(function () {
  'use strict';

  const body = document.body;
  const PAGE = body.dataset.page;          // portal | intro | deep
  const OPTION = body.dataset.option || ''; // slug, empty on the portal
  const ROOT = PAGE === 'portal' ? './' : '../';
  const ASSETS = ROOT + '../assets/'; // production-staging/assets, beside site/

  // ---------- helpers ----------
  const esc = (s) => String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const inline = (s) => esc(s)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/→/g, '<span aria-hidden="true">→</span>');
  // Markdown-lite: blank line = paragraph, single newline = line break, **bold**, *italic*.
  const md = (s) => {
    if (Array.isArray(s)) return s.map(md).join('');
    const t = String(s == null ? '' : s).trim();
    if (!t) return '';
    return t.split(/\n\s*\n/).map((p) => '<p>' + inline(p.trim()).replace(/\n/g, '<br>') + '</p>').join('');
  };
  const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const el = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content; };

  const TRACE = '<svg class="agf-trace__svg" aria-hidden="true"><defs><pattern id="agf-pcb" width="240" height="240" patternUnits="userSpaceOnUse"><g fill="none" stroke="currentColor" stroke-width="1" stroke-linejoin="round"><polyline points="120,48 120,-24 192,-24 264,-24"/><polyline points="192,24 288,24 360,24 456,24"/><polyline points="72,0 24,48 -24,96"/><polyline points="24,72 120,72 72,120"/><polyline points="216,0 312,0 264,48 336,48 336,120"/><polyline points="0,192 48,240 0,288"/><polyline points="48,192 144,192 192,240"/><polyline points="192,48 288,48 384,48"/></g><g fill="none" stroke="currentColor" stroke-width="1"><circle cx="120" cy="48" r="3"/><circle cx="264" cy="-24" r="3"/><circle cx="192" cy="24" r="3"/><circle cx="456" cy="24" r="3"/><circle cx="72" cy="0" r="3"/><circle cx="-24" cy="96" r="3"/><circle cx="24" cy="72" r="3"/><circle cx="72" cy="120" r="3"/><circle cx="216" cy="0" r="3"/><circle cx="336" cy="120" r="3"/><circle cx="0" cy="192" r="3"/><circle cx="0" cy="288" r="3"/><circle cx="48" cy="192" r="3"/><circle cx="192" cy="240" r="3"/><circle cx="192" cy="48" r="3"/><circle cx="384" cy="48" r="3"/></g><g fill="currentColor"><circle cx="120" cy="48" r="1.2"/><circle cx="264" cy="-24" r="1.2"/><circle cx="192" cy="24" r="1.2"/><circle cx="456" cy="24" r="1.2"/><circle cx="72" cy="0" r="1.2"/><circle cx="-24" cy="96" r="1.2"/><circle cx="24" cy="72" r="1.2"/><circle cx="72" cy="120" r="1.2"/><circle cx="216" cy="0" r="1.2"/><circle cx="336" cy="120" r="1.2"/><circle cx="0" cy="192" r="1.2"/><circle cx="0" cy="288" r="1.2"/><circle cx="48" cy="192" r="1.2"/><circle cx="192" cy="240" r="1.2"/><circle cx="192" cy="48" r="1.2"/><circle cx="384" cy="48" r="1.2"/></g></pattern></defs><rect width="100%" height="100%" fill="url(#agf-pcb)"/></svg>';
  const GROUND = (size, stroke) => '<svg width="' + size + '" height="' + size + '" viewBox="0 0 80 80" fill="none" stroke-linecap="round" role="img" aria-label="Floating ground"><g stroke="' + stroke + '" stroke-width="1"><path d="M46.25 4.55A36 36 0 1 1 6.17 52.31"/><path d="M4.55 33.75A36 36 0 0 1 27.69 6.17"/></g><g stroke="' + stroke + '" stroke-width="2"><line x1="40" y1="22" x2="40" y2="40"/><line x1="24" y1="40" x2="56" y2="40"/><line x1="29" y1="47" x2="51" y2="47"/><line x1="34" y1="54" x2="46" y2="54"/></g></svg>';
  const ORBIT = '<svg class="agf-readout__orbit" width="220" height="220" viewBox="0 0 280 280"><circle cx="140" cy="140" r="138"/><circle cx="140" cy="140" r="112"/><circle class="dash" cx="140" cy="140" r="126"/></svg>';

  const note = (n) => n ? '<div class="note"><b>Working note</b>' + inline(n) + '</div>' : '';
  const assumed = (flag) => flag ? '<span class="agf-badge agf-badge--plain assumed-badge">assumed</span>' : '';

  // ---------- section renderers (deep pages) ----------
  const R = {
    prose(s) { return '<div class="prose' + (s.large ? ' prose--lg' : '') + '">' + md(s.body) + '</div>'; },
    quote(s) { return '<blockquote class="pull">' + inline(s.text) + (s.cite ? '<cite>' + inline(s.cite) + '</cite>' : '') + '</blockquote>'; },
    list(s) {
      const cls = 'plain-list' + (s.columns === 2 ? ' plain-list--2' : '');
      return (s.body ? '<div class="prose">' + md(s.body) + '</div>' : '') + '<ul class="' + cls + '">' + (s.items || []).map((i) => '<li>' + inline(i) + '</li>').join('') + '</ul>';
    },
    cards(s) {
      const cols = s.columns ? ' cards--' + s.columns : '';
      return '<div class="cards' + cols + '">' + (s.items || []).map((c) => {
        let h = '<div class="agf-card">';
        if (c.eyebrow) h += '<p class="agf-eyebrow' + (c.brass ? ' agf-eyebrow--brass' : '') + '">' + inline(c.eyebrow) + '</p>';
        if (c.title) h += '<h4>' + inline(c.title) + '</h4>';
        if (c.pull) h += '<p class="pull">' + inline(c.pull) + '</p>';
        if (c.body) h += '<div class="agf-body">' + md(c.body) + '</div>';
        if (c.list && c.list.length) h += '<ul class="inline">' + c.list.map((i) => '<li>' + inline(i) + '</li>').join('') + '</ul>';
        if (c.kv && c.kv.length) h += '<div class="meta">' + c.kv.map((kv) => '<span class="kv"><b>' + inline(kv[0]) + '</b> ' + inline(kv[1]) + '</span>').join('') + '</div>';
        if (c.tags && c.tags.length) h += '<div class="meta">' + c.tags.map((t) => '<span class="agf-badge agf-badge--plain">' + inline(t) + '</span>').join('') + '</div>';
        if (c.note) h += note(c.note);
        return h + '</div>';
      }).join('') + '</div>';
    },
    table(s) {
      const cols = s.columns || [];
      const numeric = new Set(s.numeric || []);
      return '<div class="table-scroll"><table class="data"><thead><tr>' + cols.map((c) => '<th>' + inline(c) + '</th>').join('') + '</tr></thead><tbody>' +
        (s.rows || []).map((r) => '<tr>' + r.map((c, i) => (i === 0 ? '<th>' : '<td' + (numeric.has(i) ? ' class="num"' : '') + '>') + inline(c) + (i === 0 ? '</th>' : '</td>')).join('') + '</tr>').join('') +
        '</tbody></table></div>';
    },
    spec(s) {
      return '<div class="table-scroll"><table class="agf-spec">' + (s.caption ? '<caption><p class="agf-eyebrow agf-eyebrow--brass">' + inline(s.caption) + '</p></caption>' : '') +
        '<thead><tr><th>Parameter</th><th>Value</th><th>Conditions</th></tr></thead><tbody>' +
        (s.rows || []).map((r) => '<tr><th>' + inline(r[0]) + '</th><td>' + inline(r[1]) + (r[2] ? ' <span class="u">' + inline(r[2]) + '</span>' : '') + '</td><td>' + inline(r[3] || '') + '</td></tr>').join('') +
        '</tbody></table></div>';
    },
    timeline(s) {
      return '<ol class="timeline">' + (s.items || []).map((i) => '<li>' + (i.when ? '<div class="when">' + inline(i.when) + '</div>' : '') + '<h4>' + inline(i.title) + '</h4>' + (i.body ? '<div class="agf-body">' + md(i.body) + '</div>' : '') + (i.tag ? '<div class="tag">' + inline(i.tag) + '</div>' : '') + '</li>').join('') + '</ol>';
    },
    steps(s) {
      return '<ol class="steps">' + (s.items || []).map((i) => '<li><div>' + (i.title ? '<h4>' + inline(i.title) + '</h4>' : '') + '<div class="agf-body">' + md(i.body) + '</div></div></li>').join('') + '</ol>';
    },
    compare(s) {
      const [a, b] = s.columns || ['A', 'B'];
      return '<div class="compare"><div class="row head"><div class="cat"></div><div class="agf-eyebrow agf-eyebrow--brass">' + inline(a) + '</div><div class="agf-eyebrow agf-eyebrow--brass">' + inline(b) + '</div></div>' +
        (s.rows || []).map((r) => '<div class="row"><div class="cat">' + inline(r.category) + '</div><div class="cell">' + inline(r.a) + '</div><div class="cell">' + inline(r.b) + '</div>' + (r.insight ? '<div class="insight">' + inline(r.insight) + '</div>' : '') + '</div>').join('') + '</div>';
    },
    pipeline(s) {
      return '<div class="pipeline">' + (s.stages || []).map((st) => '<div class="stage"><h4>' + inline(st.name) + '</h4><p>' + inline(st.description) + '</p></div>').join('') + '</div>';
    },
    metrics(s) {
      return '<div class="readouts">' + (s.items || []).map((m) => '<div class="agf-readout">' + (s.orbit === false ? '' : ORBIT) + '<div class="agf-readout__num">' + inline(m.value) + (m.unit ? '<span class="agf-readout__unit">' + inline(m.unit) + '</span>' : '') + '</div><p class="agf-readout__label agf-eyebrow">' + inline(m.label) + (m.conditions ? '<span class="cond">' + inline(m.conditions) + '</span>' : '') + '</p></div>').join('') + '</div>';
    },
    figures(s) {
      return '<div class="figs">' + (s.items || []).map((f) => '<figure class="fig"><img loading="lazy" src="' + esc(ASSETS + String(f.src).replace(/^assets\//, '')) + '" alt="' + esc(f.alt || f.caption || '') + '">' + (f.caption ? '<figcaption class="agf-caption">' + inline(f.caption) + '</figcaption>' : '') + '</figure>').join('') + '</div>';
    },
    html(s) { return s.html || ''; }
  };

  function section(s, idx) {
    const id = s.id || slug(s.title || ('section-' + idx));
    const fn = R[s.type] || R.prose;
    let h = '<section class="sec" id="' + esc(id) + '" data-reveal>';
    if (s.eyebrow || s.title || s.lede) {
      h += '<div class="sec-head">';
      if (s.eyebrow) h += '<p class="agf-eyebrow agf-eyebrow--brass">' + inline(s.eyebrow) + '</p>';
      if (s.title) h += '<h2 class="agf-h3">' + inline(s.title) + assumed(s._assumed) + '</h2>';
      if (s.lede) h += '<p class="agf-lede">' + inline(s.lede) + '</p>';
      h += '</div>';
    }
    h += fn(s);
    if (s.note) h += note(s.note);
    return h + '</section>';
  }

  // ---------- chrome ----------
  function nav(site, opt, prev, next) {
    const links = [
      ['Home', ROOT + 'index.html', PAGE === 'portal']
    ];
    if (opt) {
      links.push([opt.short || opt.title, './intro.html', PAGE === 'intro']);
      links.push(['Deep dive', './deep.html', PAGE === 'deep']);
    }
    let h = '<div class="site-nav"><nav class="agf-nav agf-deep" data-theme="midnight">' +
      '<a class="agf-wordmark agf-wordmark--sm" href="' + ROOT + 'index.html" aria-label="AGF home"><span class="agf-wordmark__mark">AGF</span></a>' +
      '<span class="nav-tag">' + inline(site.brand.nav_tagline) + '</span>' +
      '<div class="agf-nav__links">' + links.map((l) => '<a class="agf-nav__link' + (l[2] ? ' is-active' : '') + '" href="' + l[1] + '">' + inline(l[0]) + '</a>').join('') + '</div>' +
      '<div class="nav-right">';
    if (prev) h += '<a class="agf-btn agf-btn--quiet nav-prevnext" href="../' + prev.slug + '/' + (PAGE === 'deep' ? 'deep' : 'intro') + '.html" title="' + esc(prev.title) + '">←</a>';
    if (next) h += '<a class="agf-btn agf-btn--quiet nav-prevnext" href="../' + next.slug + '/' + (PAGE === 'deep' ? 'deep' : 'intro') + '.html" title="' + esc(next.title) + '">→</a>';
    h += '<button type="button" class="agf-btn agf-btn--secondary" id="notesToggle" aria-pressed="true">Notes</button></div></nav></div>';
    return h;
  }

  function footer(site) {
    return '<footer class="agf-deep site-foot" data-theme="midnight"><div class="wrap"><div class="row">' +
      '<div><div class="agf-wordmark"><span class="agf-wordmark__mark">AGF</span><span class="agf-wordmark__strap"><span>All</span><span>Grounds</span><span>Floating</span></span></div>' +
      '<p class="agf-caption" style="margin-top:var(--space-16)">' + inline(site.brand.meta) + '</p></div>' +
      '<div class="badge-line">' + GROUND(32, 'var(--brass-text)') + '<div><p class="agf-caption" style="color:var(--ink-on-deep)">' + inline(site.brand.strapline) + '</p><p class="agf-caption">' + inline(site.brand.certificate_line) + '</p></div></div>' +
      '</div><hr class="agf-rule" style="margin:var(--space-32) 0 var(--space-16)"><p class="agf-caption">' + inline(site.brand.sources) + '</p></div></footer>';
  }

  // ---------- pages ----------
  function portal(site) {
    const b = site.brand;
    let h = '<section class="band band--deep agf-deep agf-trace agf-grain hero" data-theme="midnight">' + TRACE + '<div class="wrap">' +
      '<div class="thesis"><div><p class="agf-strapline agf-strapline--small">' + inline(b.strapline) + '</p><h1>' + inline(b.portal_headline) + '</h1></div>' +
      '<div><p class="agf-lede">' + inline(b.portal_lede) + '</p><div class="actions"><a class="agf-btn agf-btn--primary agf-btn--lg" href="' + site.options[0].slug + '/intro.html">Start with the brand</a><a class="agf-btn agf-btn--quiet" href="#options">Nine doors →</a></div></div></div>' +
      '</div></section>';
    h += '<section class="band" id="options"><div class="wrap"><p class="agf-eyebrow agf-eyebrow--brass">The reference site</p><h2 class="agf-display" style="margin:var(--space-8) 0 0">' + inline(b.portal_section_title) + '</h2><hr class="agf-rule agf-rule--rule agf-rule--short" style="margin:var(--space-24) 0"><p class="agf-lede" style="max-width:640px">' + inline(b.portal_section_lede) + '</p>' +
      '<div class="portal" style="margin-top:var(--space-48)">' + site.options.map((o) => '<a class="agf-card" href="' + o.slug + '/intro.html" data-reveal><span class="num">' + esc(o.number) + '</span><p class="agf-eyebrow">' + inline(o.eyebrow) + '</p><h3>' + inline(o.title) + '</h3><p class="agf-body">' + inline(o.summary) + '</p><span class="links"><span>Intro →</span><span style="color:var(--ink-faint)">Deep dive</span></span></a>').join('') + '</div></div></section>';
    h += '<section class="band band--tight" style="background:var(--surface-raised)"><div class="wrap"><div class="cards cards--2">' + (b.portal_notes || []).map((n) => '<div class="agf-card"><p class="agf-eyebrow agf-eyebrow--brass">' + inline(n.title) + '</p><div class="agf-body">' + md(n.body) + '</div></div>').join('') + '</div></div></section>';
    return h;
  }

  function intro(site, opt, c, next) {
    const i = c.intro;
    let h = '<section class="band band--deep agf-deep agf-trace agf-grain hero" data-theme="midnight">' + TRACE + '<div class="wrap">' +
      '<p class="agf-eyebrow">' + esc(opt.number) + ' · ' + inline(opt.eyebrow) + '</p><h1>' + inline(i.headline) + '</h1><p class="agf-lede">' + inline(i.lede) + '</p>' +
      '<div class="actions"><a class="agf-btn agf-btn--primary agf-btn--lg" href="./deep.html">Read the deep dive</a>' + (next ? '<a class="agf-btn agf-btn--quiet" href="../' + next.slug + '/intro.html">Next: ' + inline(next.title) + ' →</a>' : '') + '</div>' +
      '</div></section>';
    if (i.points && i.points.length) h += '<section class="band"><div class="wrap"><div class="points">' + i.points.map((p) => '<div class="agf-card" data-reveal><p class="agf-eyebrow agf-eyebrow--brass">' + inline(p.eyebrow || '') + '</p><h3>' + inline(p.title) + '</h3><div class="agf-body">' + md(p.body) + '</div></div>').join('') + '</div>' + note(i.note) + '</div></section>';
    if (i.metrics && i.metrics.length) h += '<section class="band band--tight" style="background:var(--surface-raised)"><div class="wrap" data-reveal>' + R.metrics({ items: i.metrics }) + (i.metrics_note ? '<p class="agf-caption" style="margin-top:var(--space-24)">' + inline(i.metrics_note) + '</p>' : '') + '</div></section>';
    if (i.quote) h += '<section class="band"><div class="wrap" data-reveal>' + R.quote(i.quote) + '</div></section>';
    const secs = (c.deep && c.deep.sections) || [];
    h += '<section class="band band--tight" style="border-top:1px solid var(--brass-hairline)"><div class="wrap"><p class="agf-eyebrow agf-eyebrow--brass">In the deep dive</p><div class="contents" style="margin-top:var(--space-16)"><ol>' + secs.filter((s) => s.title).map((s, k) => '<li><a href="./deep.html#' + esc(s.id || slug(s.title)) + '"><span class="n">' + String(k + 1).padStart(2, '0') + '</span>' + inline(s.title) + '</a></li>').join('') + '</ol></div><div class="actions" style="margin-top:var(--space-32)"><a class="agf-btn agf-btn--primary" href="./deep.html">Open the deep dive</a></div></div></section>';
    return h;
  }

  function deep(site, opt, c, prev, next) {
    const d = c.deep;
    const secs = d.sections || [];
    let h = '<section class="band band--tight"><div class="wrap"><p class="agf-eyebrow agf-eyebrow--brass">' + esc(opt.number) + ' · ' + inline(opt.eyebrow) + ' · Deep dive</p><h1 class="agf-display" style="margin:var(--space-8) 0 0">' + inline(d.headline) + '</h1><hr class="agf-rule agf-rule--rule agf-rule--short" style="margin:var(--space-24) 0"><p class="agf-lede" style="max-width:640px">' + inline(d.lede) + '</p>' + note(d.note) + '</div></section>';
    h += '<div class="wrap"><div class="deep-layout"><aside class="toc" aria-label="Contents"><p class="agf-eyebrow" style="margin:0 0 var(--space-8) var(--space-16)">Contents</p><ol>' + secs.filter((s) => s.title).map((s) => '<li><a href="#' + esc(s.id || slug(s.title)) + '">' + inline(s.title) + '</a></li>').join('') + '</ol></aside>' +
      '<div class="deep-body">' + secs.map(section).join('') + '</div></div></div>';
    h += '<section class="band"><div class="wrap"><div class="prevnext">' +
      (prev ? '<a href="../' + prev.slug + '/deep.html"><p class="agf-eyebrow">← Previous · ' + esc(prev.number) + '</p><h4>' + inline(prev.title) + '</h4></a>' : '<span></span>') +
      (next ? '<a class="next" href="../' + next.slug + '/deep.html"><p class="agf-eyebrow">Next · ' + esc(next.number) + ' →</p><h4>' + inline(next.title) + '</h4></a>' : '<span></span>') +
      '</div></div></section>';
    return h;
  }

  // ---------- behaviours ----------
  function reveal() {
    const items = document.querySelectorAll('[data-reveal]');
    if (!('IntersectionObserver' in window)) { items.forEach((n) => n.classList.add('is-in')); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e, k) => { if (e.isIntersecting) { setTimeout(() => e.target.classList.add('is-in'), Math.min(k, 6) * 60); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -10% 0px' });
    items.forEach((n) => io.observe(n));
  }
  function tocSpy() {
    const links = Array.from(document.querySelectorAll('.toc a'));
    if (!links.length || !('IntersectionObserver' in window)) return;
    const map = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { links.forEach((a) => a.classList.remove('is-active')); const a = map.get(e.target.id); if (a) a.classList.add('is-active'); } });
    }, { rootMargin: '-20% 0px -70% 0px' });
    document.querySelectorAll('.sec[id]').forEach((s) => io.observe(s));
  }
  function notesToggle() {
    const b = document.getElementById('notesToggle');
    if (!b) return;
    let on = true;
    try { on = localStorage.getItem('agf-notes') !== 'off'; } catch (e) { /* storage may be unavailable */ }
    const apply = () => { body.classList.toggle('notes-off', !on); b.setAttribute('aria-pressed', String(on)); b.textContent = on ? 'Notes: on' : 'Notes: off'; };
    apply();
    b.addEventListener('click', () => { on = !on; try { localStorage.setItem('agf-notes', on ? 'on' : 'off'); } catch (e) { /* ignore */ } apply(); });
  }

  // ---------- boot ----------
  async function load(path) {
    const r = await fetch(path, { cache: 'no-store' });
    if (!r.ok) throw new Error(path + ' → HTTP ' + r.status);
    return r.json();
  }
  async function main() {
    const mountNav = document.getElementById('nav');
    const mountMain = document.getElementById('main');
    const mountFoot = document.getElementById('foot');
    try {
      const site = await load(ROOT + 'site.json');
      const opts = site.options;
      const idx = opts.findIndex((o) => o.slug === OPTION);
      const opt = idx >= 0 ? opts[idx] : null;
      const prev = idx > 0 ? opts[idx - 1] : null;
      const next = idx >= 0 && idx < opts.length - 1 ? opts[idx + 1] : null;
      let content = null;
      if (PAGE !== 'portal') content = await load('./content.json');
      mountNav.innerHTML = nav(site, opt, prev, next);
      if (PAGE === 'portal') mountMain.innerHTML = portal(site);
      else if (PAGE === 'intro') mountMain.innerHTML = intro(site, opt, content, next);
      else mountMain.innerHTML = deep(site, opt, content, prev, next);
      mountFoot.innerHTML = footer(site);
      mountMain.removeAttribute('aria-busy');
      reveal(); tocSpy(); notesToggle();
      if (location.hash) { const t = document.getElementById(location.hash.slice(1)); if (t) t.scrollIntoView(); }
    } catch (err) {
      mountMain.innerHTML = '<div class="loadfail"><p class="agf-eyebrow agf-eyebrow--brass">Content did not load</p><h1 class="agf-h3">This page reads its copy from JSON files, and browsers refuse that over <code>file://</code>.</h1><p class="agf-body" style="margin-top:var(--space-16)">Run <code>./serve.sh</code> in the <code>production-staging/site</code> folder, then open <code>http://localhost:8787/site/</code>. Error: <code>' + esc(err.message) + '</code></p></div>';
      mountMain.removeAttribute('aria-busy');
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', main); else main();
})();
