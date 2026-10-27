#!/usr/bin/env python3
"""Build the stereOS brand package: the wordmark and OS monogram as SVG, the preview page and its renders.

Run from the package folder:  python3 -I build/build.py
The wordmark is constructed, not typeset: every letter is a single spine stroked as five parallel lines through
a luminance mask, the inline language of the AGF mark (Monoton) and the Globl Radio monogram. The O is the
Globl Radio ring. Geometry: x-height 100, cap height 140, ascender 130, band 22 (five 2-unit lines, four 3-unit gaps).
Hand-written files it never touches: README.md.
"""
import math, os, subprocess

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(HERE)

BAND = 22
STRIPES = [("white", 22), ("black", 18), ("white", 12), ("black", 8), ("white", 2)]
HALO = BAND + 7
GAP = 22
COLOURS = {"brass": "#B8860B", "ink": "#0E1612", "bone": "#E9E2D4"}

def pt(cx, cy, r, a):
    return cx + r * math.cos(math.radians(a)), cy + r * math.sin(math.radians(a))

def arc_to(cx, cy, r, a0, a1, sweep):
    """Arc segment (no initial M) from angle a0 to a1 on a circle; SVG y-down, 0 = right, 90 = down."""
    x1, y1 = pt(cx, cy, r, a1)
    d = (a1 - a0) % 360 if sweep else (a0 - a1) % 360
    return "A%.2f %.2f 0 %d %d %.2f %.2f" % (r, r, 1 if d > 180 else 0, sweep, x1, y1)

def s_spine(x, top, h):
    """Geometric S as one continuous spine: upper bowl counter-clockwise, lower bowl clockwise, tangent at the waist."""
    r = (h - BAND) / 4.0
    cx = x + BAND / 2 + r
    cy1 = top + BAND / 2 + r
    cy2 = cy1 + 2 * r
    x0, y0 = pt(cx, cy1, r, -35)
    d = "M%.2f %.2f %s %s" % (x0, y0, arc_to(cx, cy1, r, -35, 90, 0), arc_to(cx, cy2, r, -90, 145, 1))
    return [d], 2 * r + BAND

def letter_s(x): return s_spine(x, 0, 100)
def letter_S(x): return s_spine(x, -40, 140)

def letter_t(x):
    stem = "M%.2f %.2f L%.2f %.2f" % (x + 18, -30, x + 18, 100)
    bar = "M%.2f %.2f L%.2f %.2f" % (x, BAND / 2, x + 48, BAND / 2)
    return [stem, ("halo", bar)], 48

def letter_e(x):
    r = (100 - BAND) / 2.0; cx, cy = x + 50, 50
    x0, y0 = pt(cx, cy, r, 0)
    ring = "M%.2f %.2f %s" % (x0, y0, arc_to(cx, cy, r, 0, 38, 0))
    bar = "M%.2f %.2f L%.2f %.2f" % (cx - r, cy, cx + r, cy)
    return [ring, ("halo", bar)], 100

def letter_r(x):
    stem = "M%.2f %.2f L%.2f %.2f" % (x + BAND / 2, 0, x + BAND / 2, 100)
    r = 30; cx = x + BAND / 2 + r; cy = BAND / 2 + r
    x0, y0 = pt(cx, cy, r, 180)
    shoulder = "M%.2f %.2f %s" % (x0, y0, arc_to(cx, cy, r, 180, 0, 1))
    return [shoulder, ("halo", stem)], BAND + 2 * r

def letter_O(x):
    r = (140 - BAND) / 2.0; cx, cy = x + 70, 30
    return ["M%.2f %.2f A%.2f %.2f 0 1 1 %.2f %.2f A%.2f %.2f 0 1 1 %.2f %.2f" % (cx - r, cy, r, r, cx + r, cy, r, r, cx - r, cy)], 140

LETTERS = {"s": letter_s, "t": letter_t, "e": letter_e, "r": letter_r, "O": letter_O, "S": letter_S}

def stripes(d):
    return "".join('<path d="%s" stroke="%s" stroke-width="%d"/>' % (d, c, w) for c, w in STRIPES)

def build(word, fill, idp, pad=24, current=False, label=None):
    x = 0.0; parts = []
    for ch in word:
        spines, adv = LETTERS[ch](x)
        for sp in spines:
            if isinstance(sp, tuple):
                parts.append('<path d="%s" stroke="black" stroke-width="%d"/>' % (sp[1], HALO) + stripes(sp[1]))
            else:
                parts.append(stripes(sp))
        x += adv + GAP
    width = x - GAP
    top = -40 if any(c in "OS" for c in word) else (-30 if "t" in word else 0)
    x0, y0, x1, y1 = -pad, top - pad, width + pad, 100 + pad
    box = (x0, y0, x1 - x0, y1 - y0)
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="%.1f %.1f %.1f %.1f" role="img" aria-label="%s">'
            '<defs><mask id="%s" maskUnits="userSpaceOnUse" x="%.1f" y="%.1f" width="%.1f" height="%.1f">'
            '<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" fill="black"/>'
            '<g fill="none" stroke-linecap="butt" stroke-linejoin="round">%s</g></mask></defs>'
            '<rect x="%.1f" y="%.1f" width="%.1f" height="%.1f" fill="%s" mask="url(#%s)"/></svg>') % (
            (*box, label or word, idp, *box, *box, "".join(parts), *box, ("currentColor" if current else fill), idp))

# ---- SVG files -------------------------------------------------------------
os.makedirs("assets/Logos", exist_ok=True)
for name, fill in COLOURS.items():
    suf = "" if name == "brass" else "-" + name
    open("assets/Logos/stereos-wordmark%s.svg" % suf, "w").write(build("stereOS", fill, "so-" + name))
    open("assets/Logos/stereos-os%s.svg" % suf, "w").write(build("OS", fill, "soos-" + name, label="stereOS"))

open("assets/Logos/README.md", "w").write("""# Logos

Constructed marks, not typeset: each letter is one spine stroked as five parallel lines (band 22 units at an x-height of 100: five 2-unit lines, four 3-unit gaps), the inline language of the AGF mark and the Globl Radio monogram. The O is the Globl Radio ring. Regenerate with `python3 -I build/build.py`.

Delivered in brass (#B8860B) for dark grounds, ink (#0E1612, `-ink`) for paper, bone (#E9E2D4, `-bone`) for reversing out of photography under a scrim. Recolour by inlining and setting the rect's `fill`, or use the `.so-wordmark` class from the preview, which inlines it with `currentColor`. One colour per mark.

- `stereos-wordmark.svg` — the wordmark. 160px / 40 mm minimum; below that the lines close up, so use the type form (Commissioner, see README).
- `stereos-os.svg` — the OS monogram, the ring and the S alone, for app icons, boot screens and hardware etching at 48px / 12 mm and above.
""")

# ---- Preview page ----------------------------------------------------------
WM = build("stereOS", "#B8860B", "so-inline", current=True)
OSM = build("OS", "#B8860B", "soos-inline", current=True, label="stereOS")
def wm(cls, style="", idp=None):
    s = WM if idp is None else build("stereOS", "#B8860B", idp, current=True)
    return '<span class="so-wordmark %s"%s>%s</span>' % (cls, (' style="%s"' % style) if style else "", s)
GR_MARK = open("../globl-radio-design-system/assets/Logos/gr-mark.svg").read().replace('<svg ', '<svg class="gr-inline" ').replace('fill="#B8860B"', 'fill="currentColor"')
GROUND = '<svg width="24" height="24" viewBox="0 0 80 80" fill="none" stroke-linecap="round" role="img" aria-label="Floating ground"><g stroke="currentColor" stroke-width="1"><path d="M46.25 4.55A36 36 0 1 1 6.17 52.31"/><path d="M4.55 33.75A36 36 0 0 1 27.69 6.17"/></g><g stroke="currentColor" stroke-width="2"><line x1="40" y1="22" x2="40" y2="40"/><line x1="24" y1="40" x2="56" y2="40"/><line x1="29" y1="47" x2="51" y2="47"/><line x1="34" y1="54" x2="46" y2="54"/></g></svg>'

CSS = """
body { margin: 0; background: var(--surface); color: var(--ink); font-family: var(--font-sans); }
.so-wordmark { display: inline-block; color: var(--brass); line-height: 0; }
.so-wordmark svg { width: 100%; height: auto; display: block; }
.so-wordmark--ink { color: var(--ink); }
.so-wordmark--xl { width: 640px; } .so-wordmark--lg { width: 400px; } .so-wordmark--md { width: 240px; } .so-wordmark--sm { width: 160px; }
.so-type { font-family: var(--font-sans); font-weight: 300; letter-spacing: -0.01em; }
.so-type b { font-weight: 600; letter-spacing: 0; }
.so-edition { display: inline-flex; align-items: baseline; gap: var(--space-16); }
.so-edition .code { font-family: var(--font-sans); font-size: 12px; font-weight: 600; letter-spacing: var(--tracking-eyebrow); text-transform: uppercase; color: var(--brass-text); }
.so-badge { display: inline-flex; align-items: center; gap: var(--space-8); padding: var(--space-8) var(--space-16); border: 1px solid var(--brass-hairline); border-radius: var(--radius-4); color: var(--brass-text); }
.so-badge .so-wordmark { width: 84px; }
.so-badge .agf-micro { color: var(--ink-faint); letter-spacing: 0.12em; text-transform: uppercase; font-size: 10px; }
.so-state { display: inline-flex; align-items: center; gap: var(--space-8); font-size: 12px; font-weight: 600; letter-spacing: var(--tracking-eyebrow); text-transform: uppercase; color: var(--signal-nominal); }
.so-state::before { content: ""; width: 8px; height: 8px; border-radius: 50%; background: var(--signal-nominal); box-shadow: 0 0 10px rgba(212,235,216,.5); }
.sc-wrap { max-width: 1024px; margin: 0 auto; padding: var(--space-48) var(--space-32) var(--space-120); }
.sc-bar { position: sticky; top: 0; z-index: 10; display: flex; align-items: center; gap: var(--space-24); height: 64px; padding: 0 var(--space-32); background: var(--glass); backdrop-filter: blur(var(--blur-glass)); border-bottom: 1px solid var(--brass-hairline); }
.sc-bar nav { margin-left: auto; display: flex; gap: var(--space-8); }
.sc-theme { font: inherit; font-size: 12px; font-weight: 600; letter-spacing: .12em; text-transform: uppercase; height: 32px; padding: 0 var(--space-16); border-radius: var(--radius-4); border: 1px solid var(--brass-hairline); background: transparent; color: var(--ink-muted); cursor: pointer; }
.sc-theme.is-on { border-color: var(--line-strong); color: var(--brass-text); }
.sc-item { margin: 0 0 var(--space-48); }
.sc-head { display: flex; align-items: baseline; justify-content: space-between; padding-bottom: var(--space-8); border-bottom: 1px solid var(--brass-hairline); margin-bottom: var(--space-16); }
.sc-frame { border: 1px solid var(--brass-hairline); border-radius: var(--radius-8); overflow: hidden; background: var(--surface); }
.family { display: flex; align-items: center; justify-content: center; gap: var(--space-64); padding: var(--space-48); }
.family .agf-wordmark__mark { font-size: 96px; }
.family .gr { width: 200px; color: var(--brass); line-height: 0; } .family .gr svg { width: 100%; height: auto; }
.family .so-wordmark { width: 410px; }
.family .sep { width: 1px; height: 120px; background: var(--brass-hairline); }
.chain { display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 0; padding: var(--space-32); }
.chain .step { padding: var(--space-16) var(--space-24) var(--space-16) 0; border-top: 2px solid var(--brass); }
.chain .step .agf-eyebrow { color: var(--brass-text); }
.chain .step h4 { margin: var(--space-8) 0 var(--space-4); font-weight: 400; font-size: 18px; }
.chain .step p { margin: 0; color: var(--ink-muted); font-size: 14px; }
.editions { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: var(--space-24); padding: var(--space-32); }
.editions .agf-card h4 { margin: var(--space-16) 0 var(--space-4); font-weight: 400; font-size: 20px; }
.editions .agf-card p { margin: 0; color: var(--ink-muted); font-size: 14px; }
.editions .agf-card .meta { margin-top: var(--space-16); display: flex; gap: var(--space-8); flex-wrap: wrap; }
.voices { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); }
.voices > div { padding: var(--space-32); display: grid; gap: var(--space-16); align-content: start; min-height: 220px; }
.voices h4 { margin: 0; font-weight: 400; font-size: 18px; }
.voices p { margin: 0; font-size: 14px; color: var(--ink-muted); }
.voices .sw { height: 10px; border-radius: 2px; }
"""

def edition(code, desc):
    return '<div class="agf-card"><span class="so-edition">%s<span class="code">// %s</span></span><h4>stereOS %s</h4><p>%s</p></div>' % (wm("so-wordmark--sm", idp="so-" + code.lower()), code, {"EMBEDDED": "embedded", "MOBILE": "mobile", "HOME": "Home", "PRO": "Pro"}[code], desc)

PAGE = ('<!doctype html>\n<html lang="en" data-theme="midnight">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>stereOS — brand preview</title>\n'
        '<link rel="stylesheet" href="../globl-radio-design-system/globl.css">\n<style>%s</style>\n</head>\n<body>\n' % CSS +
        '<div class="sc-bar">' + wm("", "width:120px", idp="so-bar") + '<span class="agf-eyebrow">Wordmark and family · preview</span><nav><button class="sc-theme is-on" data-theme-pick="midnight">Midnight</button><button class="sc-theme" data-theme-pick="daylight">Daylight</button><button class="sc-theme" data-theme-pick="air">Air</button></nav></div>\n<main class="sc-wrap">\n'
        '<section class="sc-item" id="Wordmark"><header class="sc-head"><h2 class="agf-eyebrow agf-eyebrow--brass">Wordmark</h2><a class="agf-caption" style="color:var(--brass-text)" href="assets/Logos/README.md">assets/Logos →</a></header><div class="sc-frame">'
        '<div class="agf-deep gr-stave" data-theme="midnight" style="padding:var(--space-64);display:flex;flex-direction:column;align-items:center;gap:var(--space-32)">' + wm("so-wordmark--xl", idp="so-hero") + '<p class="agf-strapline agf-strapline--small" style="color:var(--brass)">Sound first</p></div>'
        '<div style="display:grid;grid-template-columns:1fr 1fr 1fr"><div class="agf-deep" data-theme="midnight" style="padding:var(--space-32);display:grid;place-items:center">' + wm("so-wordmark--md", idp="so-a") + '</div><div data-theme="daylight" style="background:var(--surface);padding:var(--space-32);display:grid;place-items:center">' + wm("so-wordmark--md so-wordmark--ink", idp="so-b") + '</div><div style="background:#0e1612;padding:var(--space-32);display:grid;place-items:center">' + wm("so-wordmark--md", "color:#e9e2d4", idp="so-c") + '</div></div>'
        '<div style="padding:var(--space-32);display:flex;gap:var(--space-48);align-items:center;flex-wrap:wrap"><span class="so-wordmark" style="width:48px;color:var(--brass)">' + OSM + '</span><span class="so-type" style="font-size:40px">stere<b>OS</b></span><span class="so-type" style="font-size:16px">stere<b>OS</b> Home · the type form for running text and anything under 160px</span></div></div></section>\n'
        '<section class="sc-item" id="Family"><header class="sc-head"><h2 class="agf-eyebrow agf-eyebrow--brass">The family line</h2></header><div class="sc-frame"><div class="family agf-deep" data-theme="midnight">'
        '<span class="agf-wordmark" style="color:var(--brass)"><span class="agf-wordmark__mark">AGF</span></span><span class="sep"></span><span class="gr">' + GR_MARK + '</span><span class="sep"></span>' + wm("", idp="so-fam") + '</div>'
        '<div style="padding:var(--space-24) var(--space-32)"><p class="agf-caption" style="max-width:720px">Three marks, one language: signal drawn as parallel lines. AGF is the masterbrand in Monoton; Globl Radio is the live service, five lines in five rings; stereOS is the operating system, five lines on every letter and the ring for its O. On a shared baseline the stereOS cap height equals the AGF cap height and the GR ring stands 2.6 cap heights tall.</p></div></div></section>\n'
        '<section class="sc-item" id="Voices"><header class="sc-head"><h2 class="agf-eyebrow agf-eyebrow--brass">Three voices, from tokens that already exist</h2></header><div class="sc-frame voices">'
        '<div><div class="sw" style="background:var(--brass)"></div><h4>AGF · brass</h4><p>The conductor. Marks, rules, links, the play control. Every brand in the family is drawn in it.</p></div>'
        '<div><div class="sw" style="background:var(--live)"></div><h4>Globl Radio · live</h4><p>AGF\'s signal-clip, promoted. Only where something is on air now.</p><span class="gr-onair">On air</span></div>'
        '<div><div class="sw" style="background:var(--signal-nominal)"></div><h4>stereOS · nominal</h4><p>AGF\'s signal-nominal: lock, sync, online. The system\'s own state, never the mark.</p><span class="so-state">Locked · 96 kHz · synced</span></div></div></section>\n'
        '<section class="sc-item" id="Editions"><header class="sc-head"><h2 class="agf-eyebrow agf-eyebrow--brass">Editions</h2></header><div class="sc-frame editions">'
        + edition("EMBEDDED", "The RTOS. Sound-first devices with no screen to speak of: over-ear headphones, the earbud case, the dock. Boots to the OS monogram on an OLED; the ring is etched beside the Floating Ground badge.")
        + edition("MOBILE", "Linux. Licensed in by vehicle makers: cars, boats, off-road, and the high-end boom box. The adopter\'s badge reads <em>runs stereOS</em>; the adopter\'s own brand stays on the dash.")
        + edition("HOME", "Linux, the flagship. Not a desktop: the guarantee that the box running the house is a world-class sound system. The Instrument, the Core-likes, the Symphony\'s electronics. Runs the Air theme on its screens.")
        + edition("PRO", "Standard in all AGF broadcast equipment and the Balcony. The capture end of acoustic teleportation: a Pro device at the venue, Globl Radio in between, a Home or embedded device at the couch.")
        + '</div></section>\n'
        '<section class="sc-item" id="Chain"><header class="sc-head"><h2 class="agf-eyebrow agf-eyebrow--brass">Capture to couch</h2></header><div class="sc-frame"><div class="chain">'
        '<div class="step"><p class="agf-eyebrow">01 · Venue</p><h4>stereOS Pro</h4><p>The Balcony captures: stereo, room tone, broadcast mix. l\'Art encode, l\'espacI/O maps the room.</p></div>'
        '<div class="step"><p class="agf-eyebrow">02 · Transport</p><h4>Globl Radio</h4><p>The virtual ticket. Live to air, live to app, the artist named first and paid 50/50.</p></div>'
        '<div class="step"><p class="agf-eyebrow">03 · Home</p><h4>stereOS Home · embedded</h4><p>Decode on device. The sweet spot removed; the room\'s character impressed on yours.</p></div>'
        '<div class="step"><p class="agf-eyebrow">04 · Result</p><h4>Acoustic teleportation</h4><p>One signal path, owned end to end, optimised from capture to couch. You are at the venue.</p></div>'
        '</div><div style="padding:0 var(--space-32) var(--space-32)"><p class="agf-caption" style="max-width:720px">The chain is why the three brands exist as three: the OS at both ends, the service in the middle, the masterbrand on the box.</p></div></div></section>\n'
        '<section class="sc-item" id="Badge"><header class="sc-head"><h2 class="agf-eyebrow agf-eyebrow--brass">Ingredient badge and endorsement</h2></header><div class="sc-frame" style="padding:var(--space-32);display:flex;gap:var(--space-48);align-items:center;flex-wrap:wrap">'
        '<span class="so-badge"><span class="agf-micro">runs</span>' + wm("", idp="so-badge") + '</span>'
        '<span class="so-badge"><span class="agf-micro">runs</span>' + wm("", idp="so-badge2") + '<span class="agf-micro">// home</span></span>'
        '<span class="gr-endorse">' + wm("so-wordmark--sm", idp="so-end") + '<span class="gr-endorse__rule"></span><div><span class="agf-wordmark" style="color:var(--brass)"><span class="agf-wordmark__mark">AGF</span></span><p class="agf-caption">The operating system of All Grounds Floating</p></div></span>'
        '</div></section>\n'
        '</main>\n<script>document.querySelectorAll(\'[data-theme-pick]\').forEach(function(b){b.addEventListener(\'click\',function(){document.documentElement.setAttribute(\'data-theme\',b.getAttribute(\'data-theme-pick\'));document.querySelectorAll(\'[data-theme-pick]\').forEach(function(x){x.classList.toggle(\'is-on\',x===b);});});});</script>\n</body>\n</html>\n')
open("index.html", "w").write(PAGE)

SHOT = r"""
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const root = 'file://' + process.cwd() + '/';
  for (const t of ['midnight', 'daylight']) {
    const p = await b.newPage({ viewport: { width: 1100, height: 900 } });
    await p.goto(root + 'index.html'); await p.click('[data-theme-pick="' + t + '"]'); await p.waitForTimeout(500);
    await p.screenshot({ path: 'preview-' + t + '.png', fullPage: true }); await p.close();
  }
  const p = await b.newPage({ viewport: { width: 1100, height: 700 } });
  await p.goto(root + 'index.html'); await p.waitForTimeout(400); await p.addStyleTag({ content: '.sc-bar{display:none}' });
  const el = await p.$('#Family .sc-frame'); await el.screenshot({ path: 'preview-family.png' }); await b.close();
})();
"""
open("build/_shot.js", "w").write(SHOT)
try:
    r = subprocess.run(["node", "build/_shot.js"], capture_output=True, text=True, timeout=180); print(r.stderr[-300:] if r.returncode else "rendered previews")
finally:
    os.remove("build/_shot.js")
print("built", sorted(os.listdir("assets/Logos")))
