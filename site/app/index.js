/**
 * index.js
 * ENTRY: imports, window.AGF public API, boot sequence.
 *
 * Auto-extracted from site/app.js by A-app.extract.py.
 * Function bodies are VERBATIM — no logic changes.
 * Import/export wiring is generated; only the IIFE wrapper was dropped.
 */

import { state } from './cleanup.js';
import { mount } from './mount.js';
import { refreshAll, refreshSection, refreshProducts } from './data-refresh.js';
import { renderHeaderFooter } from './renderer.js';
import { toast } from './toast.js';

// Structured error sink — additive surface for debug tooling.
// Each module's catch blocks (added in a follow-up pass) push here.
if (typeof window !== 'undefined') {
  window.AGF = window.AGF || {};
  window.AGF._errors = [];
  window.AGF._styleOrphans = { overrides: [], nudges: [] };
}

// --- verbatim from app.js (window.AGF public surface) ---
  window.AGF = {
    state,
    mount,
    refreshAll,
    refreshSection,
    refreshProducts,
    renderHeaderFooter,
    toast,
  };


// --- verbatim from app.js (boot) ---
  // ---------- boot --------------------------------------------------------
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
