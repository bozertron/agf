/* ========================================================================
 * site/editor/item-editor.js
 * Purpose: Per-field inline edit overlay (open/close + performSave)
 * Module tag (Phase 2): [agf:item-editor]
 *
 * EXTRACTED VERBATIM from site/editor.js by A-editor.extract.py on 2026-06-27T03:23:12.075357+00:00.
 * Function bodies are byte-identical to the source. Do NOT hand-edit logic;
 * edit the source and re-run the extractor.
 *
 * ========================================================================
 * REQUIRED IMPORTS (wire in Phase 2 — see A-editor.md §3.1):
 *   from ./core.js   : el, humanize, toast, api, deepClone, escapeHTML, $, $$, API
 *   from ./schema.js : getSchema, resolveSchema, navigateSchema
 *   from ./form.js   : generateForm, renderField, collectForm, getValueAtPath, setPathDeep
 *   from ./state.js  : currentEditSlug, currentEditCategory
 *   from ./section-form.js : refreshAfterEdit
 *   from ./figures.js: buildActions (actually in form.js)
 *   Exports: openItemEdit, closeItemEdit, getLastAnchorSectionId
 *
 * ========================================================================
 * ERROR-TRACKING HOOKS (Phase 2 — uncomment + apply):
 *   openItemEdit entry (editor.js ~726): console.debug('[agf:item-editor] open', {path, hostType})
 *   schema-miss toast (editor.js ~793): include `path` in message (chunk-2 #7)
 *   performSave catch (editor.js ~995): console.error('[agf:item-editor] performSave failed',
 *       {path, hostId, hostSlug, err}) BEFORE toast (chunk-2 #4) — HIGH VALUE
 *   openItemEdit load failure: console.error with host context
 *   overlay drift (editor.js ~884): add passive scroll/resize reposition (chunk-2 #6)
 *
 * Suggested module-local log helpers (uncomment in Phase 2):
 *   const TAG  = '[agf:item-editor]';
 *   const log  = (...a) => console.log(TAG, ...a);
 *   const warn = (...a) => console.warn(TAG, ...a);
 *   const err  = (...a) => console.error(TAG, ...a);
 */

// === TAG SCAFFOLD (activated in Phase-2 polish pass) =========================
// NOTE: these are module-local consts valid under ES-module wiring (Strategy A).
// For Strategy-B concatenation, strip this block (see LOAD_ORDER.md).
  const TAG  = '[agf:item-editor]';
  const log  = (...a) => console.log(TAG, ...a);
  const warn = (...a) => console.warn(TAG, ...a);
  const err  = (...a) => console.error(TAG, ...a);

/* --- state/constants: state: _currentItemOverlay, _lastAnchorSectionId (editor.js lines 660-664) --- */
  let _currentItemOverlay = null;

  // Records the id of the section most recently left/right-clicked, so that
  // createSection() can spawn the new section directly below it.
  let _lastAnchorSectionId = null;

/* --- function closeItemEdit (editor.js lines 709-725) --- */
  function closeItemEdit() {
    if (_currentItemOverlay) {
      _currentItemOverlay.remove();
      _currentItemOverlay = null;
    }
    $$('.is-item-editing').forEach(function (node) {
      node.classList.remove('is-item-editing');
    });
  }

  /**
   * openItemEdit(fieldEl)
   * Opens a compact, scoped edit form for the single data-field path carried
   * by fieldEl. Resolves the host section or product, fetches schema + data,
   * renders a single-field or single-card form, and wires Cancel / Save /
   * Appendix controls that merge (not replace) into the full data object.
   */

/* --- function openItemEdit (editor.js lines 726-1000) --- */
  async function openItemEdit(fieldEl) {
    closeItemEdit();

    const path = fieldEl.getAttribute('data-field');
    if (!path) return;
    const parts = path.split('.');
    const lastKey = parts[parts.length - 1];

    // --- Resolve host (product card or section) ---
    const card = fieldEl.closest('.product-card[data-product-slug]');
    const sec = fieldEl.closest('[data-section-id]');
    const isProduct = !!card;

    let schemaId, hostId, hostSlug;
    let fullData, schemaRec, sectionTitle;
    let productName, productCategory, productStatus;

    if (isProduct) {
      hostSlug = card.getAttribute('data-product-slug');
      schemaId = 'product';
    } else if (sec) {
      hostId = sec.getAttribute('data-section-id');
      schemaId = sec.getAttribute('data-schema');
    } else {
      return; // no host — nothing to edit
    }

    try {
      schemaRec = await getSchema(schemaId);
      if (isProduct) {
        const product = await api('GET', API.products + '/' + hostSlug);
        fullData = product.data || {};
        productName = product.name;
        productCategory = product.category;
        productStatus = product.status;
      } else {
        let section = null;
        if (window.AGF && window.AGF.state && window.AGF.state.sections) {
          section = window.AGF.state.sections.find(function (s) { return s.id === hostId; });
        }
        if (!section || !section.data) {
          section = await api('GET', API.sections + '/' + hostId);
        }
        fullData = section.data || {};
        sectionTitle = section.title;
      }
    } catch (err) {
      toast('Load failed: ' + err.message, 'error');
      return;
    }

    // --- Navigate schema to target ---
    // name/category/status are top-level DB columns on the products table,
    // not entries inside product.data. When editing one of these as a
    // root-level (single-segment) path on a product, resolve the schema and
    // value directly from the product root instead of navigating data.*
    var isProductTopLevel = isProduct && parts.length === 1 &&
      (parts[0] === 'name' || parts[0] === 'category' || parts[0] === 'status');

    var targetSchema;
    if (isProductTopLevel) {
      var rootProps = ((schemaRec.schema_json || {}).properties) || {};
      targetSchema = rootProps[parts[0]] || {};
    } else {
      targetSchema = navigateSchema(schemaRec.schema_json || {}, parts);
    }
    if (!targetSchema || !targetSchema.type) {
      console.warn(TAG, 'schema miss — no schema at path', { path, schemaId });
      toast('Cannot edit this field (no schema at path: ' + path + ').', 'error');
      return;
    }

    var resolvedTarget = resolveSchema(targetSchema);
    var currentValue;
    if (isProductTopLevel) {
      currentValue = parts[0] === 'name' ? productName
        : parts[0] === 'category' ? productCategory
        : productStatus;
    } else {
      currentValue = getValueAtPath(fullData, parts);
    }
    var isArrayItem = /^\d+$/.test(lastKey);

    // Determine where the appendix should be stored.
    // Array items store appendix on themselves (<path>.appendix).
    // Everything else stores on the host's top-level data.appendix.
    var appendixPathParts = isArrayItem ? parts.concat(['appendix']) : ['appendix'];

    // Mark editing state
    fieldEl.classList.add('is-item-editing');

    // --- Build overlay ---
    var overlay = el('div', { class: 'edit-form-overlay edit-form-overlay--item' });
    _currentItemOverlay = overlay;

    overlay.appendChild(el('h3', { text: 'Edit \u00b7 ' + humanize(lastKey) }));

    var formBody = el('div', { class: 'edit-form-body' });
    currentEditCategory = isProduct ? 'products' : 'sections';
    currentEditSlug = isProduct ? (hostSlug || 'general') : (schemaId || 'section');

    // Render the form for just this path's schema
    if ((resolvedTarget.type === 'object' || resolvedTarget.properties) &&
        resolvedTarget.type !== 'string') {
      // Object or card — render all sub-fields
      formBody.appendChild(generateForm(resolvedTarget, currentValue || {}, path));
    } else {
      // Leaf scalar or string array item
      formBody.appendChild(renderField(lastKey, resolvedTarget, currentValue, path));
    }
    overlay.appendChild(formBody);

    // --- Appendix field (collapsed by default) ---
    var existingAppendix = getValueAtPath(fullData, appendixPathParts);
    var appendixWrap = el('div', { class: 'appendix-field appendix-field--item' });
    var appendixContent = el('div', { class: 'appendix-content', style: 'display:none' });

    var appendixToggle = el('button', {
      type: 'button',
      class: 'appendix-toggle-btn',
      text: 'Appendix \u25be',
      onClick: function () {
        var open = appendixContent.style.display === 'none';
        appendixContent.style.display = open ? 'block' : 'none';
        appendixToggle.textContent = open ? 'Appendix \u25b4' : 'Appendix \u25be';
      },
    });
    appendixWrap.appendChild(appendixToggle);

    var appendixTA = el('textarea', {
      placeholder: 'Add notes, thoughts, supporting detail for the appendix\u2026',
    });
    appendixTA.value = existingAppendix || '';
    appendixContent.appendChild(appendixTA);

    var appendixActions = el('div', { class: 'appendix-actions' });
    appendixActions.appendChild(el('button', {
      type: 'button',
      class: 'btn-apx-cancel',
      text: 'Cancel',
      onClick: function () { appendixTA.value = ''; },
    }));
    appendixActions.appendChild(el('button', {
      type: 'button',
      class: 'btn-apx-publish',
      text: 'Publish to Appendix',
      onClick: function () { performSave(true); },
    }));
    appendixContent.appendChild(appendixActions);
    appendixWrap.appendChild(appendixContent);
    overlay.appendChild(appendixWrap);

    // --- Actions: Cancel + Save ---
    overlay.appendChild(buildActions(
      function () { performSave(false); },
      function () { closeItemEdit(); }
    ));

    // Position the overlay near the clicked element
    var rect = fieldEl.getBoundingClientRect();
    overlay.style.position = 'fixed';
    overlay.style.top = Math.max(8, rect.top - 8) + 'px';
    overlay.style.left = Math.min(window.innerWidth - 440, rect.right + 12) + 'px';

    document.body.appendChild(overlay);

    // Adjust if it goes off the bottom
    requestAnimationFrame(function () {
      var oRect = overlay.getBoundingClientRect();
      if (oRect.bottom > window.innerHeight) {
        overlay.style.top = Math.max(8, window.innerHeight - oRect.height - 8) + 'px';
      }
      overlay.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    // --- Core save logic (shared by Save and Publish-to-Appendix) ---
    async function performSave(withAppendix) {
      try {
        // skipPrune=true: preserve sparse array indices so getValueAtPath
        // resolves the edited element (e.g. tenets.3). Pruning would compact
        // [,,,{x}]→[{x}] and lose the index, silently skipping the merge.
        var collected = collectForm(formBody, true);
        var merged = deepClone(fullData);

        // Extract the collected value at the target path
        var collectedValue = getValueAtPath(collected, parts);

        if (isProductTopLevel) {
          // Route name/category/status to the top-level product columns,
          // never into data. data stays as a pristine deep-clone of product.data.
          if (collectedValue !== undefined && collectedValue !== '') {
            if (parts[0] === 'name') productName = collectedValue;
            else if (parts[0] === 'category') productCategory = collectedValue;
            else if (parts[0] === 'status') productStatus = collectedValue;
          }
        } else {
        // Merge into the clone based on target type.
        // collectedValue may be '' (explicit clear) — only skip if truly undefined
        // (field was not in the form at all, e.g. hidden upload with no change).
        if (collectedValue !== undefined) {
          if (resolvedTarget.type === 'object' || resolvedTarget.properties) {
            // Object/card — merge sparse collected into existing
            var existing = getValueAtPath(merged, parts) || {};
            setPathDeep(merged, parts, Object.assign({}, existing, collectedValue));
          } else {
            // Leaf scalar (string, number, etc.)
            setPathDeep(merged, parts, collectedValue);
          }
        }
        }

        // Preserve convention fields on the host data
        if (!isProduct) {
          if (fullData._style_overrides) merged._style_overrides = fullData._style_overrides;
          if (fullData._background_image) merged._background_image = fullData._background_image;
          if (fullData._background_settings) merged._background_settings = fullData._background_settings;
        }

        // Convention arrays (_texts, _figures) are managed by dedicated UIs
        // (context-menu insert, drag/resize, inline edit). If the current edit
        // path does NOT target one of these arrays, delete the stale snapshot
        // from `merged` so reconcileConventionFields backfills the FRESH version
        // from the server — preventing a stale overwrite of width/position/etc.
        if (!isProduct) {
          if (parts[0] !== '_texts') delete merged._texts;
          if (parts[0] !== '_figures') delete merged._figures;
        }

        // Set appendix if requested
        if (withAppendix) {
          var apxText = appendixTA.value.trim();
          if (apxText) {
            setPathDeep(merged, appendixPathParts, apxText);
          }
        }

        // B1: FRESH-GET reconcile — guarantee persisted convention fields
        // survive even if fullData (captured at form-open) was stale. The DB
        // is ground truth; only fill fields that `merged` LACKS so the user's
        // current edit always wins. A failed reconcile GET must NOT silently
        // proceed (that would risk clobbering a persisted override).
        merged = await reconcileConventionFields(
          isProduct ? 'product' : 'section',
          isProduct ? hostSlug : hostId,
          merged
        );

        // Send PUT
        if (isProduct) {
          await api('PUT', API.products + '/' + hostSlug, {
            name: productName,
            category: productCategory,
            status: productStatus,
            data: merged,
          });
          closeItemEdit();
          toast('Saved.', 'success');
          if (window.AGF && window.AGF.refreshProducts) {
            await window.AGF.refreshProducts();
          }
        } else {
          await api('PUT', API.sections + '/' + hostId, {
            data: merged,
            title: sectionTitle,
          });
          closeItemEdit();
          toast('Saved.', 'success');
          await refreshAfterEdit(hostId, schemaId);
        }
      } catch (err) {
        console.error(TAG, 'performSave failed', { path, hostId, hostSlug, error: err && err.message ? err.message : String(err) });
        toast('Save failed: ' + err.message, 'error');
      }
    }
  }

  // ---------- click-to-edit -----------------------------------------------

