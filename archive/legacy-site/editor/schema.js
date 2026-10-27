/* ========================================================================
 * site/editor/schema.js
 * Purpose: Schema resolution, defaults, fetch + cache layer, path navigation
 * Module tag (Phase 2): [agf:schema]
 *
 * EXTRACTED VERBATIM from site/editor.js by A-editor.extract.py on 2026-06-27T03:23:12.075171+00:00.
 * Function bodies are byte-identical to the source. Do NOT hand-edit logic;
 * edit the source and re-run the extractor.
 *
 * ========================================================================
 * REQUIRED IMPORTS (wire in Phase 2 — see A-editor.md §3.1):
 *   from ./core.js   : (none directly; uses $/$$ only indirectly)
 *   from ./state.js  : schemaCache, schemaListCache
 *   Exports: resolveSchema, defaultFor, isMarkdown, getSchemaList, getSchema, navigateSchema
 *
 * ========================================================================
 * ERROR-TRACKING HOOKS (Phase 2 — uncomment + apply):
 *   getSchema cache miss (editor.js ~168): console.debug('[agf:schema] cache miss', id)
 *
 * Suggested module-local log helpers (uncomment in Phase 2):
 *   const TAG  = '[agf:schema]';
 *   const log  = (...a) => console.log(TAG, ...a);
 *   const warn = (...a) => console.warn(TAG, ...a);
 *   const err  = (...a) => console.error(TAG, ...a);
 */

// === TAG SCAFFOLD (activated in Phase-2 polish pass) =========================
// NOTE: these are module-local consts valid under ES-module wiring (Strategy A).
// For Strategy-B concatenation, strip this block (see LOAD_ORDER.md).
  const TAG  = '[agf:schema]';
  const log  = (...a) => console.log(TAG, ...a);
  const warn = (...a) => console.warn(TAG, ...a);
  const err  = (...a) => console.error(TAG, ...a);

/* --- function resolveSchema (editor.js lines 121-134) --- */
  function resolveSchema(s) {
    if (!s || typeof s !== 'object') return s || {};
    if (Array.isArray(s.oneOf)) {
      const pick = s.oneOf.find((o) => o && o.type !== 'null') || s.oneOf[0];
      return Object.assign({}, s, pick);
    }
    if (Array.isArray(s.anyOf)) {
      const pick = s.anyOf.find((o) => o && o.type !== 'null') || s.anyOf[0];
      return Object.assign({}, s, pick);
    }
    return s;
  }

  // Pull a default for a schema node — used when adding a new array item.

/* --- function defaultFor (editor.js lines 135-153) --- */
  function defaultFor(schema) {
    const s = resolveSchema(schema);
    if (!s || !s.type) return '';
    if (s.default !== undefined) return s.default;
    if (s.type === 'string')  return s.enum ? s.enum[0] : '';
    if (s.type === 'integer' || s.type === 'number') return 0;
    if (s.type === 'boolean') return false;
    if (s.type === 'array')   return [];
    if (s.type === 'object') {
      const o = {};
      if (s.properties) {
        Object.keys(s.properties).forEach((k) => {
          o[k] = defaultFor(s.properties[k]);
        });
      }
      return o;
    }
    return null;
  }

/* --- function isMarkdown (editor.js lines 161-166) --- */
  function isMarkdown(schema) {
    const desc = (schema && schema.description) || '';
    return /markdown/i.test(desc);
  }

  // ---------- schema fetching --------------------------------------------

/* --- function getSchemaList (editor.js lines 167-171) --- */
  async function getSchemaList() {
    if (schemaListCache) return schemaListCache;
    schemaListCache = await api('GET', API.schemas);
    return schemaListCache;
  }

/* --- function getSchema (editor.js lines 173-185) --- */
  async function getSchema(id) {
    if (schemaCache.has(id)) return schemaCache.get(id);
    const rec = await api('GET', API.schemas + '/' + encodeURIComponent(id));
    schemaCache.set(id, rec);
    return rec;
  }

  // ---------- form generation --------------------------------------------
  /**
   * generateForm(schema, data, path)
   * Returns a DocumentFragment containing form fields for the given schema.
   * Each leaf field carries data-path = "a.b.c" (or "a.0.b" for arrays).
   */

/* --- function navigateSchema (editor.js lines 696-707) --- */
  function navigateSchema(schemaJson, parts) {
    let cur = resolveSchema(schemaJson);
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      if (/^\d+$/.test(p)) {
        cur = resolveSchema(cur.items || cur);
      } else {
        cur = resolveSchema((cur.properties || {})[p]);
      }
    }
    return cur || {};
  }

