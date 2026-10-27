/* ========================================================================
 * site/editor/nudge-panel.js
 * Purpose: px-scaler nudge position panel (UI + preview + apply)
 * Module tag (Phase 2): [agf:nudge-panel]
 *
 * EXTRACTED VERBATIM from site/editor.js by A-editor.extract.py on 2026-06-27T03:23:12.076007+00:00.
 * Function bodies are byte-identical to the source. Do NOT hand-edit logic;
 * edit the source and re-run the extractor.
 *
 * ========================================================================
 * REQUIRED IMPORTS (wire in Phase 2 — see A-editor.md §3.1):
 *   from ./core.js   : el, $, toast, api, API
 *   from ./section-form.js : refreshAfterEdit, reconcileConventionFields
 *   Exports: openNudgePanel, closeNudgePanel
 *
 * ========================================================================
 * ERROR-TRACKING HOOKS (Phase 2 — uncomment + apply):
 *   doApplyNudge catch (editor.js ~2761): console.error('[agf:nudge-panel] apply failed',
 *       {hostId, path, err}); detect+warn stale read (chunk-6 #4, MEDIUM race)
 *   doApplyNudge (editor.js ~2761): disable Apply button + spinner during request (chunk-6 #7)
 *
 * Suggested module-local log helpers (uncomment in Phase 2):
 *   const TAG  = '[agf:nudge-panel]';
 *   const log  = (...a) => console.log(TAG, ...a);
 *   const warn = (...a) => console.warn(TAG, ...a);
 *   const err  = (...a) => console.error(TAG, ...a);
 */

// === TAG SCAFFOLD (activated in Phase-2 polish pass) =========================
// NOTE: these are module-local consts valid under ES-module wiring (Strategy A).
// For Strategy-B concatenation, strip this block (see LOAD_ORDER.md).
  const TAG  = '[agf:nudge-panel]';
  const log  = (...a) => console.log(TAG, ...a);
  const warn = (...a) => console.warn(TAG, ...a);
  const err  = (...a) => console.error(TAG, ...a);

/* --- function closeNudgePanel (editor.js lines 2548-2558) --- */
  function closeNudgePanel() {
    var panel = document.querySelector('.nudge-panel');
    if (panel) panel.remove();
  }

  /**
   * openNudgePanel(fieldEl, hostEl)
   * Opens a floating panel for nudging a [data-field] element via
   * marginTop / marginLeft offsets. Mirrors openBgSettingsPanel positioning
   * and close-on-outside-click pattern.
   */

/* --- function openNudgePanel (editor.js lines 2559-2837) --- */
  function openNudgePanel(fieldEl, hostEl) {
    closeNudgePanel();

    var path = fieldEl.getAttribute('data-field');
    if (!path) { toast('No data-field on this element.', 'error'); return; }

    // Determine host: product card OR section/structural.
    var card = hostEl.closest('.product-card[data-product-slug]');
    var sec = hostEl.closest('[data-section-id]');
    var isProduct = !!card;
    var hostId, hostSlug;
    if (isProduct) {
      hostSlug = card.getAttribute('data-product-slug');
    } else if (sec) {
      hostId = sec.getAttribute('data-section-id');
    } else { return; }

    // Load current deltas from in-memory state.
    var currentNudges = {};
    var fullData = {};
    if (window.AGF && window.AGF.state) {
      var st = isProduct
        ? (window.AGF.state.products || []).find(function (p) { return p.slug === hostSlug; })
        : window.AGF.state.sections.find(function (s) { return s.id === hostId; });
      if (st && st.data) {
        fullData = st.data;
        currentNudges = (st.data._nudges && st.data._nudges[path]) || {};
      }
    }

    // Internal mutable state.
    var deltas = { marginTop: currentNudges.marginTop || 0, marginLeft: currentNudges.marginLeft || 0 };
    var applied = false;

    // Build panel DOM.
    var panel = el('div', { class: 'nudge-panel' });

    panel.appendChild(el('label', { text: 'NUDGE POSITION' }));
    var pathDisplay = el('div', { class: 'nudge-path', text: path });
    panel.appendChild(pathDisplay);

    // Snap selector.
    panel.appendChild(el('label', { text: 'SNAP AMOUNT' }));
    var snapSelect = el('select', { class: 'nudge-snap' });
    [4, 8, 16, 24, 32, 48, 64].forEach(function (v) {
      var opt = el('option', { value: String(v), text: String(v) + 'px' });
      if (v === 16) opt.selected = true;
      snapSelect.appendChild(opt);
    });
    panel.appendChild(snapSelect);
    function getSnap() { return parseInt(snapSelect.value, 10) || 16; }

    // Direction buttons.
    panel.appendChild(el('label', { text: 'DIRECTION' }));
    var grid = el('div', { class: 'nudge-grid' });
    var readout = el('div', { class: 'nudge-current' });

    function updateReadout() {
      var up = deltas.marginTop < 0 ? Math.abs(deltas.marginTop) : 0;
      var down = deltas.marginTop > 0 ? deltas.marginTop : 0;
      var left = deltas.marginLeft < 0 ? Math.abs(deltas.marginLeft) : 0;
      var right = deltas.marginLeft > 0 ? deltas.marginLeft : 0;
      readout.textContent = '\u2191' + up + '  \u2193' + down + '  \u2190' + left + '  \u2192' + right;
    }
    updateReadout();

    function applyPreview() {
      fieldEl.style.marginTop = deltas.marginTop + 'px';
      if (deltas.marginLeft) {
        fieldEl.style.transform = 'translateX(' + deltas.marginLeft + 'px)';
      } else {
        fieldEl.style.transform = '';
      }
    }

    function revertPreview() {
      if (currentNudges.marginTop != null && currentNudges.marginTop !== 0) {
        fieldEl.style.marginTop = currentNudges.marginTop + 'px';
      } else {
        fieldEl.style.removeProperty('margin-top');
      }
      // Horizontal: use transform (same path as applyPreview), matching load-path geometry.
      if (currentNudges.marginLeft != null && currentNudges.marginLeft !== 0) {
        fieldEl.style.transform = 'translateX(' + currentNudges.marginLeft + 'px)';
      } else {
        fieldEl.style.transform = '';
      }
    }

    function dirBtn(label, onClick) {
      return el('button', {
        type: 'button',
        class: 'nudge-dir-btn',
        text: label,
        onClick: function () { onClick(); updateReadout(); applyPreview(); },
      });
    }

    grid.appendChild(dirBtn('\u2191 Up', function () { deltas.marginTop -= getSnap(); }));
    grid.appendChild(dirBtn('\u2193 Down', function () { deltas.marginTop += getSnap(); }));
    grid.appendChild(dirBtn('\u2190 Left', function () { deltas.marginLeft -= getSnap(); }));
    grid.appendChild(dirBtn('\u2192 Right', function () { deltas.marginLeft += getSnap(); }));
    panel.appendChild(grid);

    // Free nudge inputs.
    panel.appendChild(el('label', { text: 'FREE NUDGE (PX)' }));
    var freeRow = el('div', { class: 'nudge-free' });
    var freeUp = el('input', { type: 'number', placeholder: 'Up', min: '0' });
    var freeDown = el('input', { type: 'number', placeholder: 'Down', min: '0' });
    var freeLeft = el('input', { type: 'number', placeholder: 'Left', min: '0' });
    var freeRight = el('input', { type: 'number', placeholder: 'Right', min: '0' });
    freeRow.appendChild(freeUp);
    freeRow.appendChild(freeDown);
    freeRow.appendChild(freeLeft);
    freeRow.appendChild(freeRight);
    panel.appendChild(freeRow);

    function syncFromFreeInputs() {
      var upVal = parseInt(freeUp.value, 10) || 0;
      var downVal = parseInt(freeDown.value, 10) || 0;
      var leftVal = parseInt(freeLeft.value, 10) || 0;
      var rightVal = parseInt(freeRight.value, 10) || 0;
      // Down wins over up; right wins over left.
      if (downVal > 0) {
        deltas.marginTop = downVal;
        freeUp.value = '';
      } else if (upVal > 0) {
        deltas.marginTop = -upVal;
      } else {
        deltas.marginTop = 0;
      }
      if (rightVal > 0) {
        deltas.marginLeft = rightVal;
        freeLeft.value = '';
      } else if (leftVal > 0) {
        deltas.marginLeft = -leftVal;
      } else {
        deltas.marginLeft = 0;
      }
      updateReadout();
      applyPreview();
    }

    freeUp.addEventListener('input', syncFromFreeInputs);
    freeDown.addEventListener('input', syncFromFreeInputs);
    freeLeft.addEventListener('input', syncFromFreeInputs);
    freeRight.addEventListener('input', syncFromFreeInputs);

    // Readout.
    panel.appendChild(readout);

    // Actions.
    var actions = el('div', { class: 'nudge-actions' });
    actions.appendChild(el('button', {
      type: 'button',
      class: 'nudge-clear',
      text: 'Clear',
      onClick: function () {
        deltas = { marginTop: 0, marginLeft: 0 };
        freeUp.value = '';
        freeDown.value = '';
        freeLeft.value = '';
        freeRight.value = '';
        updateReadout();
        applyPreview();
      },
    }));
    actions.appendChild(el('button', {
      type: 'button',
      class: 'nudge-apply',
      text: 'Apply',
      onClick: function () { doApplyNudge(); },
    }));
    panel.appendChild(actions);

    // Position near the field element.
    var rect = fieldEl.getBoundingClientRect();
    panel.style.position = 'fixed';
    panel.style.top = Math.max(8, rect.top + 8) + 'px';
    panel.style.left = Math.min(window.innerWidth - 288, rect.right + 8) + 'px';

    document.body.appendChild(panel);

    // Close on outside click.
    setTimeout(function () {
      document.addEventListener('mousedown', function onDocClick(ev) {
        if (!panel.contains(ev.target)) {
          if (!applied) revertPreview();
          closeNudgePanel();
          document.removeEventListener('mousedown', onDocClick);
        }
      });
      document.addEventListener('keydown', function onEsc(ev) {
        if (ev.key === 'Escape') {
          if (!applied) revertPreview();
          closeNudgePanel();
          document.removeEventListener('keydown', onEsc);
        }
      });
    }, 0);

    // Persist flow.
    async function doApplyNudge() {
      var endpoint;
      if (isProduct) endpoint = API.products + '/' + hostSlug;
      else endpoint = API.sections + '/' + hostId;

      var fresh;
      try { fresh = await api('GET', endpoint); }
      catch (e2) { toast('Could not load current data: ' + e2.message, 'error'); return; }

      var data = (fresh && fresh.data) ? JSON.parse(JSON.stringify(fresh.data)) : {};
      if (!data._nudges || typeof data._nudges !== 'object') data._nudges = {};

      var hasVertical = deltas.marginTop !== 0;
      var hasHorizontal = deltas.marginLeft !== 0;
      if (!hasVertical && !hasHorizontal) {
        delete data._nudges[path];
      } else {
        data._nudges[path] = {};
        if (hasVertical) data._nudges[path].marginTop = deltas.marginTop;
        if (hasHorizontal) data._nudges[path].marginLeft = deltas.marginLeft;
      }
      if (Object.keys(data._nudges).length === 0) delete data._nudges;

      try {
        await api('PUT', endpoint, { data: data });
      } catch (e2) {
        console.error(TAG, 'doApplyNudge PUT failed', { hostType: isProduct ? 'product' : 'section', hostId: isProduct ? hostSlug : hostId, path: path, error: e2 && e2.message ? e2.message : String(e2) });
        // NOTE (chunk-6 #4): fresh-GET above narrows but does not eliminate the
        // stale-read race (full-data PUT window). Targeted PATCH is the fix.
        toast('Nudge save failed: ' + e2.message, 'error');
        return;
      }

      // Sync in-memory state.
      if (window.AGF && window.AGF.state) {
        var list = isProduct
          ? (window.AGF.state.products || [])
          : window.AGF.state.sections;
        var st2 = isProduct
          ? list.find(function (p) { return p.slug === hostSlug; })
          : list.find(function (s) { return s.id === hostId; });
        if (st2) {
          if (st2.data) {
            if (data._nudges) st2.data._nudges = data._nudges;
            else delete st2.data._nudges;
          }
        }
      }

      // Re-render.
      applied = true;
      if (!isProduct && window.AGF && typeof window.AGF.refreshSection === 'function') {
        await window.AGF.refreshSection(hostId);
      } else if (window.AGF && typeof window.AGF.refreshAll === 'function') {
        await window.AGF.refreshAll();
      } else if (sec) {
        // Fallback: re-apply nudges directly to the live DOM.
        var nMap = data._nudges || {};
        var nEntry = nMap[path];
        if (nEntry) {
          fieldEl.style.marginTop = (nEntry.marginTop || 0) + 'px';
          fieldEl.style.marginLeft = (nEntry.marginLeft || 0) + 'px';
        } else {
          fieldEl.style.removeProperty('margin-top');
          fieldEl.style.removeProperty('margin-left');
        }
      }

      toast('Position saved.', 'success');
      closeNudgePanel();
    }
  }

  /**
   * persistBackgroundSettings(hostEl, settings)
   * Fresh-GETs the host section/product data, sets or removes
   * _background_settings, PUTs, and triggers a refresh so the renderer
   * re-emits the data-bg-* attributes. Mirrors persistStyleOverrides.
   * Pass settings=null to clear _background_settings (reset to defaults).
   */

