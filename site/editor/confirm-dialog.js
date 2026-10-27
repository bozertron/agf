/* ========================================================================
 * site/editor/confirm-dialog.js
 * Purpose: Generic confirm/cancel modal overlay (reusable)
 * Module tag (Phase 2): [agf:confirm-dialog]
 *
 * EXTRACTED VERBATIM from site/editor.js by A-editor.extract.py on 2026-06-27T03:23:12.076309+00:00.
 * Function bodies are byte-identical to the source. Do NOT hand-edit logic;
 * edit the source and re-run the extractor.
 *
 * ========================================================================
 * REQUIRED IMPORTS (wire in Phase 2 — see A-editor.md §3.1):
 *   from ./core.js : el
 *   Exports: confirmDialog
 *
 * ========================================================================
 * ERROR-TRACKING HOOKS (Phase 2 — uncomment + apply):
 *   confirmDialog (editor.js ~4088): add role=dialog, aria-modal=true, focus trap,
 *       Escape handler, focus restore (chunk-9 #2, MEDIUM a11y)
 *
 * Suggested module-local log helpers (uncomment in Phase 2):
 *   const TAG  = '[agf:confirm-dialog]';
 *   const log  = (...a) => console.log(TAG, ...a);
 *   const warn = (...a) => console.warn(TAG, ...a);
 *   const err  = (...a) => console.error(TAG, ...a);
 */

// === TAG SCAFFOLD (activated in Phase-2 polish pass) =========================
// NOTE: these are module-local consts valid under ES-module wiring (Strategy A).
// For Strategy-B concatenation, strip this block (see LOAD_ORDER.md).
  const TAG  = '[agf:confirm-dialog]';
  const log  = (...a) => console.log(TAG, ...a);
  const warn = (...a) => console.warn(TAG, ...a);
  const err  = (...a) => console.error(TAG, ...a);

/* --- function confirmDialog (editor.js lines 4088-4117) --- */
  function confirmDialog(title, message, confirmLabel, onConfirm) {
    const overlay = el('div', { class: 'confirm-overlay' });
    const dialog = el('div', { class: 'confirm-dialog' });
    dialog.appendChild(el('h3', { text: title }));
    dialog.appendChild(el('p', { text: message }));
    const actions = el('div', { class: 'form-actions', style: 'justify-content:center;border-top:none;padding-top:0' });
    actions.appendChild(el('button', {
      type: 'button',
      class: 'btn-cancel',
      text: 'Cancel',
      onClick: () => overlay.remove(),
    }));
    actions.appendChild(el('button', {
      type: 'button',
      class: 'btn-danger',
      text: confirmLabel || 'Confirm',
      onClick: async () => {
        overlay.remove();
        await onConfirm();
      },
    }));
    dialog.appendChild(actions);
    overlay.appendChild(dialog);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });
    document.body.appendChild(overlay);
  }
