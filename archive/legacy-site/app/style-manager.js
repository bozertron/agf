/**
 * style-manager.js
 * Style override, nudge, and background-image application engine + orphan tracking.
 *
 * Auto-extracted from site/app.js by A-app.extract.py.
 * Function bodies are VERBATIM — no logic changes.
 * Import/export wiring is generated; only the IIFE wrapper was dropped.
 */

import { resolveDotPath } from './utils.js';
import { state } from './cleanup.js';
import { $ as $, $$ as $$ } from './utils.js';

  const TAG = '[agf:style]';
  function _track(err, ctx) { console.error(TAG, ctx || '', err); try { if (window.AGF && window.AGF._errors) window.AGF._errors.push({ tag: TAG, message: (ctx ? ctx + ': ' : '') + (err && err.message || String(err)) }); } catch (_) {} }
  function _pushOrphan(kind, key) { try { var o = window.AGF && window.AGF._styleOrphans; if (o && o[kind] && o[kind].indexOf(key) === -1) o[kind].push(key); } catch (_) {} }


  // Bug #2: Restore inline background-image from a data-bg-image attribute.
  // The renderer re-emits the attribute on every render, but nothing re-applied
  // the inline backgroundImage/Size/Position styles — so the image vanished
  // after any refresh. This reads the attribute (set from _background_image in
  // the DB) and restores the inline styles. Single-quotes in the path are
  // escaped to stay safely inside url('...').
  function applyBackgroundFromAttr(el) {
    if (!el) return;
    var bg = el.getAttribute('data-bg-image');
    if (!bg) return;
    el.style.backgroundImage = "url('" + bg.replace(/'/g, "\\'") + "')";
    // Read background settings from data attributes (emitted by the renderer
    // from _background_settings). Fall back to cover/center/0.15 defaults so
    // sections without settings render exactly as before.
    var size = el.getAttribute('data-bg-size') || 'cover';
    var position = el.getAttribute('data-bg-position') || 'center';
    var opacity = parseFloat(el.getAttribute('data-bg-opacity'));
    if (isNaN(opacity)) opacity = 0.15;
    // Map logical values to CSS background-size/position keywords.
    var cssSize = size === 'contain' ? 'contain' : size === 'auto' ? 'auto' : 'cover';
    // Parse position into X and Y so we support both legacy 1-word values
    // (left/center/right) and new 2-word values (e.g. "left top"). The Y
    // keyword 'middle' maps to CSS 'center' (the UI label says "Middle").
    var posParts = String(position || 'center').trim().split(/\s+/);
    var posX = posParts[0] || 'center';
    var posY = posParts.length >= 2 ? posParts[1] : 'center';
    if (posY === 'middle') posY = 'center';
    var cssPosition = posX + ' ' + posY;
    // Set custom properties on the host; the ::before pseudo-element reads
    // them via var() defaults in styles.css. Also set background-size/
    // background-position directly on the host for the no-pseudo path.
    el.style.setProperty('--bg-size', cssSize);
    el.style.setProperty('--bg-position', cssPosition);
    el.style.setProperty('--bg-opacity', String(opacity));
    el.style.backgroundSize = cssSize;
    el.style.backgroundPosition = cssPosition;
    if (cssSize === 'auto') el.style.backgroundRepeat = 'no-repeat';
    else el.style.backgroundRepeat = '';
  }


  // Apply stored _style_overrides to all sections and products
  function applyAllStyleOverrides() {
    try {
    // Sections
    state.sections.forEach((sec) => {
      if (!sec.data || !sec.data._style_overrides) return;
      const container = document.querySelector(`[data-section-id="${sec.id}"]`);
      if (container) applyStyleOverrides(container, sec.data._style_overrides);
    });
    // Products
    state.products.forEach((p) => {
      if (!p.data || !p.data._style_overrides) return;
      const card = document.querySelector(`[data-product-slug="${p.slug}"]`);
      if (card) applyStyleOverrides(card, p.data._style_overrides);
    });
    // Header / Footer
    const headerSec = state.sections.find((s) => s.schema_id === 'header');
    const footerSec = state.sections.find((s) => s.schema_id === 'footer');
    if (headerSec && headerSec.data && headerSec.data._style_overrides) {
      const nav = document.querySelector('.nav-inner');
      if (nav) applyStyleOverrides(nav, headerSec.data._style_overrides);
    }
    if (footerSec && footerSec.data && footerSec.data._style_overrides) {
      const foot = document.querySelector('.foot-inner');
      if (foot) applyStyleOverrides(foot, footerSec.data._style_overrides);
    }
    // --- Nudges (parallel to overrides) ---
    state.sections.forEach((sec) => {
      if (!sec.data || !sec.data._nudges) return;
      const container = document.querySelector(`[data-section-id="${sec.id}"]`);
      if (container) applyNudges(container, sec.data._nudges);
    });
    state.products.forEach((p) => {
      if (!p.data || !p.data._nudges) return;
      const card = document.querySelector(`[data-product-slug="${p.slug}"]`);
      if (card) applyNudges(card, p.data._nudges);
    });
    if (headerSec && headerSec.data && headerSec.data._nudges) {
      const nav = document.querySelector('.nav-inner');
      if (nav) applyNudges(nav, headerSec.data._nudges);
    }
    if (footerSec && footerSec.data && footerSec.data._nudges) {
      const foot = document.querySelector('.foot-inner');
      if (foot) applyNudges(foot, footerSec.data._nudges);
    }
    // Bug #2: Restore background-image inline styles. Walk every element
    // carrying data-bg-image (sections, product cards, header .nav-inner,
    // footer .foot-inner) in one pass so any of them that carry a
    // _background_image survive re-render.
    $$('[data-bg-image]').forEach(applyBackgroundFromAttr);
    } catch (err) { _track(err, 'applyAllStyleOverrides'); }
  }


  // Apply stored _style_overrides for a single section element
  function applySectionStyleOverrides(sectionEl) {
    const id = sectionEl.getAttribute('data-section-id');
    if (!id) return;
    const sec = state.sections.find((s) => s.id === id);
    if (sec && sec.data && sec.data._style_overrides) {
      applyStyleOverrides(sectionEl, sec.data._style_overrides);
    }
    if (sec && sec.data && sec.data._nudges) {
      applyNudges(sectionEl, sec.data._nudges);
    }
    // Bug #2: also restore this section's own background-image inline style
    // after an in-place single-section refresh.
    applyBackgroundFromAttr(sectionEl);
  }


  // Tracks orphaned-override keys already warned about (ticket #25 dedupe).
  var _warnedOrphanKeys = new Set();


  // Tracks orphaned-nudge keys already warned about (separate from overrides).
  var _warnedOrphanNudgeKeys = new Set();


  // Apply a map of data-field-path → {marginTop, marginBottom, marginLeft, marginRight}
  // to descendants of `container`. Keys are pure data-field paths only.
  function applyNudges(container, nudges) {
    if (!nudges || typeof nudges !== 'object') return;
    var pathRe = /^[a-z_][\w-]*(\.[\w-]+)*$/i;
    Object.keys(nudges).forEach(function (key) {
      var deltas = nudges[key];
      if (!deltas || typeof deltas !== 'object') return;
      if (!pathRe.test(key)) {
        console.warn('[applyNudges] Non data-field key, skipping:', key);
        return;
      }
      var targetEl = null;
      try {
        targetEl = container.querySelector('[data-field="' + key.replace(/"/g, '\\"') + '"]');
      } catch (e) {
        console.warn('[applyNudges] Invalid key, skipping:', key, e.message);
        return;
      }
      if (!targetEl) {
        if (!_warnedOrphanNudgeKeys.has(key)) {
          _warnedOrphanNudgeKeys.add(key);
          console.warn('[applyNudges] No element found for data-field key "' + key + '" — nudge not applied.');
          _pushOrphan('nudges', key);
        }
        return;
      }
      ['marginTop', 'marginBottom', 'marginLeft', 'marginRight'].forEach(function (prop) {
        if (deltas[prop] == null || deltas[prop] === '') {
          targetEl.style.removeProperty(prop);
          return;
        }
        var v = Number(deltas[prop]);
        if (!Number.isFinite(v)) return;
        if (prop === 'marginLeft' || prop === 'marginRight') {
          // Cross-axis margins are absorbed by flex alignment solvers and by
          // text-align on block children; use post-layout transform instead so
          // the nudge is always visible regardless of container layout context.
          // marginLeft positive = rightward push, marginRight positive = leftward push.
          var sign = prop === 'marginLeft' ? 1 : -1;
          targetEl.style.transform = 'translateX(' + (v * sign) + 'px)';
        } else {
          targetEl.style.setProperty(prop, v + 'px');
        }
      });
      targetEl.setAttribute('data-nudged', '1');
    });
  }


  // Apply a map of override-key → style-props to descendants of a container.
  // Keys may be:
  //   1. A pure data-field path (e.g. "headline", "tenets.0")
  //   2. A data-field path + sub-selector (e.g. "tenets.0 > h3.tenet-title")
  //   3. A legacy CSS selector (backwards-compat with old nth-of-type keys)
  function applyStyleOverrides(container, overrides) {
    if (!overrides || typeof overrides !== 'object') return;
    // Regex: a plain data-field dot-path (letters/digits/dashes/dots, no spaces/>/:)
    var pathRe = /^[a-z_][\w-]*(\.[\w-]+)*$/i;
    Object.keys(overrides).forEach((key) => {
      const styles = overrides[key];
      if (!styles || typeof styles !== 'object') return;
      var targetEl = null;
      try {
        if (pathRe.test(key) && key.indexOf('>') === -1) {
          // Branch 1: pure data-field path
          targetEl = container.querySelector('[data-field="' + key.replace(/"/g, '\\"') + '"]');
        } else if (key.indexOf('>') !== -1) {
          // Branch 2: data-field path + relative sub-selector
          // Split on the first ' > ' to separate the data-field root from the rest.
          var gtIdx = key.indexOf(' > ');
          if (gtIdx === -1) gtIdx = key.indexOf('>');
          var leftPart = key.substring(0, gtIdx).trim();
          var rightPart = key.substring(gtIdx + 1).trim();
          if (rightPart.charAt(0) === '>') rightPart = rightPart.substring(1).trim();
          // leftPart should be a data-field path; find it, then search within.
          if (pathRe.test(leftPart)) {
            var fieldRoot = container.querySelector('[data-field="' + leftPart.replace(/"/g, '\\"') + '"]');
            if (fieldRoot) {
              targetEl = fieldRoot.querySelector(rightPart);
            }
          } else {
            // If left part isn't a path, try the whole thing as a CSS selector.
            targetEl = container.querySelector(key);
          }
        } else {
          // Branch 3: legacy CSS selector (nth-of-type etc.)
          targetEl = container.querySelector(key);
        }
      } catch (e) {
        console.warn('[applyStyleOverrides] Invalid selector, skipping:', key, e.message);
      }
      if (targetEl) {
        Object.keys(styles).forEach((prop) => {
          targetEl.style.setProperty(prop, styles[prop]);
        });
        targetEl.setAttribute('data-enhanced', '1');
        // Belt-and-suspenders: restore data-enh-field on the resolved element
        // so collectStyleOverrides uses the stable key directly after a
        // re-render (instead of degrading to nth-of-type selectors). Applies
        // to data-field-style keys (pure path or path + sub-selector).
        if (pathRe.test(key) || key.indexOf('>') !== -1) {
          targetEl.setAttribute('data-enh-field', key);
        }
      } else if (pathRe.test(key) && key.indexOf('>') === -1) {
        // B2: a data-field-style key resolved to NO element — surface it
        // loudly instead of silently dropping the override. Warn once per key
        // per session to avoid console spam (ticket #25).
        if (!_warnedOrphanKeys.has(key)) {
          _warnedOrphanKeys.add(key);
          console.warn('[applyStyleOverrides] No element found for data-field key "' + key + '" — override not applied.');
          _pushOrphan('overrides', key);
        }
      }
    });
  }

export { applyAllStyleOverrides, applySectionStyleOverrides, applyNudges, applyStyleOverrides };
