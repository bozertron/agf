/**
 * DEAD CODE — preserved for reference only.
 *
 * This module is not imported by any file in the codebase.
 * `buildNav()` was defined in the original monolith (app.js line 176)
 * but was never called there either — it has always been dead code.
 * The extraction script faithfully preserved it as a standalone module
 * with no consumers.
 *
 * Do NOT delete without confirming no future consumer is planned.
 *
 * --- Original description ---
 * nav.js — Navigation link generation and section->nav mapping.
 * Auto-extracted from site/app.js by A-app.extract.py.
 * Function bodies are VERBATIM — no logic changes.
 * Import/export wiring is generated; only the IIFE wrapper was dropped.
 */

import { $ as $, $$ as $$ } from './utils.js';

  function buildNav() {
    const nav = $('#navLinks');
    const drawer = $('#navDrawer');
    if (!nav) return;
    const items = [];
    const seen = new Set();
    state.sections.forEach((s) => {
      const id = navIdFor(s);
      if (!id || seen.has(id)) return;
      seen.add(id);
      items.push(`<a href="#${id}">${escapeHTML(navLabelFor(s))}</a>`);
    });
    if (state.products.length && !seen.has('products')) {
      items.splice(Math.min(items.length, 5), 0, '<a href="#products">Products</a>');
    }
    nav.innerHTML = items.join('');
    // Populate the off-canvas drawer too
    if (drawer) {
      drawer.innerHTML = items.join('');
    }
  }


  function navIdFor(section) {
    const map = {
      hero: 'hero',
      timeline: 'opportunity',
      consolidation: 'consolidation',
      tenet: 'tenets',
      venue: 'venue',
      technology: 'technology',
      'business-model': 'model',
      founder: 'founder',
      distribution: 'distribution',
      'artist-rights': 'artist-rights',
    };
    return map[section.schema_id] || section.schema_id;
  }


  function navLabelFor(section) {
    const labels = {
      hero: 'Top',
      timeline: 'The Rhyme',
      consolidation: 'Consolidation',
      tenet: 'Tenets',
      venue: 'The Venue',
      technology: 'Technology',
      'business-model': 'Business',
      founder: 'Founder',
      distribution: 'Distribution',
      'artist-rights': 'Artist Rights',
    };
    if (labels[section.schema_id]) return labels[section.schema_id];
    if (section.title) return section.title.replace(/^[\d·\-\s]+/, '').slice(0, 20);
    return section.schema_id;
  }

export { buildNav, navIdFor, navLabelFor };
