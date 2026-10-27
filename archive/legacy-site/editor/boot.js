/* ========================================================================
 * site/editor/boot.js
 * Purpose: Entry/wiring: waitForAppMount, boot, rebind, window.AGFEditor export
 * Module tag (Phase 2): [agf:boot]
 *
 * EXTRACTED VERBATIM from site/editor.js by A-editor.extract.py on 2026-06-27T03:23:12.076353+00:00.
 * Function bodies are byte-identical to the source. Do NOT hand-edit logic;
 * edit the source and re-run the extractor.
 *
 * ========================================================================
 * REQUIRED IMPORTS (wire in Phase 2 — see A-editor.md §3.1):
 *   ENTRY POINT (index.html loads this file).
 *   from ./section-ops.js   : injectAddButton
 *   from ./click-to-edit.js : bindClickToEdit
 *   from ./context-menu.js  : bindContextMenu
 *   from ./drag-drop.js     : bindDragDrop
 *   from ./inserted-text.js : bindInsertedTextDrag, bindInsertedTextEdit, bindInsertedTextResize
 *   from ./form.js          : generateForm, collectForm
 *   Exports: boot, rebind; assigns window.AGFEditor = { rebind, generateForm, collectForm }
 *
 * ========================================================================
 * ERROR-TRACKING HOOKS (Phase 2 — uncomment + apply):
 *   boot()/rebind() binding loop (editor.js ~4245,~4264): wrap EACH binder in try/catch,
 *       console.error('[agf:boot] <fn.name> failed', e) — HIGHEST-VALUE HOOK (chunk-9 #7)
 *   rebind() (editor.js ~4264): add teardown / idempotency guards to prevent duplicate
 *       listeners (chunk-9 #8, MEDIUM real bug) — FIX BEFORE ADOPTING SPLIT
 *   waitForAppMount failsafe (editor.js ~4215): console.warn on 6s timeout; gate cb() on
 *       $('#app') existence (chunk-9 #6)
 *
 * Suggested module-local log helpers (uncomment in Phase 2):
 *   const TAG  = '[agf:boot]';
 *   const log  = (...a) => console.log(TAG, ...a);
 *   const warn = (...a) => console.warn(TAG, ...a);
 *   const err  = (...a) => console.error(TAG, ...a);
 */

// === TAG SCAFFOLD (activated in Phase-2 polish pass) =========================
// NOTE: these are module-local consts valid under ES-module wiring (Strategy A).
// For Strategy-B concatenation, strip this block (see LOAD_ORDER.md).
  const TAG  = '[agf:boot]';
  const log  = (...a) => console.log(TAG, ...a);
  const warn = (...a) => console.warn(TAG, ...a);
  const err  = (...a) => console.error(TAG, ...a);

/* --- function waitForAppMount (editor.js lines 4226-4242) --- */
  function waitForAppMount(cb) {
    const app = $('#app');
    if (!app) { setTimeout(() => waitForAppMount(cb), 100); return; }
    if (app.getAttribute('aria-busy') === 'false' && app.children.length > 0) {
      cb();
      return;
    }
    const obs = new MutationObserver(() => {
      if (app.getAttribute('aria-busy') === 'false' && app.children.length > 0) {
        obs.disconnect();
        cb();
      }
    });
    obs.observe(app, { attributes: true, childList: true, subtree: false, attributeFilter: ['aria-busy'] });
    // failsafe — if the app never signals ready, fire anyway but leave a
    // breadcrumb and gate the callback on #app still existing (chunk-9 #6).
    setTimeout(() => {
      obs.disconnect();
      if (!$('#app')) {
        warn('waitForAppMount 6s timeout: #app vanished, skipping boot cb');
        return;
      }
      warn('waitForAppMount 6s timeout: proceeding with boot cb');
      cb();
    }, 6000);
  }

/* --- function boot (editor.js lines 4245-4263) --- */
  function boot() {
    waitForAppMount(() => {
      // Per-binding isolation: one throw must NOT half-initialize the editor
      // (chunk-9 #7 — highest-value hook). safeBind logs with the boot TAG.
      const binders = [
        injectAddButton, bindClickToEdit, bindContextMenu, bindDragDrop,
        bindInsertedTextDrag, bindInsertedTextEdit, bindInsertedTextResize,
      ];
      binders.forEach(safeBind);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // Expose rebind for app.js refresh hooks.

/* --- function rebind (editor.js lines 4264-4278) --- */
  function rebind() {
    // Same per-binding isolation as boot(). NOTE: this does NOT fix the
    // duplicate-listener leak (chunk-9 #8) — that requires teardown guards
    // inside each binder and is a documented pre-cutover follow-up.
    const binders = [
      injectAddButton, bindClickToEdit, bindContextMenu, bindDragDrop,
      bindInsertedTextDrag, bindInsertedTextEdit, bindInsertedTextResize,
    ];
    binders.forEach(safeBind);
  }

  // safeBind(fn): invoke a binder with try/catch isolation, log on failure.
  // Uses fn.name where available; the push to window.AGF._errors gives the
  // rest of the app a single read-only surface to observe editor failures.
  function safeBind(fn) {
    try {
      fn && fn();
    } catch (e) {
      const name = (fn && fn.name) ? fn.name : '<anonymous binder>';
      err('binder failed', { binder: name, error: e && e.message ? e.message : String(e) });
      try {
        if (!window.AGF) window.AGF = {};
        if (!Array.isArray(window.AGF._errors)) window.AGF._errors = [];
        window.AGF._errors.push({
          module: '[agf:boot]', binder: name,
          message: e && e.message ? e.message : String(e),
          stack: e && e.stack, ts: Date.now(),
        });
      } catch (_) { /* never let error-reporting itself throw */ }
    }
  }

  window.AGFEditor = {
    rebind,
    generateForm,
    collectForm,
  };

