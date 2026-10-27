#!/usr/bin/env python3
"""Build the Globl Radio design-system package.

Run from the package folder:  python3 -I build/build.py
Regenerates: assets/Logos/*.svg (from assets/Logos/source/*.eps), assets/Icons/*.svg,
globl.css (agf.css + globl-layer.css), tokens.json, tokens.css, components/*/{preview.html,README.md},
index.html, design-system.json and, when Playwright is importable from node, the preview-*.png sheets.
Hand-written files it never touches: README.md, 02-applications.md, 03-motion.md, HOW-TO-USE.md, globl-layer.css.
"""
import os, re, json, hashlib, random, subprocess, sys, shutil

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AGF = os.path.normpath(os.path.join(HERE, "..", "agf-design-system", "agf-design-system"))
os.chdir(HERE)

def write(path, s):
    os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(s)

# ----------------------------------------------------------------------------
# 1. Marks from the designer's EPS (Illustrator page body: mo / li / cv / cp / f)
def eps_paths(path):
    txt = open(path, "rb").read().decode("latin-1")
    body = txt.split("%%EndPageSetup", 1)[1].split("%%PageTrailer", 1)[0]
    paths, cur, sub, color = [], [], [], None
    for line in body.split("\n"):
        t = line.strip().split()
        if not t:
            continue
        op = t[-1]
        if op == "mo": sub = ["M %s %s" % (t[0], t[1])]
        elif op == "li": sub.append("L %s %s" % (t[0], t[1]))
        elif op == "cv": sub.append("C %s %s %s %s %s %s" % tuple(t[:6]))
        elif op == "cp": sub.append("Z"); cur.append(" ".join(sub)); sub = []
        elif op == "clp": cur, sub = [], []
        elif op == "cmyk": color = tuple(float(x) for x in t[:4])
        elif op == "f":
            if cur and color and max(color) > 0.5:   # the artwork is rich black; the page rect is white
                paths.append(" ".join(cur))
            cur, sub = [], []
    return paths

def bbox(paths):
    nums = [float(x) for p in paths for x in re.findall(r"-?\d+\.?\d*(?:e-?\d+)?", p)]
    xs, ys = nums[0::2], nums[1::2]
    return min(xs), min(ys), max(xs), max(ys)

def round_path(d, x0, y0):
    out = []
    for tok in d.split(" "):
        try:
            v = float(tok)
            out.append(("%.2f" % v).rstrip("0").rstrip("."))
        except ValueError:
            out.append(tok)
    return " ".join(out)

def shift(d, dx, dy):
    """Translate every coordinate pair in an absolute-only path (M/L/C/Z)."""
    toks = d.split(" "); out = []; i = 0
    while i < len(toks):
        t = toks[i]
        if t in ("M", "L"):
            out += [t, "%.2f" % (float(toks[i+1]) + dx), "%.2f" % (float(toks[i+2]) + dy)]; i += 3
        elif t == "C":
            vals = [float(v) for v in toks[i+1:i+7]]
            out += ["C"] + ["%.2f" % (v + (dx if k % 2 == 0 else dy)) for k, v in enumerate(vals)]; i += 7
        else:
            out.append(t); i += 1
    return " ".join(out).replace(".00", "")

SRC_MARK = "assets/Logos/source/3-logofinal-mark02.1.eps"
SRC_LOCKUP = "assets/Logos/source/3-logofinal-mark02.2.eps"
mark_paths = eps_paths(SRC_MARK)
lockup_paths = eps_paths(SRC_LOCKUP)
x0, y0, x1, y1 = bbox(mark_paths)
W, H = x1 - x0, y1 - y0
MARK_D = shift(" ".join(mark_paths), -x0, -y0)
LOCKUP_D = shift(" ".join(lockup_paths), -x0, -y0)
VB = "0 0 %.2f %.2f" % (W, H)

COLOURS = {"brass": "#B8860B", "ink": "#0E1612", "bone": "#E9E2D4"}

def mark_svg(d, fill, label):
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="%s" role="img" aria-label="%s">'
            '<path fill="%s" fill-rule="nonzero" d="%s"/></svg>' % (VB, label, fill, d))

def ring_svg(rings, fill, lamp=False):
    circles = "".join('<circle cx="50" cy="50" r="%d"/>' % r for r in rings)
    lampel = '<circle cx="50" cy="50" r="5" fill="%s" stroke="none"/>' % fill if lamp else ""
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="%s" stroke-width="2" role="img" aria-label="Globl Radio ring">'
            '%s%s</svg>' % (fill, circles, lampel))

for name, fill in COLOURS.items():
    suffix = "" if name == "brass" else "-" + name
    write("assets/Logos/gr-mark%s.svg" % suffix, mark_svg(MARK_D, fill, "Globl Radio"))
    write("assets/Logos/gr-lockup%s.svg" % suffix, mark_svg(LOCKUP_D, fill, "Globl Radio"))
    write("assets/Logos/gr-ring%s.svg" % suffix, ring_svg([48, 42, 36, 30, 24], fill))
    write("assets/Logos/gr-ring-small%s.svg" % suffix, ring_svg([48, 36, 24], fill))

write("assets/Logos/README.md", """# Logos

Delivered in brass (#B8860B) for dark grounds, ink (#0E1612, files ending `-ink`) for paper, and bone (#E9E2D4, `-bone`) for reversing out of photography under a scrim. Recolour by inlining the SVG and setting `fill`; as an `<img>` they stay as delivered. One colour per mark, always.

- `gr-mark.svg` — the monogram: G and R in five lines inside five rings, converted from Melvin Galapon's 2016 Illustrator file (`source/3-logofinal-mark02.1.eps`). The primary mark; 72px / 20 mm minimum.
- `gr-lockup.svg` — the monogram with GLOBL RADIO in the designer's outlined capitals inside the rings (`source/3-logofinal-mark02.2.eps`). 160px / 40 mm minimum; below that the monogram alone.
- `gr-ring.svg` — five concentric rings derived from the monogram, 2px strokes on a 100-unit box. The small-size and status form; 48px / 12 mm minimum.
- `gr-ring-small.svg` — three rings, for 24 to 48px. At 16px use one ring with a lamp (the Ring component draws it).
- `source/` — the two EPS originals. The designer's reversed versions (mark03.1, mark03.2) are the same geometry in white on black and are not kept; the `-bone` files serve that purpose.
""")

# ----------------------------------------------------------------------------
# 2. Icons: AGF's ten copied, four added at the same grid and stroke
ICON_HEAD = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#B8860B" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="%s">%s</svg>'
NEW_ICONS = {
    "globe": '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="3.5" ry="9"/><path d="M3 12h18M4.5 7.5h15M4.5 16.5h15"/>',
    "ticket": '<path d="M4 8a2 2 0 0 0 2-2h12a2 2 0 0 0 2 2v2.5a1.5 1.5 0 0 0 0 3V16a2 2 0 0 0-2 2H6a2 2 0 0 0-2-2v-2.5a1.5 1.5 0 0 0 0-3z"/><path d="M14.5 7v1.5M14.5 11.25v1.5M14.5 15.5V17" stroke-dasharray="1.5 1.5"/>',
    "clock": '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
    "venue": '<path d="M4 20V11a8 8 0 0 1 16 0v9"/><path d="M2.5 20h19M9 20v-5a3 3 0 0 1 6 0v5"/>',
}
os.makedirs("assets/Icons", exist_ok=True)
for f in os.listdir(os.path.join(AGF, "assets", "Icons")):
    if f.endswith(".svg"):
        shutil.copy(os.path.join(AGF, "assets", "Icons", f), os.path.join("assets", "Icons", f))
for name, body in NEW_ICONS.items():
    write("assets/Icons/%s.svg" % name, ICON_HEAD % (name, body))
write("assets/Icons/README.md", """# Icons

AGF's ten line icons (24px grid, 1.5px stroke, round caps and joins, brass) plus four for a live service, drawn to the same rules. Inline and set `stroke` to `brass`, `brass-text`, `ink-faint`, or `live` only beside a live state; use at 16, 20 or 24px beside a label with a `space-8` gap. No filled icons, no emoji.

AGF: mic · headphones · waveform · broadcast · record · play · gain · ground · phantom · spark
Globl Radio: globe · ticket · clock · venue
""")

# fonts: same three faces
os.makedirs("fonts", exist_ok=True)
for f in os.listdir(os.path.join(AGF, "fonts")):
    shutil.copy(os.path.join(AGF, "fonts", f), os.path.join("fonts", f))

# ----------------------------------------------------------------------------
# 3. Stylesheets and tokens
agf_css = open(os.path.join(AGF, "agf.css"), encoding="utf-8").read()
layer = open("globl-layer.css", encoding="utf-8").read()
write("globl.css", agf_css.rstrip() + "\n\n" + layer)

LIVE_TOKENS = [
    ("live", {"midnight": "#e0523a", "daylight": "#d2452d", "air": "#e0523a"}, "AGF's signal-clip promoted to the sub-brand's second voice. Fills the ON AIR lamp, the live ring, the play control while on air. Only where something is live now."),
    ("live-glow", {"midnight": "#f0765f", "daylight": "#e0523a", "air": "#f0765f"}, "The lit state of live: hover on the live play control, the lamp's bright phase."),
    ("live-text", {"midnight": "#f28b76", "daylight": "#a8341f", "air": "#f28b76"}, "The word live, the live time in a schedule, the countdown at zero. Holds 4.5:1 on surface in every theme."),
    ("live-hairline", {"midnight": "rgba(224,82,58,0.32)", "daylight": "rgba(210,69,45,0.4)", "air": "rgba(224,82,58,0.32)"}, "A live trace or border, used only beside live content."),
    ("on-live", {"midnight": "#0e1612", "daylight": "#fbf9f4", "air": "#0e1612"}, "Text on a live fill. Never white in Midnight or Air."),
    ("shadow-live", {"midnight": "0 0 16px rgba(224,82,58,0.55)", "daylight": "0 0 12px rgba(224,82,58,0.35)", "air": "0 0 16px rgba(224,82,58,0.55)"}, "The glow of a lit live lamp or solid ON AIR badge. Nothing else glows red."),
]
MISC_TOKENS = [
    ("opacity-stave", {"midnight": "0.22", "daylight": "0.3", "air": "0.22"}, "The stave's opacity over surface-deep (Midnight, Air) or over bone (Daylight)."),
    ("stave-pitch", {"midnight": "6px", "daylight": "6px", "air": "6px"}, "Distance between the five lines of a stave. Fixed at every width."),
    ("stave-group", {"midnight": "72px", "daylight": "72px", "air": "72px"}, "Distance between staves when tiled. 48px under 640px."),
]
tokens = {
    "name": "Globl Radio",
    "version": 1,
    "extends": "All Grounds Floating (../agf-design-system/agf-design-system/tokens.json). Every token not listed here is AGF's, unchanged, in all three themes.",
    "color": {
        "note": "Air is Globl Radio's native theme (the player and anything running while a performance is on). Midnight for the site and portal. Daylight for printed tickets and press.",
        "themes": [{"id": "midnight", "name": "Midnight"}, {"id": "daylight", "name": "Daylight"}, {"id": "air", "name": "Air (OLED)"}],
        "tokens": [{"name": n, "value": v, "usage": u} for n, v, u in LIVE_TOKENS],
    },
    "texture": {"tokens": [{"name": n, "value": v, "usage": u} for n, v, u in MISC_TOKENS]},
    "marks": {"monogram_min_px": 72, "lockup_min_px": 160, "ring_min_px": 48, "clear_space": "one ring width on every side"},
}
write("tokens.json", json.dumps(tokens, indent=2) + "\n")
tc = ["/* Globl Radio — tokens added to AGF's. Load after agf.css or tokens.css from the AGF package. */"]
for theme, sel in (("midnight", ':root, [data-theme="midnight"]'), ("daylight", '[data-theme="daylight"]'), ("air", '[data-theme="air"]')):
    tc.append(sel + " {")
    for n, v, _ in LIVE_TOKENS + MISC_TOKENS:
        tc.append("  --%s: %s;" % (n, v[theme]))
    tc.append("}")
write("tokens.css", "\n".join(tc) + "\n")

# ----------------------------------------------------------------------------
# 4. Component snippets
def MARK(cls="gr-mark gr-mark--md", lockup=False, style=""):
    return '<span class="%s"%s><svg viewBox="%s" role="img" aria-label="Globl Radio"><path d="%s"/></svg></span>' % (cls, (' style="%s"' % style) if style else "", VB, LOCKUP_D if lockup else MARK_D)

def RING(cls="gr-ring", rings=(48, 42, 36, 30, 24), dash=True, lamp=True):
    cs = "".join('<circle cx="50" cy="50" r="%d"%s/>' % (r, ' class="dash"' if (dash and i == 0) else "") for i, r in enumerate(rings))
    return '<span class="%s"><svg viewBox="0 0 100 100">%s%s</svg></span>' % (cls, cs, '<circle class="lamp" cx="50" cy="50" r="5"/>' if lamp else "")

AGF_WORDMARK = '<span class="agf-wordmark" style="color:var(--brass)"><span class="agf-wordmark__mark">AGF</span><span class="agf-wordmark__strap"><span>All</span><span>Grounds</span><span>Floating</span></span></span>'
GROUND = '<svg width="24" height="24" viewBox="0 0 80 80" fill="none" stroke-linecap="round" role="img" aria-label="Floating ground"><g stroke="var(--brass-text)" stroke-width="1"><path d="M46.25 4.55A36 36 0 1 1 6.17 52.31"/><path d="M4.55 33.75A36 36 0 0 1 27.69 6.17"/></g><g stroke="var(--brass-text)" stroke-width="2"><line x1="40" y1="22" x2="40" y2="40"/><line x1="24" y1="40" x2="56" y2="40"/><line x1="29" y1="47" x2="51" y2="47"/><line x1="34" y1="54" x2="46" y2="54"/></g></svg>'
PLAY_ICON = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg>'
PAUSE_ICON = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>'

def wave_points(n=160, seed=7, w=640, h=96):
    rnd = random.Random(seed); pts = []; v = 0.0
    for i in range(n):
        v = v * 0.72 + rnd.uniform(-1, 1) * 0.5
        env = 0.35 + 0.65 * abs(__import__("math").sin(i / 17.0)) * (0.6 + 0.4 * abs(__import__("math").sin(i / 5.3)))
        pts.append((w * i / (n - 1), h / 2 - v * env * h * 0.42))
    return pts

def WAVE(cls="gr-wave", live=True, head_at=0.7, seed=7, h=96, draw=False):
    w = 640; pts = wave_points(seed=seed, h=h)
    line = " ".join("%.1f,%.1f" % p for p in pts)
    fill = "0,%.1f " % (h / 2) + line + " %d,%.1f" % (w, h / 2)
    stave = "".join('<line class="stave" x1="0" x2="%d" y1="%.1f" y2="%.1f"/>' % (w, h / 2 + k * 6, h / 2 + k * 6) for k in (-2, -1, 0, 1, 2))
    head = ""
    if live:
        hx = w * head_at
        head = '<line class="head" x1="%.1f" x2="%.1f" y1="8" y2="%d"/><circle class="head-dot" cx="%.1f" cy="%.1f" r="3.5"/>' % (hx, hx, h - 8, hx, pts[int(head_at * (len(pts) - 1))][1])
    c = cls + (" gr-wave--live" if live else "") + (" gr-wave--draw" if draw else "")
    return '<span class="%s"><svg viewBox="0 0 %d %d" preserveAspectRatio="none">%s<polygon class="fill" points="%s"/><polyline class="line" points="%s"/>%s</svg></span>' % (c, w, h, stave, fill, line, head)

def ONAIR(state="live", text=None):
    labels = {"live": "On air", "soon": "Goes live 21:00 EDT", "idle": "Was live", "solid": "On air"}
    cls = {"live": "gr-onair", "soon": "gr-onair gr-onair--soon", "idle": "gr-onair gr-onair--idle", "solid": "gr-onair gr-onair--solid"}[state]
    return '<span class="%s">%s</span>' % (cls, text or labels[state])

def COUNTDOWN(h="00", m="42", s="10", label="Live to air in", live=False, lg=False):
    cls = "gr-countdown" + (" gr-countdown--lg" if lg else "") + (" is-live" if live else "")
    return '<span class="%s"><span class="gr-countdown__num">%s<b>:</b>%s<b>:</b>%s</span><span class="gr-countdown__label">%s</span></span>' % (cls, h, m, s, label)

def CREDIT(artist="Charlotte Day Wilson"):
    return ('<div class="gr-credit">' + GROUND + '<p class="gr-credit__text"><b>%s.</b> The stereo master is the artist\'s. The broadcast mix is shared 50/50, in perpetuity. The artist may withdraw any broadcast, without cause.</p></div>' % artist)

def PLAYER(live=True, deep=True):
    return ('<div class="gr-player%s"%s>' % (" gr-player--deep" if deep else "", ' data-theme="air"' if deep else "") +
            '<div class="gr-player__art">' + RING("gr-ring" + (" is-live" if live else ""), rings=(48, 36, 24), lamp=False) + '</div>' +
            '<div class="gr-player__meta"><span class="gr-player__title">Charlotte Day Wilson · Trio</span><span class="gr-player__where">The Balcony · Toronto · 21:14 EDT · 02:14 BST for you</span>' +
            '<span class="gr-player__status">' + (ONAIR("live") if live else ONAIR("soon")) + '<span class="agf-caption" style="color:var(--ink-faint)">4,212 listening · 38 countries</span></span></div>' +
            '<div class="gr-player__controls"><button class="gr-play%s" aria-label="%s">%s</button></div>' % (" gr-play--live" if live else "", "Pause" if live else "Play", PAUSE_ICON if live else PLAY_ICON) +
            '<div class="gr-player__wave">' + WAVE("gr-wave", live=live, h=56) + '</div></div>')

SCHEDULE = ('<table class="gr-schedule"><thead><tr><th>Local time</th><th>Artist</th><th>Venue</th><th>State</th></tr></thead><tbody>'
            '<tr><td class="t">19:30<small>EDT</small></td><td class="act">Nick Fraser Quartet<small>Opening set</small></td><td class="venue">The Balcony · Toronto</td><td>' + ONAIR("idle") + '</td></tr>'
            '<tr class="is-live"><td class="t">21:00<small>EDT</small></td><td class="act">Charlotte Day Wilson · Trio<small>Broadcast mix · l\'Art</small></td><td class="venue">The Balcony · Toronto</td><td>' + ONAIR("live") + '</td></tr>'
            '<tr><td class="t">20:00<small>PST</small></td><td class="act">Hania Rani<small>Solo piano</small></td><td class="venue">The Green Room · Vancouver</td><td>' + ONAIR("soon", "Goes live 23:00 EDT") + '</td></tr>'
            '<tr><td class="t">22:30<small>GMT</small></td><td class="act">Yussef Dayes<small>Live session</small></td><td class="venue">Front of House · London</td><td>' + ONAIR("soon", "Tomorrow") + '</td></tr>'
            '</tbody></table>')

def VENUE(name="The Balcony", city="Toronto", tz="EDT", time="21:14", act="Charlotte Day Wilson · Trio", when="Tonight · 21:00 EDT", live=True):
    return ('<div class="gr-venue"><div class="gr-venue__head"><div><p class="agf-eyebrow agf-eyebrow--brass">Venue</p><h3 class="gr-venue__name">%s</h3><p class="gr-venue__city">%s · %s %s</p></div>%s</div>' % (name, city, time, tz, RING("gr-ring" + (" is-live" if live else ""))) +
            '<div class="gr-venue__act"><span class="who">%s</span><span class="when">%s</span></div>' % (act, when) +
            '<div class="gr-venue__foot">%s<a class="agf-btn %s" href="#">%s</a></div></div>' % (ONAIR("live") if live else ONAIR("soon", when.split("·")[-1].strip() if "·" in when else "Soon"), "agf-btn--primary" if live else "agf-btn--secondary", "Watch live" if live else "Virtual ticket"))

def TICKET(pass_=False):
    strap = "All access · in perpetuity" if pass_ else "Charlotte Day Wilson"
    return ('<div class="gr-ticket%s"><div class="gr-ticket__body"><div class="gr-ticket__head">%s%s</div>' % (" gr-ticket--pass" if pass_ else "", MARK("gr-mark gr-mark--sm"), RING("gr-ring", lamp=False)) +
            '<p class="gr-ticket__strap">%s</p>' % strap +
            '<p class="agf-caption" style="color:var(--ink-on-deep-muted);margin-top:var(--space-8)">%s</p>' % ("Permanent virtual all-access pass · issued with AGF hardware · № F1-00017" if pass_ else "Virtual ticket · broadcast mix · l'Art encoded") +
            '<dl class="gr-ticket__grid">' + ("<div><dt>Holder</dt><dd>B. Webster</dd></div><div><dt>Hardware</dt><dd>F-1 · № F1-00017</dd></div><div><dt>Valid</dt><dd>Every AGF venue, every night</dd></div>" if pass_ else
            "<div><dt>Venue</dt><dd>The Balcony · Toronto</dd></div><div><dt>Local time</dt><dd>Fri 14 Mar 2026<br>21:00 EDT</dd></div><div><dt>Price</dt><dd>$12 <span class=\"agf-caption\" style=\"color:var(--ink-on-deep-muted)\">set by the artist</span></dd></div>") + '</dl></div>' +
            '<div class="gr-ticket__stub"><span class="gr-ticket__serial">%s</span><span class="agf-caption">%s</span></div></div>' % ("PASS · F1-00017" if pass_ else "GR-2026-0314-0412", "Stereo master: the artist's · broadcast mix 50/50 in perpetuity"))

ENDORSE = ('<div class="gr-endorse">' + MARK("gr-mark gr-mark--md", lockup=True) + '<span class="gr-endorse__rule"></span><div>' + AGF_WORDMARK + '<p class="agf-caption">A live service of All Grounds Floating</p></div></div>')

STAVE_BAND = ('<div class="gr-stave agf-deep agf-grain" data-theme="midnight" style="min-height:260px;padding:var(--space-48);display:flex;flex-direction:column;justify-content:flex-end">'
              '<p class="agf-strapline agf-strapline--small" style="color:var(--brass)">Live to the global village</p>'
              '<h2 style="margin:var(--space-16) 0 0;font-size:56px;line-height:1.02;font-weight:200;max-width:640px">One room.<br>Broadcast everywhere.</h2></div>')

COMPONENTS = [
 ("Monogram", "Marks",
  "The primary mark: G and R in five lines inside five rings, as drawn in the designer's file and delivered in `assets/Logos/gr-mark.svg`. Inline it inside `.gr-mark` and the path takes `currentColor`: `brass` on dark grounds (the default), `--ink` on paper, `--forest` on bone packaging, `--live` only on an ON AIR surface where the whole mark is the lamp. Sizes `--xl` 320px, `--lg` 200px, `--md` 120px, `--sm` 72px; nothing smaller, because below 72px the five lines close up and below 48px the mark is a coin. Clear space all round equals one ring width. The consumer provides size and colour only. Never two colours, never a gradient, never rotated, never over imagery without a `scrim`, and never set GR in type.",
  '<div style="display:grid;grid-template-columns:1fr 1fr;min-height:360px"><div class="agf-deep" data-theme="midnight" style="display:flex;align-items:center;justify-content:center;padding:var(--space-32)">' + MARK("gr-mark gr-mark--xl") + '</div><div style="display:flex;gap:var(--space-32);align-items:center;justify-content:center;padding:var(--space-32);background:var(--surface-raised)">' + MARK("gr-mark gr-mark--lg") + MARK("gr-mark gr-mark--md gr-mark--ink") + MARK("gr-mark gr-mark--sm") + '</div></div>'),
 ("Lockup", "Marks",
  "The monogram with GLOBL RADIO set in the designer's outlined capitals inside the rings, from `assets/Logos/gr-lockup.svg`. For print, the ticket, the title card and anywhere the mark is 160px or wider; below that the wordmark becomes unreadable inside the ring, so smaller uses carry the monogram alone. Same colours and clear space as the monogram. The strapline, when the lockup needs one, is set beneath it in Poiret One `strapline-small` in `brass` and reads *Live to the global village*; one strapline per screen, and never inside the ring.",
  '<div class="agf-deep gr-stave" data-theme="midnight" style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:var(--space-24);padding:var(--space-48);min-height:420px">' + MARK("gr-mark gr-mark--lg", lockup=True) + '<p class="agf-strapline agf-strapline--small" style="color:var(--brass)">Live to the global village</p></div>'),
 ("Endorsement", "Marks",
  "Where Globl Radio first appears on a surface, AGF stands beside it: the Globl Radio lockup (or monogram, under 160px), a vertical hairline, then the AGF wordmark with the caption *A live service of All Grounds Floating* in `ink-faint`. Both marks in the same ink, aligned on their optical centres, with a `space-24` gap each side of the rule. After the endorsement the monogram stands alone on the page. The consumer provides nothing; it never carries a link on the AGF side, and the caption is never rewritten.",
  '<div style="display:flex;justify-content:center;align-items:center;min-height:240px;padding:var(--space-32);background:var(--surface-raised)">' + ENDORSE + '</div>'),
 ("Ring", "Marks",
  "Five concentric rings derived from the monogram: the mark at small sizes and the live indicator everywhere. Default 48px, `--lg` 96px, `--sm` 24px (three rings). States: idle in `brass` with the outer ring still; `is-live` turns the mark `live`, lights a centre lamp that breathes at 1.6 s, and sets the outer dashed ring turning at 5 rpm. The ring only turns while a stream is on air and stops dead when it ends. It never spins as a loader and never appears beside the monogram on the same line. The consumer provides the state. Below 24px use `gr-ring-small.svg` or, at 16px, one ring with the lamp.",
  '<div style="display:flex;gap:var(--space-48);align-items:center;justify-content:center;min-height:200px;padding:var(--space-32)">' + RING("gr-ring gr-ring--lg") + RING("gr-ring gr-ring--lg is-live") + RING("gr-ring") + RING("gr-ring is-live") + RING("gr-ring gr-ring--sm", rings=(48, 36, 24)) + RING("gr-ring gr-ring--sm is-live", rings=(48, 36, 24)) + '</div>'),
 ("OnAir", "Status",
  "The live word with its lamp: an 8px `live` lamp with `shadow-live` breathing at 1.6 s, then ON AIR in `eyebrow` style in `live-text`. Three other states use the same shape: `--soon` is a still `brass` lamp with the air time (*Goes live 21:00 EDT*), `--idle` is a `moss` lamp with *Was live*, and `--solid` is the badge form, a `live` fill with `on-live` text, for the player and signage only. The word always travels with the lamp and the time travels with the word. One live OnAir per screen; it is never a button, never blinks, and never appears on a still image.",
  '<div style="display:flex;gap:var(--space-48);align-items:center;justify-content:center;flex-wrap:wrap;min-height:160px;padding:var(--space-32)">' + ONAIR("live") + ONAIR("solid") + ONAIR("soon") + ONAIR("idle") + '</div>'),
 ("Countdown", "Status",
  "A clock to air: hours, minutes and seconds in `data` (Commissioner 200, tabular, `\"FLAR\" 0`) with the colons in `brass-text`, and an `eyebrow` label beneath (*Live to air in*). `--lg` sets it in `data-mega` for title cards and the Balcony OLED. Digits change by replacement, never by rolling; at zero the numbers turn `live-text` (`is-live`), the Ring starts and the OnAir lamp lights, in that order over 300 ms. It always shows the venue's local air time beside it in `caption` so the clock has a reference. The consumer provides the target time; the countdown is never used for anything but air time.",
  '<div style="display:flex;gap:var(--space-64);align-items:flex-end;justify-content:center;flex-wrap:wrap;min-height:200px;padding:var(--space-32)">' + COUNTDOWN(lg=True) + COUNTDOWN(h="00", m="00", s="00", label="On air · 21:00 EDT", live=True) + '</div>'),
 ("Stave", "Texture",
  "Globl Radio's signature texture: the mark's five lines laid flat. Five 1px hairlines in `brass` at a 6px pitch (`stave-pitch`), tiled every 72px (`stave-group`), at `opacity-stave` over `surface-deep`; `.gr-stave` applies it to any band and keeps the content above it. `--one` draws a single stave centred in the element, for a rule beneath a heading or the grid behind a waveform; `--rule` makes a 25px-tall standalone rule. A stave is horizontal, never angled or curved, never over Daylight paper or photography, and never under a second texture. The consumer provides the band; the stave never carries text on its lines.",
  STAVE_BAND + '<div style="padding:var(--space-32);background:var(--surface-raised)"><p class="agf-eyebrow">Single stave as a rule</p><div class="gr-stave gr-stave--one" style="height:48px;margin-top:var(--space-16)"></div></div>'),
 ("Waveform", "Texture",
  "The performance drawn on a single stave: a 2px `brass-glow` polyline with a 25%-to-transparent fill beneath it, the same rule as an AGF OLED frequency curve, over five stave hairlines. While live, a 1.5px `live` playhead with a dot marks now; `--draw` draws the line once over 1.8 s on the damped curve when first seen. The waveform is an illustration of signal level, not a measurement: it is never labelled with dB and never presented as a frequency response. Heights 96px default, 56px inside the Player. The consumer provides the points (or the live audio analyser's output) and the live state; a canned loop is not allowed.",
  '<div class="agf-deep" data-theme="air" style="padding:var(--space-32) var(--space-48)">' + WAVE(live=True, draw=True) + '<p class="agf-caption" style="color:var(--ink-on-deep-muted);margin-top:var(--space-16)">Illustrative level, not a measurement · live head at 21:14:07 EDT</p></div>'),
 ("Player", "Service",
  "The now-playing bar, always in the Air theme (wrap it in `data-theme=\"air\"` inside any page): artwork or the small ring at the left, artist and set in `body-strong`, venue · city · local time (and the listener's own time when it differs) in `caption` tabular, the OnAir state with the listener count and its conditions, the play control, and a 56px Waveform on its stave across the bottom. The play control is a 48px ring in `brass` that fills on hover; while the stream is on air it is `live` and shows pause. One player per page, no volume knob (the device has one), no skip controls on a live stream, no autoplay with sound. The consumer provides artist, set, venue, city, times, state, count, artwork and the audio element.",
  '<div style="padding:var(--space-32);background:var(--surface-raised);display:grid;gap:var(--space-24)">' + PLAYER(live=True) + PLAYER(live=False) + '</div>'),
 ("Schedule", "Service",
  "Tonight's and upcoming performances as a table: local time with its zone in tabular figures, artist with the set beneath, venue · city, and the OnAir state. The live row is tinted with a `live-hairline` wash from the left and its time is `live-text`; past rows carry *Was live* in `ink-faint`, future rows carry their air time in `brass`. Rows are ordered by air time in the viewer's time, grouped by day. Never more than one live row per venue, and the table is never a carousel. The consumer provides the rows and the viewer's zone.",
  '<div style="padding:var(--space-32)">' + SCHEDULE + '</div>'),
 ("VenueCard", "Service",
  "One card per AGF venue: the venue name in `display`-weight Commissioner, city and the venue's local clock in `caption` tabular, the Ring at the right showing the stream's state, tonight's act with its air time beneath a hairline, and a foot with the OnAir state and one action: *Watch live* (primary) while on air, *Virtual ticket* (secondary) before. One venue per market, so a page shows at most six cards and never a grid wider than three. The consumer provides venue, city, clock, act, time and state; the card never shows a photo of the room, because the room is for being in.",
  '<div style="padding:var(--space-32);display:grid;grid-template-columns:1fr 1fr;gap:var(--space-24)">' + VENUE() + VENUE("The Green Room", "Vancouver", "PST", "18:14", "Hania Rani · Solo piano", "Tonight · 20:00 PST · 23:00 EDT", live=False) + '</div>'),
 ("Ticket", "Service",
  "The virtual ticket, sibling of the AGF Certificate: a `surface-deep` card with a `border-rule` in `brass` and a hairline outline standing 4px off it, the monogram top-left and the Ring top-right, the artist's name as the one Poiret One line in `brass-glow`, a caption with the format (*broadcast mix · l'Art encoded*), then venue and city, date and local time, and the price with *set by the artist* beneath it. A dashed hairline tears off the stub, which carries the serial in Poiret One and the artist's credit line. `--pass` is the permanent all-access pass issued with AGF hardware: `brass-glow` edges, *All access · in perpetuity* as the strapline, the owner's hardware serial as its number. Printed tickets run Daylight with a perforated stub. The consumer provides artist, venue, time, price, holder and serial.",
  '<div style="padding:var(--space-32);background:var(--surface-raised);display:grid;gap:var(--space-32);justify-items:center">' + TICKET() + TICKET(pass_=True) + '</div>'),
 ("Credit", "Service",
  "The artist's line, on every ticket, recording page and stream page: the Floating Ground badge at 24px, then in `caption`: the artist's name in `ink` bold, *The stereo master is the artist's. The broadcast mix is shared 50/50, in perpetuity. The artist may withdraw any broadcast, without cause.* Between two hairlines, 640px wide at most. It is the contract made visible and is not rewritten, abbreviated or styled as a footnote. The consumer provides the artist's name only.",
  '<div style="padding:var(--space-32);display:flex;justify-content:center">' + CREDIT() + '</div>'),
]

COVER = ('<div class="gr-stave agf-deep agf-grain cover" data-theme="midnight" style="min-height:560px;padding:var(--space-64);display:grid;grid-template-columns:auto 1fr;gap:var(--space-64);align-items:center">'
         + MARK("gr-mark gr-mark--xl") +
         '<div><p class="agf-strapline agf-strapline--small" style="color:var(--brass)">Live to the global village</p>'
         '<h1 style="margin:var(--space-16) 0 0;font-size:64px;line-height:1.02;font-weight:200;max-width:560px">Live, anywhere.<br>Heard, everywhere.</h1>'
         '<p class="agf-lede" style="margin-top:var(--space-24);max-width:520px;color:var(--ink-on-deep-muted)">The broadcast-mixed performances from AGF venues, delivered as virtual tickets. The artist named first, the room kept dark, the signal sent.</p>'
         '<div style="display:flex;gap:var(--space-16);align-items:center;margin-top:var(--space-32)"><a class="agf-btn agf-btn--primary agf-btn--lg" href="#">Tonight\'s schedule</a>' + ONAIR("live") + '</div>'
         '<div style="margin-top:var(--space-48)">' + ENDORSE + '</div></div></div>')

PREVIEW_HEAD = ('<!doctype html>\n<html lang="en" data-theme="midnight">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>Globl Radio · %s</title>\n'
                '<link rel="stylesheet" href="../../globl.css">\n<style>body{margin:0;background:var(--surface);color:var(--ink);font-family:var(--font-sans)}</style>\n</head>\n<body>\n\n%s\n</body></html>\n')
for name, group, readme, html in COMPONENTS:
    write("components/%s/preview.html" % name, PREVIEW_HEAD % (name, html))
    write("components/%s/README.md" % name, "# %s\n\n%s\n" % (name, readme))
write("components/Cover/preview.html", PREVIEW_HEAD % ("Cover", COVER))

# ----------------------------------------------------------------------------
# 5. Showcase
SC_CSS = """
body { margin: 0; background: var(--surface); color: var(--ink); font-family: var(--font-sans); }
.sc-bar { position: sticky; top: 0; z-index: 10; display: flex; align-items: center; gap: var(--space-24); height: 64px; padding: 0 var(--space-32); background: var(--glass); backdrop-filter: blur(var(--blur-glass)); border-bottom: 1px solid var(--brass-hairline); }
.sc-bar nav { margin-left: auto; display: flex; gap: var(--space-8); }
.sc-theme { font: inherit; font-size: 12px; font-weight: 600; letter-spacing: .12em; text-transform: uppercase; height: 32px; padding: 0 var(--space-16); border-radius: var(--radius-4); border: 1px solid var(--brass-hairline); background: transparent; color: var(--ink-muted); cursor: pointer; }
.sc-theme.is-on { border-color: var(--line-strong); color: var(--brass-text); }
.sc-wrap { max-width: 1024px; margin: 0 auto; padding: var(--space-48) var(--space-32) var(--space-120); }
.sc-intro { margin-bottom: var(--space-64); }
.sc-swatches { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: var(--space-8); margin: var(--space-32) 0; }
.sc-sw { height: 72px; border-radius: var(--radius-4); border: 1px solid var(--brass-hairline); padding: var(--space-8); display: flex; flex-direction: column; justify-content: flex-end; font-size: 11px; letter-spacing: .06em; }
.sc-item { margin: 0 0 var(--space-48); }
.sc-group { margin: var(--space-64) 0 var(--space-24); }
.sc-head { display: flex; align-items: baseline; justify-content: space-between; padding-bottom: var(--space-8); border-bottom: 1px solid var(--brass-hairline); margin-bottom: var(--space-16); }
.sc-link { font-size: 13px; color: var(--brass-text); text-decoration: none; }
.sc-frame { border: 1px solid var(--brass-hairline); border-radius: var(--radius-8); overflow: hidden; background: var(--surface); }
.sc-type .row { display: grid; grid-template-columns: 160px 1fr; gap: var(--space-16); align-items: baseline; padding: var(--space-8) 0; border-bottom: 1px solid var(--brass-hairline); }
.sc-type .row span:first-child { font-size: 12px; color: var(--ink-faint); letter-spacing: .08em; }
.sc-marks { display: grid; grid-template-columns: repeat(3, 1fr); }
.sc-marks > div { display: flex; align-items: center; justify-content: center; padding: var(--space-32); min-height: 220px; }
"""
items = []
last_group = None
for name, group, readme, html in COMPONENTS:
    if group != last_group:
        items.append('<h2 class="agf-h3 sc-group">%s</h2>' % group); last_group = group
    items.append('<section class="sc-item" id="%s"><header class="sc-head"><h2 class="agf-eyebrow agf-eyebrow--brass">%s</h2><a class="sc-link" href="components/%s/preview.html">open preview →</a></header><div class="sc-frame">%s</div></section>' % (name, name, name, html))
SW = "".join('<div class="sc-sw" style="background:var(--%s);color:var(--%s)">%s</div>' % (bg, fg, bg) for bg, fg in
             (("surface", "ink"), ("surface-raised", "ink"), ("surface-sunken", "ink"), ("surface-deep", "ink-on-deep"), ("brass", "on-brass"), ("brass-glow", "on-brass"), ("live", "on-live"), ("live-glow", "on-live"), ("live-text", "obsidian"), ("ink", "obsidian"), ("ink-muted", "obsidian"), ("signal-nominal", "on-brass")))
INDEX = ('<!doctype html>\n<html lang="en" data-theme="midnight">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>Globl Radio — design system showcase</title>\n<link rel="stylesheet" href="globl.css">\n<style>%s</style>\n</head>\n<body>\n' % SC_CSS +
         '<div class="sc-bar">' + MARK("gr-mark", style="width:40px") + '<span class="agf-eyebrow">Globl Radio · design system · showcase</span><nav><button class="sc-theme is-on" data-theme-pick="midnight">Midnight</button><button class="sc-theme" data-theme-pick="daylight">Daylight</button><button class="sc-theme" data-theme-pick="air">Air</button></nav></div>\n'
         '<main class="sc-wrap">\n<div class="sc-intro"><p class="agf-strapline agf-strapline--small" style="color:var(--brass-text)">Live to the global village</p><h1 class="agf-display" style="margin-top:var(--space-16)">One room, broadcast everywhere.</h1>'
         '<p class="agf-lede" style="margin-top:var(--space-16);max-width:640px">Every component below is rendered live from <code style="font-family:inherit;color:var(--brass-text)">globl.css</code>: the AGF tokens, fonts and components, plus the Globl Radio layer in one file. Switch themes above; Air is the player\'s native theme. The brand book is in README.md beside this file.</p>'
         '<div class="sc-swatches">' + SW + '</div>'
         '<div class="sc-type"><div class="row"><span>strapline · Poiret One</span><span class="strapline" style="color:var(--brass-text)">Live to the global village</span></div><div class="row"><span>display · Commissioner 300</span><span class="display">Live, anywhere. Heard, everywhere.</span></div><div class="row"><span>data · tabular</span><span class="data agf-tnum">21:00 EDT · 4,212</span></div><div class="row"><span>eyebrow</span><span class="eyebrow" style="color:var(--brass-text)">GLOBL RADIO · THE BALCONY · TORONTO</span></div><div class="row"><span>on air · live-text</span><span class="eyebrow" style="color:var(--live-text)">ON AIR</span></div></div></div>\n'
         '<section class="sc-item" id="Cover"><header class="sc-head"><h2 class="agf-eyebrow agf-eyebrow--brass">Cover</h2><a class="sc-link" href="components/Cover/preview.html">open preview →</a></header><div class="sc-frame">' + COVER + '</div></section>\n'
         '<section class="sc-item" id="Marks"><header class="sc-head"><h2 class="agf-eyebrow agf-eyebrow--brass">The marks on their grounds · brass, ink, bone</h2><a class="sc-link" href="assets/Logos/README.md">assets/Logos →</a></header><div class="sc-frame sc-marks">'
         '<div class="agf-deep" data-theme="midnight">' + MARK("gr-mark gr-mark--md") + '</div><div data-theme="daylight" style="background:var(--surface)">' + MARK("gr-mark gr-mark--md gr-mark--ink") + '</div><div style="background:#0e1612">' + MARK("gr-mark gr-mark--md", style="color:#e9e2d4") + '</div>'
         '<div class="agf-deep" data-theme="midnight">' + MARK("gr-mark gr-mark--md", lockup=True) + '</div><div data-theme="daylight" style="background:var(--surface)">' + MARK("gr-mark gr-mark--md gr-mark--ink", lockup=True) + '</div><div style="background:#0e1612">' + RING("gr-ring gr-ring--lg", lamp=False) + '</div></div></section>\n'
         + "\n".join(items) +
         '\n</main>\n<script>\n  document.querySelectorAll(\'[data-theme-pick]\').forEach(function(b){ b.addEventListener(\'click\', function(){ document.documentElement.setAttribute(\'data-theme\', b.getAttribute(\'data-theme-pick\')); document.querySelectorAll(\'[data-theme-pick]\').forEach(function(x){ x.classList.toggle(\'is-on\', x===b); }); }); });\n</script>\n</body>\n</html>\n')
write("index.html", INDEX)

# ----------------------------------------------------------------------------
# 6. design-system.json index
def blob(p):
    b = open(p, "rb").read(); return hashlib.md5(b).hexdigest(), len(b)
groups = {}
for g, folder in (("Logos", "assets/Logos"), ("Icons", "assets/Icons")):
    files = sorted(f for f in os.listdir(folder) if f.endswith(".svg"))
    groups[g] = {"name": g, "tile": "l" if g == "Logos" else "s", "order": files,
                 "files": {f: {"name": f, "blob": blob(os.path.join(folder, f))[0], "size": blob(os.path.join(folder, f))[1], "type": "image/svg+xml"} for f in files}}
write("design-system.json", json.dumps({"v": 3, "layout": "files", "title": "Globl Radio", "namespace": "GR", "extends": "AGF",
                                        "libraries": [], "sections": {}, "groups": list(groups), "assetGroups": groups, "blobs": {},
                                        "docs": {"readme": "project/README.md", "sections": []},
                                        "lastChange": {"via": "build/build.py", "note": "Globl Radio sub-brand: 1 voice, 1 texture, 1 shape, 13 components, 12 marks, 14 icons"}}, indent=2) + "\n")

# ----------------------------------------------------------------------------
# 7. Contact sheets (needs node + playwright on PATH; skipped quietly otherwise)
SHOT = r"""
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const root = 'file://' + process.cwd() + '/';
  for (const t of ['midnight', 'daylight', 'air']) {
    const p = await b.newPage({ viewport: { width: 1100, height: 900 } });
    await p.goto(root + 'index.html'); await p.click('[data-theme-pick="' + t + '"]');
    await p.waitForTimeout(600); await p.screenshot({ path: 'preview-' + t + '.png', fullPage: true }); await p.close();
  }
  let p = await b.newPage({ viewport: { width: 1100, height: 620 } });
  await p.goto(root + 'components/Cover/preview.html'); await p.waitForTimeout(400); await p.screenshot({ path: 'preview-cover.png' }); await p.close();
  p = await b.newPage({ viewport: { width: 1100, height: 520 } });
  await p.goto(root + 'index.html'); await p.waitForTimeout(400); await p.addStyleTag({ content: '.sc-bar{display:none}' });
  const el = await p.$('#Marks .sc-frame'); await el.screenshot({ path: 'preview-marks.png' }); await b.close();
})();
"""
try:
    write("build/_shot.js", SHOT)
    r = subprocess.run(["node", "build/_shot.js"], capture_output=True, text=True, timeout=180)
    print(r.stdout, r.stderr[-400:] if r.returncode else "")
finally:
    if os.path.exists("build/_shot.js"): os.remove("build/_shot.js")

print("built: %d marks, %d icons, %d components, globl.css %d bytes" % (
    len([f for f in os.listdir("assets/Logos") if f.endswith(".svg")]), len([f for f in os.listdir("assets/Icons") if f.endswith(".svg")]),
    len(COMPONENTS), os.path.getsize("globl.css")))
