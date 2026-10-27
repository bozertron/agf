#!/usr/bin/env python3
"""Compose the nine option content.json files, site.json and the 19 page shells
from the exported database content in production-staging/content/.

Run once to scaffold; after that the generated content.json files are the
editable source of truth. Re-running overwrites them, so only re-run if you
mean to start again from the database export.

    python3 -I production-staging/tools/build-content.py
"""
import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
C = os.path.join(ROOT, "content")
SITE = os.path.join(ROOT, "site")

def S(name):
    with open(os.path.join(C, "sections", name + ".json"), encoding="utf-8") as f:
        d = json.load(f)
    d.pop("_source", None)
    return d

def P(slug):
    with open(os.path.join(C, "products", slug + ".json"), encoding="utf-8") as f:
        d = json.load(f)
    d.pop("_source", None)
    return d

def write(path, data):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        if isinstance(data, str):
            f.write(data)
        else:
            json.dump(data, f, indent=2, ensure_ascii=False)
            f.write("\n")

def tidy(s):
    """Light cleanup of copy as it came out of the editor: trailing spaces, double spaces."""
    if s is None:
        return ""
    s = str(s).replace(" ", " ")
    s = re.sub(r"[ \t]+\n", "\n", s)
    s = re.sub(r"[ \t]{2,}", " ", s)
    return s.strip()

# --------------------------------------------------------------------------
# Source sections
hero = S("hero"); footer = S("footer"); team_note = S("team-note")
tenets_new = S("tenet"); tenets_old = S("tenet.v2")
prelude = S("prelude.v5")            # the full three-square version
timeline = S("timeline"); consolidation = S("consolidation"); overview = S("overview")
explainer = S("concept-explainer.v2")
tech = S("technology"); tech_old = S("technology.v2")
venue = S("venue"); artists = S("artist-rights.v2")
biz = S("business-model.v2"); dist = S("distribution.v2"); comp = S("competitive-positioning")
roadmap = S("launch-roadmap"); founder = S("founder.v2")
products = [P(s) for s in ["over-ear-home-centric", "core-all-in-one-small", "core-all-in-one-soundbar",
                           "symphony-macro-system", "the-instrument", "wasted-real-estate"]]

THESIS = tidy(hero["subheadline"])

# --------------------------------------------------------------------------
OPTIONS = [
    dict(slug="brand", number="01", eyebrow="The Brand", title="All Grounds Floating", short="Brand",
         summary="The name, the thesis behind it, the six tenets, and the posture: lead, or by definition follow."),
    dict(slug="opportunity", number="02", eyebrow="The Opportunity", title="History rhymes", short="Opportunity",
         summary="Two eras of consolidation, one safe harbor that nobody has occupied since Bang & Olufsen walked away from it."),
    dict(slug="stack", number="03", eyebrow="The Stack", title="Six technologies, one signal path", short="Stack",
         summary="l'Art, stereOS, BT'N-Tech, l'espacI/O, FRC41 and No-Nails: the moat, from capture to the room."),
    dict(slug="lineup", number="04", eyebrow="The Lineup", title="The inaugural product line", short="Lineup",
         summary="Six products from a shared platform, sequenced for time-to-market, landing the flagship just above Focal."),
    dict(slug="venue", number="05", eyebrow="The Venue", title="A church of the performing arts", short="Venue",
         summary="Front of House, the Balcony, the Green Room: retail hidden behind a stage, one venue per qualifying market."),
    dict(slug="artists", number="06", eyebrow="Artist Rights", title="Artists drive their own destiny", short="Artists",
         summary="Artists own the stereo master outright. Broadcast mixes are 50/50 in perpetuity. The artist can block any broadcast."),
    dict(slug="business", number="07", eyebrow="The Business", title="The way the money actually works", short="Business",
         summary="Pricing the package, not the unit. Distribution as the future bank-roller. Where AGF lands against the field."),
    dict(slug="roadmap", number="08", eyebrow="The Roadmap", title="Sequencing the line", short="Roadmap",
         summary="Three phases over 24 months, two PR levers, five venue pilots and a 1,000-piece-a-month year-one target."),
    dict(slug="founder", number="09", eyebrow="The Founder", title="Twenty-five years in this market", short="Founder",
         summary="Benjamin Webster: from garage-sale speakers to Mass Fidelity, a Dolby skunkworks, and the plan on the page."),
]

site = {
    "brand": {
        "mark": "AGF",
        "strapline": "All Grounds Floating",
        "nav_tagline": "Even Rails → Smooth Tracks",
        "certificate_line": "Measured in silence.",
        "tagline": "Pure signal.",
        "meta": "Reference site · working draft · 2026",
        "sources": tidy(footer["source_text"]),
        "portal_headline": "The forest holds the gold.",
        "portal_lede": THESIS,
        "portal_section_title": "Nine doors into the plan.",
        "portal_section_lede": "Each door opens on a short introduction, then a deep dive built from the full brand development document. Working notes stay visible until a section is signed off.",
        "portal_notes": [
            {"title": "How to read this", "body": "The intro pages are the pitch: one headline, three points, the measurements that matter. The deep dives carry everything the brand document held, reorganised by topic. Nothing has been invented; where a line was drafted for this site rather than lifted from the document, it carries an **assumed** badge."},
            {"title": "Standing lines", "body": "**All Grounds Floating** under the mark. **Even Rails → Smooth Tracks** in the nav. **Measured in silence.** on the certificate. **Pure signal.** for campaigns. Everything else is open for discussion."}
        ]
    },
    "options": OPTIONS
}
write(os.path.join(SITE, "site.json"), site)

# --------------------------------------------------------------------------
# 01 · Brand
def tenet_cards():
    old = {t["number"]: t for t in tenets_old["tenets"]}
    items = []
    for t in tenets_new["tenets"]:
        o = old.get(t["number"], {})
        card = {
            "eyebrow": "Tenet %d" % t["number"], "brass": True,
            "title": tidy(t["title"]),
            "pull": tidy(t.get("anchor_phrase")),
            "body": tidy(t.get("body")),
            "kv": [["Key insight", tidy(t.get("key_insight"))]],
        }
        if o.get("example_title"):
            card["list"] = ["Worked example: " + tidy(o["example_title"])]
        if t["number"] == 6:
            card["note"] = "Two versions of this tenet's key insight exist in the document: \"Choose violence.\" (July 14) and \"Know where to push, and how to present it to a global market that eats new entrants for breakfast.\" (July 6). The shorter one is shown; say which you want."
        items.append(card)
    return items

brand = {
    "slug": "brand",
    "intro": {
        "headline": "When you listen to music, you're hearing your power supply.",
        "lede": "A floating ground isolates a circuit from the noise of common earth. All Grounds Floating is that idea made into a company: the quietest possible foundation, then everything else.",
        "points": [
            {"eyebrow": "The name", "title": "A technical truth, chosen as a flag", "body": "Tubes as a category sound better because they force low-noise power supplies. Digital systems are just as sensitive, they just fail more gracefully. We plant our flag here because it's strategically advantageous; it's also the truth."},
            {"eyebrow": "The posture", "title": "Lead. Otherwise, by definition, follow.", "body": "Execution path is open for discussion. Vision is not. Followers die slow deaths, almost without exception."},
            {"eyebrow": "The model", "title": "Channel the B&O of the 70s to 90s", "body": "Bold aesthetics, appointment-only distribution, first movers in Class-D and multi-room. When they spotted an inch, they took it. They had the courage to lead, in every regard."}
        ],
        "metrics": [
            {"value": "6", "label": "Operating tenets", "conditions": "Twenty-five years of lessons, compounding, distilled"},
            {"value": "3", "label": "Things the strategy must be", "conditions": "Sticky, defensible, and not a boil-the-ocean plan"},
            {"value": "1", "label": "Courage required", "conditions": "To lead; the costs are lower than the traditional route"}
        ],
        "metrics_note": "Hero metrics on this page are structural counts, not measurements. Real measurements with conditions belong on the Stack and Lineup pages.",
        "quote": {"text": "They had the courage to lead, in every regard.", "cite": "On Bang & Olufsen, from the brand development document"},
        "note": "Intro copy on this page is lifted from the hero, team note and tenets sections of the document. The three-point framing (name, posture, model) is an editorial choice for the site."
    },
    "deep": {
        "headline": "All Grounds Floating.",
        "lede": "The thesis, the lineage, the six tenets, and the reasons the plan is sticky and defensible.",
        "sections": [
            {"type": "prose", "id": "thesis", "eyebrow": "The thesis", "title": "You're hearing your power supply", "large": True, "body": THESIS,
             "note": "This is the hero subheadline from the document, verbatim. It doubles as the origin of the name and as the pitch for BT'N-Tech."},
            {"type": "prose", "id": "prelude", "eyebrow": "Prelude", "title": "Every side of the fence", "body": [tidy(prelude["intro_text"])] + [tidy(sq["text"]) for sq in prelude["squares"]] + [tidy(prelude["summary"])]},
            {"type": "prose", "id": "lineage", "eyebrow": tidy(team_note["section_label"]), "title": tidy(team_note["section_title"]), "body": tidy(team_note["body"])},
            {"type": "cards", "id": "tenets", "eyebrow": "The six tenets", "title": tidy(tenets_new["section_title"]), "lede": tidy(tenets_new["intro_text"]), "columns": 2, "items": tenet_cards(),
             "note": "Bodies are the first-person July 14 version. Worked-example titles come from the July 6 version. Both versions are kept in content/sections/tenet.json and tenet.v2.json."},
            {"type": "figures", "id": "boards", "eyebrow": "Earlier explorations", "title": "Brand boards", "lede": "AI-generated boards from before the design system existed. The design system in agf-design-system/ supersedes them; they are kept for the ideas, not the execution.", "items": [
                {"src": "assets/brand-boards/agf-packaging-measured-in-silence-card.jpeg", "caption": "Packaging exploration: the calibration certificate, \"Measured in Silence.\""},
                {"src": "assets/brand-boards/agf-master-design-system-board-portrait.png", "caption": "\"The forest holds the gold\" board with the three-division tier system."}
            ]},
            {"type": "list", "id": "standing-lines", "eyebrow": "Fixed language", "title": "Standing lines", "body": "Four lines belong to the brand and are not rewritten. The rest of the site's copy is open.",
             "items": ["**All Grounds Floating** · the strapline under the mark", "**Even Rails → Smooth Tracks** · the nav tagline from the document", "**Measured in silence.** · the certificate headline", "**Pure signal.** · the campaign tagline"],
             "_assumed": True, "note": "The design system fixed three of these; the fourth came from the document's header. Confirm or cut."},
            {"type": "cards", "id": "divisions", "eyebrow": "Structure", "title": "Three divisions", "lede": "How the design system organises the brand. The document itself speaks of a consumer line, the l'Art Production line and stereOS; the mapping below is proposed, not settled.", "_assumed": True,
             "items": [
                 {"eyebrow": "AGF // HEAR", "brass": True, "title": "Consumer", "body": "Reference amplifiers, DACs, headphones, the Core-like all-in-ones, the Symphony. Forest-floor anodise, walnut and leather, a knurled solid-brass volume crown.", "tags": ["Midnight theme"]},
                 {"eyebrow": "AGF // FIELD", "brass": True, "title": "Professional capture", "body": "The l'Art Production line: capture, preamplifiers, the Instrument in its pro and measurement modes. Bead-blasted aluminium, a recessed photo-etched brass mark.", "tags": ["Midnight theme"]},
                 {"eyebrow": "AGF // AIR", "brass": True, "title": "Broadcast", "body": "stereOS live-to-air, venue broadcast chains, the Balcony installations. Obsidian faceplates, OLED telemetry on true black, TiN-gold connectors.", "tags": ["Air theme"]}
             ],
             "note": "Open question from the brand page brief: keep the three codes, rename them, or drop them for the document's own framing?"}
        ]
    }
}
write(os.path.join(SITE, "brand", "content.json"), brand)

# --------------------------------------------------------------------------
# 02 · Opportunity
eras = timeline["eras"]
acq_rows = []
for a in consolidation["acquisitions"]:
    v = a.get("value_usd")
    val = "undisclosed" if not v else ("$%.2fB" % (v / 1e9) if v >= 1e9 else "$%dM" % round(v / 1e6))
    acq_rows.append([tidy(a["acquirer"]), tidy(a["target"]), val])
opportunity = {
    "slug": "opportunity",
    "intro": {
        "headline": "Hundreds of brands, decades apart, one safe harbor.",
        "lede": "Japanese conglomerates owned the mass market in 1982. Chinese vendors and private-equity roll-ups own it now. Different flags, identical structural pressure. In both eras exactly one brand stood alone, and it is no longer there.",
        "points": [
            {"eyebrow": "Then", "title": "1978 to 1991", "body": "Nine Japanese conglomerates held 55% or more of global Hi-Fi share by 1982. Specialty retail differentiated with esoteric brands. The aspirational tier sold $1M systems without a stretch."},
            {"eyebrow": "Now", "title": "2014 to 2026", "body": "GoerTek, IAG, HSG and Cosonic consolidate the floor. Tweeter is gone, Magnolia is inside Best Buy, Krell closed and is reopening, B&O is public and at less than half its peak."},
            {"eyebrow": "The outlier", "title": "Bang & Olufsen, 2007/08", "body": "Peak revenue of about $853M, roughly $1.25B in 2026 dollars. You had to put in the work to acquire B&O, the audio equivalent of the Birkin bag. New management didn't recognise their beachhead and almost destroyed the brand."}
        ],
        "metrics": [
            {"value": "853", "unit": "M USD", "label": "B&O peak revenue", "conditions": "FY2007/08, about $1.25B in 2026 dollars"},
            {"value": "402", "unit": "M USD", "label": "B&O revenue now", "conditions": "FY2023/24, Copenhagen-listed"},
            {"value": "8.35", "unit": "B USD", "label": "Samsung buys Harman", "conditions": "Seventeen brands in one transaction"}
        ],
        "quote": {"text": "History does not repeat. It rhymes.", "cite": "Section title from the brand development document"}
    },
    "deep": {
        "headline": "History rhymes.",
        "lede": tidy(timeline["section_title"]) + ". Two eras, the consolidation table, and why each of these facts matters to AGF.",
        "sections": [
            {"type": "timeline", "id": "then", "eyebrow": eras[0]["label"] + " · " + eras[0]["year_range"], "title": "The first wave", "items": [{"when": tidy(e["year"]), "title": tidy(e["title"]), "body": tidy(e["description"])} for e in eras[0]["events"]]},
            {"type": "timeline", "id": "now", "eyebrow": eras[1]["label"] + " · " + eras[1]["year_range"], "title": "The second wave", "items": [{"when": tidy(e["year"]), "title": tidy(e["title"]), "body": tidy(e["description"])} for e in eras[1]["events"]]},
            {"type": "compare", "id": "rhymes", "eyebrow": "Even Rails → Smooth Tracks", "title": "Where the eras rhyme", "columns": ["1978–1991", "2014–2026"],
             "rows": [{"category": tidy(c["category"]), "a": tidy(c["era_1_value"]), "b": tidy(c["era_2_value"]), "insight": tidy(c["insight"])} for c in timeline["comparison_points"]]},
            {"type": "table", "id": "consolidation", "eyebrow": tidy(consolidation["section_label"]), "title": tidy(consolidation["section_title"]), "lede": tidy(consolidation["intro_text"]),
             "columns": ["Acquirer", "Brands acquired", "Value"], "numeric": [2], "rows": acq_rows,
             "note": "Dates and source links are blank for all but the Harman transaction in the document. Worth filling before this goes public."},
            {"type": "cards", "id": "why-it-matters", "eyebrow": tidy(explainer["section_label"]), "title": tidy(explainer["section_title"]), "lede": tidy(explainer["intro_text"]), "columns": 2,
             "items": [{"eyebrow": "Concept", "title": tidy(m["headline"]), "body": tidy(m["body"])} for m in explainer["modules"]]},
            {"type": "metrics", "id": "at-a-glance", "eyebrow": tidy(overview["section_label"]), "title": tidy(overview["section_title"]), "lede": tidy(overview["headline"]), "orbit": False,
             "items": [{"value": tidy(m["value"]), "label": tidy(m["label"]), "conditions": tidy(m.get("context"))} for m in overview["metrics"]],
             "note": "The $4.2B TAM and the \"12+\" acquisitions count come from the document's At-a-Glance block without a cited source. Treat as unverified until sourced."},
            {"type": "prose", "id": "summary", "eyebrow": "Summary", "title": "The thesis in three lines", "body": tidy(overview["summary"])}
        ]
    }
}
write(os.path.join(SITE, "opportunity", "content.json"), opportunity)

# --------------------------------------------------------------------------
# 03 · Stack
def tech_cards():
    old = {t["id"]: t for t in tech_old["technologies"]}
    items = []
    status_label = {"patented": "Patented", "trade_secret": "Trade secret", "pending": "Patent pending", "open": "Open"}
    for t in tech["technologies"]:
        o = old.get(t["id"], {})
        caps = [tidy(c) for c in t.get("key_capabilities", [])]
        # the editor split one capability on its comma; stitch it back
        caps = [c for c in caps if c]
        stitched = []
        for c in caps:
            if stitched and re.match(r"^\d{3}pc", c):
                stitched[-1] = stitched[-1] + "," + c
            else:
                stitched.append(c)
        card = {"eyebrow": tidy(t["full_name"]), "brass": True, "title": tidy(t["name"]), "pull": tidy(t.get("tagline")),
                "body": tidy(t.get("description")), "list": stitched,
                "kv": [["Advantage", tidy(t.get("competitive_advantage"))]],
                "tags": [status_label.get(t.get("patent_status"), tidy(t.get("patent_status")))]}
        if o.get("patent_status") and o["patent_status"] != t.get("patent_status"):
            card["note"] = "Patent status differs between document versions: %s (July 6) versus %s (July 14). Shown as the newer one. This must be settled before publication." % (status_label.get(o["patent_status"]), status_label.get(t.get("patent_status")))
        items.append(card)
    return items

lart = next(t for t in tech["technologies"] if t["id"] == "lart")
stack = {
    "slug": "stack",
    "intro": {
        "headline": "Flawless implementation of stereo. Everything else is gravy.",
        "lede": tidy(tech["lart_stack"]["body"]),
        "points": [
            {"eyebrow": "l'Art", "title": "Acoustic teleportation, not surround sound", "body": "Stereo is already 3D when implemented properly. l'Art does not add speakers or processing. It removes stereo's only real downside: the sweet spot."},
            {"eyebrow": "BT'N-Tech", "title": "Every extra dB compounds", "body": "From toroidal chokes to full waveform regeneration. Well known at industrial scale, virtually absent in consumer audio. The hidden benefit propagates through every product and the entire strategy."},
            {"eyebrow": "stereOS", "title": "The operating system for performing arts", "body": "Third parties don't license codecs. They adopt AGF's implementation. Kernel locked, application space open, content positioned as premium."}
        ],
        "metrics": [
            {"value": "6", "label": "Technologies in the stack", "conditions": "l'Art · stereOS · BT'N-Tech · l'espacI/O · FRC41 · No-Nails"},
            {"value": "5", "label": "Pipeline stages", "conditions": "Capture, encode, decode, render, experience"},
            {"value": "<30", "unit": "Hz", "label": "Symphony bass reach", "conditions": "Single 8-inch woofer, transmission line, audibly balanced at low volume"}
        ],
        "metrics_note": "The Symphony figure is a design target from the document, not a measurement yet.",
        "quote": {"text": tidy(lart["description"]).split("\n\n")[0], "cite": "l'Art, from the document"}
    },
    "deep": {
        "headline": tidy(tech["section_title"]),
        "lede": tidy(tech["intro_text"]).replace("\n\n", " "),
        "sections": [
            {"type": "prose", "id": "in-one-breath", "eyebrow": tidy(tech["lart_stack"]["eyebrow"]), "title": tidy(tech["lart_stack"]["headline"]), "large": True, "body": tidy(tech["lart_stack"]["body"])},
            {"type": "pipeline", "id": "pipeline", "eyebrow": "The l'Art pipeline", "title": "Capture to experience", "stages": [{"name": tidy(s["name"]), "description": tidy(s["description"])} for s in tech["codec_diagram"]["stages"]]},
            {"type": "cards", "id": "technologies", "eyebrow": "Six technologies", "title": "The moat, card by card", "columns": 2, "items": tech_cards(),
             "note": "Capabilities and advantages are the July 14 version. The July 6 version (content/sections/technology.v2.json) adds a few lines worth considering: Sony America's California R&D had similar tech and 'the marketing guys completely ruined it'; No-Nails lists beryllium-alloy HF in the dustcap position and light final-stage DSP; FRC41's effect is described as moving to a pair of high-end speakers in the sweet spot."},
            {"type": "pipeline", "id": "lart-stages", "eyebrow": "l'Art, stage by stage", "title": "What each stage does", "stages": [{"name": tidy(s["stage"]), "description": tidy(s["description"])} for s in lart["codec_pipeline"]]}
        ]
    }
}
write(os.path.join(SITE, "stack", "content.json"), stack)

# --------------------------------------------------------------------------
# 04 · Lineup
def money(v):
    if v is None: return ""
    return "$%s" % format(int(v), ",")
def asp(p):
    a = (p.get("business") or {}).get("asp_usd") or {}
    lo, hi = a.get("min"), a.get("max")
    if lo is None: return "TBD"
    return money(lo) if lo == hi else money(lo) + "–" + money(hi)
def ttm(p):
    t = (p.get("business") or {}).get("ttm_months") or {}
    if not t: return "TBD"
    return "%s–%s mo" % (t.get("min"), t.get("max"))
def drivers(p):
    out = []
    for d in (p.get("audio") or {}).get("drivers") or []:
        bits = []
        if d.get("quantity"): bits.append("%d×" % d["quantity"])
        if d.get("size_mm"): bits.append("%d mm" % d["size_mm"])
        if d.get("material"): bits.append(d["material"])
        bits.append(d.get("type", ""))
        out.append(" ".join(b for b in bits if b))
    return ", ".join(out)
def wireless(p):
    out = []
    for w in (p.get("connectivity") or {}).get("wireless") or []:
        s = w.get("protocol", "")
        if w.get("version"): s += " " + str(w["version"])
        if w.get("codecs"): s += " (" + ", ".join(w["codecs"]) + ")"
        out.append(s)
    return "; ".join(out)
def wired(p):
    return ", ".join((w.get("connector", "") + (" " + w["format"] if w.get("format") else "")) for w in ((p.get("connectivity") or {}).get("wired") or []))

prod_cards = []
spec_sections = []
for p in products:
    kv = [["Status", p["status"]], ["ASP", asp(p)], ["TTM", ttm(p)]]
    card = {"eyebrow": p["category"], "brass": True, "title": tidy(p["name"]), "pull": tidy(p.get("tagline")), "body": tidy(p.get("description")),
            "list": [tidy(x) for x in ((p.get("competitive_reference") or {}).get("key_differentiators") or [])],
            "kv": kv, "tags": list(p.get("agf_technologies") or [])}
    prod_cards.append(card)
    rows = []
    if drivers(p): rows.append(["Drivers", drivers(p), "", ""])
    fr = (p.get("audio") or {}).get("frequency_response")
    if fr: rows.append(["Frequency response", "%s–%s" % (fr.get("low_hz"), fr.get("high_hz")), "Hz", "design target"])
    amp = (p.get("audio") or {}).get("amplification")
    if amp:
        v = "Class " + str(amp.get("class", ""))
        if amp.get("channels"): v += ", %d channels" % amp["channels"]
        if amp.get("watts_per_channel"): v += ", %d W per channel" % amp["watts_per_channel"]
        rows.append(["Amplification", v, "", tidy(amp.get("topology", ""))])
    dac = (p.get("audio") or {}).get("dac")
    if dac: rows.append(["DAC", dac.get("architecture", ""), "", ""])
    enc = (p.get("audio") or {}).get("enclosure")
    if enc: rows.append(["Enclosure", enc.get("type", ""), "", ""])
    if wireless(p): rows.append(["Wireless", wireless(p), "", ""])
    if wired(p): rows.append(["Wired", wired(p), "", ""])
    ff = p.get("form_factor") or {}
    dims = ff.get("dimensions")
    if dims: rows.append(["Dimensions", "%s × %s × %s" % (dims.get("height_mm"), dims.get("width_mm"), dims.get("depth_mm")), "mm", "H × W × D"])
    if ff.get("finish"): rows.append(["Finish", tidy(ff["finish"]), "", ", ".join(ff.get("materials") or [])])
    if ff.get("variants"): rows.append(["Variants", " · ".join(v["name"] for v in ff["variants"]), "", " · ".join(tidy(v.get("differentiator", "")) for v in ff["variants"])])
    pw = p.get("power") or {}
    if pw.get("battery_life_hours"): rows.append(["Battery", str(pw["battery_life_hours"]), "h", tidy(pw.get("charging_type", ""))])
    cr = p.get("competitive_reference") or {}
    if cr.get("comparable_products"): rows.append(["Comparables", ", ".join(cr["comparable_products"]), "", tidy(cr.get("price_positioning", ""))])
    b = p.get("business") or {}
    if b.get("cogs_usd"): rows.append(["COGS", money(b["cogs_usd"]["min"]) + "–" + money(b["cogs_usd"]["max"]), "", "internal"])
    if b.get("asp_usd"): rows.append(["ASP", asp(p), "", "internal until priced"])
    rows.append(["Time to market", ttm(p), "", ", ".join(b.get("certifications") or [])])
    spec_sections.append({"type": "spec", "id": "spec-" + p["slug"], "eyebrow": "Specification · " + p["category"], "title": tidy(p["name"]), "caption": tidy(p.get("tagline")), "rows": rows,
                          "note": tidy(p.get("roadmap_notes")) if p.get("roadmap_notes") else None})

lineup = {
    "slug": "lineup",
    "intro": {
        "headline": "Six products. One platform where it pays.",
        "lede": "Optimized for time-to-market on a full line that stands up to scrutiny from channel interest. The lower price categories are filled with third-party partner product; we move upward and land our flagship just above Focal's consumer offering.",
        "points": [
            {"eyebrow": "Ships first", "title": "Over-Ear — Home Centric", "body": "A dock that charges and feeds six pairs at once over RF, with Bluetooth as the fallback. Hardware about 80% complete, software about 70%. Four to six months to market."},
            {"eyebrow": "Shared tooling", "title": "Core-like small, soundbar, Symphony", "body": "Three SKUs on one electronics platform. The Symphony is where the No-Nails process becomes visible: a single 8-inch woofer in a transmission line reaching below 30 Hz."},
            {"eyebrow": "Halo", "title": "The Instrument", "body": "A pre-amp that presents as a measurement instrument, an audiophile reference and a mastering reference on one platform. Lands just above Focal while the Krell vacuum is open."}
        ],
        "metrics": [
            {"value": "6", "label": "Products in the inaugural line", "conditions": "Headphone, two all-in-ones, macro-system, flagship, earbud case"},
            {"value": "4–6", "unit": "mo", "label": "First ship", "conditions": "Over-Ear — Home Centric, ETL/FCC/CE budgeted at about $30K"},
            {"value": ">5", "unit": "K USD", "label": "Flagship price", "conditions": "The Instrument, just above Focal's consumer flagship"}
        ],
        "metrics_note": "Prices, COGS and tooling figures are internal planning numbers from the document and are flagged as such in the deep dive.",
        "quote": {"text": "Why are AirPod cases filled with plastic? What if the case itself was the point, and the earbuds were an exponentially lower-power byproduct?", "cite": "Wasted Real-Estate, from the document"}
    },
    "deep": {
        "headline": "The inaugural product line.",
        "lede": "Every product with its specification as the document holds it. Status, pricing and timing are planning values and will change.",
        "sections": [
            {"type": "cards", "id": "the-line", "eyebrow": "06 · The Lineup", "title": "Six products", "columns": 2, "items": prod_cards},
            {"type": "figures", "id": "renders", "eyebrow": "Renders", "title": "What exists on the bench", "lede": "CAD renders from the repository, shown as work in progress. No product photography exists yet.", "items": [
                {"src": "assets/renders/symphony-macro-system/symphony-tower-walnut-front.png", "caption": "Symphony Macro-System, walnut. 150 cm tall, 36 cm wide, under 20 cm deep."},
                {"src": "assets/renders/symphony-macro-system/symphony-tower-copper-front.png", "caption": "Symphony, brushed copper panel."},
                {"src": "assets/renders/symphony-macro-system/symphony-tower-green-brass-front.png", "caption": "Symphony, forest green with brass."},
                {"src": "assets/renders/symphony-macro-system/symphony-tower-black-brass-trim-front-angle-61.jpg", "caption": "Symphony, black with brass edge trim."},
                {"src": "assets/renders/over-ear-home-centric/over-ear-headphones-matte-black-copper-front-three-quarter-135.jpg", "caption": "Over-Ear — Home Centric, matte black with copper trim, on a head form."},
                {"src": "assets/renders/over-ear-home-centric/over-ear-headphones-matte-black-copper-earcup-closeup-136.jpg", "caption": "Over-Ear, earcup detail."},
                {"src": "assets/concept-boards/wasted-real-estate-earbud-case-board.webp", "caption": "Wasted Real-Estate concept board (AI-generated board; copy transcribed in assets/ASSETS.md)."}
            ], "note": "No renders exist yet for the Core-like all-in-ones or the Instrument. The Symphony folder holds two overlapping render sets (numbered JPGs from product-renders, transparent PNGs from the old site); both are kept until you pick."},
            {"type": "figures", "id": "also-on-the-bench", "eyebrow": "Not in the document", "title": "Also on the bench", "lede": "Four more objects have renders in the repository but no entry in the brand document: a studio microphone, a desktop broadcast microphone, a keyboard-format control surface and a desktop stereo amplifier.", "_assumed": True, "items": [
                {"src": "assets/renders/studio-microphone/studio-mic-shockmount-front-angle-202.jpg", "caption": "Large-diaphragm studio microphone in a wire shock mount, AGF mark on the crossbar."},
                {"src": "assets/renders/broadcast-microphone/broadcast-mic-greybox-front-angle-1.png", "caption": "Desktop broadcast microphone on a weighted base (grey-box CAD)."},
                {"src": "assets/renders/control-surface/control-surface-greybox-angle-1.png", "caption": "Keyboard-format control surface with hinged encoder and fader strip (grey-box CAD)."},
                {"src": "assets/renders/desktop-stereo-amp/desktop-amp-black-front-65.jpg", "caption": "Desktop stereo amplifier, black faceplate, walnut cheeks."},
                {"src": "assets/renders/desktop-stereo-amp/desktop-amp-silver-front-agf-logo-small-jr.png", "caption": "Desktop stereo amplifier, silver faceplate."}
            ], "note": "Decide whether these are products, the l'Art Production line, or explorations. They are shown so nothing is lost; cutting is one line in content.json."}
        ] + spec_sections + [
            {"type": "table", "id": "runway", "eyebrow": "The runway, at a glance", "title": "Time to market, cost and price", "columns": ["Product", "TTM", "COGS", "ASP", "Notes"],
             "rows": [[tidy(r["product"]), tidy(r["ttm"]), tidy(r["cogs_range"]), tidy(r["asp_range"]), tidy(r["notes"])] for r in biz["runway_table"]],
             "note": "Internal planning table. Decide whether COGS stays on any public page."}
        ]
    }
}
write(os.path.join(SITE, "lineup", "content.json"), lineup)

# --------------------------------------------------------------------------
# 05 · Venue
zones = sorted(venue["zones"], key=lambda z: z.get("customer_journey_step", 0))
venue_c = {
    "slug": "venue",
    "intro": {
        "headline": "The venue. A church of the performing arts.",
        "lede": "No sales floor. No clipboards. You arrive through a bar you'd find in any world-class city, with a band downstairs, and discover the consumer product only after you've decided you trust the room.",
        "points": [{"eyebrow": tidy(z["name"]), "title": tidy(z["tagline"]), "body": tidy(z["atmosphere"])} for z in zones],
        "metrics": [
            {"value": "1", "label": "Venue per qualifying market", "conditions": "Never two; measured by arts-aware buyer density and a host partner"},
            {"value": "100", "unit": "%", "label": "Donations to local artists", "conditions": "Front of House ticket donations"},
            {"value": "50/50", "label": "Broadcast split", "conditions": "In perpetuity, co-owned master, artist may block"}
        ],
        "quote": {"text": "Live performance is the brand surface; the consumer product is the secret you discover after you've decided you trust the room.", "cite": "Cultural positioning, from the document"}
    },
    "deep": {
        "headline": tidy(venue["section_title"]) + ".",
        "lede": tidy(venue["concept_description"]).replace("\n\n", " "),
        "sections": [
            {"type": "cards", "id": "zones", "eyebrow": "Three zones", "title": "Front of House, Balcony, Green Room", "columns": 1,
             "items": [{"eyebrow": "Step %s · %s" % (z.get("customer_journey_step"), tidy(z["tagline"])), "brass": True, "title": tidy(z["name"]), "body": tidy(z["description"]), "list": [tidy(f) for f in z.get("features", [])], "kv": [["Vibe", tidy(z["atmosphere"]).replace("Vibe: ", "")]]} for z in zones]},
            {"type": "figures", "id": "boards", "eyebrow": "Concept boards", "title": "How it has been pictured so far", "items": [
                {"src": "assets/concept-boards/venue-three-panel-board-front-of-house-balcony-green-room.webp", "caption": "Three-panel venue board: Front of House, the Balcony, the Green Room (AI-generated)."},
                {"src": "assets/concept-boards/venue-balcony-marble-control-surface-concept.webp", "caption": "The Balcony: a marble control surface over the stage, virtual tickets and live-to-air countdown (AI-generated)."},
                {"src": "assets/section-backgrounds/venue-background.webp", "caption": "Venue interior mood (AI-generated)."}
            ], "note": "All venue imagery is AI-generated mood work. Fine for discussion, not for publication."},
            {"type": "steps", "id": "journey", "eyebrow": tidy(venue["section_label"]), "title": "Five steps", "items": [{"body": tidy(s["description"])} for s in venue["customer_journey"]]},
            {"type": "prose", "id": "customer", "eyebrow": "Who it is for", "title": "The target customer", "body": tidy(venue["target_customer_profile"])},
            {"type": "cards", "id": "royalties", "eyebrow": "Royalty structure", "title": "What the artist keeps", "columns": 2, "items": [
                {"eyebrow": "Broadcast split", "title": "50/50 in perpetuity", "body": tidy(venue["royalty_structure"]["broadcast_split"])},
                {"eyebrow": "Stereo ownership", "title": "The artist's, full stop", "body": tidy(venue["royalty_structure"]["stereo_ownership"])},
                {"eyebrow": "Blocking rights", "title": "Without cause", "body": tidy(venue["royalty_structure"]["artist_blocking_rights"])},
                {"eyebrow": "Why", "title": "Front-running the outrage", "body": tidy(venue["royalty_structure"]["notes"])}]},
            {"type": "cards", "id": "virtual-ticket", "eyebrow": "Virtual ticket", "title": "In the room without being in the room", "columns": 2, "items": [
                {"eyebrow": "Concept", "title": "Broadcast-mixed feed", "body": tidy(venue["virtual_ticket"]["concept"])},
                {"eyebrow": "Pricing", "title": "Artist-set, venue floor", "body": tidy(venue["virtual_ticket"]["pricing_model"])},
                {"eyebrow": "Owner perk", "title": "Permanent all-access", "body": tidy(venue["virtual_ticket"]["owner_perks"])}]},
            {"type": "list", "id": "financial-model", "eyebrow": "Financial model", "title": "Flagship only, one per market", "body": tidy(venue["financial_model"]["philosophy"]) + "\n\n" + tidy(venue["financial_model"]["qualification_rule"]), "items": [tidy(r) for r in venue["financial_model"]["revenue_streams"]]},
            {"type": "cards", "id": "cultural-positioning", "eyebrow": "Cultural positioning", "title": "Touch grass", "columns": 2, "items": [
                {"eyebrow": "Movement", "title": "What it aligns with", "body": tidy(venue["cultural_positioning"]["movement"])},
                {"eyebrow": "Anti-pattern", "title": "What it is not", "body": tidy(venue["cultural_positioning"]["anti_pattern"])},
                {"eyebrow": "Summary", "title": "The stance", "body": tidy(venue["cultural_positioning"]["summary"])}]}
        ]
    }
}
write(os.path.join(SITE, "venue", "content.json"), venue_c)

# --------------------------------------------------------------------------
# 06 · Artists
artists_c = {
    "slug": "artists",
    "intro": {
        "headline": "Artists drive their own destiny.",
        "lede": "The standard stereo capture and the on-site recording belong to the artist, full stop. The broadcast-mixed version is co-owned 50/50 in perpetuity, and the artist can block any broadcast without cause.",
        "points": [{"eyebrow": "%d%% artist · %d%% AGF" % (t["artist_share_percent"], t["agf_share_percent"]), "title": tidy(t["tier_name"]), "body": tidy(t["description"])} for t in artists["ownership_tiers"]],
        "metrics": [
            {"value": "100", "unit": "%", "label": "Artist share of stereo master", "conditions": "Raw capture; mix, master and sell through any channel"},
            {"value": "50/50", "label": "Broadcast-mixed split", "conditions": "In perpetuity; artist sets forever-copy pricing"},
            {"value": "0", "label": "Cause needed to block a broadcast", "conditions": "Artist's right, even on the 50/50 version"}
        ],
        "quote": {"text": "We front-run the inevitable open-source-advocate and big-tech-smear-campaign outrage by being the most artist-favorable contract in the industry.", "cite": "Artist rights philosophy, from the document"}
    },
    "deep": {
        "headline": tidy(artists["section_title"]),
        "lede": "The philosophy, the three ownership tiers, how the agreement is enforced, and every revenue stream with its split.",
        "sections": [
            {"type": "prose", "id": "philosophy", "eyebrow": "Philosophy", "title": "A vibrant, financially healthy arts community", "large": True, "body": tidy(artists["philosophy"])},
            {"type": "cards", "id": "tiers", "eyebrow": "Ownership tiers", "title": "Three versions of every performance", "columns": 1,
             "items": [{"eyebrow": "%d%% artist · %d%% AGF" % (t["artist_share_percent"], t["agf_share_percent"]), "brass": True, "title": tidy(t["tier_name"]), "body": tidy(t["description"]), "list": ["Right: " + tidy(r) for r in t.get("rights", [])] + ["Restriction: " + tidy(r) for r in t.get("restrictions", [])]} for t in artists["ownership_tiers"]]},
            {"type": "cards", "id": "enforcement", "eyebrow": "Enforcement", "title": "Social first, legal second", "columns": 2, "items": [
                {"eyebrow": "Device lockout", "title": "Terms of service", "body": tidy(artists["enforcement"]["device_lockout"])},
                {"eyebrow": "Legal remedies", "title": "On behalf of the artist", "list": [tidy(x) for x in artists["enforcement"]["legal_remedies"]]},
                {"eyebrow": "Social deterrent", "title": "A faux-pas, not a piracy panic", "list": [tidy(x) for x in artists["enforcement"]["social_deterrent"]]}]},
            {"type": "table", "id": "revenue-streams", "eyebrow": "Revenue streams", "title": "Every stream and its split", "columns": ["Stream", "What it is", "Split"],
             "rows": [[tidy(r["stream"]), tidy(r["description"]), tidy(r["split"])] for r in artists["revenue_streams"]]}
        ]
    }
}
write(os.path.join(SITE, "artists", "content.json"), artists_c)

# --------------------------------------------------------------------------
# 07 · Business
status_word = {"dominant": "Dominant", "struggling": "Struggling", "closed": "Closed", "reopening": "Reopening", "ceiling": "Ceiling", "premium-fill": "Premium fill"}
business = {
    "slug": "business",
    "intro": {
        "headline": "Numbers, runway, and the way the money actually works.",
        "lede": "Once a sales team has a customer, price is not the negotiation. They are negotiating a budgeted total package. Premium buyers do not want a discount. They want a reason.",
        "points": [
            {"eyebrow": "Pricing", "title": tidy(biz["pricing_strategy"]["model_name"]), "body": tidy(biz["pricing_strategy"]["description"])},
            {"eyebrow": "Channel", "title": "The future bank-roller", "body": "Owner-operators, often 20+ years in, built Polk, Definitive and McIntosh and are now treated as disposable. AGF is critically better than the devil they know: third-party fill on the floor, our line moving up, the flagship just above Focal."},
            {"eyebrow": "Position", "title": "Just above Focal, well below the ceiling", "body": "B&O struggles. Krell reopens. Focal sets the consumer ceiling. Burmester proves the pricing model. D'Agostino proves a ceiling exists. AGF lands in the seam with a venue model none of them have."}
        ],
        "metrics": [
            {"value": "199→299", "unit": "USD", "label": "Relay price ladder", "conditions": "Sales went up at each step"},
            {"value": "5,999", "unit": "EUR", "label": "Burmester packaging", "conditions": "For a $200-class device, for convenience"},
            {"value": "~1,000", "unit": "pcs/mo", "label": "Focal flagship volume", "conditions": "With a focused rep firm; the year-one comparable"}
        ],
        "quote": {"text": "The performance is above average, but you seem to have figured out some details we haven't. We package it with clients for convenience at €5,999.", "cite": "A Burmester executive at Munich High-End, as quoted in the document"}
    },
    "deep": {
        "headline": tidy(biz["section_title"]),
        "lede": "Pricing, channel approach and the revenue model; then distribution in detail; then where AGF lands against the field.",
        "sections": [
            {"type": "cards", "id": "pricing", "eyebrow": "Pricing", "title": tidy(biz["pricing_strategy"]["model_name"]), "columns": 2, "items": [
                {"eyebrow": "Philosophy", "title": "Price is not the negotiation", "body": tidy(biz["pricing_strategy"]["philosophy"])},
                {"eyebrow": "The model", "title": "Price the package, not the unit", "body": tidy(biz["pricing_strategy"]["description"])}]},
            {"type": "cards", "id": "channel", "eyebrow": "Channel approach", "title": tidy(biz["channel_approach"]["model_name"]), "columns": 2, "items": [
                {"eyebrow": "Philosophy", "title": "Curated third-party fills the floor", "body": tidy(biz["channel_approach"]["philosophy"])},
                {"eyebrow": "Partner types", "title": "Who we sell with", "list": [tidy(x) for x in biz["channel_approach"]["partner_types"]]},
                {"eyebrow": "Target partners", "title": "Who we call first", "list": [tidy(x) for x in biz["channel_approach"]["target_partners"]]}]},
            {"type": "prose", "id": "revenue-model", "eyebrow": "Revenue model", "title": "Hardware-led with a codec and OS halo", "body": tidy(biz["revenue_model"])},
            {"type": "prose", "id": "scaling", "eyebrow": tidy(biz["scaling_heading"]), "title": "Three phases over five years", "body": tidy(biz["scaling_timeline"])},
            {"type": "prose", "id": "distribution", "eyebrow": "09 · Distribution", "title": tidy(dist["section_title"]), "large": True, "body": tidy(dist["philosophy"])},
            {"type": "table", "id": "partner-criteria", "eyebrow": "Partner criteria", "title": tidy(dist["partner_criteria_heading"]), "columns": ["Criterion", "What it evaluates", "Weight"], "numeric": [2],
             "rows": [[tidy(c["criterion"]), tidy(c["description"]), "%d%%" % round(c["weight"] * 100)] for c in dist["partner_criteria"]]},
            {"type": "table", "id": "territories", "eyebrow": "Territories", "title": "Where, in what order", "columns": ["Region", "Strategy", "Priority"], "numeric": [2],
             "rows": [[tidy(t["region"]), tidy(t["strategy"]), str(t["priority"])] for t in sorted(dist["territories"], key=lambda t: t["priority"])]},
            {"type": "cards", "id": "channel-types", "eyebrow": "Channel types", "title": "Five channels, five approaches", "columns": 2,
             "items": [{"eyebrow": "Channel", "title": tidy(c["type"]), "body": tidy(c["description"]), "kv": [["Approach", tidy(c["approach"])]]} for c in dist["channel_types"]]},
            {"type": "prose", "id": "distribution-revenue", "eyebrow": "Channel economics", "title": "Third-party fills the floor; AGF owns the ceiling", "body": tidy(dist["revenue_model"])},
            {"type": "cards", "id": "competitive-positioning", "eyebrow": "11 · Competitive positioning", "title": "Where AGF lands", "lede": tidy(comp["intro_text"]), "columns": 2,
             "items": [{"eyebrow": status_word.get(c["status"], c["status"]) + " · prestige %s · ~%s" % (c["prestige_score"], money(c["price_usd_avg"])), "brass": c["brand"] == "AGF", "title": tidy(c["brand"]), "pull": tidy(c["category"]), "list": [tidy(k) for k in c.get("key_data_points", [])], "body": tidy(c["agf_positioning"]), "kv": [["Opening", tidy(c["opening"])]]} for c in comp["competitors"]],
             "note": "The document renders these on a perceptual map (log price versus prestige). That chart is on the list for the next pass; the cards carry the same data."},
            {"type": "prose", "id": "summary", "eyebrow": "Summary", "title": "The seam", "body": tidy(comp["summary"])}
        ]
    }
}
write(os.path.join(SITE, "business", "content.json"), business)

# --------------------------------------------------------------------------
# 08 · Roadmap
def phase_items():
    items = []
    for ph in roadmap["phases"]:
        ms = []
        for m in ph.get("milestones", []):
            if isinstance(m, dict):
                ms.append("%s (month %s, %s)" % (tidy(m.get("label")), m.get("slot"), m.get("type")))
            else:
                ms.append(tidy(m))
        items.append({"when": "Months %d–%d · TTM %s" % (ph["start_slot"], ph["start_slot"] + ph["duration_slots"] - 1, tidy(ph["ttm"])), "title": tidy(ph["title"]), "body": tidy(ph["rationale"]) + ("\n\n" + "\n".join("• " + x for x in ms) if ms else ""), "tag": "Ships: " + ", ".join(ph.get("products", []))})
    return items

roadmap_c = {
    "slug": "roadmap",
    "intro": {
        "headline": "Three phases, one shared platform where it pays.",
        "lede": tidy(roadmap["intro_text"]),
        "points": [
            {"eyebrow": "Phase 1", "title": "Over-Ear ships first", "body": "Fastest TTM in the line, ETL pre-approved power supply paths. Establishes AGF in market, funds the rest of the line, validates the channel."},
            {"eyebrow": "Phase 2", "title": "Core-like and Symphony together", "body": "Shared tooling, three SKUs, one investment. The Symphony goes to long-lead reviewers at $29,990 and to retail at $2,990."},
            {"eyebrow": "Phase 3", "title": "The Instrument, then the return of Wasted Real-Estate", "body": "The halo lands while Krell rebuilds dealer trust. The suppressed Dolby concept returns, paired with five venue pilots, and the backstory carries the launch."}
        ],
        "metrics": [
            {"value": "24", "unit": "mo", "label": "Planning horizon", "conditions": "Six swimlanes on the document's Gantt"},
            {"value": "5", "label": "Venue pilots", "conditions": "First five financially qualifying markets, one per market"},
            {"value": "1,000", "unit": "pcs/mo", "label": "Year-one run-rate target", "conditions": "Global, across 100+ retail partners"}
        ],
        "quote": {"text": "Anchors the perceived ceiling, then drops the ladder.", "cite": "The Symphony review-tier stunt, from the document"}
    },
    "deep": {
        "headline": tidy(roadmap["section_title"]),
        "lede": tidy(roadmap["intro_text"]),
        "note": "The document drew this as a 24-month Gantt with milestone markers for PR stunts, venue pilots and volume targets. The Gantt is queued for the next pass; the timeline below carries the same months.",
        "sections": [
            {"type": "timeline", "id": "phases", "eyebrow": "Six swimlanes", "title": "The phases, month by month", "items": phase_items()},
            {"type": "cards", "id": "pr-levers", "eyebrow": "PR levers", "title": "Two stunts, timed to the sequence", "columns": 2,
             "items": [{"eyebrow": tidy(s["timing"]), "title": tidy(s["name"]), "body": tidy(s["description"])} for s in roadmap["pr_stunts"]]},
            {"type": "prose", "id": "venue-pilots", "eyebrow": "Venue pilots · %d" % roadmap["venue_pilots"]["count"], "title": "First five markets", "body": tidy(roadmap["venue_pilots"]["criteria"]) + "\n\n" + tidy(roadmap["venue_pilots"]["notes"])},
            {"type": "prose", "id": "year-one", "eyebrow": "Year-one targets", "title": "%s pieces a month, globally" % format(roadmap["year_one_targets"]["global_units_per_month"], ","), "body": tidy(roadmap["year_one_targets"]["anchor_reference"]) + "\n\n" + tidy(roadmap["year_one_targets"]["notes"])},
            {"type": "prose", "id": "beyond", "eyebrow": "Beyond year one", "title": "Phased rollout to year five", "body": tidy(biz["scaling_timeline"])}
        ]
    }
}
write(os.path.join(SITE, "roadmap", "content.json"), roadmap_c)

# --------------------------------------------------------------------------
# 09 · Founder
founder_c = {
    "slug": "founder",
    "intro": {
        "headline": "Twenty-five years in this market, longer if you count the garage sales.",
        "lede": "Benjamin Webster, founder and CEO. Content production, retail distribution, technology provider, brands, professional and consumer: every side of the fence, from a business perspective.",
        "points": [
            {"eyebrow": "Mass Fidelity", "title": "The first commercial wave field synthesis", "body": "Core and Relay. The Relay PR tour ran 291% over plan. Munich High-End. The Burmester conversation. The proof of every tenet in real-world operation."},
            {"eyebrow": "Dolby", "title": "The skunkworks", "body": "Build products no one could get mad at. Remora, the soundbar that lived behind the TV. Apple got mad anyway; the IP still drives Dolby headphone revenue nearly a decade later."},
            {"eyebrow": "NMI Devices", "title": "What Sonos became, architecturally", "body": "One of the first teams in the world on DSP-driven amplification. Shuttered after the big Japanese brands decided a digital amp would never sound good and nobody would network their music."}
        ],
        "metrics": [
            {"value": "25", "unit": "yr", "label": "Domain depth", "conditions": "From pawn-shop trading to the plan on the page"},
            {"value": "4", "label": "Companies", "conditions": "NMI Devices, Mass Fidelity, the Dolby skunkworks, AGF"},
            {"value": "291", "unit": "%", "label": "Relay PR tour over plan", "conditions": "Mass Fidelity, 2010s"}
        ],
        "quote": {"text": tidy(founder["cta_body"]), "cite": tidy(founder["cta_heading"]).replace("*", "")}
    },
    "deep": {
        "headline": tidy(founder["section_title"]),
        "lede": "%s, %s. %d years of accumulated domain depth, the milestones, the mentors, and the companies." % (founder["name"], founder["title"], founder["domain_depth_years"]),
        "sections": [
            {"type": "timeline", "id": "milestones", "eyebrow": "Milestones", "title": "From the garage sales to AGF", "items": [{"when": tidy(m["year"]), "title": tidy(m["event"]), "body": tidy(m.get("description", "")) + ("\n\n**Outcome:** " + tidy(m["outcome"]) if m.get("outcome") else "") , "tag": (tidy(m["company"]) + " · " if m.get("company") else "") + tidy(m.get("significance", ""))} for m in founder["milestones"]]},
            {"type": "figures", "id": "prior-work", "eyebrow": "Prior work", "title": "Things that shipped, or almost did", "items": [
                {"src": "assets/prior-work/massfidelity-usb-audio-dac-black-gold-render.png", "caption": "Mass Fidelity USB Audio DAC, black with a brass control."},
                {"src": "assets/prior-work/remora-speaker-on-tv-rear-render.png", "caption": "Remora, the soundbar that lived behind the TV. Dolby skunkworks."},
                {"src": "assets/prior-work/remora-driver-layout-spec-diagram.png", "caption": "Remora driver layout: twelve racetrack drivers, four subwoofers, four passive radiators."},
                {"src": "assets/prior-work/round-earbud-case-with-earbuds-paul-simon-screen.png", "caption": "The earbud case concept at Dolby, before it became Wasted Real-Estate."}
            ], "note": "Renders carry Mass Fidelity and Dolby marks. Check rights before any of these go public."},
            {"type": "cards", "id": "companies", "eyebrow": tidy(founder["key_companies_heading"]), "title": "Four companies", "columns": 2,
             "items": [{"eyebrow": tidy(c["years"]), "title": tidy(c["name"]), "pull": tidy(c["role"]), "body": tidy(c["outcome"])} for c in founder["key_companies"]]},
            {"type": "table", "id": "mentors", "eyebrow": tidy(founder["mentors_heading"]), "title": "Ten mentors", "columns": ["Mentor", "Contribution", "Relationship"],
             "rows": [[tidy(m["name"]), tidy(m["contribution"]), tidy(m["relationship"])] for m in founder["mentors"]],
             "note": "Named people on a public page need their consent or a public record. Flag any name that should stay internal."},
            {"type": "prose", "id": "now-what", "eyebrow": "Next", "title": tidy(founder["cta_heading"]).replace("*", ""), "large": True, "body": tidy(founder["cta_body"]),
             "note": "The document's CTA was 'Request the Deck' with a placeholder address. The real contact is still an open question."}
        ]
    }
}
write(os.path.join(SITE, "founder", "content.json"), founder_c)

# --------------------------------------------------------------------------
# Page shells
def shell(page, opt, title, desc):
    rel = "./" if page == "portal" else "../"
    return """<!doctype html>
<html lang="en" data-theme="midnight">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>%s</title>
  <meta name="description" content="%s">
  <link rel="stylesheet" href="%sshared/agf.css">
  <link rel="stylesheet" href="%sshared/site.css">
</head>
<body data-page="%s"%s>
  <a class="skip" href="#main">Skip to content</a>
  <header id="nav"></header>
  <main id="main" aria-busy="true"></main>
  <footer id="foot"></footer>
  <script src="%sshared/site.js" defer></script>
</body>
</html>
""" % (title, desc.replace('"', "&quot;"), rel, rel, page, (' data-option="%s"' % opt) if opt else "", rel)

write(os.path.join(SITE, "index.html"), shell("portal", None, "AGF · All Grounds Floating", "The AGF reference site: nine doors into the brand, the opportunity, the stack, the lineup, the venue, artist rights, the business, the roadmap and the founder."))
for o in OPTIONS:
    write(os.path.join(SITE, o["slug"], "intro.html"), shell("intro", o["slug"], "AGF · %s · %s" % (o["number"], o["title"]), o["summary"]))
    write(os.path.join(SITE, o["slug"], "deep.html"), shell("deep", o["slug"], "AGF · %s · %s · Deep dive" % (o["number"], o["title"]), o["summary"]))

write(os.path.join(SITE, "serve.sh"), """#!/usr/bin/env sh
# Serve production-staging locally (site + assets). Browsers refuse to fetch
# JSON over file://, so open http://localhost:8787/site/ after running this.
# Needs only python3.
cd "$(dirname "$0")/.." && echo "Open http://localhost:8787/site/" && python3 -m http.server 8787
""")
os.chmod(os.path.join(SITE, "serve.sh"), 0o755)
print("wrote site.json, 9 content.json files, 19 pages, serve.sh")
