/* ========================================================================
 * site/editor/state.js
 * Purpose: Shared mutable editor state (cross-module)
 * Module tag (Phase 2): [agf:state]
 *
 * EXTRACTED VERBATIM from site/editor.js by A-editor.extract.py on 2026-06-27T03:23:12.075142+00:00.
 * Function bodies are byte-identical to the source. Do NOT hand-edit logic;
 * edit the source and re-run the extractor.
 *
 * ========================================================================
 * REQUIRED IMPORTS (wire in Phase 2 — see A-editor.md §3.1):
 *   Consumers import: currentEditSlug, currentEditCategory, schemaCache,
 *                     schemaListCache (live bindings).
 *   Phase 2: add clearSchemaCache() to invalidate caches (chunk-1 bug #3,#4).
 *
 * ========================================================================
 * ERROR-TRACKING HOOKS (Phase 2 — uncomment + apply):
 *   clearSchemaCache(): log when caches are cleared.
 *
 * Suggested module-local log helpers (uncomment in Phase 2):
 *   const TAG  = '[agf:state]';
 *   const log  = (...a) => console.log(TAG, ...a);
 *   const warn = (...a) => console.warn(TAG, ...a);
 *   const err  = (...a) => console.error(TAG, ...a);
 */

// === TAG SCAFFOLD (activated in Phase-2 polish pass) =========================
// NOTE: these are module-local consts valid under ES-module wiring (Strategy A).
// For Strategy-B concatenation, strip this block (see LOAD_ORDER.md).
  const TAG  = '[agf:state]';
  const log  = (...a) => console.log(TAG, ...a);
  const warn = (...a) => console.warn(TAG, ...a);
  const err  = (...a) => console.error(TAG, ...a);

/* --- state/constants: schemaCache, schemaListCache, currentEditSlug, currentEditCategory (editor.js lines 22-29) --- */
  // Cache fetched schema definitions so we don't refetch on every form open.
  const schemaCache = new Map();          // id -> full schema record
  let schemaListCache = null;             // GET /api/schemas list

  // Tracks the slug of the product/section currently being edited; consumed by
  // image upload fields so that uploads are routed to the correct sub-folder.
  let currentEditSlug = null;
  let currentEditCategory = 'products';

