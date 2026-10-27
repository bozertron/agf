/**
 * renderer.js
 * Page HTML assembly: buildPageHTML, renderHeaderFooter, global_renderer.
 *
 * Auto-extracted from site/app.js by A-app.extract.py.
 * Function bodies are VERBATIM — no logic changes.
 * Import/export wiring is generated; only the IIFE wrapper was dropped.
 */

import { $ as $, $$ as $$ } from './utils.js';
import { state } from './cleanup.js';

  const TAG = '[agf:render]';
  function _track(err, ctx) { console.error(TAG, ctx || '', err); try { if (window.AGF && window.AGF._errors) window.AGF._errors.push({ tag: TAG, message: (ctx ? ctx + ': ' : '') + (err && err.message || String(err)) }); } catch (_) {} }

  // ---------- render shell ------------------------------------------------
  function buildPageHTML() {
    if (!global_renderer()) return '<p class="lede" style="padding:var(--space-5xl) var(--space-lg)">Renderer unavailable.</p>';
    const renderer = window.SchemaRenderer;

    let html = '';
    let productsInjected = false;
    state.sections.forEach((section) => {
      // The product collection rides between technology (display_order 5)
      // and business-model (display_order 7).
      if (!productsInjected && section.schema_id === 'business-model' && state.products.length) {
        html += renderer.renderProductsBlock(state.products);
        productsInjected = true;
      }
      try {
        html += renderer.renderSection(section);
      } catch (err) {
        _track(err, 'renderSection ' + (section && section.id));
        html += '<section class="section-error" data-section-id="' + (section && section.id || '') + '"><p>Section unavailable.</p></section>';
      }
    });
    if (!productsInjected && state.products.length) {
      // Append at the end if we never hit a business-model section.
      html += renderer.renderProductsBlock(state.products);
    }
    return html;
  }


  function renderHeaderFooter() {
    const renderer = window.SchemaRenderer;
    if (!renderer) return;
    // Find header and footer sections in state
    const headerSec = state.sections.find((s) => s.schema_id === 'header');
    const footerSec = state.sections.find((s) => s.schema_id === 'footer');

    // Render header into .nav-inner
    const navInner = document.querySelector('.nav-inner');
    if (navInner && headerSec) {
     try {
      navInner.setAttribute('data-section-id', headerSec.id);
      navInner.setAttribute('data-schema', 'header');
      navInner.innerHTML = renderer.renderHeader(headerSec.data || {});
      // Apply background image if set
      if (headerSec.data && headerSec.data._background_image) {
        navInner.setAttribute('data-bg-image', headerSec.data._background_image);
        var hbs = headerSec.data._background_settings || {};
        navInner.setAttribute('data-bg-size', hbs.size || 'cover');
        navInner.setAttribute('data-bg-position', hbs.position || 'center');
        navInner.setAttribute('data-bg-opacity', String(hbs.opacity != null ? hbs.opacity : 0.15));
      } else {
        navInner.removeAttribute('data-bg-image');
        navInner.removeAttribute('data-bg-size');
        navInner.removeAttribute('data-bg-position');
        navInner.removeAttribute('data-bg-opacity');
      }
      // Nav links removed — header now only shows AGF + tagline + action buttons
     } catch (err) { _track(err, 'renderHeader'); }
    }

    // Render footer into .foot-inner
    const footInner = document.querySelector('.foot-inner');
    if (footInner && footerSec) {
     try {
      footInner.setAttribute('data-section-id', footerSec.id);
      footInner.setAttribute('data-schema', 'footer');
      footInner.innerHTML = renderer.renderFooter(footerSec.data || {});
      // Apply background image if set
      if (footerSec.data && footerSec.data._background_image) {
        footInner.setAttribute('data-bg-image', footerSec.data._background_image);
        var fbs = footerSec.data._background_settings || {};
        footInner.setAttribute('data-bg-size', fbs.size || 'cover');
        footInner.setAttribute('data-bg-position', fbs.position || 'center');
        footInner.setAttribute('data-bg-opacity', String(fbs.opacity != null ? fbs.opacity : 0.15));
      } else {
        footInner.removeAttribute('data-bg-image');
        footInner.removeAttribute('data-bg-size');
        footInner.removeAttribute('data-bg-position');
        footInner.removeAttribute('data-bg-opacity');
      }
     } catch (err) { _track(err, 'renderFooter'); }
    }
  }


  function global_renderer() {
    return !!(window.SchemaRenderer && typeof window.SchemaRenderer.renderSection === 'function');
  }

export { buildPageHTML, renderHeaderFooter, global_renderer };
