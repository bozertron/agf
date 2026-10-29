/* AGF www — the glue. Every page is its own app: its data sits inline in <script type="application/json" id="db">,
   this file draws the shared header and footer, cycles panel media, handles email capture and the home page's
   strapline reveal. No fetch, no router: pages are folders and links are relative. Works from file:// and any static host. */
(function () {
  'use strict';
  var root = document.body.getAttribute('data-root') || './';   // path back to the www folder, e.g. "../" from a page folder
  var dbEl = document.getElementById('db');
  var DB = dbEl ? JSON.parse(dbEl.textContent) : {};
  window.DB = DB;
  var esc = function (s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); };
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var GROUND = '<svg viewBox="0 0 80 80" fill="none" stroke-linecap="round" role="img" aria-label="Floating ground"><g stroke="currentColor" stroke-width="1"><path d="M46.25 4.55A36 36 0 1 1 6.17 52.31"/><path d="M4.55 33.75A36 36 0 0 1 27.69 6.17"/></g><g stroke="currentColor" stroke-width="2"><line x1="40" y1="22" x2="40" y2="40"/><line x1="24" y1="40" x2="56" y2="40"/><line x1="29" y1="47" x2="51" y2="47"/><line x1="34" y1="54" x2="46" y2="54"/></g></svg>';

  // ---------- header ----------
  function header() {
    var h = document.getElementById('hdr'); if (!h) return;
    var isHome = document.body.getAttribute('data-page') === 'home';
    h.className = 'hdr';
    h.innerHTML =
      '<a class="hdr__mark" href="' + root + 'index.html" aria-label="AGF home">AGF</a>' +
      '<span class="hdr__word hdr__word--l">acoustics-tech unlocks</span>' +
      (isHome ? '<button type="button" class="hdr__strap" id="strap" aria-pressed="false">Even Rails. Smooth Tracks.</button>'
              : '<a class="hdr__strap" href="' + root + 'index.html">Even Rails. Smooth Tracks.</a>') +
      '<span class="hdr__word hdr__word--r">globally, rise with us.</span>' +
      '<a class="hdr__ground" href="' + root + 'concierge/index.html" aria-label="Concierge">' + GROUND + '</a>';
    if (isHome) {
      var strap = document.getElementById('strap');
      var mark = h.querySelector('.hdr__mark');
      var setPower = function (on) {
        document.body.classList.toggle('is-power', on);
        strap.setAttribute('aria-pressed', String(on));
        var home = document.getElementById('layer-home'), power = document.getElementById('layer-power');
        if (home && power) { home.className = 'layer ' + (on ? 'is-off' : 'is-on'); power.className = 'layer ' + (on ? 'is-on' : 'is-off'); }
      };
      strap.addEventListener('click', function () { setPower(!document.body.classList.contains('is-power')); });
      mark.addEventListener('click', function (e) { if (document.body.classList.contains('is-power')) { e.preventDefault(); setPower(false); } });
    }
  }

  // ---------- footer ----------
  function footer() {
    var f = document.getElementById('ftr'); if (!f) return;
    f.className = 'ftr';
    f.innerHTML = '<span>' + esc(DB.footer || '© AGF. All grounds reserved') + '</span><span>All Grounds Floating</span>';
  }

  // ---------- media cycling ----------
  // A panel's media list: [{type:"image"|"video", src:"...", alt:"..."}]. Images crossfade every `every` ms; a video plays
  // through and the next item follows when it ends (a looping video with no siblings simply loops).
  function cycle(el, items, every) {
    if (!items || !items.length) return;
    var nodes = items.map(function (m) {
      var n;
      if (m.type === 'video') { n = document.createElement('video'); n.src = m.src; n.muted = true; n.playsInline = true; n.autoplay = false; n.loop = items.length === 1; n.preload = 'metadata'; }
      else { n = document.createElement('img'); n.src = m.src; n.alt = m.alt || ''; n.loading = 'lazy'; }
      el.appendChild(n); return n;
    });
    var i = 0, timer = null;
    function show(k) {
      nodes.forEach(function (n, j) { n.classList.toggle('is-current', j === k); if (n.tagName === 'VIDEO') { if (j === k) { n.currentTime = 0; n.play().catch(function () {}); } else { n.pause(); } } });
      clearTimeout(timer);
      if (nodes.length > 1 && !reduced) {
        if (nodes[k].tagName === 'VIDEO') nodes[k].onended = function () { show((k + 1) % nodes.length); };
        else timer = setTimeout(function () { show((k + 1) % nodes.length); }, every || 6000);
      }
    }
    show(0);
  }
  function panels() {
    var list = document.querySelectorAll('[data-media]');
    Array.prototype.forEach.call(list, function (el) {
      var key = el.getAttribute('data-media');
      var items = (DB.media && DB.media[key]) || [];
      var holder = el.querySelector('.panel__media');
      if (holder && items.length) { el.classList.add('has-media'); cycle(holder, items, +el.getAttribute('data-every') || (DB.cycle_ms || 6000)); }
    });
  }

  // ---------- email capture ----------
  // DB.capture = { endpoint: "https://..." (optional POST target, JSON body {email, list}), mailto: "you@domain", list: "early-access" }
  function capture() {
    var boxes = document.querySelectorAll('.capture');
    Array.prototype.forEach.call(boxes, function (box) {
      var form = box.querySelector('form'), msg = box.querySelector('.msg'); if (!form) return;
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var email = form.querySelector('input[type=email]').value.trim();
        var list = box.getAttribute('data-list') || (DB.capture && DB.capture.list) || 'general';
        var c = DB.capture || {};
        if (c.endpoint) {
          fetch(c.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email, list: list, page: location.pathname }) })
            .then(function (r) { if (!r.ok) throw new Error(r.status); msg.textContent = 'Thank you. We will be in touch.'; msg.className = 'msg is-ok'; form.reset(); })
            .catch(function () { msg.textContent = 'That did not send. Try again, or write to ' + (c.mailto || 'us') + '.'; msg.className = 'msg'; });
        } else {
          var to = c.mailto || '';
          location.href = 'mailto:' + to + '?subject=' + encodeURIComponent('[' + list + '] ' + email) + '&body=' + encodeURIComponent('Please add ' + email + ' to ' + list + '.');
          msg.textContent = 'Your mail app should open with the request ready to send.'; msg.className = 'msg is-ok';
        }
      });
    });
    // "Apply" style buttons that reveal a capture box
    Array.prototype.forEach.call(document.querySelectorAll('[data-reveal-capture]'), function (b) {
      b.addEventListener('click', function () { var t = document.getElementById(b.getAttribute('data-reveal-capture')); if (t) { t.classList.remove('is-hidden'); var inp = t.querySelector('input'); if (inp) inp.focus(); } });
    });
  }

  function boot() { header(); footer(); panels(); capture(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
