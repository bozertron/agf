/* ========================================================================
 * site/editor/click-to-edit.js
 * Purpose: Click dispatcher that opens item/product/section editors
 * Module tag (Phase 2): [agf:click-to-edit]
 *
 * EXTRACTED VERBATIM from site/editor.js by A-editor.extract.py on 2026-06-27T03:23:12.075421+00:00.
 * Function bodies are byte-identical to the source. Do NOT hand-edit logic;
 * edit the source and re-run the extractor.
 *
 * ========================================================================
 * REQUIRED IMPORTS (wire in Phase 2 — see A-editor.md §3.1):
 *   from ./core.js : $
 *   from ./item-editor.js : openItemEdit
 *   from ./product-form.js : openProductForm
 *   from ./section-form.js : openSectionEdit
 *   Exports: bindClickToEdit
 *
 * ========================================================================
 * ERROR-TRACKING HOOKS (Phase 2 — uncomment + apply):
 *   handleClickToEdit (editor.js ~1010): wrap openItemEdit/openProductForm/openSectionEdit
 *       in try/catch with [agf:click-to-edit] prefix
 *
 * Suggested module-local log helpers (uncomment in Phase 2):
 *   const TAG  = '[agf:click-to-edit]';
 *   const log  = (...a) => console.log(TAG, ...a);
 *   const warn = (...a) => console.warn(TAG, ...a);
 *   const err  = (...a) => console.error(TAG, ...a);
 */

// === TAG SCAFFOLD (activated in Phase-2 polish pass) =========================
// NOTE: these are module-local consts valid under ES-module wiring (Strategy A).
// For Strategy-B concatenation, strip this block (see LOAD_ORDER.md).
  const TAG  = '[agf:click-to-edit]';
  const log  = (...a) => console.log(TAG, ...a);
  const warn = (...a) => console.warn(TAG, ...a);
  const err  = (...a) => console.error(TAG, ...a);

/* --- function shouldTriggerEdit (editor.js lines 1001-1008) --- */
  function shouldTriggerEdit(e) {
    return !e.target.closest(
      'button, a, input, select, textarea, [role="button"], ' +
      '.product-expand-btn, .pdf-download-btn, .compare-toggle-btn, ' +
      '.cmp-card-check, .pspec-group-head, .appendix-ref, .btn, svg, canvas, [data-chart], ' +
      '.enhance-panel, .section-context-menu'
    );
  }

/* --- function handleClickToEdit (editor.js lines 1010-1057) --- */
  function handleClickToEdit(e) {
    // Per-item edit: check for data-field FIRST (before section/product fallback).
    // Skip if the click is on an appendix-ref (those open the appendix popup
    // via app.js) or on excluded interactive elements.
    if (!e.target.closest('.appendix-ref') && shouldTriggerEdit(e)) {
      var fieldEl = e.target.closest('[data-field]');
      if (fieldEl && !fieldEl.classList.contains('is-item-editing') &&
          !_currentItemOverlay) {
        var anchorSec = fieldEl.closest('[data-section-id]');
        if (anchorSec) _lastAnchorSectionId = anchorSec.getAttribute('data-section-id');
        openItemEdit(fieldEl);
        return;
      }
    }
    // Close any open item editor on clicks outside it
    if (_currentItemOverlay && !e.target.closest('.edit-form-overlay--item')) {
      closeItemEdit();
    }
    // Product card: left-click opens in-place edit
    const card = e.target.closest('.product-card');
    if (card) {
      if (!shouldTriggerEdit(e)) return;
      if (card.classList.contains('is-editing')) return;
      var cardSec = card.closest('[data-section-id]');
      if (cardSec) _lastAnchorSectionId = cardSec.getAttribute('data-section-id');
      const slug = card.getAttribute('data-product-slug');
      const productsSection = $('#products');
      if (slug && productsSection) openProductForm(slug, productsSection, card);
      return;
    }
    // Header / Footer inner containers
    const structural = e.target.closest('.nav-inner[data-section-id], .foot-inner[data-section-id]');
    if (structural) {
      if (!shouldTriggerEdit(e)) return;
      if (structural.classList.contains('is-editing')) return;
      _lastAnchorSectionId = structural.getAttribute('data-section-id');
      toast('Click a specific item to edit it — or right-click → ✏️ Edit all fields.', 'info');
      return;
    }
    // Section: left-click on empty chrome shows a hint instead of the full form
    const sec = e.target.closest('[data-section-id]');
    if (sec) {
      if (!shouldTriggerEdit(e)) return;
      if (sec.classList.contains('is-editing')) return;
      _lastAnchorSectionId = sec.getAttribute('data-section-id');
      toast('Click a specific item to edit it — or right-click → ✏️ Edit all fields.', 'info');
    }
  }

/* --- function bindClickToEdit (editor.js lines 1059-1077) --- */
  function bindClickToEdit() {
    const app = $('#app');
    if (!app) return;
    app.removeEventListener('click', handleClickToEdit);
    app.addEventListener('click', handleClickToEdit);
    // Also bind on header and footer containers for schema-driven editing
    const nav = $('header.nav');
    if (nav) {
      nav.removeEventListener('click', handleClickToEdit);
      nav.addEventListener('click', handleClickToEdit);
    }
    const foot = $('footer.foot');
    if (foot) {
      foot.removeEventListener('click', handleClickToEdit);
      foot.addEventListener('click', handleClickToEdit);
    }
  }

  // ---------- context menu (right-click) -----------------------------------

