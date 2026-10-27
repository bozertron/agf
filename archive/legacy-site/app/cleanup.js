/**
 * cleanup.js
 * App state, cleanup tracking, and managed-listener lifecycle.
 *
 * Auto-extracted from site/app.js by A-app.extract.py.
 * Function bodies are VERBATIM — no logic changes.
 * Import/export wiring is generated; only the IIFE wrapper was dropped.
 */

import { escapeHTML } from './utils.js';

  // ---------- state -------------------------------------------------------
  const state = {
    sections: [],
    products: [],
    rhymeAuto: null,
    intervals: [],
  };


  // Track bound listeners and observers for cleanup (site-002 fix)
  const _bound = {
    listeners: [],   // [{target, event, handler, options}]
    observers: [],   // IntersectionObserver instances
    heroRafId: null, // rAF ID for hero parallax (site-001 fix)
    heroObserver: null, // IntersectionObserver for hero visibility
  };


  // Managed addEventListener: stores references for later removal
  function addManagedListener(target, event, handler, options) {
    target.addEventListener(event, handler, options);
    _bound.listeners.push({ target, event, handler, options });
  }


  // Remove all managed listeners and disconnect observers
  function unbindAll() {
    _bound.listeners.forEach(({ target, event, handler, options }) => {
      target.removeEventListener(event, handler, options);
    });
    _bound.listeners.length = 0;
    _bound.observers.forEach((obs) => obs.disconnect());
    _bound.observers.length = 0;
    // Cancel hero parallax rAF
    if (_bound.heroRafId != null) {
      cancelAnimationFrame(_bound.heroRafId);
      _bound.heroRafId = null;
    }
    if (_bound.heroObserver) {
      _bound.heroObserver.disconnect();
      _bound.heroObserver = null;
    }
    // Clear intervals
    state.intervals.forEach((id) => clearInterval(id));
    state.intervals.length = 0;
    if (state.rhymeAuto) {
      clearInterval(state.rhymeAuto);
      state.rhymeAuto = null;
    }
  }

export { state, _bound, addManagedListener, unbindAll };
