> Note (2026-10-27): the move to `archive/legacy-site/` is committed. The font files under `assets/` that duplicated `/fonts/` were then deleted (commit `03a1e31`; 22 files, all but `assets/Commissioner/README.txt`), and `styles/core/fonts.css` was repointed at the licensed web fonts in `/fonts/web/`. Sections 1.1 and 1.2 below describe the state at move time and are annotated where it has since changed.

# LEGACY-MAP: the retired AGF schema-driven brand site

Location: `archive/legacy-site/` (moved with `git mv` from `site/`, 2026-10-27, nothing deleted at move time; committed 2026-10-27; duplicate fonts removed and `fonts.css` repointed to `/fonts/web/` afterwards, see note above).
Purpose: a map detailed enough to rebuild every behaviour of the old site **without the server or database**. The content itself now lives in `production-staging/content/` (`sections/*.json`, `products/*.json`, `raw/*.json`).

Read this first, because four facts change how you read everything below:

1. **The package is two programs glued together.** The *web site* is `index.html` + `app/` + `schema-renderer.js` (monolith) + `components/` + `styles/` + `editor.js`. The *PDF spec sheet* is the top-level `README.md` + `index.js` + `helpers.js` + `sections/` + `css/` (extracted from `server/templates/product-pdf.js`). They share nothing but naming. `index.js`, `helpers.js`, `README.md` at the archive root are **PDF** files, not site files.
2. **`index.html` loads the monoliths, not the split trees.** It loads `schema-renderer.js`, `components/system-configurator.js` and `editor.js`. The split trees `schema-renderer/`, `components/system-configurator/` and `editor/` are generated extractions that are **not loaded** by anything. `app/` is the only split tree that is live (via `<script type="module" src="app/index.js">`).
3. **The live monolith and the split tree have diverged in both directions.** The live `schema-renderer.js` is newer in image-adjust support and has had its hardcoded fallback copy removed. The split `schema-renderer/` tree is newer in having `overview` and `concept-explainer` renderers, which the live monolith does not contain (so on the live site those two section types rendered an "Unsupported schema" stub). See section 9.1.
4. **"22 schemas with default_data" is only partly true.** There are 22 schemas; only 5 (`concept-explainer`, `cut-sheet`, `overview`, `prelude`, `team-note`) carry a `default_data` block. The `_viz_config` blocks carry per-field `default` values in the schema, but the chart components do **not** apply those defaults (details in 2.2).

## Contents

1. Move summary and duplicate-font report
2. Architecture
3. Module-by-module table (every .js file)
4. Component data contracts (components/)
5. app/bindings behaviours
6. Schema reference (22 schemas)
7. Styles layer and token comparison
8. Worth porting / do not port
9. Known defects
10. Appendix: exported content map

---

## 1. Move summary and duplicate-font report

### 1.1 What moved

| From | To |
|---|---|
| `site/README.md, index.html, index.js, helpers.js, editor.js, editor.js.broken, schema-renderer.js, schema-renderer.js.broken, vitest.config.js` | `archive/legacy-site/<same name>` |
| `site/app/ components/ css/ editor/ schema-renderer/ schemas/ sections/ styles/` | `archive/legacy-site/<same dir>/` |
| `site/assets/Commissioner`, `site/assets/Monoton`, `site/assets/PoiretOne-Regular` | `archive/legacy-site/assets/<same>/` |
| `site/assets/screenshots`, `site/assets/sections` | **not touched** (another agent's job) |

236 files moved, all recorded by git as pure renames (`R100`), and the move is committed. `site/` no longer exists. After the move, 22 of the moved font and licence files were deleted as duplicates of `/fonts/` (see 1.2), so the archive now holds 215 tracked files (236 minus 22 deleted, plus `LEGACY-MAP.md`). The `@font-face` URLs in `styles/core/fonts.css` originally pointed at the archived copies (`../../assets/...`); after those copies were deleted they were repointed to the web builds in `/fonts/web/` (`../../../../fonts/web/*.woff2`, resolved from `styles/core/`), keeping the same family names, weights and `font-display`. The legacy `assets/Commissioner/`, `assets/Monoton/` and `assets/PoiretOne-Regular/` paths shown in the table above are the move-time layout; only `assets/Commissioner/README.txt` remains.

### 1.2 Fonts versus `/fonts/` (sha256)

At move time every font file in the archive was **byte-identical** to a licensed source copy in `/home/user/agf/fonts/`. Because of that, the duplicates were later deleted (commit `03a1e31`); the table below records what they were, and the paths in its first column no longer exist on disk except `Commissioner/README.txt`.

| Archive file at move time (`archive/legacy-site/assets/...`; deleted unless noted) | sha256 (first 12) | Identical to |
|---|---|---|
| `Commissioner/Commissioner-VariableFont_FLAR,VOLM,slnt,wght.ttf` | dae2fae6fdd0 | `fonts/Commissioner/Commissioner-Variable.ttf` |
| `Commissioner/Commissioner-Thin.ttf` (and `static/` copy) | 82b742a9b4a2 | `fonts/Commissioner/static/Commissioner-Thin.ttf` |
| `Commissioner/Commissioner-ExtraLight.ttf` (and `static/` copy) | a7497824bc9b | `fonts/Commissioner/static/Commissioner-ExtraLight.ttf` |
| `Commissioner/Commissioner-Light.ttf` (and `static/` copy) | fadc0f71d5e6 | `fonts/Commissioner/static/Commissioner-Light.ttf` |
| `Commissioner/Commissioner-Regular.ttf` (and `static/` copy) | 296daea352fc | `fonts/Commissioner/static/Commissioner-Regular.ttf` |
| `Commissioner/Commissioner-Medium.ttf` (and `static/` copy) | c5b125c00a88 | `fonts/Commissioner/static/Commissioner-Medium.ttf` |
| `Commissioner/Commissioner-SemiBold.ttf` (and `static/` copy) | 319b6d2020b5 | `fonts/Commissioner/static/Commissioner-SemiBold.ttf` |
| `Commissioner/Commissioner-Bold.ttf` (and `static/` copy) | ae3c40df9181 | `fonts/Commissioner/static/Commissioner-Bold.ttf` |
| `Commissioner/Commissioner-ExtraBold.ttf` (and `static/` copy) | 3578fe76754b | `fonts/Commissioner/static/Commissioner-ExtraBold.ttf` |
| `Commissioner/Commissioner-Black.ttf` (and `static/` copy) | 26ddb4394ae5 | `fonts/Commissioner/static/Commissioner-Black.ttf` |
| `Monoton/Monoton-Regular.ttf` | 951c4cea65ff | `fonts/Monoton/Monoton-Regular.ttf` |
| `PoiretOne-Regular/PoiretOne-Regular.ttf` | 7529dd3270b3 | `fonts/PoiretOne/PoiretOne-Regular.ttf` |
| `Commissioner/OFL.txt` | d1dceb754629 | `fonts/licenses/OFL-Commissioner.txt` |
| `Commissioner/README.txt` | af60f53ac1dd | **no match** (Google Fonts download readme; only non-duplicate file) |

Result: 21 of 21 `.ttf` files are exact duplicates (12 distinct fonts; the 9 Commissioner statics are stored twice inside the archive, once loose and once in `static/`, and the variable file is the only one the CSS actually loads, along with Monoton and Poiret One). `OFL.txt` is also a duplicate. Monoton and Poiret One had no licence file in the archive; their licences are in `fonts/licenses/OFL-Monoton.txt` and `OFL-PoiretOne.txt`.

Outcome: the entire `archive/legacy-site/assets/` tree was deleted except `Commissioner/README.txt` (the only non-duplicate). Since `styles/core/fonts.css` pointed at the deleted files, it was repointed to `/home/user/agf/fonts/web/` (`Commissioner-Variable.woff2`, `Monoton-Regular.woff2`, `PoiretOne-Regular.woff2`). Note these are the WOFF2 web builds, not the byte-identical TTFs listed above, so the archived CSS now loads the same families and weights from different file formats. The archive's CSS therefore depends on the `/fonts/web/` directory staying in place relative to `archive/legacy-site/`.

---

## 2. Architecture

### 2.1 In one paragraph

`index.html` is an empty shell: a fixed `<header class="nav"><div class="nav-inner">`, an empty `<main id="app" aria-busy="true">` with a loading spinner, an empty `<footer class="foot"><div class="foot-inner">`, a toast container, a PCB-motif toggle button, and script tags. The ten visualisation components in `components/` load first and attach themselves to `window` (`PositioningChart`, `RoadmapChart`, `FreqResponse`, `DriverDiagram`, `TechFlow`, `ConnectivityBadges`, `PowerGauge`, `MaterialSwatches`, `ProductCompare`, `SystemConfigurator`). Then `schema-renderer.js` (deferred) defines `window.SchemaRenderer`, a registry mapping a section's `schema_id` to a function that returns an HTML string. Then `app/index.js` (an ES module) runs `mount()`, which fetches `/api/sections` and `/api/products`, drops invisible rows, sorts by `display_order`, builds the page HTML by calling `SchemaRenderer.renderSection(section)` for each section (the product collection is spliced in just before the `business-model` section), assigns it to `#app.innerHTML`, renders header and footer separately into `.nav-inner` / `.foot-inner`, re-applies stored style overrides/nudges/background images, and calls `bindAll()` to attach scroll/reveal/counter/tab/accordion behaviours. Chart hosts (`[data-chart]`) are mounted afterwards by a `MutationObserver` in `schema-renderer.js` using a `window.__agfChartData` cache; product visualisations are hydrated on the next animation frame from a per-product cache. `editor.js` (an in-page CMS, always on, no auth in the client) then adds click-to-edit, context menus, drag-and-drop uploads and a schema-driven form generator that writes back to `/api/*` and calls `window.AGF.refreshSection()` to re-render. `styles/index.css` is a manifest of 65 `@import`ed CSS partials sliced verbatim out of an original 4,557-line `styles.css`, with tokens in `styles/core/tokens.css`. `schemas/` holds 22 JSON-Schema files that drive both the editor forms and (informally) the renderers. Separately, `sections/` + `css/` + root `index.js`/`helpers.js` are a server-side PDF spec-sheet renderer (`renderPdfHtml(product, pdfConfig)`), and `vitest.config.js` is a stub pointing at a `tests/` directory that is not in the archive.

### 2.2 Cross-cutting conventions (these matter for a rebuild)

* **Data envelope.** A section row is `{id, schema_id, title, display_order, is_visible, created_at, updated_at, data}`; a product row is `{id, slug, name, category, status, display_order, is_visible, data}`. All content is in `data`. The export in `production-staging/content/sections/*.json` flattens `data` to top level and adds `_source`.
* **Underscore "convention fields"** are editor-managed keys that any section/product `data` may carry, independent of schema: `_style_overrides`, `_nudges`, `_background_image`, `_background_settings` (`{size: cover|contain|auto, position: "x y", opacity}`), `_figures` (`[{id, src, caption, placement: left|center|right, size: original|full|fit, position: top|after-head|bottom}]`), `_texts` (`[{id, content, position:{top%,left%}, width}]`), `_margin_to_margin` (boolean), `_viz_config`, `appendix` (markdown string). The export used by the new site strips the editor-only ones.
* **Appendix pattern.** Any section, and any list item with an `appendix` string, gets an `<div class="appendix-ref"><em>*Learn more in Appendix*</em></div>` link; clicking it opens a modal with the markdown rendered. Item-level refs carry `data-appendix-key="<dot.path>"` (for example `tenets.2`) and resolve `<dot.path>.appendix` on the data.
* **Edit hooks in the DOM.** Every editable value is rendered with `data-field="<dot.path>"`; every section root gets `data-section-id`/`data-schema`; every product card `data-product-slug`. A rebuild that drops the editor can drop all `data-field` attributes (but see `applyNudges`/`applyStyleOverrides`, which also key on them).
* **Reveal.** Most blocks carry the attribute `data-reveal`; CSS hides them (`opacity:0; translateY(24px)`) until JS adds `.is-in`.
* **Markdown.** `md()` supports only `**bold**`, `*italic*`, blank-line to `<br><br>`, newline to `<br>`; input is HTML-escaped first. No links, lists, headings.
* **Headings.** `head({num,label,title,deck,...})` renders `<div class="section-head"><p class="eyebrow">NUM · LABEL</p><h2 class="section-title">…</h2><p class="section-deck">…</p></div>`. `sanitizeHeadingTitle` escapes, turns newlines into `<br>`, and for single-line titles containing a `.` rewrites `"A. B."` into `A.<br/><em>B.</em>` (italic second sentence).
* **Chart defaults live in schemas, not code.** `_viz_config` field defaults (for example `x_axis.min = 500`) are declared in the JSON schemas and were applied by the editor/seed, **not** by `positioning-chart.js` or `roadmap-chart.js`. Those two components read the config raw. Product-viz components, by contrast, do apply code defaults (section 4).

### 2.3 Directory tree

```
archive/legacy-site/
├── README.md            PDF package readme (NOT the site)
├── index.html           site shell
├── index.js             PDF: renderPdfHtml()           (NOT the site)
├── helpers.js           PDF: esc, md, fmtRange, fmtUSD, sectionCfg
├── vitest.config.js     test stub (tests/ dir absent)
├── app/                 LIVE orchestrator (ES modules) + app/bindings/ (11 behaviours)
├── schema-renderer.js   LIVE monolith renderer (1,992 lines)
├── schema-renderer.js.broken   older revision of the above (1,911 lines)
├── schema-renderer/     NOT LOADED split extraction (helpers, heading, figure-utils, chart-*, renderers/, product/)
├── components/          LIVE visualisations; system-configurator.js live, system-configurator/ NOT loaded
├── editor.js            LIVE in-page CMS monolith (5,458 lines)
├── editor.js.broken     older revision (4,304 lines)
├── editor/              NOT LOADED split extraction (20 files) + LOAD_ORDER.md + EXTRACT_REPORT.txt
├── schemas/             22 *.schema.json
├── sections/ css/       PDF section renderers and CSS partials (NOT the site)
├── styles/              site CSS: index.css + _manifest.json + 11 groups of partials
└── assets/              only Commissioner/README.txt remains; fonts live in /fonts/ (see 1.2)
```

### 2.4 Boot and data flow

```
index.html
 ├─ <link styles/index.css?v=2026-06-27-cutover>   (+ Google Fonts Commissioner)
 ├─ components/*.js              -> window.PositioningChart, RoadmapChart, FreqResponse, DriverDiagram,
 │                                  TechFlow, ConnectivityBadges, PowerGauge, MaterialSwatches,
 │                                  ProductCompare, SystemConfigurator
 ├─ schema-renderer.js (defer)   -> window.SchemaRenderer = {renderSection, renderProductsBlock,
 │                                  hydrateProductVisualizations, renderers, helpers, mountCharts,
 │                                  renderHeader, renderFooter}; installs MutationObserver -> mountCharts
 ├─ app/index.js (module)        -> window.AGF = {state, mount, refreshAll, refreshSection,
 │                                  refreshProducts, renderHeaderFooter, toast}; mount() on DOMContentLoaded
 │     mount(): loadAll() -> app.innerHTML = buildPageHTML() -> renderHeaderFooter()
 │              -> applyAllStyleOverrides() -> bindAll() -> aria-busy=false
 └─ editor.js (defer)            -> waits for #app[aria-busy=false] (6 s failsafe), then boots editor;
                                    window.AGFEditor = {rebind, generateForm, collectForm}
```

Endpoints the client calls (the server is not in the archive; the new site needs none of them): `GET /api/sections`, `GET /api/sections/:id`, `GET /api/sections?schema=comparison-config`, `GET /api/products`, `GET /api/schemas`, `PUT/POST/DELETE /api/sections|products`, `PUT /api/sections/:id/order`, `POST /api/upload`, `GET /api/export/website`, and `GET /api/pdf/product/:slug` (the "Download PDF" link on each product card; server-side, presumably calling `renderPdfHtml(product, pdfConfigRow.data)` from the PDF package using the hidden `pdf-config` row; the server is not in the archive so this is inferred).

Page order produced by `buildPageHTML()` (sorted by `display_order`; header/footer/config schemas emit nothing into `#app`): hero(-1.5), consolidation(2), timeline(3), team-note(4), tenet(5), prelude(5.5 to 5.97, five rows), technology(5.75 / 7), concept-explainer(6, 8.5), venue(6), overview(8), **[products block]**, business-model(9), founder(10), distribution(11), artist-rights(12), competitive-positioning(13), launch-roadmap(14), tenet(17). See section 10 for the duplicates.



---

## 3. Module-by-module table (every .js file)

Legend: **LIVE** = loaded by `index.html`; **SPLIT** = generated extraction, not loaded; **PDF** = server-side PDF package. "Inputs" are the data fields read. Paths are relative to `archive/legacy-site/`.

### 3.1 Root files

| Path | Status | Exports / attaches | Inputs | DOM produced | Notable behaviour |
|---|---|---|---|---|---|
| `index.html` | LIVE | n/a | none | shell: `#scrollProgress`, `header#nav > .nav-inner`, `main#app[aria-busy]` with `#appLoading` spinner, `footer.foot > .foot-inner`, `#toast-container[aria-live=polite]`, `button#pcbToggle.pcb-toggle[aria-pressed=true]`; `<body class="is-pcb">` | Title "AGF — All Grounds Floating · Foundational Brand Development"; meta description about "strategic move into the global audio & consumer technology markets"; loads Google-hosted Commissioner **and** local TTF (duplicate); script order: components, `schema-renderer.js` (defer), `app/index.js` (module), `editor.js` (defer). |
| `schema-renderer.js` | LIVE | `window.SchemaRenderer` = `{renderSection, renderProductsBlock, hydrateProductVisualizations, renderers: REGISTRY, helpers:{esc,md,fmtUSD,fmtRange,splitHeadline,toRoman}, mountCharts, renderHeader, renderFooter}` | every section `data` | HTML strings for 18 schema ids (no overview/concept-explainer) | Helpers `esc, md, toRoman, appendixRef, fmtUSD, fmtRange, splitHeadline, groupIndependents, sanitizeHeadingTitle, head, imageSettingsDataAttrs, figureHTML, figuresByPosition, insertedTextsHTML`; `renderSection` wraps output: injects `data-section-id/data-schema/data-bg-*` into the first `<section>`, inserts `_figures` (top / after `.section-head` / bottom), `_texts`, and the appendix link; skips `comparison-config`, `pdf-config`, `header`, `footer`; unknown ids render an "Unsupported schema" stub; MutationObserver auto-mounts `[data-chart]` hosts. Hardcoded fallback copy was removed here (kept in `.broken`). |
| `schema-renderer.js.broken` | superseded | same API | same | same | Older revision (diff 227 lines). Parses fine (`node --check`), so "broken" means superseded/rolled back, not syntax-broken. Has all the hardcoded fallback copy, no image-adjust attrs, no dynamic consolidation columns, `strict-mode` function wrapper. |
| `editor.js` | LIVE | `window.AGFEditor = {rebind, generateForm, collectForm}` | `/api/schemas`, section/product rows | forms, overlays, context menu, panels | See 3.6. One IIFE; the older source had 98 top-level functions. |
| `editor.js.broken` | superseded | same | | | Older revision, space-indented (live file is tab-indented, apparently reformatted), without the image-adjust panel (`openImageAdjustPanel`, `persistImageSettings`, `applyLiveImagePreview`, `sliderRow`); still ~5,700 diff lines when whitespace is ignored. Parses fine (`node --check`). |
| `index.js` | PDF | `renderPdfHtml(product, pdfConfig)` (named + default) | `pdfConfig.brand_colors.{primary,accent,text}` (defaults `#1F4A2D`, `#B8860B`, `#1A1A1A`), `font_family` (default Commissioner), `template_sections[]`; `product.data.name`, `product.name` | full HTML document `<main class="agf-doc">` + inline `<style>` | If `template_sections` missing/empty, renders default order header, hero_image, overview, audio_specs(2 cols), connectivity, technologies(badges), form_factor, business_metrics(audience investor), footer(confidentiality notice). Title `"<name> · Spec Sheet"`. Does **not** use `safeRender` (see defects). |
| `helpers.js` | PDF | `esc, md, fmtRange, fmtUSD, sectionCfg` | n/a | n/a | `md` emits `</p><p>` for blank lines (site's `md` emits `<br><br>` instead). `fmtRange` guards `min/max` both undefined. `sectionCfg` is unused. |
| `vitest.config.js` | stub | vitest config | n/a | n/a | `environment: node`, `include: tests/**/*.test.{js,ts}`, `snapshotDir: tests/__snapshots__`, `testTimeout: 15000`, single fork "shared DB state". There is no `tests/` directory in the archive. |

### 3.2 app/ (the orchestrator, LIVE)

| Path | Exports | Inputs | DOM | Notable behaviour |
|---|---|---|---|---|
| `app/index.js` | sets `window.AGF = {state, mount, refreshAll, refreshSection, refreshProducts, renderHeaderFooter, toast}`; `window.AGF._errors=[]`, `_styleOrphans={overrides:[],nudges:[]}` | none | none | Boots `mount()` on DOMContentLoaded or immediately. Replaces (does not extend) any existing `window.AGF`. |
| `app/utils.js` | `$`, `$$`, `escapeHTML`, `resolveDotPath(obj,"a.0.b")` | n/a | n/a | `resolveDotPath` returns `''` unless the leaf is a string; array indices must be integers in range. |
| `app/cleanup.js` | `state {sections, products, rhymeAuto, intervals}`, `_bound {listeners, observers, heroRafId, heroObserver}`, `addManagedListener`, `unbindAll` | n/a | n/a | Every binding registers listeners/observers here so `bindAll()` can tear down before re-binding (site-001/002 fixes). |
| `app/api.js` | `API {sections:'/api/sections', products:'/api/products', schemas:'/api/schemas'}`, `fetchJSON`, `loadAll` | `is_visible`, `display_order` | none | Fetches sections and products in parallel; a failed fetch becomes `[]` and is logged to `AGF._errors`; filters `is_visible !== false`; sorts ascending by `display_order`. |
| `app/renderer.js` | `buildPageHTML`, `renderHeaderFooter`, `global_renderer` | `state.sections[].schema_id`, header/footer `data`, `_background_image`, `_background_settings` | `#app` HTML; `.nav-inner`, `.foot-inner` | Splices `renderProductsBlock(state.products)` immediately before the first `business-model` section, or appends at the end; per-section try/catch yields `<section class="section-error">`. Header/footer use the **first** matching row, so the duplicates in the DB are silently ignored. Emits `data-bg-image/size/position/opacity` on `.nav-inner`/`.foot-inner`. |
| `app/mount.js` | `mount`, `bindAll` | none | `#app` | `mount` = loadAll, build, header/footer, style overrides, bindAll; on failure writes a "Connection error" section. `bindAll` calls unbindAll then 10 bindings (**not** `bindHamburger`, though it is imported). |
| `app/data-refresh.js` | `refreshAll`, `refreshSection(id)`, `refreshProducts` | `/api/sections/:id`, `/api/products` | replaces node(s) in place | Edit-mode live reload; calls `AGFEditor.rebind()` and toasts. Not needed without the editor. |
| `app/style-manager.js` | `applyAllStyleOverrides`, `applySectionStyleOverrides`, `applyNudges`, `applyStyleOverrides`, `applyBackgroundFromAttr` | `data._style_overrides`, `_nudges`, `data-bg-*` attributes | inline styles on `[data-field]` elements | Overrides keyed by data-field path (`headline`), path + sub-selector (`tenets.0 > h3.tenet-title`) or legacy CSS selector; nudges map `{marginTop,marginBottom,marginLeft,marginRight}` to margins, with left/right turned into `transform: translateX()`. Background: sets `--bg-size/--bg-position/--bg-opacity` and inline background-image. Orphans (keys with no element) are warned once and pushed to `AGF._styleOrphans`. |
| `app/toast.js` | `toast(msg, type='info'\|'success'\|'error')` | n/a | `.toast.toast-<type>` in `#toast-container` | Adds `toast-out` at 2.4 s, removes at 2.9 s. |
| `app/nav.js` | `buildNav`, `navIdFor`, `navLabelFor` | | | **DEAD**: never imported, and references `state`/`escapeHTML` without importing them. Its id map is the only record of intended nav labels: hero "Top", timeline "The Rhyme" (#opportunity), consolidation, tenet "Tenets", venue "The Venue", technology, business-model "Business" (#model), founder, distribution, artist-rights "Artist Rights". |
| `app/bindings/index.js` | barrel of 11 `bind*` | | | See section 5. |
| `app/bindings/*.js` | `bindScrollProgress, bindRevealObserver, bindCounters, bindRhymeTabs, bindActiveNav, bindAppendixLinks, bindProductExpand, bindSmoothScroll, bindHeroParallax, bindPCBToggle, bindHamburger` | | | One file each; documented in section 5. |

### 3.3 schema-renderer/ (SPLIT; same renderers as the live monolith, older copy)

Every file in this tree is an IIFE that registers on `window.AGF` (`AGF.helpers`, `AGF.heading`, `AGF.figures`, `AGF.renderers`, `AGF.product`, `AGF.REGISTRY`) and catches its own load errors into `AGF._errors`. `load-order.txt` gives the intended order. Loading order bug: `helpers.js` assigns `AGF.helpers.setSectionId` **before** `AGF.helpers = AGF.helpers || {}`, so when it is the first file to load it throws a TypeError that its own `try/catch` swallows, leaving `AGF.helpers` with no `esc`, `md` and so on. As written, the tree cannot initialise.

| Path | Exports | Inputs | DOM | Notable behaviour |
|---|---|---|---|---|
| `schema-renderer/index.js` | `globalThis.SchemaRenderer` (adds `errorLog`, `flushErrors`, `_safeRender`, `renderOverview`, `renderConceptExplainer`) | | | `renderSectionTracked` wrapper with an error log. |
| `schema-renderer/helpers.js` | `esc, md, toRoman, appendixRef, fmtUSD, fmtRange, splitHeadline, groupIndependents, setSectionId, getSectionId` | | | `toRoman` table covers 1 to 12 only (else returns the number). `fmtUSD`: `>=1e9` "$1.2B", `>=1e6` "$12M", `>=1e3` "$12K". `splitHeadline` splits off the last word. `groupIndependents` buckets items by regex over `specialty + name`: Public / Speaker ateliers / German engineering / UK engineering / Newer wave / Other. **Quirk:** it is used on technologies, venue features, venue journey, overview highlights and concept-explainer items, where it makes no semantic sense; those items lack `specialty`, and `name` rarely matches, so everything lands in "Other" and order is preserved (no-op), but it is a latent reordering bug. |
| `schema-renderer/heading.js` | `sanitizeHeadingTitle`, `head` | opts `{num,numPath,label,labelPath,title,titlePath,deck,deckPath,marginToMargin,data}` | `.section-head` | `data._margin_to_margin` adds class `section-head-margin-to-margin`. |
| `schema-renderer/figure-utils.js` | `FIG_PLACEMENTS/SIZES/POSITIONS`, `figureHTML`, `figuresByPosition`, `insertedTextsHTML` | `_figures`, `_texts` | `<figure class="fig fig-<placement> fig-<size>" data-figure-id>`; `.inserted-text` absolutely positioned (default top = 80 + 5i %, left 5 %) | Whitelists prevent arbitrary class injection. `_texts[].content` is inserted as raw HTML (trusted-editor assumption; an XSS vector if the data is untrusted). |
| `schema-renderer/chart-cache.js` | `window.__agfChartData = {}` | | | Cache keyed by random id. |
| `schema-renderer/chart-mount.js` | `AGF.mountCharts` + MutationObserver | `[data-chart]`, `data-chart-key` | mounts into host | `positioning` to `PositioningChart.render(host,data)`; `roadmap` to `RoadmapChart.render`. Marks `data-chart-mounted`. |
| `schema-renderer/render-section.js` | `AGF.renderSection`, `AGF.REGISTRY` | `section.schema_id`, `section.data`, `_background_*`, `_margin_to_margin`, `appendix` | | Same wrapper logic as the monolith. |
| `schema-renderer/renderers/hero.js` | `renderers['hero']` | `mark, headline, strapline, subheadline, metrics[], background_type, scroll_indicator` | `section#hero.hero`: `.hero-grain`, `.hero-orbits > .o.o1/.o2/.o3`, `.hero-inner > .kicker, .hero-stage > h1.hero-mark + .hero-taglines`, `.hero-subheadline.lede`, `.hero-meta` | **Old copy**: fallbacks `AGF`, `All Grounds Floating`, `Even Rails → Smooth Tracks`. Kicker text hardcoded "Foundational Brand Development · 2026". |
| `.../renderers/team-note.js` | `team-note` | `section_label, section_title, body` | `section.team-note > .team-note-inner > head + p.team-note-body + hr.team-note-rule` | |
| `.../renderers/timeline.js` | `timeline` | `section_number, section_label, section_title, intro_text, flip_interval_seconds, eras[0..1].{year_range,label}, comparison_points[].{category,era_1_value,era_2_value,insight,appendix}` | `section#opportunity` > `.rhyme[data-flip-interval]` > `.rhyme-rail` (2 `.rhyme-tab[data-era=80s\|now]`, `.rhyme-pill`) + `.rhyme-panes` (2 `.rhyme-pane[data-pane]`) of `.rhyme-row` (`.rr-side`, `.rr-mid`, `.rr-side`) | Last comparison row gets `.rhyme-highlight`. Era 1 pane shows `era_1_value`, era 2 pane `era_2_value`; `insight` appears in both. `eras[].events` is never rendered. Default title "History does not repeat. It rhymes." (live monolith: empty). |
| `.../renderers/consolidation.js` | `consolidation` | `acquisitions[].{date,acquirer,target,value_usd,source_url,appendix}`, `independent_brands[].{name,specialty,appendix}`, head fields | `section#consolidation` > `.cons-table` (`.ct-row`, `.ct-yr`, `.ct-src a`) + `.independent-block > h3, .ib-intro, .ib-grid > .ib-group > .ib-h + ul > li` | Split copy: fixed 4 columns and hardcoded "Who is left, as a matter of public record" + intro paragraph. Live copy: columns appear only if some row has data (`--ct-cols`, `--ct-cols-mob` CSS vars, class `cons-table--has-date\|--no-date`), blank brands are skipped, heading/intro come from `independent_heading` / `independent_intro` (both empty in the export). |
| `.../renderers/tenet.js` | `tenet` | `tenets[].{number,title,anchor_phrase,body,example_title,example_body,key_insight,appendix}`, head fields | `section#tenets` > `.tenets > article.tenet[data-tenet-num]` > `.tenet-num` (Roman numeral), `.tenet-body > h3, p.tenet-body-text, p.tenet-example-title, p.tenet-insight(em), p.tenet-anchor "→ …"` | `md()` is applied **before** wrapping in `<em>` to avoid an `<em>` leak (comment in source). |
| `.../renderers/venue.js` | `venue` | `zones[].{id,name,tagline,description,atmosphere,features[],customer_journey_step,appendix}`, `customer_journey[].{description,appendix}`, `target_customer_profile`, `royalty_structure.{broadcast_split,stereo_ownership,artist_blocking_rights,notes}`, `virtual_ticket.{concept,price,pricing_model,owner_perks}`, `financial_model.{philosophy,qualification_rule,ticket_price,revenue_streams[]}`, `cultural_positioning.{movement,anti_pattern,summary}`, `concept_description`, `_margin_to_margin` | `section.section-dark#venue` > `.venue > .venue-floor > .floor-zone.zone-foh\|balcony\|green` (+ `.zone-num` Roman, `.zone-tag` with last word in `<em>`, `.zone-feel`, `ul.zone-features`, `.zone-step`), `.venue-caption`, `.venue-flow > ol`, up to four `.venue-economics > dl.pspec` | Zone class from `z.id` (`front-of-house`→foh, `balcony`, `green-room`→green) else by index. `virtual_ticket.price` and `financial_model.ticket_price` are read but **not in the schema**. Journey step range summary ("steps 1–3") from `fmtRange`. |
| `.../renderers/technology.js` | `technology` | `technologies[].{id,name,full_name,tagline,description,patent_status,key_capabilities[≤4],competitive_advantage,market_size,frequency_range,appendix}`, `codec_diagram.stages[].{name,description}`, `lart_stack.{eyebrow,headline,body}` | `section#technology` > `.tech-grid > article.tech-card` + `.codec-deep > .cd-copy + .cd-diagram > .cd-layer.cd-l1..n` | The "kind" line = `full_name` minus `name`, else `patent_status`, else "Technology" (live: ""). Roman numeral = index+1. `market_size` (USD number) and `frequency_range` are read but absent from the schema. `.codec-deep` renders only if `codec_diagram.stages` is non-empty. |
| `.../renderers/business-model.js` | `business-model` | `pricing_strategy.{model_name,philosophy,description}`, `channel_approach.{philosophy,partner_types,target_partners}`, `revenue_model`, `runway_table[].{product,ttm,cogs_range,asp_range,notes}`, `scaling_timeline` | `section#model` > `.model-grid > 3 × .model-card` + `.runway > .runway-table > .rr.rhead + .rr rows` + phased-rollout card | Card headings "Pricing Strategy / Channel Approach / Revenue Model", "The Bose-Like Third-Party", "Hardware-led, codec/OS halo", "The Runway, at a glance", "Phased rollout" are hardcoded even though `*_heading` keys exist in the export (section 9). |
| `.../renderers/founder.js` | `founder` | `milestones[].{year,event,company,description,significance}`, `mentors[].{name,relationship,contribution}`, `key_companies[].{name,role,years,outcome}`, `name`, `section_title`, `intro_text` | `section.section-dark#founder` > `.founder-grid > .timeline > .tl-item(.tl-yr,.tl-desc)` + `aside.mentor-callout` + `.runway` companies table + `.cta` (hardcoded) | Title falls back to `name + "."`. CTA: "The plan is on the page. Now what?", body paragraph, `mailto:hello@agf.brand` "Request the deck", "Back to top" are **hardcoded** (also stored as `cta_heading`/`cta_body` in the v2 row but never read). Note `colspan="2"` is set on a `<div>` (no effect). |
| `.../renderers/distribution.js` | `distribution` | `philosophy`, `partner_criteria[].{criterion,description,weight 0..1}`, `territories[].{region,strategy,priority}`, `channel_types[].{type,description,approach}`, `revenue_model` | `section#distribution` > two `.runway > .runway-table.dist-table`, `.model-grid > .model-card`, revenue card | Weight bar: `.weight-bar > .weight-fill{width:round(w*100)%}` + `.weight-pct`. Priority badge `.prio-badge.prio-N` text `P<N>`. |
| `.../renderers/artist-rights.js` | `artist-rights` | `philosophy`, `ownership_tiers[].{tier_name,description,artist_share_percent,agf_share_percent,rights[],restrictions[]}`, `enforcement.{device_lockout,legal_remedies,social_deterrent}`, `revenue_streams[].{stream,description,split}` | `section.section-dark#artist-rights` > `.model-grid > .model-card.tier-card` with `.split-bar > .split-artist + .split-agf` (widths = percents) | `legal_remedies` / `social_deterrent` accept array or string. "Identified, blocked, recovered" heading hardcoded. |
| `.../renderers/competitive-positioning.js` | `competitive-positioning` | whole `data` (cached for the chart), `competitors[]`, `summary` | `section#competitive-positioning` > `.cp-chart-mount[data-chart=positioning][data-chart-key]` + `<noscript>` table fallback + `.cp-summary` | Generates `key = 'cp-' + random`, stores `data` in `window.__agfChartData[key]` on every render (never cleaned). |
| `.../renderers/launch-roadmap.js` | `launch-roadmap` | whole `data`, `pr_stunts[]`, `venue_pilots.{count,criteria,notes}`, `year_one_targets.{global_units_per_month,anchor_reference,notes}` | `section.section-dark#launch-roadmap` > `.lr-chart-mount[data-chart=roadmap]` + `.model-grid.lr-supports` cards ("PR Stunt", "Venue Pilots: N markets", "Year-One Target: N pcs / month") | Same random-key cache. |
| `.../renderers/header.js` | `header` | `brand_name, nav_links[].{label,href}, cta_text, cta_link` | `.nav-left > a.nav-mark > .mark-word`, `a.nav-tagline`; `.nav-right#navRight > nav.nav-links > a.nav-link` + `a.nav-cta.btn.primary` | Tagline "Even Rails → Smooth Tracks" (linking to `#technology`) is **hardcoded**; the `tagline` key in two header rows is ignored. |
| `.../renderers/footer.js` | `footer` | `brand_name, tagline, meta_text, source_text` | `.foot-mark > .mark-word + .foot-mark-text`, `p.foot-meta`, `p.foot-src` | Split copy defaults tagline to "— All Grounds Floating"; live copy defaults to "". |
| `.../renderers/prelude.js` | `prelude` | `squares[0..2].{text,image}` (+ live: `image_settings`), `summary`, head fields | `section > head + .prelude-grid > 3 × .prelude-square (background-image) > p.prelude-square-text` + `.prelude-summary` | Always slices to 3. Live version builds background-size/position/rotation from `image_settings {fit,posX,posY,scale,rotation}` and emits `data-img-*`/`data-image-path` for the editor. |
| `.../renderers/cut-sheet.js` | `cut-sheet` | `image, image_position(left\|right), title, description, benefits[].{label,value}`, head fields | `section.cut-sheet.cut-sheet--left\|right` > `.cs-top (.cs-image + .cs-text)` + `.cs-benefits-bar > .cs-benefit` | Head renders only if any head field exists. Live version adds `image_settings` object-fit/position/transform. |
| `.../renderers/overview.js` | `overview` | `mode(text\|image), headline, summary, image, image_position, metrics[].{label,value\|value_range,context}, highlights[].{icon,title,description}`, head fields | `section#overview` > `.ov-content[.ov-content-image.ov-content-left\|right]` > `.ov-body (.ov-headline, .ov-summary)` + `.ov-extras (.ov-metrics .ov-metric, ul.ov-highlights li.ov-highlight)` + `.ov-image` | **Only in the split tree.** Bug in image mode: the body and extras are emitted twice (see section 9). Metric value: number to `fmtUSD`, else `value_range` via `fmtRange`, else raw text. |
| `.../renderers/concept-explainer.js` | `concept-explainer` | `modules[].{type,id,display_order,headline,subhead,body,hide_blurb,items[],image,image_position,text_position}`, `layout`, `footnote` | `section#concept-explainer` > `.ce-modules[data-layout]` > `.ce-module.ce-reason-list\|ce-subsection\|ce-overview-block\|ce-text-image` | **Only in the split tree.** Modules sorted by `display_order` (default 999); unknown type falls back to overview_block; each module gets `data-sort-order`. Items may be strings or `{text,value,value_range}`. |
| `.../product/spec-group.js` | `AGF.product.specGroup(label, rows)` | rows `[label, value, rawHtml?]` | `.pspec-group[data-group] > button.pspec-group-head(.pspec-toggle) + dl.pspec` | Drops rows whose value is undefined/null/''. |
| `.../product/product-card.js` | `renderProductCard(p)` | see section 6 `product` | `article.product-card[data-product-slug][data-status]` > `.phead (.pnum zero-padded display_order, h3, .pmeta-row .pcat .pstatus.pstatus-<status>)`, `.ptag`, `.agf-tech-pills`, `.product-actions` (expand button + PDF link), `.product-spec-sheet` (5 spec groups + competitive reference + roadmap notes + `.product-visualizations[data-product-viz]`) | Formatting rules: frequency `"{low}–{high} Hz ±{tol}dB"` (`?` for missing), sensitivity `"{n} dB SPL"`, impedance `Ω`, THD `%`, drivers `"{qty}× {type} {size}mm ({material})"` joined by ` · `, amp `"Class X · NW/ch · Nch"`, DAC `"arch · chipset · Nbit"`, dimensions `"H × W × D mm"` (h/w/d order), margin `round(x*100)%`, business ranges via `fmtRange`. |
| `.../product/product-viz.js` | `_cacheProduct`, `hydrateProductVisualizations(root)`, `_scheduleHydration` | `_viz_config` | calls each component's `render(ph, data)` in this order: FreqResponse, DriverDiagram, TechFlow, ConnectivityBadges, PowerGauge, MaterialSwatches | Placeholders matched by `[data-product-viz="<slug>"]`; marks `data-viz-hydrated=1`. |
| `.../product/compare-mode.js` | `_fetchCompareConfig`, `_scheduleCompareInit` | comparison-config row; `AGF.state.products` | compare toggle, per-card checkbox `label.cmp-card-check`, launch button | Selection cap = `max_compare` (default 3); launch needs at least 2; calls `ProductCompare.init(document.body, products, cfg)`. |
| `.../product/products-section.js` | `renderProductsBlock(products)`, `renderProduct`, `_scheduleConfiguratorBinding` | products | `section.section-dark#products` | Heading **hardcoded**: "06 · The Lineup / Inaugural product line." + deck about Focal's $5K flagship. Adds "Build Your System" CTA only when some product has `system_config`. |

### 3.4 components/ (LIVE; contracts in section 4)

| Path | Attaches | Inputs | DOM | Notable |
|---|---|---|---|---|
| `components/positioning-chart.js` | `window.PositioningChart.render(container, sectionData)` | `competitors[]`, `_viz_config` | SVG perceptual map / HTML bars / HTML table | no config defaults |
| `components/roadmap-chart.js` | `window.RoadmapChart.render(container, sectionData)` | `phases[]`, `_viz_config` | CSS-grid Gantt / table | no config defaults |
| `components/freq-response.js` | `window.FreqResponse.render(container, productData)` | `audio.frequency_response`, `_viz_config` | `.freq-wrap` SVG 1000×320 | curve is synthetic |
| `components/driver-diagram.js` | `window.DriverDiagram.render` | `audio.drivers[]`, `audio.enclosure` | `.driver-wrap` SVG | |
| `components/tech-flow.js` | `window.TechFlow.render` | `agf_technologies[]` | `.tech-flow-wrap` SVG 900×120 | |
| `components/connectivity-badges.js` | `window.ConnectivityBadges.render` | `connectivity` | `.connectivity-wrap > .connectivity-badges > .connectivity-badge` | |
| `components/power-gauge.js` | `window.PowerGauge.render` | `power` | `.power-gauge-container.power-gauge-arc\|bar\|meter` | |
| `components/material-swatches.js` | `window.MaterialSwatches.render` | `form_factor` | `.material-swatches-wrap > .material-swatches > .swatch-card` | |
| `components/product-compare.js` | `window.ProductCompare.init(container, products, config)`, `.close()` | `comparison-config` | `.compare-overlay[role=dialog]` | |
| `components/system-configurator.js` | `window.SystemConfigurator.init(container, products)`, `.close()` | `system_config`, `business.asp_usd`, `agf_technologies` | `#agf-configurator.configurator-overlay` | LIVE monolith (314 lines) |
| `components/system-configurator/constants.js` | `AGF.SystemConfig.constants` | | | **SPLIT**; `ROLE_ORDER`, `ROLE_LABEL`, `WIRELESS`, `esc, priceOf, fmtUSD, roleOf, configOf, laneLayout` |
| `components/system-configurator/lifecycle.js` | `SC.lifecycle {init, close, mount, shellHTML, bindEvents, toggle}` | | | SPLIT; adds idempotent mount, unknown-slug guard |
| `.../render-cards.js` | `SC.cards.renderCards` | | `button.configurator-card[data-card-slug]` | SPLIT |
| `.../render-chain.js` | `SC.chain {renderChain, nodeSVG, edgeSVG}` | | SVG | SPLIT |
| `.../render-footer.js` | `SC.footer {computeCompanionHints, renderSynergy, renderPrice}` | | | SPLIT |
| `.../index.js` | `SC.render`, `window.SystemConfigurator` | | | SPLIT; per-renderer try/catch |

### 3.5 PDF package: `sections/` and `css/` (server side)

All renderers have the signature `(product, cfg, palette, pdfConfig) -> html`. Inputs below are `product.data.*`. Each returns `''` when it has nothing to show.

| Path | Exports | Reads | Produces |
|---|---|---|---|
| `sections/index.js` | `SECTION_RENDERERS`, `renderAllSections` (`safeRender` wrapper logs `[product-pdf] section "<key>" failed for product "<slug>"` and emits an HTML comment) | `template_sections[].key/enabled` | dispatch keys: `header, hero_image, overview, audio_specs, connectivity, technologies, form_factor, business_metrics, footer` |
| `sections/header.js` | `renderHeader` | `cfg.background_color` (default palette.primary), `cfg.show_logo`, `category`, `slug`, `name`, `tagline` | `header.agf-header` with hardcoded mark "AGF / All Grounds Floating" (ignores `pdf-config.brand_mark/brand_tag`) and eyebrow "Spec Sheet · (category)" |
| `sections/hero-image.js` | `renderHeroImage` | `hero_image` | `figure.agf-hero-figure` (only section that reads `hero_image`) |
| `sections/overview.js` | `renderOverview` | `description`, `category`, `status`, `form_factor.finish/materials` | "01 — Overview" prose + "At a glance" aside |
| `sections/audio-specs.js` | `renderAudioSpecs` | `audio.*`, `cfg.columns` (1 or else 2) | "02 — Audio" definition list + driver table (Qty/Type/Size/Material); also reads `dac.max_sample_rate_khz`, `enclosure.tuning_hz`, `enclosure.volume_liters` |
| `sections/connectivity.js` | `renderConnectivity` | `connectivity.*` | "03 — Connectivity" two columns + extras |
| `sections/technologies.js` | `renderTechnologies` | `agf_technologies[]`, `cfg.format` (`badges` default, `list`, `table`) | "04 — AGF Technologies"; table mode uses the hardcoded role "AGF foundational technology" |
| `sections/form-factor.js` | `renderFormFactor` | `form_factor.*`, `variants[].{name,differentiator,asp_usd}` | "05 — Form Factor" |
| `sections/business-metrics.js` | `renderBusinessMetrics` | `business.*`, `cfg.audience` (must contain "investor") | "06 — Business Metrics · Investor-only" with `.agf-confidential-shade` |
| `sections/footer.js` | `renderFooter` | `pdfConfig.footer_text`, `cfg.confidentiality_notice === true`, `slug` | confidential line + footer row |
| `css/index.js` | `buildCss(palette, fontFamily)` | | concatenates ten partials; per-partial try/catch emits a CSS comment on failure |
| `css/base.css.js` | `(palette, fontStack)` | | `@page{margin:0}`, 10.5 pt body, `print-color-adjust:exact`, body padding `0.35in 0.55in 0.4in` |
| `css/header.css.js, hero.css.js, block.css.js, overview.css.js, specs.css.js, connectivity.css.js, technologies.css.js, form-factor.css.js, footer.css.js` | each a template-literal CSS function | `palette.primary/accent/text` | `.agf-header` (diagonal hairline pattern, 38 pt weight-200 display title), `.agf-hero-figure` (max 3.4 in), `.agf-block*`, `.agf-overview*`, `.agf-spec-dl/.agf-cols-1\|2\|3/.agf-driver-table`, `.agf-conn-*`, `.agf-tech-*`, `.agf-variant-*` and `.agf-confidential-shade`, `.agf-footer*` |

### 3.6 editor/ (SPLIT) and editor.js (LIVE)

The split tree is 20 files extracted verbatim from an older `editor.js` (see `editor/EXTRACT_REPORT.txt`: 4,214 of 4,278 source lines; the live monolith has since grown to 5,458 lines, adding `image-adjust-panel`, `nudge-panel` revisions and more). The split files have no real `import`/`export` statements (only comment blocks listing the intended ones) and were never wired.

| File | Role (exports as documented in its header) |
|---|---|
| `core.js` | `$ $$ API toast escapeHTML el humanize deepClone setNestedField shortId cssAttrEscape`; `api(method,url,body)` fetch wrapper |
| `state.js` | `schemaCache`, `schemaListCache`, `currentEditSlug`, `currentEditCategory` |
| `schema.js` | `resolveSchema defaultFor isMarkdown getSchemaList getSchema navigateSchema` (GET `/api/schemas`) |
| `confirm-dialog.js` | `confirmDialog` (no focus trap/ARIA, flagged in header) |
| `form.js` | `generateForm renderField renderArrayField renumberArray createImageUploadField collectForm prune getValueAtPath setPathDeep buildActions`: JSON-schema to DOM form and back |
| `item-editor.js` | `openItemEdit closeItemEdit getLastAnchorSectionId`: per-`[data-field]` overlay + `performSave` (GET then full PUT, race flagged) |
| `click-to-edit.js` | `bindClickToEdit`: dispatches clicks to item / product / section editors |
| `context-menu.js` | `bindContextMenu removeContextMenu`: right-click menu (figure, product, structural, prelude, section) |
| `section-ops.js` | `injectAddButton toggleVisibility reorderSection confirmDeleteSection` |
| `section-form.js` | `openSchemaPicker createSection refreshAfterEdit openSectionEdit reconcileConventionFields` |
| `product-form.js` | `openProductForm confirmDeleteProduct` |
| `figures.js` | `insertFigure openFigurePanel removeFigInsertPanel uploadFigureFile saveFigure removeFigure moveFigure insertBackgroundImage applyBackgroundImage deleteUploadedAsset` |
| `bg-settings.js` | `openBgSettingsPanel removeBgSettingsPanel persistBackgroundSettings removeBackgroundImage` |
| `inserted-text.js` | `insertText saveInsertedText bindInsertedTextDrag bindInsertedTextResize bindInsertedTextEdit` |
| `nudge-panel.js` | `openNudgePanel closeNudgePanel` (px scaler for margins) |
| `enhance-panel.js` | `openEnhancePanel removeEnhancePanel removeTextField` (per-element typography/colour/alignment/width overrides) |
| `style-overrides.js` | `resolveEnhanceKey collectStyleOverrides persistStyleOverrides buildElementSelector` |
| `drag-drop.js` | `bindDragDrop` (drop an image on a section to set its background) |
| `image-adjust-panel.js` | `openImageAdjustPanel removeImageAdjustPanel` (fit/position/scale/rotation for prelude squares, cut-sheet image, figures); this file is a bare function file with no module scaffolding |
| `convention-fields.js` | `STANDARD_CONVENTION_FIELDS`, `preserveConventionFields(source,target)`: a never-wired fix for the "full PUT clobbers underscore fields" bug |
| `boot.js` | `waitForAppMount, boot, rebind`; `window.AGFEditor` |
| `LOAD_ORDER.md`, `EXTRACT_REPORT.txt` | migration notes (reference `/home/bozertron/0.1-Audio-AGF-BP/...`, `A-editor.md`, `tickets/` which are not in the repo) |

Editor guard rails absent: the live `editor.js` boots for **every visitor** with no mode flag or auth check on the client; protection (if any) was only at the API.



---

## 4. Component data contracts (components/)

The new site will re-implement these from the exported content in `production-staging/content/`. For each: entry point, the exact JSON shape read, defaults applied **in code**, DOM/SVG output, and quirks. Colour values are the literals in the code (they are brand-aligned hexes, not tokens).

Gating pattern shared by the six product-viz components (`FreqResponse`, `DriverDiagram`, `TechFlow`, `ConnectivityBadges`, `PowerGauge`, `MaterialSwatches`): each is invoked as `X.render(containerEl, productData)` where `productData` is the product's `data` object; each reads `productData._viz_config` (default `{}`), **skips only if its `show_*` flag is exactly `false`** (absent means on), and also silently skips when its source data is missing. They append into `.product-visualizations[data-product-viz="<slug>"]` in this fixed order: freq, driver, tech-flow, connectivity, power, materials. Each draws a mono caption rail (`FR · 01`, `DR · 02`, `TF · 03`, `CN · 04`, `PW · 05`, `MT · 06`).

### 4.1 `components/positioning-chart.js` : `PositioningChart.render(container, sectionData)`

`sectionData` = the whole `competitive-positioning` section data.

```jsonc
{
  "competitors": [
    { "brand": "Bang & Olufsen",            // string; a brand matching /^agf\b/i is highlighted
      "category": "Luxury electronics ...",  // string
      "status": "struggling",                 // string (table fallback only)
      "price_usd_avg": 45000,                 // number: default X metric
      "prestige_score": 92,                   // number 0..100: default Y metric
      "agf_positioning": "markdown",          // detail card text (markdown stripped to plain)
      "opening": "markdown" }                 // fallback for the card text
  ],
  "_viz_config": {                            // ALL of these are read raw; there are NO code defaults
    "chart_type": "perceptual-map",           // "perceptual-map" | "table" | "bar-chart"; any other value or absent => map
    "x_axis": { "field": "price_usd_avg", "label": "Price (USD)", "min": 500, "max": 250000, "scale": "log" },   // "log" | "linear"
    "y_axis": { "field": "prestige_score", "label": "Prestige", "min": 0, "max": 100, "scale": "linear" },
    "highlight_color": "#B8860B", "competitor_color": "#A89880",
    "dot_radius": 28, "enable_animation": true, "show_grid": true, "show_labels": true
  }
}
```
(The values above are the exact config in the export and the schema defaults.)

Behaviour:
* No `_viz_config` or `chart_type:"table"` => `table.positioning-data-table` with columns Brand, Category, Status, Price (avg) (`fmtUSD`, "—" if not a number), Prestige; AGF row gets class `is-agf`.
* `chart_type:"bar-chart"` => `div.positioning-bars` of `.pbar-row` (label, track, fill, value). Uses only `x_axis.field`; width = value / max-of-field * 100 %; fill = `highlight_color` for AGF else `competitor_color`; value `fmtUSD`.
* Otherwise perceptual map: `<svg viewBox="0 0 1000 600">`, padding `{top:40, right:40, bottom:70, left:90}` (plot area 870 × 490). Plot rect fill `rgba(184,134,11,0.02)`, stroke `rgba(26,58,42,0.15)`. `project(v,min,max,scale)` returns 0..1, clamped; non-numbers return 0.5; log scale: `lo=log10(max(min,1))`, `hi=log10(max(max,lo+1))`, `v` floored to `max(min,1)`. X ticks: for `log` the subset of `[1000, 5000, 25000, 100000, 250000]` inside `[min,max]`, otherwise 5 evenly spaced; Y ticks 5 evenly spaced; tick labels via `fmtUSD` for X (`$1K`, `$25K`, `$250K`) and raw numbers for Y; grid lines `rgba(26,58,42,0.08)`; axis titles `"<label> →"` at bottom and rotated left. Dot per competitor with finite x and y: `<g class="brand-group" data-idx>` containing `circle.brand-dot[.animate][.is-agf]` (r = `dot_radius`, fill-opacity .85, stroke-width 2) and, if `show_labels`, brand text at `cy - r - 8`.
* Interaction (`bindInteractions`): hover shows `.positioning-detail-card` (brand `h4`, `.detail-cat`, price, "Prestige N", plain-text positioning) in `.positioning-detail-host` placed 14 px to the right of the dot; click pins it (click again or click outside or `Esc` unpins); a document-level `keydown` listener is stored as `container._posChartCleanup` and removed on re-render.
* Failure modes: `_viz_config` present but `x_axis`/`y_axis` missing throws `TypeError`; `mountCharts` catches and leaves the host empty. The CSS for the map assumes a light panel (`#1a3a2a` text, `#fff` card), unlike the dark site; and `.positioning-detail-host` is `position:absolute; inset:0`, so `.positioning-map` must be `position:relative`.

### 4.2 `components/roadmap-chart.js` : `RoadmapChart.render(container, sectionData)`

```jsonc
{
  "phases": [
    { "title": "Phase 1 — Over-Ear Home Centric (fastest to market)",  // bar label
      "product": "Over-Ear",             // swimlane label (falls back to title, then "Phase N")
      "ttm": "4–6 months",               // tooltip, table
      "start_slot": 1,                    // 1-based column; clamped to [1,total_slots]; default 1
      "duration_slots": 5,                // clamped to [1, total-start+1]; default 1
      "products": ["Over-Ear — Home Centric"],   // table fallback only
      "rationale": "markdown",            // tooltip (markdown stripped)
      "milestones": [                     // ONLY objects with numeric slot are drawn; strings are dropped
        "plain string milestones are ignored",
        { "type": "target", "slot": 5, "label": "1000 pcs/mo" } ] }
  ],
  "_viz_config": {                        // read raw
    "chart_type": "gantt",                // "table" => table; absent config => table; anything else => gantt
    "time_unit": "months",                // "months" => M1..; "quarters" => Q1..; "weeks" => W1..
    "total_slots": 24,                    // code default 24 (|| 24), min 1
    "label_column_width": "160px",        // NO default; if absent the grid template becomes invalid
    "bar_gradient_start": "#1a3a2a", "bar_gradient_end": "#b8860b",   // NO default
    "milestone_types": [ { "key": "pr", "label": "PR Stunt", "color": "#FFD700" },
                         { "key": "venue", "label": "Venue Pilot", "color": "#90EE90" },
                         { "key": "target", "label": "Volume Target", "color": "#87CEEB" } ],   // unknown type colour = #bbb
    "show_today_marker": true, "enable_hover": true
  }
}
```
Output: `div.roadmap-chart` with a legend (`.legend-item`/`.legend-dot` per milestone type), then `div.roadmap-grid` with `grid-template-columns: <label_column_width> repeat(<total_slots>, minmax(var(--space-xl), 1fr))`. First row = empty corner + `total` header cells. Each phase is a `div.roadmap-swimlane` (CSS `display: contents`) holding `.swimlane-label` and `.roadmap__bar` with inline `grid-column: <start+1> / span <dur>` and a 90° gradient background; the bar holds `.bar-label` and absolutely positioned `.milestone` dots at `left = clamp((slot - start)/duration, 0..1) * 100 %` (so a milestone at slot `start+duration` sits on the bar's right edge). `.today-marker` is a **fake**: placed at slot `round(total * 0.15)`, not tied to any date. Hover (`enable_hover`): `.roadmap-tooltip` follows the mouse (title, ttm, rationale; milestone tooltip shows label + type). Data caveat: the schema declares `milestones` as `array<string>`, `phases[].product/start_slot/duration_slots` are undeclared, and the export's six rows carry `phase: 1..6` but are titled "Phase 1, 2, 2, 2, 3, 3" (three launch phases, six rows; see defects).

### 4.3 `components/freq-response.js` : `FreqResponse.render(container, productData)`

Reads `audio.frequency_response = { low_hz, high_hz, tolerance_db }` (all optional; code defaults `low_hz||20`, `high_hz||20000`, `tolerance_db||3`, so a literal 0 is replaced) plus `_viz_config.show_freq_response`, `.freq_response_color` (default `#B8860B`), `.freq_response_db_range` (default 12). Skips if `audio.frequency_response` is falsy.

SVG `viewBox 0 0 1000 320`. X = log10 mapped 20 Hz to 20 kHz across 0 to 1000 (grid at 20, 50, 100, 200, 500, 1k, 2k, 5k, 10k, 20k, labels at y=300, lines y 20 to 280, axis caption "HERTZ" at y=316). Y: `y = 160 - dB/range*140` (0 dB at y 160; dashed datum line). dB gridlines from `[-12,-6,-3,0,3,6,12]` filtered to `|dB| <= range`, right-aligned labels at x=994. Passband rectangle from `low` to `min(high,20000)` at ±tolerance (opacity .07) with dashed edge lines. **The curve is synthetic, not measured**: 61 points, roll-off over the first 8 % (`-((0.08-t)/0.08) * range * 0.85`) and last 8 % (`... * 0.65`) of the span, and in between `sin(9.4t)*tol*0.28 + sin(21t)*tol*0.12` "musical ripple"; joined by cubic Béziers with midpoint control points; gradient area fill (id `frGrad-<n>`, unique per instance), 4 px glow, 2.2 px stroke, end dots. Caption: `"{low}Hz – {high>=1000 ? high/1000+'kHz' : high+'Hz'} · ±{tol}dB"`. Only the Symphony macro-system has this data (28 to 22000, no tolerance).

### 4.4 `components/driver-diagram.js` : `DriverDiagram.render(container, productData)`

Reads `audio.drivers[]` (required, non-empty) with `{ type, size_mm, material, quantity }` and optional `audio.enclosure = { type, tuning_hz }`.
* Rows sorted by role order: `tweeter 0`, `balanced-armature 1`, `electrostatic 1`, `planar 2`, `full-range 3`, `dynamic 3`, `coaxial 3`, `woofer 4`, unknown 99 (tweeter at top).
* Radius: `size_mm` maps 8 mm to r=10 and 220 mm to r=38 linearly (clamped); no size => r=16.
* `quantity` default 1; up to 3 concentric-cone circles are drawn side by side (8 px gap) and any excess shows a `×N` brass badge.
* Material to colour (first match on lower-cased substring): `beryllium` {fill #E8C56A, stroke #B8860B, glyph #7a5a0b}; `aluminum|alloy` {#cfd1cc, #8a8c87, #3a3c37}; `paper|composite|cone` {#A89880, #6e6048, #3a3024}; `lf` {#6f8478, #3a4a3e, #1a2a1e}; `custom` {#b8a070, #776035, #3a2e15}; default {#9da89a, #4a5a52, #1a2a22}. Each driver = cone circle, surround ring (0.78 r), dust cap (0.32 r), specular dot.
* Layout: `viewBox 0 0 460 (60 + 90*n)`; driver centres at x=92, y = 80 + 90*idx; label rail at x=200: `"{qty}× {type} · {size}mm"` (brass 12 px) and material (10 px, "—" if none). Enclosure (if `enclosure.type`): dashed rounded rect x 8..176, label `"ENCLOSURE · <TYPE>"`, and `"Tuned {tuning_hz}Hz"` bottom-right. Caption `"{sum of quantity} transducers"`.

### 4.5 `components/tech-flow.js` : `TechFlow.render(container, productData)`

Reads `agf_technologies[]` (strings from the enum `l'Art, stereOS, BT'N-Tech, l'espacI/O, FRC41, No-Nails`) and `_viz_config.tech_flow_order` (default `["stereOS","l'Art","BT'N-Tech","l'espacI/O","FRC41","No-Nails"]`). The chain = the order list filtered to technologies the product has, then any product technologies not in the order list appended. SVG `viewBox 0 0 900 120`: labels `["IN", ...chain, "OUT"]`, slot width `868 / n`; stage boxes width `min(slot-14, 130)` (terminals `min(slot-14, 64)`), height 44, radius 6, fill `#1a3a2a` stroke `#B8860B`; terminals fill `#0f2a1f` stroke `#3a5a4a`; dashed rail behind; brass arrows (`marker id="tf-arrow"`, defined once per card, so the id repeats across cards but is identical); "STAGE 0N" captions below stage boxes; text colour `#f4ecd8`. Caption `"N stage(s)"`. Note the signal order is a brand assertion (stereOS first, No-Nails last), not derived.

### 4.6 `components/connectivity-badges.js` : `ConnectivityBadges.render(container, productData)`

Reads `connectivity = { wireless:[{protocol,version,codecs[],range_m}], wired:[{connector,format,max_resolution}], streaming_protocols:[string], multi_room:bool, max_paired_devices:number }` and `_viz_config.badge_colors` merged over defaults `{wireless:'#87CEEB', wired:'#FFD700', streaming:'#90EE90', feature:'#DDA0DD'}`. Each badge is `div.connectivity-badge` with `border-left-color` set inline, `span.cb-kind` (uppercase kind), `strong` title, optional `span.codec-list` sub-line:
* wireless: kind `WIRELESS`, title `"{protocol||'Wireless'} {version}"`, sub = codecs joined ` · ` plus `"{range_m}m range"`;
* wired: kind `WIRED`, title `connector||'Wired'`, sub = `format` + `max_resolution`;
* streaming: ONE badge, kind `STREAMING`, title = first protocol, sub = the rest joined ` · `;
* feature: if `multi_room` truthy: `FEATURE / Multi-room / "N paired devices" or "Synced playback"`; else if `max_paired_devices`: `FEATURE / "N paired devices" / "Memory-resident"`.
Nothing is rendered if no badge was produced.

### 4.7 `components/power-gauge.js` : `PowerGauge.render(container, productData)`

Reads `power = { battery_life_hours, wall_power_watts, standby_watts, charging_type, ... }` and `_viz_config.gauge_style` (`arc` default | `bar` | `meter`). `pickMetric` takes the first numeric of: `battery_life_hours` => `{unit:'hr', max:60, label:'Battery life'}`; `wall_power_watts` => `{unit:'W', max: value>200 ? 2400 : 300, label:'Wall power'}`; `standby_watts` => `{unit:'W', max:5, label:'Standby'}`; none => nothing rendered. Value clamped to [0,max], `pct = value/max`.
* arc: `svg viewBox 0 0 220 140`, centre (110,116), r 84, top semicircle (π to 2π), 9 tick marks (every second one longer), `path.gauge-arc-bg` plus `path.gauge-arc-active` with `stroke-dasharray = π·r` and `stroke-dashoffset` animated from full length to `len·(1-pct)` on the next animation frame (the CSS must provide the transition), 32 px brass value at (110,96), spaced uppercase unit at y 112, label `PW · 05 <label>`. (`activeEnd` is computed and unused.)
* bar: head (mark, label, value+unit), `.pg-bar-track[role=progressbar]` with `.pg-bar-fill` width animated 0 to pct on next frame, 5 tick spans, foot `0` / `max+unit`.
* meter: native `<meter min=0 max=max low=25% high=75% optimum=85% value>` with value and `/ max` foot.
In the export only two products have `power` (Over-Ear 30 h, `charging_type` "Dock RF + USB-C", gauge arc; Wasted Real-Estate 8 h, arc). The Instrument/Core products set `show_power_gauge:true` but have no `power`, so no gauge appears for them.

### 4.8 `components/material-swatches.js` : `MaterialSwatches.render(container, productData)`

Reads `form_factor = { finish:string, materials:[string], color_options:[string] }`. Items in order: finish (kind `finish`, card also gets `swatch-primary`), each material (kind `material`), each colour (kind `color`). Each item becomes `div.swatch-card.swatch-<warm|cool>` with `.swatch-color` (inline `background: linear-gradient(135deg, ...)`) and `.swatch-meta` (`.swatch-kind`, `.swatch-label`). Colour chosen by the first matching lower-case substring in this order (tone in brackets):
`matte copper|copper plat` #c46a2a/#7d3a14/#2a1207 (warm); `copper` #d49460/#a05a28/#3a1a08 (warm); `obsidian` #1a1a22/#0a0a10 (cool); `beryllium` #f0e0a8/#b89a4a/#5a4218 (warm); `mass-loaded|alloy|aluminum` #dadcd6/#9a9c97/#3a3c37 (cool); `leather` #7a4a2a/#3a2010 (warm); `memory-foam|foam` #3a3a3a/#1a1a1a (cool); `paper|pre-primed` #f0e8d4/#cab98a (warm); `transmission-line|cabinet` #3a2818/#1a0e08 (warm); `cone` #a89880/#5a4830 (warm); `semiconductor|silicon` #5a6a78/#1a242c (cool); `chassis|machined` #b8b8b8/#4a4a4a (cool); `ui` #1a3a2a/#0a1a14 (cool); `matte` #3a3a3a/#1a1a1a (cool); otherwise #2a4a3a/#1a3a2a (cool). Quirk: the bare substring `ui` matches many words ("built", "guide"). Caption `"N sample(s)"`.

### 4.9 `components/product-compare.js` : `ProductCompare.init(container, products, config)`

* `products`: product rows `{slug, name, category, data}`; fewer than 2 aborts; the first `max` are shown.
* `config` (the `comparison-config` row's data):
```jsonc
{ "comparison_fields": [ { "path": "audio.frequency_response",   // dot path into product.data
                           "label": "Frequency Response",
                           "format": "range_hz",                   // range_hz | db | percent | currency_range | array_count | number | text (default)
                           "higher_wins": true } ],                // omit to disable winner logic + direction chip for that row
  "max_compare": 3,           // default 3, clamped to 2..5
  "highlight_winner": true,   // default on unless === false
  "overlay_freq_curves": true,// default on unless === false
  "show_price_bar": true }    // default on unless === false
```
Export has 8 fields: frequency response (range_hz, higher wins), sensitivity (db, higher), THD (percent, lower), SNR (db, higher), max SPL (db, higher), price `business.asp_usd` (currency_range, lower), technologies `agf_technologies` (array_count, higher), wireless `connectivity.wireless` (array_count, higher).
* No `comparison_fields` => fallback grid of every key under `audio` across the selected products, `format:text` (objects are `JSON.stringify`-ed).
* Winner weight (`numericWeight`): `range_hz` = `high_hz - low_hz`; `currency_range` = midpoint of `min,max` (or `min`); `array_count` = array length; numbers and numeric strings as is; else NaN (excluded). `findWinner` takes the max or min; ties go to the first product. The winning cell gets `.compare-highlight` and a `▲`.
* Display formats: `range_hz` => `"lo–hi Hz ±tol dB"` (`?` for missing); `db` => `"N dB"`; `percent` => `"N%"`; `currency_range` => `"$min–$max"` / `"$min"` / `fmtUSD(number)`; `array_count` => `"N · protocol|name|type, ..."`; missing/empty => `—`.
* Frequency-response overlay (`buildFreqOverlay`): needs at least two products with `audio.frequency_response` containing `low_hz` or `high_hz`; draws one synthetic curve each (same shape function as 4.3 but with a per-product phase offset `+i`, `+i*1.3`, dB range fixed 12), colours from `CURVE_COLORS = ['#B8860B','#D4A234','#A89880','#6B7A6F','#7AB48A']`, plus legend. With the export, only Symphony has the data, so the overlay never appears.
* Price bar (`buildPriceBar`): `business.asp_usd` as `{min,max}` or number; bar width = midpoint / max-midpoint (minimum 2 %); label via `fmtUSD` ("$599–$799"); products without a price are omitted.
* Chrome: `.compare-overlay[role=dialog][aria-modal]` with `.compare-overlay-backdrop`, header "CMP · 0N / Compare Products / Side-by-side · schema-driven", `.compare-grid` with CSS var `--cmp-cols`, header row `P · 01..` with `--cmp-curve` colour; closes on ✕, backdrop and `Esc`; adds body class `compare-locked`; `.is-open` set on next frame.
* Compare-mode UI (`schema-renderer/product/compare-mode.js`, runs inside `#products`): toggle button `[data-compare-toggle]` switches `.compare-mode` on the section and injects a checkbox label into each card; selection capped at `max_compare`; "Compare Selected" `[data-compare-launch]` appears at 2+ selected.

### 4.10 `components/system-configurator.js` (and `system-configurator/`) : `SystemConfigurator.init(container, products)`

Reads per product: `slug`, `name`, `data.system_config = { system_role, companions:[slug], connection_types:[{target_slug, connection}] }`, `data.business.asp_usd.min` (price, 0 if absent) and `data.agf_technologies`. Only products with `system_config` are used (none => console warning, no overlay).

```jsonc
"system_config": { "system_role": "source",                       // source | processor | amplifier | output | accessory (default accessory)
                   "companions": ["over-ear-home-centric", "core-all-in-one-small"],
                   "connection_types": [ { "target_slug": "over-ear-home-centric", "connection": "BT" } ] }   // RF | BT | USB-C | WiFi | analog | digital-coax
```
* Lanes: left to right `source, processor, amplifier, output`; unknown roles appended as extra lanes; `accessory` is a separate row at the bottom (y = 384) labelled "Accessories". Empty lanes are dropped. Lane header = two-digit index (y 18) + role label (y 36).
* SVG `viewBox 0 0 880 420`, `padX 80`, `padY 60`; lane centre `x = 80 + laneW*(i+0.5)`; items stacked vertically at `y = 100 + (H-2*padY-40) * (n==1 ? 0.4 : j/(n-1))`. Nodes 140×64 (accessories 110×38) rounded rects with side "pins"; label = name cut at the first em dash.
* Selection: sidebar `button.configurator-card[data-card-slug][aria-pressed]` toggles membership; cards of unselected `companions` of selected products get `.companion-hint`. Card shows role, name, `fmtUSD(price)` (`>=1000` => `$X.XK`), "✓ in system" or "+ add".
* Edges: only between two **selected** products that both exist in the chart; cubic Bézier with horizontal tangents, mid-point label tag (the connection name); class `is-wireless` (dashed) for `BT`, `RF`, `WiFi`, else `is-wired`. De-duplication rule `if (slug > c.target_slug) return;` draws an edge only from the lexicographically smaller slug, so a link declared **only** on the larger-slug product is never drawn (latent bug that bites in the export: The Instrument declares `symphony-macro-system` / `USB-C`, Symphony does not declare it back, and `'the-instrument' > 'symphony-macro-system'`, so that USB-C edge can never be drawn; every other link is declared from both sides).
* Footer: "Technology Synergy" = union of `agf_technologies` of selected products as pills (placeholder "— select products to see shared technologies —"); "Total · ASP min" = sum of `asp_usd.min` of selected products, and "N product(s) selected".
* Chrome: `#agf-configurator.configurator-overlay` with grain layer (click closes), eyebrow "System Configurator · 06.5", title "Build Your *System*.", legend (Wired / Wireless / Companion); closes on ✕ and `Esc`; body class `configurator-open`; `.is-open` on the next frame.
* The CTA that launches it ("Build Your System", `[data-build-system]`) is rendered under the product list only if some product has `system_config`.

### 4.11 Product-card data (for the web card and PDF)

Fields consumed by `renderProductCard` (and the PDF `sections/*`): `name, slug, category, status, tagline, description, hero_image (PDF only), agf_technologies[], audio.{frequency_response{low_hz,high_hz,tolerance_db}, sensitivity_db_spl, impedance_ohms, thd_percent, snr_db, max_spl_db, drivers[{type,size_mm,material,quantity,appendix}], amplification{class,watts_per_channel,channels,topology}, dac{architecture,chipset,bit_depth,max_sample_rate_khz}, enclosure{type,tuning_hz,volume_liters}, crossover{type,frequency_hz,slope_db_oct}}, connectivity.{wireless[], wired[], multi_room, max_paired_devices, streaming_protocols[]}, form_factor.{dimensions{height_mm,width_mm,depth_mm}, weight_g, finish, materials[], color_options[], variants[{name,differentiator,asp_usd}]}, power.{battery_life_hours, charging_type, charge_time_minutes, wall_power_watts, standby_watts, power_supply}, business.{ttm_months{min,max}, cogs_usd{min,max}, asp_usd{min,max}, tooling_cost_usd, target_volume_monthly, gross_margin_target (0..1), certifications[], cert_cost_estimate_usd, v2_refactor_months}, competitive_reference.{price_positioning, comparable_products[], key_differentiators[]}, roadmap_notes, system_config, _viz_config`. The product enum values: category `headphone, speaker, flagship, accessory, earbud, macro-system, soundbar`; status `concept, development, prototype, production, shipping` (all six exported products are `concept` except Over-Ear = `development`).



---

## 5. app/bindings/ behaviours

`bindAll()` (in `app/mount.js`) first calls `unbindAll()` (removes every managed listener, disconnects every observer, cancels the hero rAF, clears intervals), then runs the ten bindings below **in this order**: scroll-progress, reveal, counters, rhyme-tabs, product-expand, smooth-scroll, hero-parallax, pcb-toggle, active-nav, appendix. `bindHamburger` exists and is exported but is **never called**. Each binding is wrapped in try/catch with an `[agf:bind:*]` tag that pushes to `window.AGF._errors`. Listeners go through `addManagedListener`; observers are pushed to `_bound.observers`.

| Binding (function / file) | Triggers | CSS classes and data attributes relied on | What it does |
|---|---|---|---|
| **Scroll progress** `bindScrollProgress` / `scroll-progress.js` | `window` `scroll` (passive), rAF-throttled | `#scrollProgress` (`.scroll-progress`, fixed 2 px bar, gradient gold-soft to gold, `width 80ms linear`), `#nav` gets/loses `.is-scrolled` | `pct = scrollY / (scrollHeight - innerHeight) * 100`; sets the bar width; toggles `.is-scrolled` on `#nav` when `scrollY > 30` (CSS `.nav.is-scrolled` restyles the header). Runs once immediately. |
| **Reveal** `bindRevealObserver` / `reveal.js` | `IntersectionObserver` `{rootMargin:'0px 0px -8% 0px', threshold:0.05}` | `[data-reveal]` (CSS: `opacity:0; transform:translateY(24px)`, `.8s var(--ease)`), adds `.is-in` | Adds `.is-in` once, then unobserves. Fallback without IO: add `.is-in` to all. Targets are collected when binding runs, so elements injected later (chart output, overlays) are not revealed. `motion-safe.css` forces `[data-reveal]` visible under `prefers-reduced-motion`. |
| **Counters** `bindCounters` / `counters.js` | `IntersectionObserver` `{threshold:0.4}` | `[data-count="<number>"]` (rendered on `.hero-meta .num` for numeric `metrics[].value`; `data-suffix` is emitted but not read; suffix sits in a sibling `.suf`) | Count-up 0 to target over 1200 ms with cubic ease-out `1-(1-t)^3`, rounding to integers each frame (so decimals appear only at the end) then sets the exact target. Fallback without IO writes the target immediately. Not guarded for reduced motion (the CSS only handles animations). |
| **Rhyme tabs** `bindRhymeTabs` / `rhyme-tabs.js` | click on tabs; `mouseenter`/`mouseleave` on `.rhyme` | `.rhyme[data-flip-interval="<seconds>"]`, `.rhyme-tab[data-era="80s"\|"now"]` + `.is-active`, `.rhyme-pane[data-pane="80s"\|"now"]` + `.is-active` (`display:none` otherwise), `.rhyme-pill` (absolutely positioned 2 px gold rule, `width:50%`, `transition: transform .35s`) | Clicking a tab activates that era and **stops** the auto-flip permanently. Otherwise auto-flips between `80s` and `now` every `data-flip-interval` seconds (default 12 s, from `flip_interval_seconds`; the renderer leaves the attribute empty if unset, which falls to 12 s). Hover pauses (`stopAutoFlip`), `mouseleave` restarts. The pill moves with `translateX(0%)` / `translateX(100%)`. Interval IDs are tracked in `state.rhymeAuto`/`state.intervals` for cleanup. Era keys `80s`/`now` are hardcoded; the exported eras are labelled "Then" (1978–1991) and "Now" (2014–2026), and each carries an `events[]` list (4 and 5 items) that this component and its renderer never display. |
| **Product expand** `bindProductExpand` / `product-expand.js` | click | `.product-expand-btn` (inside `.product-actions`) with `aria-expanded` and a child `.px-arrow` (text "↓"/"↑"), `.product-card.is-open`, `.pspec-group` + `.is-open`, `.pspec-group-head` with `aria-expanded` and child `.pspec-toggle` ("+"/"−") | Button toggles `.is-open` on the card, flips `aria-expanded`, swaps the arrow, and on first open auto-opens the first `.pspec-group`. Each group head toggles its own `.is-open`. **No CSS for `.product-spec-sheet`, `.pspec-group`, `.pspec-group-head`, `.pspec-toggle` or `.product-card.is-open` exists in `styles/`**, so the show/hide behaviour is undefined in the archived stylesheet (the original was presumably in a stylesheet revision not captured). |
| **Smooth scroll** `bindSmoothScroll` / `smooth-scroll.js` | click on every `a[href^="#"]` present at bind time | `#nav` (height subtracted) | `preventDefault`, `scrollTo({top: target.top + scrollY - nav.offsetHeight + 1, behavior:'smooth'})`. Ignores `#` and missing targets. Also `html { scroll-behavior: smooth }` in `core/reset.css`. |
| **Hero parallax** `bindHeroParallax` / `hero-parallax.js` | window `mousemove` (passive) + rAF loop gated by IO | `#hero` (or `.hero`), `.hero-orbits .o` (three spans `.o1 .o2 .o3`) | Skips entirely under `prefers-reduced-motion: reduce`. Mouse position becomes `px,py = (pos/size - 0.5) * 16`; the loop sets `el.style.translate = px*f py*f` with `f = (i+1)*0.4` per orbit. The loop runs only while the hero intersects the viewport (IO start/stop, site-001 fix); the rAF id and observer are stored in `_bound` for teardown. |
| **PCB toggle** `bindPCBToggle` / `pcb-toggle.js` | click | `#pcbToggle.pcb-toggle[aria-pressed]`, `body.is-pcb` (CSS `body.is-pcb::before`: fixed full-screen gold hairline grid + radial dots at 5 % opacity, `pointer-events:none`, z-index 0) | Toggles `is-pcb` on `<body>` and `aria-pressed`. Default is ON (`<body class="is-pcb">`). The hero's `pcb_motif` field is never read. No CSS exists for `.pcb-toggle` in `styles/`. |
| **Active nav** `bindActiveNav` / `active-nav.js` | `IntersectionObserver` `{rootMargin:'-20% 0px -60% 0px'}` on every `section[id]` | `.nav-links a` (the header renderer outputs `nav.nav-links > a.nav-link` only when `nav_links` is non-empty; in the export `nav_links` is `[]`) , `href="#<section id>"` | Toggles `.is-active` on the link whose `href` equals `#<intersecting section id>`. Effectively a no-op with the exported data. No `.is-active` CSS exists for nav links. |
| **Appendix popup** `bindAppendixLinks` / `appendix.js` | delegated click on `#app` | `.appendix-ref` with `data-appendix-for="<section id>"` or `"product:<slug>"` and optional `data-appendix-key="<dot.path>"`; builds `.appendix-popup > .appendix-popup-content > h4 "Appendix" + .appendix-popup-body + .appendix-popup-actions > button.btn-apx-close` | Resolves text: product refs look in `state.products` by slug, section refs in `state.sections` by id; with a key it uses `resolveDotPath(data, key + '.appendix')`, otherwise `data.appendix`. Renders via `SchemaRenderer.helpers.md`. Closes on backdrop click or the close button (no Esc handling). **The popup CSS lives in `styles/editor/appendix.css`**, so a rebuild must not drop that partial with the editor styles. |
| **Hamburger** `bindHamburger` / `hamburger.js` (**dead**) | click | `#navHamburger`, `#navDrawer`, `#navDrawerOverlay`, each with `.is-open` | Would open/close an off-canvas drawer (closes on overlay click or link click). No renderer emits those three ids and `bindAll` never calls it. |

Other runtime behaviours that are not in `bindings/` but are visible to users:
* **Chart mounting**: `mountCharts` MutationObserver (section 3.1).
* **Product visualisation hydration**: `requestAnimationFrame` after `renderProductsBlock`.
* **Loading state**: `#appLoading` spinner until `mount()` replaces `#app` contents; `aria-busy` true to false; error state "Connection error / Unable to load brand content".
* **Toasts**: `toast(msg,type)`; used only by the editor and refresh code.



---

## 6. Schema reference (22 schemas in `schemas/`)

Every file is JSON Schema draft-07 with `$id` equal to the `schema_id`. The tables below are generated directly from the files: **Field path** uses `[]` for array items; **Description** is verbatim (blank where the schema has none); **Req** = listed in the `required` array of its object; **Renderer reads?** is `yes` when the live renderer (or the named component) reads that key, **`NO`** when it is never read, and `partial` with the reason otherwise. "yes" was assigned by matching the key name in the renderer source and then hand-corrected for the keys where generic names (`title`, `type`, `description`) would give false positives; treat a "yes" on a generic name as "very likely".

Schema-level facts:

* Only `team-note` declares a top-level `appendix`; every other section accepts `appendix` anyway because `renderSection` reads `data.appendix` generically. Item-level `appendix` is declared on most array items.
* No schema declares `_figures`, `_texts`, `_background_image`, `_background_settings`, `_margin_to_margin`, `_style_overrides` or `_nudges` (convention fields, section 2.2), except that `_viz_config` is declared on `competitive-positioning`, `launch-roadmap` and `product`.
* `additionalProperties` is explicit only on the five schemas that carry `default_data` (all `true`).
* Schemas for `comparison-config` and `pdf-config` are for hidden (`is_visible=false`) config rows, which `renderSection` skips.

### 6.1 Mismatches between schemas and renderers (rebuild gotchas)

Keys the renderers read that **no schema declares**:

| Where | Key | Meaning |
|---|---|---|
| `venue` | `virtual_ticket.price`, `financial_model.ticket_price` | numbers shown via `fmtUSD` |
| `technology` | `technologies[].market_size` (USD number, "Market: $X"), `technologies[].frequency_range {min,max}` ("Range: a–b") | |
| `prelude` | `squares[].image_settings`, `cut-sheet` `image_settings` | `{fit\|size: cover\|contain\|fill, posX, posY, scale, rotation}` (defaults `cover, 50, 50, 100, 0`) |
| `launch-roadmap` | `phases[].product`, `start_slot`, `duration_slots`, milestone **objects** `{type,slot,label}` | the Gantt's actual contract |
| `competitive-positioning`, `launch-roadmap`, `product` | `_viz_config.*` defaults | declared in schema, not applied by the two chart components |
| all sections | `appendix`, `_figures`, `_texts`, `_background_image`, `_background_settings`, `_margin_to_margin` | handled by `renderSection` |

Keys present in the **exported data** that nothing in the archive reads: `header.tagline` (two rows), `pdf-config.brand_mark`, `pdf-config.brand_tag`, `business-model.runway_heading` / `scaling_heading`, `founder.cta_heading` / `cta_body` / `key_companies_heading` / `mentors_heading`, `distribution.partner_criteria_heading` / `territories_heading`, `artist-rights.revenue_streams_heading`, `timeline.eras[].events[]`, `competitive-positioning.competitors[].key_data_points`, `hero.pcb_motif`. The `*_heading` and `cta_*` keys hold the exact strings that the live renderer hardcodes (see section 9.3), so they are the intended editable copy and the data is the authority.

Schemas with no live renderer at all: `overview`, `concept-explainer` (they exist only in the unloaded `schema-renderer/` split tree).

### 6.2 Per-schema tables


#### `artist-rights`  ·  schema title "AGF Artist Rights Section"

> Content ownership philosophy, ownership tiers, enforcement mechanisms, and revenue-sharing streams that define AGF's stance on artist rights.

**Consumer:** live: schema-renderer.js renderArtistRights (modular: schema-renderer/renderers/artist-rights.js). Page section #artist-rights, class section-dark.

Required top-level: `section_title`, `philosophy`. additionalProperties: (unset).

| Field path | Type | Req | Constraints / enum / default | Description (verbatim) | Renderer reads? |
|---|---|---|---|---|---|
| `section_title` | string | Y |  | Display title for the section. | yes |
| `section_number` | string or integer |  |  | Section ordinal. | yes |
| `section_label` | string |  |  | Short label shown in the section eyebrow after the number (e.g. 'The Consolidation'). | yes |
| `philosophy` | string | Y |  | Markdown-formatted philosophy on artist rights and content ownership. | yes |
| `ownership_tiers` | array |  |  | Tiered ownership and rights structures available to artists. | yes |
| `ownership_tiers[].tier_name` | string | Y |  | Name of the tier (e.g., 'Founder', 'Resident', 'Guest'). | yes |
| `ownership_tiers[].description` | string |  |  | Markdown-formatted description of the tier. | yes |
| `ownership_tiers[].artist_share_percent` | number |  | min 0 ; max 100 | Percent of revenue retained by the artist. | yes |
| `ownership_tiers[].agf_share_percent` | number |  | min 0 ; max 100 | Percent of revenue retained by AGF. | yes |
| `ownership_tiers[].rights` | array of string |  |  | Rights granted to the artist at this tier. | yes |
| `ownership_tiers[].restrictions` | array of string |  |  | Restrictions imposed at this tier. | yes |
| `ownership_tiers[].appendix` | string |  |  | markdown — supporting notes for the appendix | yes |
| `enforcement` | object |  |  | Mechanisms by which artist-rights agreements are enforced. | yes |
| `enforcement.device_lockout` | string or boolean |  |  | Whether/how device-level lockout is used to enforce ownership terms. | yes |
| `enforcement.legal_remedies` | array of string |  |  | Legal remedies available to AGF and the artist. | yes |
| `enforcement.social_deterrent` | array of string |  |  | Social or reputational deterrents that reinforce compliance. | yes |
| `revenue_streams` | array |  |  | Distinct revenue streams produced by artist content and how they are split. | yes |
| `revenue_streams[].stream` | string | Y |  | Name of the revenue stream. | yes |
| `revenue_streams[].description` | string |  |  | Markdown-formatted description. | yes |
| `revenue_streams[].split` | string |  |  | Revenue-split formula (e.g., '70/30 artist/AGF'). | yes |
| `revenue_streams[].appendix` | string |  |  | markdown — supporting notes for the appendix | yes |

#### `business-model`  ·  schema title "AGF Business Model Section"

> Pricing philosophy, channel approach, runway economics, and the scaling timeline that operationalizes AGF's go-to-market.

**Consumer:** live: renderBusinessModel (#model). Product collection block is injected immediately BEFORE this section by app/renderer.js.

Required top-level: `section_title`. additionalProperties: (unset).

| Field path | Type | Req | Constraints / enum / default | Description (verbatim) | Renderer reads? |
|---|---|---|---|---|---|
| `section_title` | string | Y |  | Display title for the section. | yes |
| `intro_text` | string |  |  | Markdown-formatted introductory narrative. | yes |
| `section_number` | string or integer |  |  | Section ordinal. | yes |
| `section_label` | string |  |  | Short label shown in the section eyebrow after the number (e.g. 'The Consolidation'). | yes |
| `pricing_strategy` | object |  |  | How AGF prices its products and the philosophy behind it. | yes |
| `pricing_strategy.philosophy` | string |  |  | Markdown-formatted pricing philosophy. | yes |
| `pricing_strategy.model_name` | string |  |  | Short label for the pricing model. | yes |
| `pricing_strategy.description` | string |  |  | Markdown-formatted description of the model. | yes |
| `channel_approach` | object |  |  | How AGF reaches customers through partners and direct channels. | yes |
| `channel_approach.philosophy` | string |  |  | Markdown-formatted channel philosophy. | yes |
| `channel_approach.partner_types` | array of string |  |  | Categories of channel partners. | yes |
| `channel_approach.target_partners` | array of string |  |  | Specific named target partners or markdown narrative. | yes |
| `runway_table` | array |  |  | Per-product runway economics table. | yes |
| `runway_table[].product` | string | Y |  | Product name or SKU. | yes |
| `runway_table[].ttm` | string |  |  | Time-to-market range or value (e.g., '6-9 mo'). | yes |
| `runway_table[].cogs_range` | string |  |  | Cost-of-goods range in USD. | yes |
| `runway_table[].asp_range` | string |  |  | Average-selling-price range in USD. | yes |
| `runway_table[].notes` | string |  |  | Free-form notes about this row. | yes |
| `runway_table[].appendix` | string |  |  | markdown — supporting notes for the appendix | yes |
| `revenue_model` | string |  |  | Markdown-formatted description of revenue streams and unit economics. | yes |
| `scaling_timeline` | string |  |  | Markdown-formatted phased scaling plan. | yes |

#### `comparison-config`  ·  schema title "Product Comparison Configuration"

> Schema-driven configuration for the interactive product comparison overlay. Defines which fields are compared, how they are formatted, and which visualizations appear.

**Consumer:** Never rendered as a section (renderSection returns ""). Fetched at runtime by schema-renderer/product/compare-mode.js (_fetchCompareConfig, GET /api/sections?schema=comparison-config) and passed to ProductCompare.init(). Hidden row (is_visible=false).

Required top-level: none. additionalProperties: (unset).

| Field path | Type | Req | Constraints / enum / default | Description (verbatim) | Renderer reads? |
|---|---|---|---|---|---|
| `comparison_fields` | array |  |  | Ordered list of fields to display as rows in the comparison grid. | yes |
| `comparison_fields[].path` | string | Y |  | Dot-notation path into product.data (e.g. 'audio.frequency_response'). | yes |
| `comparison_fields[].label` | string | Y |  | Human-readable row label. | yes |
| `comparison_fields[].format` | string | Y | enum: range_hz, db, percent, currency_range, array_count, text, number | Formatter applied to the resolved value. | yes |
| `comparison_fields[].higher_wins` | boolean |  |  | If true, the largest value wins; if false, the smallest value wins. Used when highlight_winner is enabled. | yes |
| `max_compare` | integer |  | default: `3` ; min 2 ; max 5 | Maximum number of products that may be selected for comparison. | yes |
| `highlight_winner` | boolean |  | default: `true` | When true, the winning value in each row is highlighted. | yes |
| `overlay_freq_curves` | boolean |  | default: `true` | When true, an overlaid frequency-response chart is rendered if multiple products expose audio.frequency_response. | yes |
| `show_price_bar` | boolean |  | default: `true` | When true, a horizontal price-comparison bar chart is rendered. | yes |

#### `competitive-positioning`  ·  schema title "AGF Competitive Positioning Section"

> Direct competitor analysis. Where AGF sits relative to the consolidated, struggling, and ceiling-defining incumbents — and why each opens a seam.

**Consumer:** live: renderCompetitivePositioning (#competitive-positioning) -> host div [data-chart=positioning] -> components/positioning-chart.js (PositioningChart.render).

Required top-level: `section_title`, `competitors`. additionalProperties: (unset).

| Field path | Type | Req | Constraints / enum / default | Description (verbatim) | Renderer reads? |
|---|---|---|---|---|---|
| `section_title` | string | Y |  | Display title for the section. | yes |
| `section_number` | string or integer |  |  | Section ordinal. | yes |
| `section_label` | string |  |  | Short label shown in the section eyebrow after the number (e.g. 'The Consolidation'). | yes |
| `intro_text` | string |  |  | Markdown-formatted positioning thesis. Sets up why each competitor matters to AGF. | yes |
| `competitors` | array | Y |  | Per-competitor positioning entries. | yes |
| `competitors[].brand` | string | Y |  | Competitor brand name. | yes |
| `competitors[].category` | string |  |  | Tier this competitor occupies (e.g., 'luxury electronics', 'aspirational halo', 'consumer flagship'). | yes |
| `competitors[].status` | string |  | enum: dominant, struggling, closed, reopening, ceiling, premium-fill | Current market state of the competitor. | yes |
| `competitors[].key_data_points` | array of string |  |  | Sourced numbers and dates that anchor the positioning claim. | **NO** |
| `competitors[].agf_positioning` | string |  |  | Markdown-formatted articulation of how AGF positions itself relative to this competitor. | partial: also shown in hover/click detail card (markdown stripped) |
| `competitors[].opening` | string |  |  | Short statement of the seam or vacuum AGF can occupy because of this competitor's state. | yes |
| `competitors[].source_urls` | array of string |  |  | Primary-source links (press releases, SEC filings, public reports). | **NO** |
| `competitors[].prestige_score` | number |  |  | Perceived prestige score (0–100) used by the perceptual-map visualization. | yes |
| `competitors[].price_usd_avg` | number |  |  | Average flagship price in USD used by the perceptual-map visualization. | yes |
| `competitors[].appendix` | string |  |  | markdown — supporting notes for the appendix | yes |
| `summary` | string |  |  | Markdown-formatted summary of AGF's overall competitive stance after surveying the field. | yes |
| `_viz_config` | object |  |  | Chart visualization configuration (editable via Edit UI) | yes |
| `_viz_config.chart_type` | string |  | enum: perceptual-map, table, bar-chart ; default: `"perceptual-map"` |  | yes |
| `_viz_config.x_axis` | object |  |  |  | yes |
| `_viz_config.x_axis.field` | string |  | default: `"price_usd_avg"` |  | yes |
| `_viz_config.x_axis.label` | string |  | default: `"Price (USD)"` |  | yes |
| `_viz_config.x_axis.min` | number |  | default: `500` |  | yes |
| `_viz_config.x_axis.max` | number |  | default: `250000` |  | yes |
| `_viz_config.x_axis.scale` | string |  | enum: log, linear ; default: `"log"` |  | yes |
| `_viz_config.y_axis` | object |  |  |  | yes |
| `_viz_config.y_axis.field` | string |  | default: `"prestige_score"` |  | yes |
| `_viz_config.y_axis.label` | string |  | default: `"Prestige"` |  | yes |
| `_viz_config.y_axis.min` | number |  | default: `0` |  | yes |
| `_viz_config.y_axis.max` | number |  | default: `100` |  | yes |
| `_viz_config.y_axis.scale` | string |  | enum: linear, log ; default: `"linear"` |  | yes |
| `_viz_config.highlight_color` | string |  | default: `"#B8860B"` |  | yes |
| `_viz_config.competitor_color` | string |  | default: `"#A89880"` |  | yes |
| `_viz_config.dot_radius` | number |  | default: `28` |  | yes |
| `_viz_config.enable_animation` | boolean |  | default: `true` |  | yes |
| `_viz_config.show_grid` | boolean |  | default: `true` |  | yes |
| `_viz_config.show_labels` | boolean |  | default: `true` |  | yes |

#### `concept-explainer`  ·  schema title "Concept Explainer"

> A flexible explanatory section with typed, reorderable modules — reason lists, subsections, overview blocks, and text+image pairs.

**Consumer:** NO LIVE RENDERER. Only schema-renderer/renderers/concept-explainer.js (modular tree, not loaded by index.html). Live schema-renderer.js REGISTRY lacks it -> page shows an "Unsupported schema" stub.

Required top-level: `section_title`. additionalProperties: True.

| Field path | Type | Req | Constraints / enum / default | Description (verbatim) | Renderer reads? |
|---|---|---|---|---|---|
| `section_label` | string |  | default: `""` | Eyebrow label | yes |
| `section_number` | string |  | default: `""` | Section number | yes |
| `section_title` | string | Y | default: `"How It Works"` | Main section title | yes |
| `intro_text` | string |  | default: `""` | Markdown intro narrative | yes |
| `layout` | string |  | enum: grid, rows, alternating ; default: `"grid"` | Visual layout for modules | yes |
| `modules` | array |  |  | Ordered, typed modules rendered within this section | yes |
| `modules[].id` | string |  | default: `""` | Stable identifier | yes |
| `modules[].type` | string | Y | enum: reason_list, subsection, overview_block, text_image | Module type — determines render behaviour | yes |
| `modules[].display_order` | integer |  | default: `0` | Sort order within modules array | yes |
| `modules[].headline` | string |  | default: `""` | Module heading | yes |
| `modules[].subhead` | string |  | default: `""` | Sub-heading (subsection only) | yes |
| `modules[].body` | string |  | default: `""` | Markdown body text | yes |
| `modules[].hide_blurb` | boolean |  | default: `false` | Hide the body/blurb (reason_list only) | yes |
| `modules[].text_position` | string |  | enum: left, right ; default: `"left"` | Text side when paired with image | yes |
| `modules[].image_position` | string |  | enum: left, right ; default: `"right"` | Image placement (subsection only) | yes |
| `modules[].image` | string |  | default: `""` | Image path/URL | yes |
| `modules[].items` | array |  |  | List items for reason_list, subsection, or overview_block | yes |
| `modules[].items[].label` | string |  | default: `""` | Item label | **NO** |
| `modules[].items[].description` | string |  | default: `""` | Item description | **NO** |
| `modules[].items[].text` | string |  | default: `""` | Text content | yes |
| `modules[].items[].icon` | string |  | default: `""` | Emoji or icon | **NO** |
| `footnote` | string |  | default: `""` | Optional markdown footnote | yes |

`default_data`: `{"section_label": "", "section_number": "", "section_title": "How It Works", "intro_text": "", "layout": "grid", "modules": [{"id": "", "type": "overview_block", "display_order": 0, "headline": "", "body": "", "items": []}, {"id": "", "type": "reason_list", "display_order": 1, "headline": "", "body": "", "hide_blurb": false, "text_position": "left", "items": [], "image": ""}, {"id": "", "type": "subsection", "display_order": 2, "headline": "", "subhead": "", "body": "", "image": "", "image_position": "right", "items": []}, {"id": "", "type": "text_image", "display_order": 3, "headline": "", "body": "", "text_position": "left", "image": ""}], "footnote": ""}`


#### `consolidation`  ·  schema title "AGF Consolidation Section"

> Data-driven view of the audio industry's M&A consolidation, contrasted with surviving independent brands.

**Consumer:** live: renderConsolidation (#consolidation). Live version builds the table columns dynamically (column hidden if no row has data).

Required top-level: `section_title`, `acquisitions`. additionalProperties: (unset).

| Field path | Type | Req | Constraints / enum / default | Description (verbatim) | Renderer reads? |
|---|---|---|---|---|---|
| `section_title` | string | Y |  | Display title for the section. | yes |
| `section_number` | string or integer |  |  | Section ordinal. | yes |
| `section_label` | string |  |  | Short label shown in the section eyebrow after the number (e.g. 'The Consolidation'). | yes |
| `intro_text` | string |  |  | Markdown-formatted introductory narrative. | yes |
| `independent_heading` | string |  |  | Heading for the independent-brands block. Editable; empty string clears it so nothing renders (no hardcoded fallback). | yes |
| `independent_intro` | string |  |  | Intro paragraph for the independent-brands block. Markdown-formatted; empty string clears it. | yes |
| `acquisitions` | array | Y |  | Documented acquisition, merger, or investment events. | yes |
| `acquisitions[].acquirer` | string | Y |  | Acquiring entity. | yes |
| `acquisitions[].target` | string | Y |  | Acquired entity. | yes |
| `acquisitions[].value_usd` | number |  |  | Transaction value in USD; null if undisclosed. | yes |
| `acquisitions[].date` | string |  |  | Date or year of the transaction (ISO 8601 preferred). | yes |
| `acquisitions[].type` | string |  | enum: acquisition, merger, investment | Transaction type. | **NO** |
| `acquisitions[].source_url` | string |  |  | Citation URL. | yes |
| `acquisitions[].appendix` | string |  |  | markdown — supporting notes for the appendix | yes |
| `independent_brands` | array |  |  | Brands that have remained independent despite consolidation pressure. | yes |
| `independent_brands[].name` | string | Y |  | Brand name. | yes |
| `independent_brands[].specialty` | string |  |  | Audio specialty or category focus. | yes |
| `independent_brands[].founded_year` | integer |  |  | Year founded. | **NO** |
| `independent_brands[].appendix` | string |  |  | markdown — supporting notes for the appendix | yes |

#### `cut-sheet`  ·  schema title "Cut Sheet"

> A product-style section with photo, description, and benefits highlights.

**Consumer:** live: renderCutSheet (class section cut-sheet cut-sheet--left|right; no id).

Required top-level: `title`. additionalProperties: True.

| Field path | Type | Req | Constraints / enum / default | Description (verbatim) | Renderer reads? |
|---|---|---|---|---|---|
| `section_label` | string |  | default: `""` | Eyebrow label | yes |
| `section_number` | string |  | default: `""` | Section number | yes |
| `title` | string | Y | default: `""` | Main title | yes |
| `description` | string |  | default: `""` | Paragraph describing the item | yes |
| `image` | string |  | default: `""` | Square photo | yes |
| `image_position` | string |  | default: `"left"` | Photo placement (left or right) | yes |
| `benefits` | array |  |  | Benefits highlights in the bottom bar | yes |
| `benefits[].label` | string |  | default: `""` | Benefit title | yes |
| `benefits[].value` | string |  | default: `""` | Benefit description | yes |

`default_data`: `{"section_label": "", "section_number": "", "title": "", "description": "", "image": "", "image_position": "left", "benefits": [{"label": "", "value": ""}, {"label": "", "value": ""}, {"label": "", "value": ""}]}`


#### `distribution`  ·  schema title "AGF Distribution Section"

> Channel partnership philosophy, partner-selection criteria, territories, and channel-type playbooks that define AGF's distribution strategy.

**Consumer:** live: renderDistribution (#distribution).

Required top-level: `section_title`. additionalProperties: (unset).

| Field path | Type | Req | Constraints / enum / default | Description (verbatim) | Renderer reads? |
|---|---|---|---|---|---|
| `section_title` | string | Y |  | Display title for the section. | yes |
| `section_number` | string or integer |  |  | Section ordinal. | yes |
| `section_label` | string |  |  | Short label shown in the section eyebrow after the number (e.g. 'The Consolidation'). | yes |
| `philosophy` | string |  |  | Markdown-formatted distribution philosophy. | yes |
| `partner_criteria` | array |  |  | Weighted criteria used to evaluate prospective channel partners. | yes |
| `partner_criteria[].criterion` | string | Y |  | Name of the criterion. | yes |
| `partner_criteria[].description` | string |  |  | What the criterion evaluates. | yes |
| `partner_criteria[].weight` | number |  |  | Relative importance weight (0-1 or 0-100). | yes |
| `partner_criteria[].appendix` | string |  |  | markdown — supporting notes for the appendix | yes |
| `revenue_model` | string |  |  | Markdown-formatted description of channel revenue model and partner economics. | yes |
| `territories` | array |  |  | Geographic territories with associated strategy and priority. | yes |
| `territories[].region` | string | Y |  | Region or country name. | yes |
| `territories[].strategy` | string |  |  | Markdown-formatted regional strategy. | yes |
| `territories[].priority` | string or integer |  |  | Priority tier or numeric rank for this territory. | yes |
| `territories[].appendix` | string |  |  | markdown — supporting notes for the appendix | yes |
| `channel_types` | array |  |  | Classes of channel and how AGF approaches each. | yes |
| `channel_types[].type` | string | Y |  | Channel type (e.g., 'Specialty Hi-Fi', 'D2C', 'Custom Install'). | yes |
| `channel_types[].description` | string |  |  | What this channel is and why it matters. | yes |
| `channel_types[].approach` | string |  |  | Markdown-formatted approach for engaging this channel. | yes |
| `channel_types[].appendix` | string |  |  | markdown — supporting notes for the appendix | yes |

#### `footer`  ·  schema title "AGF Footer"

> Schema for the site footer: brand mark, tagline, meta text, and source citations.

**Consumer:** rendered into `footer .foot-inner` by app/renderer.js renderHeaderFooter -> SchemaRenderer.renderFooter. Not placed in #app.

Required top-level: none. additionalProperties: (unset).

| Field path | Type | Req | Constraints / enum / default | Description (verbatim) | Renderer reads? |
|---|---|---|---|---|---|
| `brand_name` | string |  |  | Brand mark text rendered in Monoton type. | yes |
| `tagline` | string |  |  | Tagline following the brand name (e.g. '— All Grounds Floating'). | yes |
| `meta_text` | string |  |  | Meta / distribution line (e.g. 'Foundational Brand Development Document · 2026 · Internal & Investor Distribution'). | yes |
| `source_text` | string |  |  | markdown — Source citations and attributions. | yes |

#### `founder`  ·  schema title "AGF Founder Section"

> Founder origin story, milestone timeline, formative companies, and the mentor lineage that shaped the brand's perspective.

**Consumer:** live: renderFounder (#founder, section-dark).

Required top-level: `section_title`, `name`. additionalProperties: (unset).

| Field path | Type | Req | Constraints / enum / default | Description (verbatim) | Renderer reads? |
|---|---|---|---|---|---|
| `section_title` | string | Y |  | Display title for the section. | yes |
| `intro_text` | string |  |  | Markdown-formatted introductory narrative. | yes |
| `section_number` | string or integer |  |  | Section ordinal. | yes |
| `section_label` | string |  |  | Short label shown in the section eyebrow after the number (e.g. 'The Consolidation'). | yes |
| `name` | string | Y |  | Founder's full name. | yes |
| `title` | string |  |  | Founder's role or title (e.g., 'Founder & CEO'). | **NO** |
| `domain_depth_years` | number |  |  | Years of accumulated expertise in the relevant domains. | **NO** |
| `milestones` | array |  |  | Key biographical and professional milestones. | yes |
| `milestones[].year` | string or integer | Y |  | Year or year-range of the milestone. | yes |
| `milestones[].event` | string | Y |  | Short headline of the milestone. | yes |
| `milestones[].company` | string |  |  | Associated company or institution. | yes |
| `milestones[].description` | string |  |  | Markdown-formatted longer description. | yes |
| `milestones[].significance` | string |  |  | Why this milestone matters to the AGF narrative. | yes |
| `milestones[].appendix` | string |  |  | markdown — supporting notes for the appendix | yes |
| `mentors` | array |  |  | Mentors who shaped the founder's perspective. | yes |
| `mentors[].name` | string | Y |  | Mentor's name. | yes |
| `mentors[].contribution` | string |  |  | What the mentor contributed to the founder's craft or thinking. | yes |
| `mentors[].relationship` | string |  |  | Nature of the mentor-mentee relationship. | yes |
| `mentors[].appendix` | string |  |  | markdown — supporting notes for the appendix | yes |
| `key_companies` | array |  |  | Formative companies the founder worked at or built. | yes |
| `key_companies[].name` | string | Y |  | Company name. | yes |
| `key_companies[].role` | string |  |  | Founder's role at the company. | yes |
| `key_companies[].years` | string |  |  | Year range of involvement. | yes |
| `key_companies[].outcome` | string |  |  | Outcome or exit (e.g., 'Acquired by Sony, 2014'). | yes |
| `key_companies[].appendix` | string |  |  | markdown — supporting notes for the appendix | yes |

#### `header`  ·  schema title "AGF Header / Navigation"

> Schema for the top navigation bar: brand mark, nav links, and CTA button.

**Consumer:** rendered into `header .nav-inner` by app/renderer.js renderHeaderFooter -> SchemaRenderer.renderHeader. Not placed in #app.

Required top-level: none. additionalProperties: (unset).

| Field path | Type | Req | Constraints / enum / default | Description (verbatim) | Renderer reads? |
|---|---|---|---|---|---|
| `brand_name` | string |  |  | Brand mark text rendered in Monoton type. | yes |
| `nav_links` | array |  |  | Navigation link entries. Leave empty to auto-generate from sections. | yes |
| `nav_links[].label` | string |  |  | Display text for the link. | yes |
| `nav_links[].href` | string |  |  | Anchor href (e.g. #opportunity). | yes |
| `nav_links[].appendix` | string |  |  | markdown — supporting notes for the appendix | **NO** |
| `cta_text` | string |  |  | Call-to-action button label. | yes |
| `cta_link` | string |  |  | Call-to-action button href. | yes |

#### `hero`  ·  schema title "AGF Hero Section"

> Landing section schema for the AGF brand experience, defining the giant Monoton mark, the Commissioner top tagline, the Poiret strapline, supporting subheadline, proof-point metrics, and immersive background treatments.

**Consumer:** live: renderHero (#hero).

Required top-level: `mark`, `headline`, `subheadline`. additionalProperties: (unset).

| Field path | Type | Req | Constraints / enum / default | Description (verbatim) | Renderer reads? |
|---|---|---|---|---|---|
| `mark` | string | Y |  | The giant brand mark rendered in Monoton on the left of the hero stage (typically 'AGF'). Drives the height of the taglines column to its right. | yes |
| `headline` | string | Y |  | Top-aligned tagline in Commissioner at 25% the height of the mark. Sits to the right of the mark, flush with its top. | yes |
| `strapline` | string |  |  | Bottom-aligned tagline in Poiret One at 15% the height of the mark. Sits to the right of the mark, flush with its bottom. The 'tagline underneath' beat. | yes |
| `subheadline` | string | Y |  | Supporting subheadline that contextualizes the headline. | yes |
| `metrics` | array |  |  | Quantitative proof-points displayed beneath the headline. | yes |
| `metrics[].label` | string | Y |  | Human-readable label for the metric. | yes |
| `metrics[].value` | string or number | Y |  | Numeric or string value for the metric (string allows ranges, e.g., '4-6'). | yes |
| `metrics[].suffix` | string |  |  | Optional unit or qualifier appended to the value (e.g., 'B', '%', 'mo'). | yes |
| `metrics[].appendix` | string |  |  | markdown — supporting notes for the appendix | yes |
| `background_type` | string |  | enum: orbits, static, video | Visual treatment behind the hero content. | partial: only toggles orbits on/off; "static" and "video" render identically (no video element exists) |
| `scroll_indicator` | boolean |  |  | Whether to show an animated scroll affordance. | yes |
| `pcb_motif` | boolean |  |  | Whether to overlay the printed-circuit-board engraved motif. | **NO** |

#### `launch-roadmap`  ·  schema title "AGF Launch Roadmap Section"

> Phased go-to-market sequencing for AGF's inaugural product line, including PR levers, venue pilots, and Year-1 volume targets.

**Consumer:** live: renderLaunchRoadmap (#launch-roadmap, section-dark) -> host div [data-chart=roadmap] -> components/roadmap-chart.js (RoadmapChart.render).

Required top-level: `section_title`, `phases`. additionalProperties: (unset).

| Field path | Type | Req | Constraints / enum / default | Description (verbatim) | Renderer reads? |
|---|---|---|---|---|---|
| `section_title` | string | Y |  | Display title for the section. | yes |
| `section_number` | string or integer |  |  | Section ordinal. | yes |
| `section_label` | string |  |  | Short label shown in the section eyebrow after the number (e.g. 'The Consolidation'). | yes |
| `intro_text` | string |  |  | Markdown-formatted overview of the launch sequencing logic. | yes |
| `phases` | array | Y |  | Ordered launch phases with associated products, TTM, and rationale. | partial: chart also reads undeclared phases[].product, start_slot, duration_slots |
| `phases[].phase` | string or integer | Y |  | Phase ordinal (e.g., 1, 2, 3). | **NO** |
| `phases[].title` | string | Y |  | Phase display title. | yes |
| `phases[].ttm` | string |  |  | Time-to-market range for this phase (e.g., '4-6 months'). | yes |
| `phases[].products` | array of string |  |  | Products shipping in this phase. | partial: only used in table fallback |
| `phases[].rationale` | string |  |  | Markdown-formatted reasoning for why this phase ships in this order. | yes |
| `phases[].milestones` | array of string |  |  | Key milestones or gates within this phase. | partial: chart reads only OBJECT milestones {type,slot,label}; plain strings (as this schema declares) are silently dropped by roadmap-chart.js |
| `pr_stunts` | array |  |  | Public-relations or marketing levers timed to the launch sequence. | yes |
| `pr_stunts[].name` | string | Y |  | Short identifier for the stunt (e.g., 'Symphony Review-Tier Anchor'). | yes |
| `pr_stunts[].description` | string |  |  | Markdown-formatted description of the stunt and its mechanic. | yes |
| `pr_stunts[].timing` | string |  |  | When relative to the launch this stunt fires. | yes |
| `pr_stunts[].appendix` | string |  |  | markdown — supporting notes for the appendix | yes |
| `venue_pilots` | object |  |  | Venue-pilot strategy for the launch period. | yes |
| `venue_pilots.count` | integer |  |  | Number of pilot venues planned. | yes |
| `venue_pilots.criteria` | string |  |  | Markdown-formatted selection criteria for pilot markets. | yes |
| `venue_pilots.notes` | string |  |  | Additional pilot strategy notes. | yes |
| `year_one_targets` | object |  |  | Year-1 volume and revenue targets. | yes |
| `year_one_targets.global_units_per_month` | integer |  |  | Global monthly unit-volume target. | yes |
| `year_one_targets.anchor_reference` | string |  |  | Reference comp (e.g., Wasted Real-Estate vs Focal flagship benchmark). | yes |
| `year_one_targets.notes` | string |  |  | Markdown-formatted notes on how the target compounds over Y1. | yes |
| `_viz_config` | object |  |  | Gantt visualization configuration (editable via Edit UI). | yes |
| `_viz_config.chart_type` | string |  | enum: gantt, timeline, table ; default: `"gantt"` |  | yes |
| `_viz_config.time_unit` | string |  | enum: months, quarters, weeks ; default: `"months"` |  | yes |
| `_viz_config.total_slots` | integer |  | default: `24` |  | yes |
| `_viz_config.label_column_width` | string |  | default: `"140px"` |  | yes |
| `_viz_config.bar_gradient_start` | string |  | default: `"#1a3a2a"` |  | yes |
| `_viz_config.bar_gradient_end` | string |  | default: `"#b8860b"` |  | yes |
| `_viz_config.milestone_types` | array |  | default: `[{"key": "pr", "label": "PR Stunt", "color": "#FFD700"}, {"key": "venue", "label": "Venue Pilot", "color": "#90EE90"}, {"key": "target", "label": "Volume Target", "color": "#87CEEB"}]` |  | yes |
| `_viz_config.milestone_types[].key` | string |  |  |  | yes |
| `_viz_config.milestone_types[].label` | string |  |  |  | yes |
| `_viz_config.milestone_types[].color` | string |  |  |  | yes |
| `_viz_config.show_today_marker` | boolean |  | default: `true` |  | yes |
| `_viz_config.enable_hover` | boolean |  | default: `true` |  | yes |

#### `overview`  ·  schema title "Overview"

> A high-level orienting section with headline, summary, metrics, and optional image — the 'at a glance' executive view.

**Consumer:** NO LIVE RENDERER. Only schema-renderer/renderers/overview.js (modular tree, not loaded). Live page shows "Unsupported schema" stub.

Required top-level: `section_title`. additionalProperties: True.

| Field path | Type | Req | Constraints / enum / default | Description (verbatim) | Renderer reads? |
|---|---|---|---|---|---|
| `section_label` | string |  | default: `""` | Eyebrow label | yes |
| `section_number` | string |  | default: `""` | Section number | yes |
| `section_title` | string | Y | default: `"At a Glance"` | Main section title | yes |
| `headline` | string |  | default: `""` | Bold tagline or headline | yes |
| `summary` | string |  | default: `""` | Markdown summary narrative | yes |
| `intro_text` | string |  | default: `""` | Deck/intro narrative below the title | yes |
| `mode` | string |  | enum: text, image ; default: `"text"` | Display mode — text-only or image alongside text | yes |
| `image` | string |  | default: `""` | Image path/URL (used when mode='image') | yes |
| `image_position` | string |  | enum: left, right ; default: `"right"` | Image placement when mode='image' | yes |
| `metrics` | array |  |  | Key headline proof-point metrics | yes |
| `metrics[].value` | string |  | default: `""` | Metric value | yes |
| `metrics[].label` | string |  | default: `""` | Metric label | yes |
| `metrics[].context` | string |  | default: `""` | Optional context line | yes |
| `highlights` | array |  |  | Bullet-style highlight items | yes |
| `highlights[].icon` | string |  | default: `""` | Emoji or icon | yes |
| `highlights[].title` | string |  | default: `""` | Highlight title | yes |
| `highlights[].description` | string |  | default: `""` | Short description | yes |

`default_data`: `{"section_label": "", "section_number": "", "section_title": "At a Glance", "headline": "", "summary": "", "intro_text": "", "mode": "text", "image": "", "image_position": "right", "metrics": [], "highlights": []}`


#### `pdf-config`  ·  schema title "PDF Export Configuration"

> Configuration for the press-kit PDF spec sheet exporter. Controls which template sections are emitted, layout, page format, brand palette, and footer copy.

**Consumer:** Never rendered on the page. Consumed server-side by renderPdfHtml(product, pdfConfig) in index.js (the PDF spec-sheet package at the archive root: index.js, helpers.js, sections/, css/). Hidden row.

Required top-level: none. additionalProperties: (unset).

| Field path | Type | Req | Constraints / enum / default | Description (verbatim) | Renderer reads? |
|---|---|---|---|---|---|
| `template_sections` | array |  |  | Ordered list of template sections. Sections render in array order; flip enabled to false to hide. | yes |
| `template_sections[].key` | string | Y | enum: header, hero_image, overview, audio_specs, connectivity, technologies, form_factor, business_metrics, footer |  | yes |
| `template_sections[].enabled` | boolean | Y | default: `true` |  | yes |
| `template_sections[].show_logo` | boolean |  |  |  | yes |
| `template_sections[].background_color` | string |  |  |  | yes |
| `template_sections[].columns` | integer |  | min 1 ; max 3 |  | yes |
| `template_sections[].format` | string |  | enum: badges, list, table |  | yes |
| `template_sections[].audience` | string |  | enum: public, investor, partner |  | yes |
| `template_sections[].confidentiality_notice` | boolean |  |  |  | yes |
| `page_format` | string |  | enum: A4, Letter, A3 ; default: `"A4"` |  | **NO** |
| `margins` | object |  |  |  | **NO** |
| `margins.top` | string |  | default: `"0.5in"` |  | **NO** |
| `margins.bottom` | string |  | default: `"0.5in"` |  | **NO** |
| `margins.left` | string |  | default: `"0.75in"` |  | **NO** |
| `margins.right` | string |  | default: `"0.75in"` |  | **NO** |
| `brand_colors` | object |  |  |  | yes |
| `brand_colors.primary` | string |  | default: `"#1F4A2D"` |  | yes |
| `brand_colors.accent` | string |  | default: `"#B8860B"` |  | yes |
| `brand_colors.text` | string |  | default: `"#1A1A1A"` |  | yes |
| `font_family` | string |  | default: `"Commissioner"` |  | yes |
| `footer_text` | string |  | default: `"AGF \u2014 All Grounds Floating \| Foundational Brand Development \| 2026"` |  | yes |

#### `prelude`  ·  schema title "Prelude"

> An orienting section with title, three visual squares, and a summary.

**Consumer:** live: renderPrelude (no id; class section; three .prelude-square tiles + summary).

Required top-level: none. additionalProperties: True.

| Field path | Type | Req | Constraints / enum / default | Description (verbatim) | Renderer reads? |
|---|---|---|---|---|---|
| `section_label` | string |  | default: `""` | Eyebrow label | yes |
| `section_number` | string |  | default: `""` | Section number | yes |
| `section_title` | string |  | default: `"Prelude"` | Title in the top rectangle | yes |
| `intro_text` | string |  | default: `""` | Small orienting paragraph below the title | yes |
| `squares` | array |  |  | Three content squares | yes |
| `squares[].text` | string |  | default: `""` | Text content for this square | yes |
| `squares[].image` | string |  | default: `""` | Image for this square | yes |
| `summary` | string |  | default: `""` | Summary paragraph in the bottom rectangle | yes |

`default_data`: `{"section_label": "", "section_number": "", "section_title": "Prelude", "intro_text": "", "squares": [{"text": "", "image": ""}, {"text": "", "image": ""}, {"text": "", "image": ""}], "summary": ""}`


#### `product`  ·  schema title "AGF Product Specification"

> Professional-grade audio product specification for enthusiast-level detail

**Consumer:** Rows live in the products table (not sections). Web: schema-renderer.js renderProductsBlock/renderProductCard + components/{freq-response,driver-diagram,tech-flow,connectivity-badges,power-gauge,material-swatches,product-compare}.js + components/system-configurator.js. PDF: sections/*.js.

Required top-level: `name`, `category`, `tagline`. additionalProperties: (unset).

| Field path | Type | Req | Constraints / enum / default | Description (verbatim) | Renderer reads? |
|---|---|---|---|---|---|
| `name` | string | Y |  | Product name | yes |
| `category` | string | Y | enum: headphone, speaker, flagship, accessory, earbud, macro-system, soundbar |  | yes |
| `tagline` | string | Y |  |  | yes |
| `hero_image` | string |  |  |  | partial: PDF only (sections/hero-image.js) |
| `description` | string |  |  | Markdown-formatted product description | yes |
| `form_factor` | object |  |  |  | yes |
| `form_factor.dimensions` | object |  |  |  | yes |
| `form_factor.dimensions.height_mm` | number |  |  |  | yes |
| `form_factor.dimensions.width_mm` | number |  |  |  | yes |
| `form_factor.dimensions.depth_mm` | number |  |  |  | yes |
| `form_factor.weight_g` | number |  |  |  | yes |
| `form_factor.finish` | string |  |  |  | yes |
| `form_factor.materials` | array of string |  |  |  | yes |
| `form_factor.color_options` | array of string |  |  |  | yes |
| `form_factor.variants` | array |  |  |  | yes |
| `form_factor.variants[].name` | string |  |  |  | yes |
| `form_factor.variants[].differentiator` | string |  |  |  | yes |
| `form_factor.variants[].asp_usd` | number |  |  |  | yes |
| `audio` | object |  |  |  | yes |
| `audio.frequency_response` | object |  |  |  | yes |
| `audio.frequency_response.low_hz` | number |  |  |  | yes |
| `audio.frequency_response.high_hz` | number |  |  |  | yes |
| `audio.frequency_response.tolerance_db` | number |  |  |  | yes |
| `audio.sensitivity_db_spl` | number |  |  |  | yes |
| `audio.impedance_ohms` | number |  |  |  | yes |
| `audio.thd_percent` | number |  |  |  | yes |
| `audio.snr_db` | number |  |  |  | yes |
| `audio.max_spl_db` | number |  |  |  | yes |
| `audio.drivers` | array |  |  |  | yes |
| `audio.drivers[].type` | string |  | enum: dynamic, planar, electrostatic, balanced-armature, coaxial, woofer, tweeter, full-range |  | yes |
| `audio.drivers[].size_mm` | number |  |  |  | yes |
| `audio.drivers[].material` | string |  |  |  | yes |
| `audio.drivers[].quantity` | integer |  |  |  | yes |
| `audio.drivers[].appendix` | string |  |  | markdown — supporting notes for the appendix | yes |
| `audio.amplification` | object |  |  |  | yes |
| `audio.amplification.class` | string |  | enum: A, AB, D, H, GaN, chip-amp |  | yes |
| `audio.amplification.watts_per_channel` | number |  |  |  | yes |
| `audio.amplification.channels` | integer |  |  |  | yes |
| `audio.amplification.topology` | string |  |  |  | partial: not read anywhere |
| `audio.dac` | object |  |  |  | yes |
| `audio.dac.chipset` | string |  |  |  | yes |
| `audio.dac.bit_depth` | integer |  |  |  | yes |
| `audio.dac.max_sample_rate_khz` | number |  |  |  | partial: PDF only |
| `audio.dac.architecture` | string |  | enum: delta-sigma, R2R, hybrid, FPGA |  | yes |
| `audio.crossover` | object |  |  |  | yes |
| `audio.crossover.type` | string |  | enum: passive, active-DSP, none |  | yes |
| `audio.crossover.frequency_hz` | number |  |  |  | yes |
| `audio.crossover.slope_db_oct` | number |  |  |  | yes |
| `audio.enclosure` | object |  |  |  | yes |
| `audio.enclosure.type` | string |  | enum: sealed, ported, transmission-line, open-baffle, horn, isobaric |  | yes |
| `audio.enclosure.tuning_hz` | number |  |  |  | yes |
| `audio.enclosure.volume_liters` | number |  |  |  | partial: PDF only |
| `connectivity` | object |  |  |  | yes |
| `connectivity.wireless` | array |  |  |  | yes |
| `connectivity.wireless[].protocol` | string |  | enum: Bluetooth, WiFi, RF, proprietary |  | yes |
| `connectivity.wireless[].version` | string |  |  |  | yes |
| `connectivity.wireless[].codecs` | array of string |  |  |  | yes |
| `connectivity.wireless[].range_m` | number |  |  |  | yes |
| `connectivity.wired` | array |  |  |  | yes |
| `connectivity.wired[].connector` | string |  |  |  | yes |
| `connectivity.wired[].format` | string |  |  |  | yes |
| `connectivity.wired[].max_resolution` | string |  |  |  | yes |
| `connectivity.multi_room` | boolean |  |  |  | yes |
| `connectivity.max_paired_devices` | integer |  |  |  | yes |
| `connectivity.streaming_protocols` | array of string |  |  |  | yes |
| `agf_technologies` | array of string |  |  |  [items enum: l'Art, stereOS, BT'N-Tech, l'espacI/O, FRC41, No-Nails] | yes |
| `power` | object |  |  |  | yes |
| `power.battery_life_hours` | number |  |  |  | yes |
| `power.charging_type` | string |  |  |  | yes |
| `power.charge_time_minutes` | number |  |  |  | yes |
| `power.wall_power_watts` | number |  |  |  | yes |
| `power.standby_watts` | number |  |  |  | yes |
| `power.power_supply` | string |  |  |  | yes |
| `business` | object |  |  |  | yes |
| `business.ttm_months` | object |  |  |  | yes |
| `business.ttm_months.min` | number |  |  |  | yes |
| `business.ttm_months.max` | number |  |  |  | yes |
| `business.cogs_usd` | object |  |  |  | yes |
| `business.cogs_usd.min` | number |  |  |  | yes |
| `business.cogs_usd.max` | number |  |  |  | yes |
| `business.asp_usd` | object |  |  |  | yes |
| `business.asp_usd.min` | number |  |  |  | yes |
| `business.asp_usd.max` | number |  |  |  | yes |
| `business.tooling_cost_usd` | number |  |  |  | yes |
| `business.target_volume_monthly` | integer |  |  |  | yes |
| `business.certifications` | array of string |  |  |  | yes |
| `business.cert_cost_estimate_usd` | number |  |  |  | yes |
| `business.v2_refactor_months` | number |  |  |  | yes |
| `business.gross_margin_target` | number |  |  |  | yes |
| `status` | string |  | enum: concept, development, prototype, production, shipping |  | yes |
| `roadmap_notes` | string |  |  |  | yes |
| `competitive_reference` | object |  |  |  | yes |
| `competitive_reference.comparable_products` | array of string |  |  |  | yes |
| `competitive_reference.price_positioning` | string |  |  |  | yes |
| `competitive_reference.key_differentiators` | array of string |  |  |  | yes |
| `system_config` | object |  |  | System configurator relationships (editable via Edit UI) | yes |
| `system_config.companions` | array of string |  |  | Slugs of products that pair well with this one | yes |
| `system_config.connection_types` | array |  |  | How this product connects to other products | yes |
| `system_config.connection_types[].target_slug` | string |  |  |  | yes |
| `system_config.connection_types[].connection` | string |  | enum: RF, BT, USB-C, WiFi, analog, digital-coax |  | yes |
| `system_config.system_role` | string |  | enum: source, processor, amplifier, output, accessory | Where this product sits in the signal chain | yes |
| `_viz_config` | object |  |  | Per-product visualization configuration — controls which visual components are shown and their styling | yes |
| `_viz_config.show_freq_response` | boolean |  | default: `true` | Show frequency response curve | yes |
| `_viz_config.show_driver_diagram` | boolean |  | default: `true` | Show driver arrangement diagram | yes |
| `_viz_config.show_tech_flow` | boolean |  | default: `true` | Show technology signal flow | yes |
| `_viz_config.show_connectivity_badges` | boolean |  | default: `true` | Show connectivity badges | yes |
| `_viz_config.show_power_gauge` | boolean |  | default: `true` | Show power gauge | yes |
| `_viz_config.show_material_swatches` | boolean |  | default: `true` | Show material swatches | yes |
| `_viz_config.freq_response_color` | string |  | default: `"#B8860B"` | Primary color for frequency curve | yes |
| `_viz_config.freq_response_db_range` | number |  | default: `12` | dB range for Y-axis (+/-) | yes |
| `_viz_config.gauge_style` | string |  | enum: arc, bar, meter ; default: `"arc"` | Power gauge display style | yes |
| `_viz_config.tech_flow_order` | array of string |  | default: `["stereOS", "l'Art", "BT'N-Tech", "l'espacI/O", "FRC41", "No-Nails"]` | Order of technologies in signal flow diagram | yes |
| `_viz_config.badge_colors` | object |  |  |  | partial: merged over built-in defaults |
| `_viz_config.badge_colors.wireless` | string |  | default: `"#87CEEB"` |  | yes |
| `_viz_config.badge_colors.wired` | string |  | default: `"#FFD700"` |  | yes |
| `_viz_config.badge_colors.streaming` | string |  | default: `"#90EE90"` |  | yes |
| `_viz_config.badge_colors.feature` | string |  | default: `"#DDA0DD"` |  | yes |

#### `team-note`  ·  schema title "AGF Team Note"

> A short prose note from the AGF team. Sits between major sections as a quiet interlude; closes with a hairline rule below the text. Simple headline + body structure — same edit controls as every other section (per-item click-to-edit, right-click menu for background images / inline figures / enhance / reorder).

**Consumer:** live: renderTeamNote (class team-note).

> $comment: default_data is a custom extension (not part of JSON Schema). It is consumed by server/seed.js and server/migrations/sync_schemas.js to populate the section_schemas table with initial content.

Required top-level: `body`. additionalProperties: True.

| Field path | Type | Req | Constraints / enum / default | Description (verbatim) | Renderer reads? |
|---|---|---|---|---|---|
| `section_label` | string |  | default: `""` | Small eyebrow label above the headline (e.g., 'On the team'). Optional. Maps to the standard section eyebrow used by every section. | yes |
| `section_title` | string |  | default: `""` | The note's headline (h2). Optional — leave empty for a body-only interlude. Maps to the standard section title used by every section. | yes |
| `body` | string | Y | default: `""` | The note's main prose. Markdown supported: **bold**, *italic*, blank lines for new paragraphs. Rendered in the grey Commissioner (var(--taupe), weight 300) — matching the hero subheadline. | yes |
| `appendix` | string |  | default: `""` | markdown — supporting notes for the appendix | yes |

`default_data`: `{"section_label": "On the team", "section_title": "", "body": ""}`


#### `technology`  ·  schema title "AGF Technology Moat Section"

> Catalog of AGF's proprietary technologies that establish its defensible competitive moat, including codec pipeline visualization.

**Consumer:** live: renderTechnology (#technology).

Required top-level: `section_title`, `technologies`. additionalProperties: (unset).

| Field path | Type | Req | Constraints / enum / default | Description (verbatim) | Renderer reads? |
|---|---|---|---|---|---|
| `section_title` | string | Y |  | Display title for the section. | yes |
| `intro_text` | string |  |  | Markdown-formatted introductory narrative. | yes |
| `section_number` | string or integer |  |  | Section ordinal. | yes |
| `section_label` | string |  |  | Short label shown in the section eyebrow after the number (e.g. 'The Consolidation'). | yes |
| `technologies` | array | Y |  | Proprietary technologies presented as moat cards. | yes |
| `technologies[].id` | string | Y |  | Stable slug identifier. | yes |
| `technologies[].name` | string | Y |  | Short technology name (e.g., 'l'Art'). | yes |
| `technologies[].full_name` | string |  |  | Expanded or formal name of the technology. | yes |
| `technologies[].tagline` | string |  |  | Short evocative tagline. | yes |
| `technologies[].description` | string |  |  | Markdown-formatted description of the technology. | yes |
| `technologies[].patent_status` | string |  | enum: patented, trade_secret, pending, open | Intellectual-property posture for this technology. | yes |
| `technologies[].key_capabilities` | array of string |  |  | Bullet-list of standout capabilities. | partial: first 4 only (slice(0,4)) |
| `technologies[].codec_pipeline` | array |  |  | Stage-by-stage breakdown of the codec or signal pipeline. | **NO** |
| `technologies[].codec_pipeline[].stage` | string | Y |  | Pipeline stage name. | **NO** |
| `technologies[].codec_pipeline[].description` | string |  |  | What happens at this stage. | **NO** |
| `technologies[].competitive_advantage` | string |  |  | Markdown-formatted articulation of how this technology beats incumbents. | yes |
| `technologies[].appendix` | string |  |  | markdown — supporting notes for the appendix | yes |
| `codec_diagram` | object |  |  | Top-level codec pipeline diagram shared across the technology section. | yes |
| `codec_diagram.stages` | array |  |  | Ordered stages of the codec diagram. | yes |
| `codec_diagram.stages[].name` | string |  |  | Stage name. | yes |
| `codec_diagram.stages[].description` | string |  |  | Description of the stage. | yes |
| `codec_diagram.stages[].icon` | string |  |  | Optional icon identifier or path. | **NO** |
| `lart_stack` | object |  |  | Content for the l'Art stack diagram section within the technology section. | yes |
| `lart_stack.eyebrow` | string |  | default: `"The l'Art stack, in one breath"` | Eyebrow label above the l'Art stack section | yes |
| `lart_stack.headline` | string |  | default: `"Flawless implementation of stereo. Everything else is gravy."` | Main heading for the l'Art stack section | yes |
| `lart_stack.body` | string |  | default: `"Quadrophonic failed. Surround-sound failed. Dolby Atmos is financially dominant in cinemas but a niche at home. Mono, mixed mono, and stereo have dominated from inception to current day. The opportunity has \"the fine art of good enough\" written all over it."` | Body text for the l'Art stack section | yes |

#### `tenet`  ·  schema title "AGF Operating Tenets Section"

> The six guiding tenets that govern AGF's product, business, and cultural decisions.

**Consumer:** live: renderTenet (#tenets).

Required top-level: `section_title`, `tenets`. additionalProperties: (unset).

| Field path | Type | Req | Constraints / enum / default | Description (verbatim) | Renderer reads? |
|---|---|---|---|---|---|
| `section_title` | string | Y |  | Display title for the section. | yes |
| `intro_text` | string |  |  | Markdown-formatted introductory narrative. | yes |
| `section_number` | string or integer |  |  | Section ordinal. | yes |
| `section_label` | string |  |  | Short label shown in the section eyebrow after the number (e.g. 'The Consolidation'). | yes |
| `tenets` | array | Y |  | Ordered list of operating tenets. | yes |
| `tenets[].number` | integer | Y | min 1 ; max 6 | Tenet ordinal (1-6). | yes |
| `tenets[].title` | string | Y |  | Tenet title. | yes |
| `tenets[].anchor_phrase` | string | Y |  | Memorable short phrase that anchors the tenet. | yes |
| `tenets[].body` | string | Y |  | Markdown-formatted full body of the tenet. | yes |
| `tenets[].example_title` | string |  |  | Title of a concrete example illustrating the tenet. | yes |
| `tenets[].example_body` | string |  |  | Markdown-formatted example body. | yes |
| `tenets[].key_insight` | string |  |  | Concise distilled insight or pull-quote. | yes |
| `tenets[].appendix` | string |  |  | markdown — supporting notes for the appendix | yes |

#### `timeline`  ·  schema title "AGF Timeline / History Rhymes Section"

> Comparative timeline contrasting two eras of audio industry evolution to surface recurring patterns.

**Consumer:** live: renderTimeline (#opportunity) + app/bindings/rhyme-tabs.js.

Required top-level: `section_title`, `eras`. additionalProperties: (unset).

| Field path | Type | Req | Constraints / enum / default | Description (verbatim) | Renderer reads? |
|---|---|---|---|---|---|
| `section_title` | string | Y |  | Display title for the section. | yes |
| `intro_text` | string |  |  | Markdown-formatted introductory narrative. | yes |
| `section_number` | string or integer |  |  | Ordinal label or number for this section in the narrative sequence. | yes |
| `section_label` | string |  |  | Short label shown in the section eyebrow after the number (e.g. 'The Consolidation'). | yes |
| `flip_interval_seconds` | number |  | default: `12` | Auto-flip interval between 'then' and 'now' panes, in seconds. Set higher for a calmer pace. | yes |
| `eras` | array | Y |  | Discrete eras being compared, typically two. | yes |
| `eras[].year_range` | string | Y |  | Human-readable date range for the era (e.g., '1950-1985'). | yes |
| `eras[].label` | string | Y |  | Era name or thematic label. | yes |
| `eras[].events` | array |  |  | Notable events that define the era. | **NO** |
| `eras[].events[].year` | string or integer | Y |  | Year or year-range of the event. | **NO** |
| `eras[].events[].title` | string | Y |  | Short event title. | **NO** |
| `eras[].events[].description` | string |  |  | Longer narrative description of the event. | **NO** |
| `comparison_points` | array |  |  | Side-by-side comparison rows highlighting how patterns rhyme between eras. | yes |
| `comparison_points[].category` | string | Y |  | What dimension is being compared. | yes |
| `comparison_points[].era_1_value` | string |  |  | Value/state for the first era. | yes |
| `comparison_points[].era_2_value` | string |  |  | Value/state for the second era. | yes |
| `comparison_points[].insight` | string |  |  | The takeaway or pattern revealed by the comparison. | yes |
| `comparison_points[].appendix` | string |  |  | markdown — supporting notes for the appendix | yes |

#### `venue`  ·  schema title "AGF Venue / Retail Experience Section"

> Definition of the physical retail venue concept, its experiential zones, and the customer journey through them.

**Consumer:** live: renderVenue (#venue, section-dark).

Required top-level: `section_title`, `zones`. additionalProperties: (unset).

| Field path | Type | Req | Constraints / enum / default | Description (verbatim) | Renderer reads? |
|---|---|---|---|---|---|
| `section_title` | string | Y |  | Display title for the section. | yes |
| `section_number` | string or integer |  |  | Section ordinal. | yes |
| `section_label` | string |  |  | Short label shown in the section eyebrow after the number (e.g. 'The Consolidation'). | yes |
| `concept_description` | string |  |  | Markdown-formatted overview of the venue concept. | yes |
| `zones` | array | Y |  | Discrete experiential zones inside the venue. | yes |
| `zones[].id` | string | Y |  | Stable slug identifier for the zone. | yes |
| `zones[].name` | string | Y |  | Display name of the zone. | yes |
| `zones[].tagline` | string |  |  | Short evocative tagline. | yes |
| `zones[].description` | string |  |  | Markdown-formatted description of the zone. | yes |
| `zones[].features` | array of string |  |  | Notable features or installations within the zone. | yes |
| `zones[].atmosphere` | string |  |  | Description of the sensory atmosphere. | yes |
| `zones[].customer_journey_step` | number |  |  | Numeric position of this zone in the customer journey. | yes |
| `zones[].appendix` | string |  |  | markdown — supporting notes for the appendix | yes |
| `customer_journey` | array |  |  | Ordered steps of the customer journey through the venue. | yes |
| `customer_journey[].step` | string or integer | Y |  | Step ordinal or label. | **NO** |
| `customer_journey[].description` | string |  |  | Description of what happens at this step. | yes |
| `customer_journey[].appendix` | string |  |  | markdown — supporting notes for the appendix | yes |
| `target_customer_profile` | string |  |  | Markdown-formatted persona description of the target venue customer. | yes |
| `royalty_structure` | object |  |  | Performance-recording royalty structure unique to the venue model. | yes |
| `royalty_structure.broadcast_split` | string |  |  | Revenue split on broadcast-mixed performances (e.g., '50/50 in perpetuity'). | yes |
| `royalty_structure.stereo_ownership` | string |  |  | Ownership rule for the standard stereo capture. | yes |
| `royalty_structure.artist_blocking_rights` | string |  |  | Conditions under which the artist may block downstream broadcast. | yes |
| `royalty_structure.notes` | string |  |  | Additional royalty-structure detail. | yes |
| `virtual_ticket` | object |  |  | Virtual-ticketing concept for broadcast-mixed performances. | yes |
| `virtual_ticket.concept` | string |  |  | Markdown-formatted description of the virtual ticket product. | yes |
| `virtual_ticket.pricing_model` | string |  |  | Pricing model for virtual tickets. | yes |
| `virtual_ticket.owner_perks` | string |  |  | Permanent virtual all-access pass entitlements for AGF hardware owners. | yes |
| `financial_model` | object |  |  | Per-venue financial model and qualifying-market criteria. | yes |
| `financial_model.philosophy` | string |  |  | Markdown-formatted statement of the venue financial model. | yes |
| `financial_model.qualification_rule` | string |  |  | Rule for which markets qualify (e.g., 'one per financially qualifying market'). | yes |
| `financial_model.revenue_streams` | array of string |  |  | Venue revenue streams. | yes |
| `cultural_positioning` | object |  |  | Cultural and brand positioning for the venue concept. | yes |
| `cultural_positioning.movement` | string |  |  | The cultural movement the venue aligns with (e.g., 'touch grass'). | yes |
| `cultural_positioning.anti_pattern` | string |  |  | What the venue is explicitly NOT (e.g., the sterile boutique). | yes |
| `cultural_positioning.summary` | string |  |  | Markdown-formatted summary of the cultural stance. | yes |


---

## 7. The styles/ layer

### 7.1 How it is assembled

`styles/index.css` is a master file of 65 `@import url("group/file.css")` lines. `styles/_manifest.json` records each partial's `source_start`/`source_end` line range in the original `styles.css` (4,557 lines), its purpose, and the load order, with the note that concatenating all partials reproduces the source. Load order: **core** (brand-doc, tokens, fonts, reset), **layout**, **sections**, **util**, **feedback**, **viz**, **compare**, **configurator**, **editor**, then **core/motion-safe.css** last (reduced-motion overrides). `index.css` has 65 imports; `_manifest.json` lists 64 partials: `editor/image-adjust-panel.css` is imported but absent from the manifest (manifest drift). Cache-buster in the HTML: `?v=2026-06-27-cutover`. Partials are verbatim slices, so many carry a banner comment and some mix tabs and 2-space indentation. 28 `@media` blocks in total: 15 at `max-width: 1024px` (stack the hero stage and product card), 10 at `768px`, 2 at `1280px`, and 1 `prefers-reduced-motion`.

### 7.2 Every partial, in load order (lines | what it styles)

| # | Partial | Lines | Styles |
|---|---|---|---|
| 1 | `core/brand-doc.css` | 37 | Brand / palette / typography documentation header |
| 2 | `core/tokens.css` | 126 | :root design tokens (colors, type, spacing, motion) |
| 3 | `core/fonts.css` | 43 | @font-face: Commissioner, Monoton, Poiret One |
| 4 | `core/reset.css` | 34 | Global reset & base element styles |
| 5 | `layout/pcb-motif.css` | 31 | body.is-pcb::before decorative PCB trace |
| 6 | `layout/scroll-progress.css` | 23 | .scroll-progress indicator |
| 7 | `layout/nav.css` | 97 | .nav + children + scrolled state |
| 8 | `sections/hero.css` | 237 | Hero: grain, orbits, inner, kicker, display, stage |
| 9 | `sections/team-note.css` | 66 | Team note prose (+ .team-note-rule tail) |
| 10 | `sections/hero-secondary.css` | 122 | .lede, .hero-actions, .btn (SHARED), .hero-meta, scrollhint |
| 11 | `sections/hero-data.css` | 63 | Hero data strip (.hd-*) |
| 12 | `sections/section-base.css` | 116 | .section, .section-dark, .eyebrow, [data-reveal] |
| 13 | `sections/rhyme.css` | 109 | Rhyme timeline (.rhyme-*) |
| 14 | `sections/opportunity-grid.css` | 43 | .opportunity-grid, .og-card |
| 15 | `sections/opportunity-data.css` | 78 | .opportunity-data (.od-*) |
| 16 | `sections/consolidation.css` | 106 | .cons-table (.ct-*) (+ @media tail) |
| 17 | `sections/independent-block.css` | 64 | .independent-block (.ib-*) |
| 18 | `sections/tenets.css` | 67 | .tenets (.tenet-*) |
| 19 | `sections/venue.css` | 136 | .venue-*, .floor-zone, .zone-* |
| 20 | `sections/tech.css` | 144 | .tech-*, .codec-deep, .cd-* |
| 21 | `sections/products.css` | 89 | .products, .product-card (.phead/.pnum/.ptag/.pspec) |
| 22 | `sections/model.css` | 55 | .model-* business model cards |
| 23 | `sections/runway.css` | 61 | .runway table (.rr, .rhead) |
| 24 | `sections/founder.css` | 82 | .founder-grid, .timeline, .mentor-callout |
| 25 | `sections/cta.css` | 47 | .cta call-to-action block |
| 26 | `sections/footer.css` | 66 | .foot-* site footer |
| 27 | `sections/pdf-button.css` | 118 | .pdf-download-btn + light-section variant |
| 28 | `sections/prelude.css` | 58 | .prelude-grid three-column intro |
| 29 | `sections/cut-sheet.css` | 91 | .cs-* product cut sheet (to EOF) |
| 30 | `util/bg-overlay.css` | 32 | [data-bg-image] background image overlay |
| 31 | `util/figures.css` | 94 | .fig floated figures + clearfix + responsive |
| 32 | `feedback/drag-highlight.css` | 17 | .is-dragover highlight |
| 33 | `feedback/toast.css` | 33 | #toast-container + slideIn |
| 34 | `feedback/confirm-dialog.css` | 24 | .confirm-overlay / .confirm-dialog |
| 35 | `feedback/loading.css` | 40 | .app-loading spinner |
| 36 | `viz/positioning-chart.css` | 52 | .positioning-chart / .brand-dot / .pmap-* |
| 37 | `viz/roadmap-chart.css` | 74 | .roadmap-chart Gantt |
| 38 | `viz/product-viz.css` | 137 | freq response, driver, tech-flow + caption rail |
| 39 | `viz/connectivity.css` | 59 | .connectivity-badges |
| 40 | `viz/power-gauge.css` | 104 | arc + bar + meter variants |
| 41 | `viz/material-swatches.css` | 80 | .material-swatches + mobile tightening |
| 42 | `viz/upload-zone.css` | 34 | .upload-zone image drop area |
| 43 | `compare/toolbar.css` | 118 | .products-toolbar, compare toggle/launch |
| 44 | `compare/card-select.css` | 68 | .compare-mode .product-card selection |
| 45 | `compare/overlay.css` | 112 | .compare-overlay shell + header |
| 46 | `compare/grid.css` | 135 | .compare-grid rows/cols/cells |
| 47 | `compare/highlight.css` | 32 | .compare-highlight + section captions |
| 48 | `compare/charts.css` | 105 | freq overlay + price bar + responsive |
| 49 | `configurator/overlay.css` | 160 | banner + scroll-lock + frame + header |
| 50 | `configurator/cards.css` | 121 | .configurator-card selection + companion hint |
| 51 | `configurator/signal-chain.css` | 86 | SVG .chain-node + .system-connection |
| 52 | `configurator/footer.css` | 95 | synergy pills + price total + responsive |
| 53 | `editor/edit-states.css` | 74 | .is-editing hide rules + nav-add button |
| 54 | `editor/edit-menus.css` | 58 | .section-context-menu + .schema-picker |
| 55 | `editor/edit-forms.css` | 128 | .edit-form-overlay, .form-field/group/array |
| 56 | `editor/appendix.css` | 92 | .appendix-field/ref/popup (merges 2 source chunks) |
| 57 | `editor/enhance-panel.css` | 137 | .enhance-panel text-enhancement popover |
| 58 | `editor/enhance-controls.css` | 63 | .enh-align-* paragraph alignment controls |
| 59 | `editor/per-item-editor.css` | 122 | .edit-form-overlay--item + collapsible appendix |
| 60 | `editor/inserted-text.css` | 67 | .inserted-text draggable text blocks |
| 61 | `editor/fig-insert-panel.css` | 113 | Figure insert popover |
| 62 | `editor/bg-settings-panel.css` | 132 | Background settings popover |
| 63 | `editor/image-adjust-panel.css` | 24 | (not in manifest) |
| 64 | `editor/nudge-panel.css` | 109 | px-scaler nudge position popover |
| 65 | `core/motion-safe.css` | 47 | prefers-reduced-motion overrides (manifest: load LAST) |

Notes on the partials:
* **Orphan CSS** (no markup in any JS produces these classes): `sections/hero-data.css` (`.hd-*`), `sections/opportunity-data.css` (`.od-*`), `sections/opportunity-grid.css` (`.og-card`, `.opportunity-grid`). They are leftovers from an earlier version of the opportunity/hero sections.
* **Missing CSS** (markup is emitted but there is no rule anywhere in `styles/`): `.agf-tech-pill(s)`, `.pmeta-row`, `.pcat`, `.pstatus` (status chips), `.pdesc`, `.product-spec-sheet`, `.pspec-group`, `.pspec-group-head`, `.pspec-toggle`, `.px-arrow`, `.card-desc`, `.m-list`, `.tier-card`, `.split-bar/.split-artist/.split-agf` (artist-rights split bars), `.weight-bar/.weight-fill/.weight-pct` and `.prio-badge` (distribution), `.venue-economics`, `.zone-desc/.zone-features/.zone-step`, `.venue-caption-text`, `.tech-desc`, `.tenet-insight`, `.tenet-example-title`, `.tl-desc`, `.cp-*` fallback classes, `.positioning-map/.positioning-table/.roadmap-table`, `.lg-wired`, `.pin-l/.pin-r`, `.synergy-indicator`, `.dist-table`, `.cmp-card-check-tick`, `.ct-c-acquirer`, plus `.pcb-toggle`, the nav-link `.is-active` state and the whole hamburger drawer. 48 classes in all (a script compared every class literal in the live JS with the CSS). Either these relied on a later stylesheet that was not captured in the partial extraction, or they were never styled; verify against the screenshots before relying on this.
* **Undefined custom properties** referenced with no definition: `--col-body` (cut-sheet text colour, no fallback), `--col-card` (fallback `#1a1a1a`), `--type-h2` (fallback `2rem`), `--electric` (fallback `#00e0ff`, editor only). Runtime-set variables (not tokens): `--bg-size/--bg-position/--bg-opacity` (set by `applyBackgroundFromAttr`), `--ct-cols/--ct-cols-mob` (consolidation), `--cmp-cols`, `--cmp-curve` (compare overlay), `--pdf-rule-hi`.
* **Hero stage recipe** (`sections/hero.css`): `--mark-size: clamp(120px, 14vw, 240px)`; the Monoton mark is gold (`--gold`) with a faint glow; the top tagline is Commissioner 300 at **32 %** of the mark size in `--gold-soft`, right-aligned and flush with the top of the mark; the bottom tagline is Poiret One uppercase at **15 %** of the mark size with `--track-wide`, white, flush with the bottom; the columns stretch so the mark drives height; below 1024 px they stack. This is the "mark + two stacked taglines" lockup the new site should reproduce.
* The viz partials (`positioning-chart.css`, `power-gauge.css`, `product-viz.css` and others) use many hard-coded hexes (`#1a3a2a`, `#6e665b`, `#d8cfb8`, `#f4ecd8`, `#c00` for the today marker) instead of tokens, and the positioning chart is styled for a light panel.

### 7.3 Design tokens in `styles/core/tokens.css`

All tokens are on `:root`. Sources: `styles/core/tokens.css` (and `fonts.css` for faces).

**Colour**

| Token | Value | Notes |
|---|---|---|
| `--forrest` | `#1F4A2D` | primary background (alias `--bg`, `--green`) |
| `--forrest-deep` | `#0E2317` | dark sections, footer, scrims (alias `--dark`) |
| `--forrest-lift` | `#2A5A3C` | elevated cards (alias `--bg-2`) |
| `--forrest-sink` | `#163822` | pressed / sunken / fine rules (alias `--bg-3`, `--rule`) |
| `--gold` | `#B8860B` | primary accent (alias `--accent`) |
| `--gold-soft` | `#D4A234` | hover, light-on-dark accent (aliases `--accent-soft`, `--dark-accent`) |
| `--gold-mute` | `rgba(184,134,11,0.28)` | hairlines, dividers |
| `--obsidian` | `#0E1612` | ink (alias `--ink`) |
| `--obsidian-2` | `#1A221D` | layering variant (alias `--ink-2`) |
| `--taupe` | `#A89880` | quote / body-on-dark (alias `--muted`) |
| `--taupe-2` | `#C0B098` | lighter on dark, ledes (alias `--dark-ink`) |
| `--moss` | `#6B7A6F` | captions, sources, eyebrows on dark (alias `--dark-muted`) |
| `--dark-2` | `#08160E` | deepest section tone |
| `--dark-rule` | `#1A2E22` | rules inside dark sections |

**Typography** : `--font: 'Commissioner', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`. Sizes (locked to 1920×1080): `--type-micro 16px`, `--type-body 16px`, `--type-bold 16px`, `--type-lede 24px`, `--type-h4 24px`, `--type-h3 32px`, `--type-display 48px`, `--type-mega 96px`. Leading: `--leading-tight 1.05`, `-snug 1.15`, `-normal 1.45`, `-relaxed 1.65`, `-loose 1.75`. Tracking: `--track-tight -0.02em`, `-normal 0`, `-wide 0.08em`, `-wider 0.16em`, `-widest 0.24em`, `-mega 0.32em`.

**Layout** : `--max: none`, `--gutter: clamp(24px, 4vw, 32px)`; column tokens (fluid percentages with clamps): `--col-data clamp(600px,69%,1100px)`, `--col-medium clamp(500px,61%,980px)`, `--col-head clamp(520px,57%,920px)`, `--col-meta clamp(480px,53%,880px)`, `--col-prose clamp(440px,47%,760px)`, `--col-deck clamp(400px,45%,720px)`, `--col-narrow clamp(360px,40%,640px)`, `--col-rule clamp(120px,14%,220px)`.

**Spacing** (rule of 8s): `--space-2xs 4`, `-xs 8`, `-sm 16`, `-md 24`, `-lg 32`, `-xl 48`, `-2xl 64`, `-3xl 80`, `-4xl 96`, `-5xl 120` px; `--space-section-xl 120`, `-lg 80`, `-md 64`, `-sm 48`. **Borders**: `--border-hair 1px`, `--border-rule 2px`, `--border-bold 3px`. **Radius**: `--radius-xs 2`, `-sm 4`, `-md 6`, `-lg 8`, `-pill 999`. **Breakpoints** (declared, but CSS custom properties cannot be used in media queries, so unused): `--bp-mobile 768`, `--bp-tablet 1024`, `--bp-desktop 1280`. **Motion**: `--ease: cubic-bezier(.2,.7,.2,1)` (the only motion token; durations are literals such as `.8s` reveal, `.35s` pill, `.2s` hovers).

**Fonts** (`core/fonts.css`): Commissioner variable (`weight 100 900`, `font-display: swap`; originally `format('truetype-variations')`, now `format('woff2')`), Monoton 400, Poiret One 400, now loaded as WOFF2 from `/fonts/web/` via `../../../../fonts/web/` (originally the archive's TTFs under `assets/`, since deleted; see 1.1). `index.html` also pulls Commissioner from Google Fonts (redundant).

### 7.4 Comparison with `/home/user/agf/agf-design-system/agf-design-system/tokens.css`

The new system defines three themes (`midnight` default, `daylight`, `air`) with semantic names (`--surface*`, `--ink*`, `--brass*`, `--signal-*`), numeric spacing names (`--space-4`..`--space-120`), numeric radii (`--radius-2/4/8/pill`), `--border-hairline/rule/bold`, tracking tokens, `--font-sans/--font-mark/--font-strapline`, and a type scale as classes (`.mark-mega 96`, `.mark 48`, `.mark-small 24`, `.strapline-hero 40`, `.strapline 24`, `.strapline-small 16`, `.mega 96`, `.display 48`, `.h3 32`, `.lede 24`, `.body 16`, `.small 14`, `.caption 13`, `.eyebrow 12`, `.micro 11`, `.data-mega 96`, `.data 48`, `.data-small 24`). Its motion curve is `--ease-damped: cubic-bezier(0.16, 1, 0.3, 1)` (per `03-motion.md`). Legacy-to-new:

| Legacy token | Value | New equivalent | Verdict |
|---|---|---|---|
| `--forrest` | `#1F4A2D` | `--forest` `#1f4a2d` (and `--surface-raised` in midnight) | **same colour, different spelling** (forrest vs forest). Role differs: legacy used it as the page background, new midnight page surface is `#0e2317`. |
| `--forrest-deep` | `#0E2317` | `--surface` / `--surface-deep` `#0e2317` | same value; legacy "dark section", new "base surface". |
| `--forrest-lift` | `#2A5A3C` | `--surface-lifted` (midnight) | same value. |
| `--forrest-sink` | `#163822` | `--surface-sunken` (midnight), `--surface-raised` (air) | same value. |
| `--gold` | `#B8860B` | `--brass` `#b8860b` | same value, **different name** (gold vs brass). |
| `--gold-soft` | `#D4A234` | `--brass-text` (midnight/air) `#d4a234`, `--signal-hot` | same value; new `--brass-text` in daylight is `#7a5906`, which the legacy `--gold-soft` has no equivalent for (legacy gold-soft on a light surface would be low contrast). |
| `--gold-mute` | `rgba(184,134,11,.28)` | `--brass-hairline` (midnight/air `.28`, daylight `.45`), `--opacity-trace .28` | same value in dark themes. |
| `--obsidian` | `#0E1612` | `--obsidian` `#0e1612` | identical. |
| `--obsidian-2` | `#1A221D` | none | **no equivalent** (nearest `--surface-sunken` air `#070b09` is different). |
| `--taupe` | `#A89880` | none | **no equivalent.** Legacy's main muted text colour (36 uses) is missing from the new system; `--ink-muted` is `#c0b098`. Also used as `competitor_color` in the positioning chart. |
| `--taupe-2` | `#C0B098` | `--ink-muted` / `--ink-on-deep-muted` `#c0b098` | same value, different name. |
| `--moss` | `#6B7A6F` | `--moss` `#6b7a6f` | identical; new adds `--ink-faint #a5b2a8` as the legible moss. |
| `--dark-2` | `#08160E` | none | no equivalent. |
| `--dark-rule` | `#1A2E22` | none | no equivalent. |
| **`--ink`** | `var(--obsidian)` `#0E1612` | `--ink` `#e9e2d4` (midnight, air) / `#0e1612` (daylight) | **CONFLICT: same name, inverted meaning.** Legacy `--ink` is dark text; new `--ink` is light text in the default theme. Any legacy rule using `var(--ink)` will go invisible on midnight. |
| **`--muted`** | `var(--taupe)` | none; `--ink-muted` is `#c0b098` | name absent in new; if mapped to `--ink-muted` the value shifts from `#A89880` to `#C0B098`. |
| **`--bg`, `--bg-2`, `--bg-3`** | forrest, lift, sink | `--surface`, `--surface-lifted`, `--surface-sunken` | **role conflict:** legacy `--bg` is `#1F4A2D`; new `--surface` is `#0e2317` (darker). The visual impression of the site changes if mapped by name. |
| `--accent`, `--accent-soft` | gold, gold-soft | `--brass`, `--brass-text` | rename only. |
| `--font` | Commissioner + system fallbacks | `--font-sans` Commissioner, "Helvetica Neue", Arial | different fallback stack. |
| (none; literal `'Monoton'`, `'Poiret One'`) | | `--font-mark`, `--font-strapline` | new system adds tokens the legacy hardcoded as literal font names (Monoton in 6 places). |
| `--type-micro` | **16px** | `.micro` **11px** (also `.caption 13`, `.small 14`, `.eyebrow 12`) | **CONFLICT:** same word, 16 vs 11. The legacy scale has nothing below 16 and the components use literals (`.72rem`, `.85rem`) instead. |
| `--type-body/-bold` | 16px | `.body 16`, `.body-strong 16/600` | match. |
| `--type-lede` / `--type-h4` | 24px | `.lede 24` / none for h4 | match / h4 missing. |
| `--type-h3` / `-display` / `-mega` | 32 / 48 / 96 | `.h3 32` / `.display 48` / `.mega 96` | match. Weights differ: legacy brand doc says "display uses 200", new `.display` is 300 and `.mega` 200. |
| `--leading-*` | 1.05, 1.15, 1.45, 1.65, 1.75 | per-class leading: display 1.05, h3 1.15, lede 1.4, body 1.55, small 1.45 | legacy body leading (`relaxed 1.65`) vs new `1.55`; lede `1.4` vs `1.45`. |
| `--track-wide/-wider/-widest/-mega` | .08 / .16 / .24 / .32em | `--tracking-eyebrow .18em`, `--tracking-strapline .32em`, `--tracking-mark .06em` | legacy eyebrow uses `--track-widest .24em` (new eyebrow `.18em`); legacy `-mega .32em` equals new strapline-hero. |
| `--space-2xs..5xl` | 4, 8, 16, 24, 32, 48, 64, 80, 96, 120 px | `--space-4..120` | **identical values; names differ** (t-shirt vs numeric). A mechanical rename works. Legacy extras with no counterpart: `--space-section-*`. |
| `--border-hair/-rule/-bold` | 1/2/3px | `--border-hairline/-rule/-bold` | `hair` vs `hairline` spelling. |
| `--radius-xs/sm/md/lg/pill` | 2/4/6/8/999 | `--radius-2/4/8/pill` | **`--radius-md` (6px) has no counterpart**; used 8 times. |
| `--ease` | `cubic-bezier(.2,.7,.2,1)` | `--ease-damped` `cubic-bezier(0.16, 1, 0.3, 1)` | **different curve.** The new system says nothing else should be used. Port animations with the new curve and 300 ms hover timings. |
| `--gutter`, `--max`, `--col-*` | see above | none | layout tokens have no equivalent; the new design system is silent on measures. |
| (none) | | `--signal-nominal/-hot/-clip`, `--live`, `--glass`, `--blur-glass`, `--opacity-grain .06`, `--shadow-panel/-glow`, `--focus-ring`, `--on-brass` | new-only. |

Legacy values that fail contrast, to avoid porting by accident (WCAG contrast ratios computed here): `--taupe` on `--forrest` 3.6:1; `--moss` on `--forrest` 2.2:1 and on `--forrest-sink` 2.9:1; `--gold` on `--forrest` 3.1:1; `--gold-soft` on `--forrest` 4.3:1. The default `body` colour is `--obsidian` on a `--forrest` background (1.8:1), so every block must override its text colour. Hard-coded off-palette colours in components: `#87CEEB`, `#FFD700`, `#90EE90`, `#DDA0DD` (connectivity badges and milestone types), `#7AB48A` (compare curve), `#c00` (today marker).



---

## 8. Worth porting / do not port

### 8.1 Worth porting (15)

Each entry names the file and the function(s) to read first, then why.

| # | What | File : function(s) | Why it is worth it / what to change |
|---|---|---|---|
| 1 | **Competitive perceptual map** (log price × prestige, AGF highlighted, pin-able detail cards) | `components/positioning-chart.js` : `perceptualMap`, `project`, `bindInteractions` (+ `barChart`, `tableFallback` as responsive fallbacks) | The strongest single visual in the old site, and the data is complete in `content/sections/competitive-positioning.json` (6 competitors, price 3K to 150K, prestige 75 to 95). Apply the new tokens, apply the config defaults in code, add label collision handling (Krell/Burmester/B&O cluster) and keyboard access (dots are not focusable). |
| 2 | **Launch roadmap Gantt** (CSS grid, swimlanes, typed milestone dots, hover tooltip) | `components/roadmap-chart.js` : `gantt`, `bindInteractions`; markup trick `.roadmap-swimlane { display: contents }` | Data is complete in `launch-roadmap.json` (6 phases with `start_slot`/`duration_slots`, typed milestones). Replace the fake "today" marker with a real date or drop it; add defaults for `label_column_width` and gradient colours; fix the milestone type (strings vs objects). |
| 3 | **Side-by-side product compare overlay** (config-driven rows, winner highlight, price bar) | `components/product-compare.js` : `init`, `buildRows`, `numericWeight`, `findWinner`, `formatValue`, `buildPriceBar` | Pure function of `comparison-config.json` + product data; adding a row is one JSON entry. The winner logic (`higher_wins`, per-format weights) is the reusable core. The frequency overlay only works for products with a measured range (only Symphony today). |
| 4 | **"Build Your System" configurator** (signal-chain lanes, companion hints, synergy pills, running total) | `components/system-configurator.js` (`init`) or the split `constants.js : laneLayout`, `render-chain.js : renderChain/nodeSVG/edgeSVG`, `render-footer.js : computeCompanionHints/renderSynergy/renderPrice` | Relationships are 100 % data-driven from `system_config` on each product, and it is the one interactive that explains the *system* thesis. Fix the one-directional edge rule (4.10) and handle products with no price. |
| 5 | **Technology signal-flow strip** (IN → stereOS → l'Art → BT'N-Tech → l'espacI/O → FRC41 → No-Nails → OUT) | `components/tech-flow.js` : `render` | Tiny, self-contained, and encodes the canonical technology order from `_viz_config.tech_flow_order`. |
| 6 | **Driver arrangement diagram** (size-scaled concentric drivers, role-ordered, material-coloured, enclosure outline) | `components/driver-diagram.js` : `render`, `materialColor` | Turns `audio.drivers[]` into an honest, data-true diagram (sizes are real). 5 of 6 products have drivers. |
| 7 | **Power gauge** (arc / bar / native meter, animated fill) | `components/power-gauge.js` : `pickMetric`, `renderArc`, `renderBar`, `renderMeter` | Good stylings for battery hours; keep the three variants as theme options. Note the scale maxima are arbitrary (60 h, 300/2400 W, 5 W). |
| 8 | **Frequency-response graphic**, *only* as a labelled illustration or with real measurements | `components/freq-response.js` : `render` (log X 20 Hz to 20 kHz, ±dB band, tolerance edges, area gradient) | The axes, grid and passband band are right; the in-band curve is invented (`sin` ripple) so it must not be presented as a measurement. Feed it a real measured array when one exists. |
| 9 | **Connectivity badges + material swatches** (`ConnectivityBadges`, `MaterialSwatches`) | `components/connectivity-badges.js : render/makeBadge`; `components/material-swatches.js : chipFor` | The keyword-to-gradient table in `chipFor` is reusable brand-material vocabulary (copper, obsidian, beryllium, mass-loaded alloy, leather, foam ...). Replace the off-palette badge colours (sky blue, pink) with brass/moss tokens. |
| 10 | **"History rhymes" two-era comparison with auto-flip** | `schema-renderer.js : renderTimeline` + `app/bindings/rhyme-tabs.js : bindRhymeTabs` | A distinctive pattern (sliding gold pill, pause on hover, stops after a click). The export also contains 9 era `events[]` that were never displayed: richer content waiting for a layout. |
| 11 | **Scroll choreography** | `app/bindings/reveal.js : bindRevealObserver`; `counters.js : bindCounters`; `scroll-progress.js : bindScrollProgress`; `hero-parallax.js : bindHeroParallax` | Small, dependency-free, reduced-motion aware (parallax) and IO-gated. Re-time to the design system's damped curve and 300 ms hover rule; add reduced-motion handling to counters. |
| 12 | **Appendix / "Learn more" progressive disclosure** | `schema-renderer.js : appendixRef`; `app/bindings/appendix.js : bindAppendixLinks`; `app/utils.js : resolveDotPath` | Keeps research-grade footnotes (many items carry `appendix` markdown) out of the main narrative. Make it an accessible `<dialog>` with Esc and focus return. Remember its CSS lives in `styles/editor/appendix.css`. |
| 13 | **Data-table section patterns** | live `schema-renderer.js : renderConsolidation` (adaptive `COLS`, `--ct-cols`), `renderDistribution` (weight bars), `renderArtistRights` (artist/AGF split bar), `renderBusinessModel` (runway table), `renderVenue` (three zones + economics `dl`) | Each maps a JSON list cleanly to a table or bar; the CSS for the bars/split/priority badge is missing in the archive, so rebuild it from the markup. |
| 14 | **Hero lockup and heading system** | `schema-renderer.js : renderHero`, `head`, `sanitizeHeadingTitle`, `splitHeadline`, `toRoman`; `styles/sections/hero.css : .hero-stage` | Giant Monoton mark with Commissioner (32 %) and Poiret One (15 %) taglines flush to the mark's top and bottom; eyebrow "NUM · LABEL"; two-tone emphasis on the last sentence/word. These are the brand's typographic signatures; the new design system already names the mark/strapline faces. |
| 15 | **Spec sheet: web accordion and print PDF** | web `schema-renderer.js : renderProductCard`, `specGroup`, `app/bindings/product-expand.js`; print `index.js : renderPdfHtml`, `sections/*.js`, `css/*.css.js` | The formatting rules for specs (frequency range string, driver summary, amp class, dimensions order H × W × D, margin %) and the 9-block print layout with investor-only gating (`business_metrics`, `confidentiality_notice`) are directly reusable; palette and font are parameters. The print CSS is already `@page`-aware with `print-color-adjust: exact`. |

### 8.2 Do not port

| Item | Where | Reason |
|---|---|---|
| The whole in-page CMS | `editor.js`, `editor/*`, `styles/editor/*` (except `appendix.css`), `app/data-refresh.js`, `window.AGFEditor` | Tied to a server/database that no longer exists; the new pages are static. It boots for every visitor with no client-side auth gate, writes with GET-then-full-PUT (documented race that clobbers `_figures`/`_texts`), inserts `_texts[].content` as raw HTML, and the confirm dialog has no focus trap or ARIA. |
| Nudges | `app/style-manager.js : applyNudges`, `editor/nudge-panel.js`, `_nudges` | Per-element pixel margin hacks keyed to `data-field`; left/right nudges are converted to `translateX`, which is not responsive and fights a design system. Already stripped from the export. One header row even carries `_nudges.headline.marginLeft: -100` for a field that does not exist. |
| Style overrides and "enhance" panel | `app/style-manager.js : applyStyleOverrides`, `editor/enhance-panel.js`, `editor/style-overrides.js`, `_style_overrides` | Inline-style patches addressed by `nth-of-type` selectors; incompatible with tokens/themes; produces orphans (`AGF._styleOrphans`). Stripped from the export. E.g. a header override sets `.nav-tagline` to `32px / 100 / rgb(168,152,128)`, a one-off. |
| Background/figure/inserted-text machinery | `_background_image/_settings`, `applyBackgroundFromAttr`, `figuresByPosition`, `insertedTextsHTML`, `editor/figures.js`, `bg-settings.js`, `inserted-text.js`, `image-adjust-panel.js`, `drag-drop.js` | Editor concepts. Percent-absolute positioned text blocks are fragile. If an image is needed, use plain responsive `<figure>` markup. |
| `*.broken` files | `schema-renderer.js.broken`, `editor.js.broken` | Superseded revisions (they parse). Value: `schema-renderer.js.broken` is the only code that still contains the original fallback strings, all of which are already recovered in `production-staging/CONTENT-HARVEST.md`. Keep as history. |
| Split extraction trees | `schema-renderer/`, `editor/`, `components/system-configurator/` | Never loaded, partly wrong (load-order bug, stale logic, no real import/export). Exceptions: `schema-renderer/renderers/overview.js` and `concept-explainer.js` are the only implementations of those two schemas (re-implement from the contract in section 6, fixing the duplicated-body bug), and `system-configurator/` has the better error isolation. |
| Runtime plumbing | `app/api.js`, `app/mount.js`, `app/cleanup.js`, `window.__agfChartData`, random chart keys, `MutationObserver` chart mounting, `_scheduleHydration` | The new site should render at build time from `content/*.json`. These exist only to bridge a fetch-then-innerHTML architecture. |
| Dead code | `app/nav.js`, `bindHamburger`, `bindActiveNav` (no nav links in data), `sectionCfg` in PDF `helpers.js`, `activeEnd` in `power-gauge.js` | Never executed. |
| Heuristic `groupIndependents` outside consolidation | `schema-renderer.js` (used by technology, venue, overview, concept-explainer) | Regex bucketing by words like "German" / "atelier" was meant for independent hi-fi brands; applied to lists whose items have no `specialty`/`name` it is a no-op (everything lands in "Other"), but it would silently reorder technologies whose `name` contains words like "public" or "german", and `concept-explainer` prints non-"Other" bucket names as `.ce-group-label` headings. |
| Schemas as forms | `schemas/*.json` | Keep as documentation of fields (section 6), not as a CMS. Many descriptions are generic. |
| Orphan and editor CSS | `hero-data.css`, `opportunity-data.css`, `opportunity-grid.css`, `styles/editor/*`, `feedback/drag-highlight.css`, `viz/upload-zone.css`, `confirm-dialog.css` | No markup uses them or they only style editor chrome. |
| Hidden config rows as page content | `pdf-config`, `comparison-config` | Not content; `comparison-config` is data for item 3, `pdf-config` for item 15. |
| `vitest.config.js` | | Points at a `tests/` folder that does not exist. |
| Fake or invented visuals presented as data | `RoadmapChart.positionTodayMarker` (15 % of the timeline), `FreqResponse` ripple, `ProductCompare` overlay curves | Misleading unless clearly labelled illustrative. |



---

## 9. Known defects (found by reading; nothing was executed in a browser)

### 9.1 Wiring, loading and dead code

1. **The split trees are not wired.** `index.html` loads `schema-renderer.js`, `components/system-configurator.js` and `editor.js`; nothing loads `schema-renderer/`, `components/system-configurator/` or `editor/`. `editor/LOAD_ORDER.md`, `schema-renderer/load-order.txt` and the `A-*.extract.py` tickets they cite (`tickets/`, `HOOKS.md`, `product-pdf.js.shim.example`) are not in the archive.
2. **Live renderer cannot render `overview` or `concept-explainer`.** They are absent from the live `REGISTRY`, so the three visible rows (`overview` 02820881, `concept-explainer` 4f022f7f and d30a3470) would have produced "Unsupported schema" stubs. Their only implementations are in the unloaded split tree.
3. **Split `schema-renderer/helpers.js` cannot initialise**: `AGF.helpers.setSectionId = ...` runs before `AGF.helpers = AGF.helpers || {}`, so on a clean `window.AGF` it throws `TypeError` (swallowed by its own try/catch); every later file then reads an empty `AGF.helpers`.
4. **Two diverged vintages.** Live monolith has `image_settings` (prelude/cut-sheet), dynamic consolidation columns, `independent_heading/_intro`, `md()` on the hero subheadline, empty-hero placeholders; it lacks `_margin_to_margin` / `data-margin-to-margin` support that the CSS (`section-base.css`, `consolidation.css`, `team-note.css`) and the split tree still have. The split tree has the opposite. A rebuild must merge both.
5. **`app/index.js` replaces `window.AGF`** instead of extending it, which would discard any `AGF.helpers`/`AGF.renderers` registered earlier by the split renderer modules.
6. **`bindHamburger` is imported by `mount.js` but never called**; no renderer emits `#navHamburger`, `#navDrawer`, `#navDrawerOverlay`. `app/nav.js` (`buildNav`) is dead and would throw (uses `state` and `escapeHTML` without importing them). `bindActiveNav` targets `.nav-links a`, which only exists when `nav_links` is non-empty (it is `[]` in the export).
7. **Manifest drift**: `styles/index.css` imports `editor/image-adjust-panel.css`, which is not in `_manifest.json`.
8. **`vitest.config.js`** points at `tests/**/*.test.*` that is not present.
9. **Dead variables/params**: `power-gauge.js` computes `activeEnd` and never uses it; PDF `helpers.js : sectionCfg` is unused; PDF `sections/index.js : renderAllSections/safeRender` is never called (see 9.4).

### 9.2 The `.broken` files

* `schema-renderer.js.broken` and `editor.js.broken` both pass `node --check`; they are not syntactically broken. They are the *previous* revisions (space-indented, strict-mode wrapper) that were replaced by the tab-indented live files. They are the only copies in the archive that still contain the renderers' original hardcoded fallback copy, and (editor) lack the image-adjust panel.
* Nothing else in the archive references them.

### 9.3 Hardcoded fallback copy

All strings below are text a renderer outputs when data is empty or regardless of data. They were mostly recovered into `production-staging/CONTENT-HARVEST.md`.

| Renderer | String | Where it survives |
|---|---|---|
| hero | kicker "Foundational Brand Development · 2026" | live + split + broken |
| hero | defaults mark `AGF`, headline `All Grounds Floating`, strapline `Even Rails → Smooth Tracks` | split + broken only (live: empty) |
| header | tagline link "Even Rails → Smooth Tracks" → `#technology`; brand default `AGF`; aria-label "AGF home" | live + split |
| footer | tagline default "— All Grounds Floating" | split + broken |
| timeline | title "History does not repeat. It rhymes." | split + broken |
| consolidation | "Who is left, as a matter of public record" + "A short list. The truly-independent boutique premium brands are getting rare. AGF aims to join this list, not the one above." | split + broken (live: `independent_heading/_intro`, both empty in the export) |
| tenet | title "The operating gospel." + deck "Twenty-five years of compounding, distilled. Each tenet is a constraint that creates leverage — and a load-bearing rule that protects the others." | split + broken |
| venue | title "The venue. A church of the performing arts."; sub-headings "How a customer meets AGF", "Royalty Structure", "Virtual Ticket", "Financial Model", "Cultural Positioning" and every `dt` label | titles: split + broken; sub-headings: all |
| technology | title "Foundational technology, single-source."; deck "Technologies presented as real product opportunities ... Each layer compounds the others."; kind fallback "Technology"; l'Art block defaults ("The l'Art stack, in one breath", "Flawless implementation of stereo. Everything else is gravy.", the "Quadrophonic failed..." paragraph) | split + broken |
| products block | "06" / "The Lineup" / "Inaugural product line." / deck mentioning Focal's $5K flagship; "Compare", "Select 2–3 products", "Compare Selected", "Build Your System" + hint, "View Spec Sheet", "Download PDF" | all (live too) |
| business-model | title "Numbers, runway, and the way the money actually works."; deck "Optimizing TTM on a full line..."; "The Budgeted Total Package"; card headings "Pricing Strategy", "Channel Approach", "The Bose-Like Third-Party", "Target Partners", "Revenue Model", "Hardware-led, codec/OS halo"; "The Runway, at a glance", "Phased rollout" | titles/model name: split + broken; headings: all |
| founder | deck "Twenty-five years in this market, longer if you count the garage sales."; "The mentors, in shorthand", "Key companies"; CTA block ("The plan is on the page. Now what?", the "Channel introductions..." paragraph, `mailto:hello@agf.brand` "Request the deck", "Back to top") | deck: all; CTA/headings: all (the `cta_*` and `*_heading` keys in the v2 rows hold the same strings but are never read) |
| distribution | title "Distribution — the future bank-roller."; "Partner Criteria (weighted)", "Territories", "The price floor and the price ceiling" | all |
| artist-rights | title "Artist Rights — artists drive their own destiny."; "Identified, blocked, recovered", "Device Lockout", "Legal Remedies", "Social Deterrent", "Rights", "Restrictions", "Revenue Streams" | titles: split + broken; headings: all |
| competitive-positioning | title "Competitive Positioning — where AGF lands." | split + broken |
| launch-roadmap | title "Launch Roadmap — sequencing the line."; cards "PR Stunt", "Venue Pilots", "Year-One Target", "pcs / month", "markets" | titles: split + broken; cards: all |
| prelude | title "Prelude" | split + broken |
| index.html / PDF | page `<title>` and meta description; PDF mark "AGF / All Grounds Floating", footer default "AGF — All Grounds Floating", confidentiality notice "Confidential — for the named recipient only. Unauthorized distribution prohibited.", "No description provided." | all |
| index.js (PDF) | default palette `#1F4A2D / #B8860B / #1A1A1A`, default font `Commissioner` | n/a |

### 9.4 Renderer bugs

* **`overview.js` image mode duplicates or drops content** (split tree only): image on the right (default) renders the headline/summary body twice (as `leadingHTML` and again inside `.ov-text`); image on the left drops the body entirely and renders the metrics/highlights block twice (`textInner` plus `extrasHTML`).
* **Double escaping of titles** (split `overview.js`, `venue.js`, `technology.js`): they pass `sanitizeHeadingTitle(...)` output to `head()`, which sanitises again, so a title containing a full stop or `&` shows literal `&lt;br/&gt;` / `&amp;amp;`.
* **Invalid HTML**: `appendixRef()` emits a `<div>` as a direct child of `<ol>`/`<ul>`/`<dl>`/`.runway-table` in venue (journey), consolidation (independent brands), overview (highlights), founder (mentors), technology and others.
* **Section numbering is inconsistent**: some renderers print `toRoman(section_number)` (venue, technology, overview, concept-explainer) and others print the raw string (timeline, consolidation, tenet, business-model ...). `toRoman` only knows 1 to 12 and fails for zero-padded strings such as `"05"` (returns `"05"`).
* **`distribution` weights** assume 0 to 1 (`Math.round(weight*100)%`), but the schema says "0-1 or 0-100"; a 0 to 100 value would draw a 5000 % bar. **`artist-rights`** split bars use the raw percentages as widths without normalising.
* **Counters**: `data-suffix` is emitted but unused; decimals are lost during the animation (integer rounding) and appear only at the end; `prefers-reduced-motion` is not honoured by `bindCounters`.
* **Hero with the exported data renders no brand mark**: `hero.json` has `mark: ""`, `strapline: ""`, `metrics: []`, `scroll_indicator: false`. The live renderer prints an empty `h1.hero-mark--empty` (an editor affordance), so the Monoton lockup the CSS is designed around is absent from the exported content. The old `AGF` / "Even Rails → Smooth Tracks" came only from the fallbacks.
* **Header**: the `tagline` stored in two header rows is ignored (hardcoded); `nav_links` is `[]`; `cta_text/cta_link` exist only on the oldest row ("Request the Deck" → `#founder`).
* **Chart plumbing**: every render of `competitive-positioning` / `launch-roadmap` stores the whole section in `window.__agfChartData` under a fresh random key and never removes it (leak on every refresh); the `<noscript>` fallback table is the only fallback (not shown when the component fails at runtime).
* **`compare-mode.js` fetches `/api/sections?schema=comparison-config`** separately because `loadAll()` drops hidden sections, so the config can never come from `state.sections`.
* **Product block numbering** is hardcoded "06 · The Lineup" while the products block is inserted by position, not by `display_order`.
* **PDF**: `renderPdfHtml` in `index.js` filters and maps `SECTION_RENDERERS` itself and never calls `renderAllSections/safeRender`, so a throwing renderer aborts the whole PDF despite the README's promise; `pdf-config.page_format` and `margins` are never read (the CSS fixes `@page { margin: 0 }` and a body padding of `0.35in 0.55in 0.4in`); `brand_mark`/`brand_tag` are ignored (header hardcodes "AGF" / "All Grounds Floating"); the font is named but never embedded (`font-family: 'Commissioner', Helvetica...` relies on the PDF engine having it); `fmtRange` in the site helper does not guard `min/max` both undefined (the PDF copy does).

### 9.5 Component bugs (details in section 4)

* `PositioningChart` and `RoadmapChart` apply **no config defaults** despite schema defaults; a partial `_viz_config` throws or yields invalid CSS (`label_column_width` undefined). `PositioningChart` adds a container-level click listener on every render (never removed; only the `keydown` handler is cleaned up). Dots are mouse-only (no focus/keyboard/touch).
* `RoadmapChart`: schema says `milestones: array<string>`, the chart needs objects; the today marker is fake; `phases[].product/start_slot/duration_slots` are undeclared in the schema.
* `FreqResponse` / `ProductCompare` overlay curves are fabricated; `tolerance_db || 3` replaces an explicit 0.
* `DriverDiagram` material matching is by loose substring (`lf` matches "half-inch"); `TechFlow` marker id `tf-arrow` repeats per card (harmless but invalid HTML ids).
* `MaterialSwatches.chipFor`: `ui` substring matches unrelated words.
* `ProductCompare.formatValue('number')` escapes then the caller escapes again.
* `SystemConfigurator` edge de-duplication (`slug > target_slug`) loses links declared only on the larger slug; in the export the Instrument → Symphony `USB-C` link is lost.
* `product-viz.js` caches product data under `slug || name`, so two products without slug would collide; hydration depends on a `requestAnimationFrame` after the `innerHTML` assignment.

### 9.6 Data defects visible in the DB export

* **Duplicate and test rows.** `raw/sections.json` has 39 rows for 20 schema ids. Four `header` rows exist: three share `display_order -2` (`5d676382` with `cta_text "Request the Deck"` plus a style override on `.nav-tagline`; `670cf286` and `08ca9631` with `tagline` and `_nudges.headline.marginLeft -100`) and a fourth at `display_order 1.5` (`48492576`) whose fields are all empty strings, plus two identical `footer` rows. All of them carry `created_at 2026-07-06 08:21:02`, the same instant as the rest of the seed, so they look like repeated seed/import runs or a half-finished "add header" action, not something the renderer created: `renderHeaderFooter` only reads the **first** `header` and `footer` row and never writes. The editor-created rows are the later ones (2026-07-14: prelude ×3 and `concept-explainer` d30a3470).
* **Other schemas are duplicated too and, unlike header/footer, would each render as a separate section** (no deduplication in `buildPageHTML`): `tenet` ×2 (orders 5 and 17), `prelude` ×5 (5.5 to 5.97), `technology` ×2 (5.75, 7), `concept-explainer` ×2 (6, 8.5), `business-model` ×2 (9, 9), `founder` ×2 (10, 10), `distribution` ×2 (11, 11), `artist-rights` ×2 (12, 12), `competitive-positioning` ×2 (13, 13, byte-identical), `launch-roadmap` ×2 (14, 14, byte-identical). Plus hidden `pdf-config` ×2 and `comparison-config` ×2 (the latter identical).
* **Which export file is the substantive one.** `content/sections/<schema>.json` is "newest" by `updated_at`, but ties are broken arbitrarily: for `artist-rights`, `business-model`, `distribution`, `founder` the `.v2.json` row has the same timestamp and is the one that carries the `*_heading` / `cta_*` keys; `concept-explainer.json` (newest) is an empty shell (no modules, background image only) while `concept-explainer.v2.json` holds the real "Why This Matters" content with 4 modules; `header.json` is the newest but `header.v2.json` is the only one with a CTA.
* **Numbering/order mismatch**: titles say 01 Opportunity, 02 Consolidation, 03 Tenets, 04 Venue, 05 Stack, 06 Lineup, 07 Business, 08 Founder, 09 Distribution, 10 Artist Rights, 11 Competitive Positioning, 12 Launch Roadmap, but `display_order` renders consolidation (2) before the opportunity/timeline (3) and technology (5.75) before venue (6).
* **Roadmap phase titles** read "Phase 1, 2, 2, 2, 3, 3" for `phase` 1 to 6.
* `consolidation.independent_heading` / `independent_intro` are empty strings, so that block has an empty heading in the live renderer.
* `competitive-positioning` includes AGF itself as a competitor row (`prestige 90`, `price_usd_avg 3000`) to get the highlighted dot; `isAGF` relies on the brand string starting with "AGF".
* Wasted Real-Estate has no `business.asp_usd`, so it is priced `$0` in the configurator total and omitted from the compare price bar.



---

## 10. Appendix: exported content map (where each page section's data now lives)

All paths under `production-staging/content/`.

| Page section (id) | schema_id | Export file(s) | Notes |
|---|---|---|---|
| nav (`header`) | header | `sections/header.json` (+ `.v2`, `.v3`) | brand "AGF"; v2 has `cta_text "Request the Deck"` → `#founder` |
| `#hero` | hero | `sections/hero.json` | mark/strapline empty; headline "All Grounds Floating"; subheadline is the power-supply paragraph |
| `#consolidation` | consolidation | `sections/consolidation.json` | acquisitions table + independent brands |
| `#opportunity` | timeline | `sections/timeline.json` | eras "Then" 1978–1991 / "Now" 2014–2026, 3 comparison rows, `flip_interval_seconds` 12 |
| team note | team-note | `sections/team-note.json` | |
| `#tenets` | tenet | `sections/tenet.json` (display 5) / `tenet.v2.json` (display 17) | both substantive and different |
| prelude ×5 | prelude | `sections/prelude.json` + `.v2` to `.v5` | `.v5` carries `_figures` and a background |
| `#technology` | technology | `sections/technology.json` / `technology.v2.json` | both substantive and different |
| concept explainer | concept-explainer | `concept-explainer.v2.json` has the content | `concept-explainer.json` is a shell |
| `#venue` | venue | `sections/venue.json` | |
| `#overview` | overview | `sections/overview.json` | 4 metrics, 4 highlights; no live renderer |
| `#products` | (products table) | `products/*.json` (6 files), `raw/products.json` | order by `display_order`; spliced before business-model |
| `#model` | business-model | `business-model.json` / `.v2.json` | v2 adds `runway_heading`, `scaling_heading` |
| `#founder` | founder | `founder.json` / `.v2.json` | v2 adds CTA and heading keys |
| `#distribution` | distribution | `distribution.json` / `.v2.json` | weights 0.3/0.25/0.2/0.15/0.1; priorities 1,1,2,3,3 |
| `#artist-rights` | artist-rights | `artist-rights.json` / `.v2.json` | tiers 100/0, 0/100, 50/50 |
| `#competitive-positioning` | competitive-positioning | `competitive-positioning.json` | `_viz_config` shown in 4.1 |
| `#launch-roadmap` | launch-roadmap | `launch-roadmap.json` | 6 phases, 3 typed milestones, 2 PR stunts |
| footer | footer | `sections/footer.json` | "— All Grounds Floating", meta "Foundational Brand Development Document · 2026 · Internal & Investor Distribution", sources line |
| (hidden) compare | comparison-config | `comparison-config.json` | 8 fields, max 3 |
| (hidden) PDF | pdf-config | `pdf-config.json` / `.v2.json` | palette `#1F4A2D / #B8860B / #1A1A1A`, A4, margins 0.5/0.75 in (unused), 9 template sections |

Products (`slug`, `category`, `status`, `system_role`, viz flags): `over-ear-home-centric` (headphone, development, output, arc gauge, 30 h battery), `core-all-in-one-small` (speaker, concept, output, bar gauge), `core-all-in-one-soundbar` (soundbar, concept, output, bar gauge), `symphony-macro-system` (macro-system, concept, amplifier, **only product with `frequency_response`** and `show_freq_response:true`), `the-instrument` (flagship, concept, source, `show_freq_response:false`, `show_driver_diagram:false`, meter gauge, no drivers), `wasted-real-estate` (earbud, concept, accessory, arc gauge, 8 h battery, no ASP). Connection graph in `system_config`: Instrument ↔ Over-Ear (BT), Instrument ↔ Core Small (BT), Instrument ↔ Core Soundbar (BT), Instrument → Symphony (USB-C, one-way), Over-Ear ↔ Symphony (RF), Soundbar ↔ Symphony (WiFi), Symphony ↔ Wasted Real-Estate (analog).

---
*Generated 2026-10-27 from a static read of the code; no browser run. Counts (files, classes, contrast ratios, byte-identity) were computed with scripts against the archived files.*

