/* ========================================================================
 * site/editor/section-ops.js
 * Purpose: Section CRUD: add-button injection, visibility, reorder, delete
 * Module tag (Phase 2): [agf:section-ops]
 *
 * EXTRACTED VERBATIM from site/editor.js by A-editor.extract.py on 2026-06-27T03:23:12.075657+00:00.
 * Function bodies are byte-identical to the source. Do NOT hand-edit logic;
 * edit the source and re-run the extractor.
 *
 * ========================================================================
 * REQUIRED IMPORTS (wire in Phase 2 — see A-editor.md §3.1):
 *   from ./core.js   : $, $$, toast, api, API
 *   from ./confirm-dialog.js : confirmDialog
 *   from ./section-form.js   : openSchemaPicker, refreshAfterEdit
 *   Exports: injectAddButton, toggleVisibility, reorderSection, confirmDeleteSection
 *
 * ========================================================================
 * ERROR-TRACKING HOOKS (Phase 2 — uncomment + apply):
 *   toggleVisibility (editor.js ~1450): early-return if !id (chunk-3 #7)
 *   reorderSection (editor.js ~1469): normalize var->const/let (chunk-3 inconsistency)
 *   every op: console.error('[agf:section-ops] <op> failed', {id, err}) before toast
 *
 * Suggested module-local log helpers (uncomment in Phase 2):
 *   const TAG  = '[agf:section-ops]';
 *   const log  = (...a) => console.log(TAG, ...a);
 *   const warn = (...a) => console.warn(TAG, ...a);
 *   const err  = (...a) => console.error(TAG, ...a);
 */

// === TAG SCAFFOLD (activated in Phase-2 polish pass) =========================
// NOTE: these are module-local consts valid under ES-module wiring (Strategy A).
// For Strategy-B concatenation, strip this block (see LOAD_ORDER.md).
  const TAG  = '[agf:section-ops]';
  const log  = (...a) => console.log(TAG, ...a);
  const warn = (...a) => console.warn(TAG, ...a);
  const err  = (...a) => console.error(TAG, ...a);

/* --- function injectAddButton (editor.js lines 1428-1448) --- */
  function injectAddButton() {
    const nav = document.getElementById('navRight') || document.querySelector('.nav-inner');
    if (!nav || nav.querySelector('.nav-add-btn')) return;
    const secBtn = el('button', {
      type: 'button',
      class: 'nav-add-btn',
      text: '+ Section',
      onClick: (e) => openSchemaPicker(e.currentTarget),
    });
    nav.appendChild(secBtn);
    const prodBtn = el('button', {
      type: 'button',
      class: 'nav-add-btn',
      text: '+ Product',
      onClick: () => {
        const ps = $('#products');
        if (ps) openProductForm(null, ps);
      },
    });
    nav.appendChild(prodBtn);
  }

/* --- function toggleVisibility (editor.js lines 1450-1467) --- */
  async function toggleVisibility(sec) {
    const id = sec.getAttribute('data-section-id');
    try {
      const r = await api('PATCH', API.sections + '/' + id + '/visibility');
      // sync window.AGF.state
      if (window.AGF && window.AGF.state) {
        const st = window.AGF.state.sections.find((x) => x.id === id);
        if (st) st.is_visible = r.is_visible;
      }
      toast(r.is_visible ? 'Section visible.' : 'Section hidden.', 'success');
      // Re-render so hidden sections are removed from / kept in the DOM
      if (window.AGF && window.AGF.refreshAll) {
        await window.AGF.refreshAll();
      }
    } catch (err) {
      toast('Visibility failed: ' + err.message, 'error');
    }
  }

/* --- function reorderSection (editor.js lines 1469-1502) --- */
  async function reorderSection(sec, dir) {
    const id = sec.getAttribute('data-section-id');
    const sections = (window.AGF && window.AGF.state && window.AGF.state.sections) || [];
    const me = sections.find((x) => x.id === id);
    if (!me) return;
    const sorted = sections.slice().sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    const idx = sorted.findIndex((x) => x.id === id);
    const swap = sorted[idx + dir];
    if (!swap) return;

    try {
      // Fresh-GET both sections so we swap using ground-truth display_order
      // from the DB, not potentially-stale in-memory state.
      var [meFresh, swapFresh] = await Promise.all([
        api('GET', API.sections + '/' + me.id),
        api('GET', API.sections + '/' + swap.id),
      ]);
      var myOrder = (meFresh && typeof meFresh.display_order === 'number') ? meFresh.display_order : (me.display_order || 0);
      var swapOrder = (swapFresh && typeof swapFresh.display_order === 'number') ? swapFresh.display_order : (swap.display_order || 0);

      await Promise.all([
        api('PATCH', API.sections + '/' + me.id + '/order', { display_order: swapOrder }),
        api('PATCH', API.sections + '/' + swap.id + '/order', { display_order: myOrder }),
      ]);
      me.display_order = swapOrder;
      swap.display_order = myOrder;
      toast('Order updated.', 'success');
      if (window.AGF && window.AGF.refreshAll) {
        await window.AGF.refreshAll();
      }
    } catch (err) {
      toast('Reorder failed: ' + err.message, 'error');
    }
  }

/* --- function confirmDeleteSection (editor.js lines 1504-1531) --- */
  function confirmDeleteSection(sec) {
    const id = sec.getAttribute('data-section-id');
    const schema = sec.getAttribute('data-schema') || 'section';
    confirmDialog(
      'Delete this section?',
      'Schema: ' + schema + '. This cannot be undone.',
      'Delete',
      async () => {
        try {
          await api('DELETE', API.sections + '/' + id);
          toast('Section deleted.', 'success');
          if (window.AGF && window.AGF.refreshAll) {
            await window.AGF.refreshAll();
          }
        } catch (err) {
          toast('Delete failed: ' + err.message, 'error');
        }
      }
    );
  }

  // ---------- insert background image (context menu) -----------------------
  /**
   * insertBackgroundImage(sectionEl, productSlug, productCard)
   * Opens a file picker, uploads the chosen image, stores the path as
   * _background_image in the section/product data, and applies it immediately
   * as a CSS background on the target element.
   */

