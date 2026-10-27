/**
 * bindings/rhyme-tabs.js
 * Rhyme tab switching + auto-flip with hover pause.
 *
 * Auto-extracted from site/app.js by A-app.extract.py.
 * Function bodies are VERBATIM — no logic changes.
 * Import/export wiring is generated; only the IIFE wrapper was dropped.
 */

import { $ as $, $$ as $$ } from '../utils.js';
import { state as state, addManagedListener as addManagedListener } from '../cleanup.js';

  const TAG = '[agf:bind:rhyme-tabs]';
  function _track(err, ctx) { console.error(TAG, ctx || '', err); try { if (window.AGF && window.AGF._errors) window.AGF._errors.push({ tag: TAG, message: (ctx ? ctx + ': ' : '') + (err && err.message || String(err)) }); } catch (_) {} }

  // 4. Rhyme tabs + auto-flip (interval from data-flip-interval, pauses on hover)
  function bindRhymeTabs() {
    try {
    const tabs = $$('.rhyme-tab');
    const panes = $$('.rhyme-pane');
    const pill = $('.rhyme-pill');
    const rhymeEl = $('.rhyme');
    if (!tabs.length) return;

    // Read flip interval from the rendered data attribute (seconds → ms).
    // Default to 12000ms (12s) when missing or invalid.
    function getFlipIntervalMs() {
      if (rhymeEl) {
        const raw = rhymeEl.getAttribute('data-flip-interval');
        if (raw != null && raw !== '') {
          const secs = parseFloat(raw);
          if (Number.isFinite(secs) && secs > 0) return secs * 1000;
        }
      }
      return 12000;
    }

    function setRhyme(era) {
      tabs.forEach((t) => t.classList.toggle('is-active', t.dataset.era === era));
      panes.forEach((p) => p.classList.toggle('is-active', p.dataset.pane === era));
      if (pill) pill.style.transform = era === 'now' ? 'translateX(100%)' : 'translateX(0%)';
    }

    function startAutoFlip() {
      stopAutoFlip();
      const ms = getFlipIntervalMs();
      state.rhymeAuto = setInterval(() => {
        const active = tabs.find((t) => t.classList.contains('is-active'));
        setRhyme(active && active.dataset.era === '80s' ? 'now' : '80s');
      }, ms);
      state.intervals.push(state.rhymeAuto);
    }

    function stopAutoFlip() {
      if (state.rhymeAuto) {
        clearInterval(state.rhymeAuto);
        state.intervals = state.intervals.filter((id) => id !== state.rhymeAuto);
        state.rhymeAuto = null;
      }
    }

    tabs.forEach((tab) => {
      const handler = () => { setRhyme(tab.dataset.era); stopAutoFlip(); };
      addManagedListener(tab, 'click', handler);
    });

    // Pause auto-flip while hovering so the user can read/edit undisturbed.
    if (rhymeEl) {
      addManagedListener(rhymeEl, 'mouseenter', stopAutoFlip);
      addManagedListener(rhymeEl, 'mouseleave', startAutoFlip);
    }

    startAutoFlip();
    } catch (err) { _track(err); }
  }

export { bindRhymeTabs };
