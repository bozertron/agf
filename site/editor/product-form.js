/* ========================================================================
 * site/editor/product-form.js
 * Purpose: Product add/edit form + delete confirmation
 * Module tag (Phase 2): [agf:product-form]
 *
 * EXTRACTED VERBATIM from site/editor.js by A-editor.extract.py on 2026-06-27T03:23:12.076291+00:00.
 * Function bodies are byte-identical to the source. Do NOT hand-edit logic;
 * edit the source and re-run the extractor.
 *
 * ========================================================================
 * REQUIRED IMPORTS (wire in Phase 2 — see A-editor.md §3.1):
 *   from ./core.js   : el, $, toast, api, deepClone, API, escapeHTML
 *   from ./schema.js : getSchema
 *   from ./form.js   : generateForm, collectForm, buildActions
 *   from ./confirm-dialog.js : confirmDialog
 *   from ./section-form.js   : reconcileConventionFields
 *   from ./state.js  : currentEditSlug, currentEditCategory
 *   Exports: openProductForm, confirmDeleteProduct
 *
 * ========================================================================
 * ERROR-TRACKING HOOKS (Phase 2 — uncomment + apply):
 *   save handlers (editor.js ~4002,~4068): console.error('[agf:product-form] save failed',
 *       {slug, err}); Phase 2: use preserveConventionFields() (chunk-9 #1)
 *
 * Suggested module-local log helpers (uncomment in Phase 2):
 *   const TAG  = '[agf:product-form]';
 *   const log  = (...a) => console.log(TAG, ...a);
 *   const warn = (...a) => console.warn(TAG, ...a);
 *   const err  = (...a) => console.error(TAG, ...a);
 */

// === TAG SCAFFOLD (activated in Phase-2 polish pass) =========================
// NOTE: these are module-local consts valid under ES-module wiring (Strategy A).
// For Strategy-B concatenation, strip this block (see LOAD_ORDER.md).
  const TAG  = '[agf:product-form]';
  const log  = (...a) => console.log(TAG, ...a);
  const warn = (...a) => console.warn(TAG, ...a);
  const err  = (...a) => console.error(TAG, ...a);

/* --- function openProductForm (editor.js lines 3963-4066) --- */
  async function openProductForm(slug, productsSection, targetCard) {
    let schema, product = null;
    try {
      schema = await getSchema('product');
      if (slug) product = await api('GET', API.products + '/' + slug);
    } catch (err) {
      toast('Load failed: ' + err.message, 'error');
      return;
    }

    // --- Editing an existing product card in-place ---
    if (targetCard) {
      if (targetCard.classList.contains('is-editing')) return;
      targetCard.classList.add('is-editing');

      const overlay = el('div', { class: 'edit-form-overlay' });
      overlay.appendChild(el('h3', { text: 'Edit product' }));

      const formBody = el('div', { class: 'edit-form-body' });
      const data = product ? (product.data || {}) : {};
      currentEditCategory = 'products';
      currentEditSlug = slug || (data.name ? String(data.name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') : 'general');
      formBody.appendChild(generateForm(schema.schema_json || {}, data, ''));
      overlay.appendChild(formBody);

      overlay.appendChild(buildActions(
        async () => {
          const collected = collectForm(formBody);
          const name = collected.name || (product && product.name);
          const category = collected.category || (product && product.category);
          const status = collected.status || (product && product.status) || 'concept';
          if (!name) { toast('Name is required.', 'error'); return; }
          if (!category) { toast('Category is required.', 'error'); return; }
          // Preserve convention fields
          if (product && product.data && product.data._background_image) collected._background_image = product.data._background_image;
          if (product && product.data && product.data._background_settings) collected._background_settings = product.data._background_settings;
          if (product && product.data && product.data._style_overrides) collected._style_overrides = product.data._style_overrides;
          try {
            await reconcileConventionFields('product', slug, collected);
            await api('PUT', API.products + '/' + slug, {
              name, category, status, data: collected,
            });
            targetCard.classList.remove('is-editing');
            overlay.remove();
            if (window.AGF && window.AGF.refreshProducts) {
              await window.AGF.refreshProducts();
            }
          } catch (err) {
            toast('Save failed: ' + err.message, 'error');
          }
        },
        () => {
          targetCard.classList.remove('is-editing');
          overlay.remove();
        }
      ));

      targetCard.appendChild(overlay);
      overlay.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // --- Adding a new product: mount form above the grid ---
    const grid = productsSection.querySelector('.products');
    if (!grid) return;

    const prior = productsSection.querySelector(':scope > .edit-form-overlay');
    if (prior) prior.remove();

    const overlay = el('div', { class: 'edit-form-overlay' });
    overlay.appendChild(el('h3', { text: 'Add product' }));

    const formBody = el('div', { class: 'edit-form-body' });
    currentEditCategory = 'products';
    currentEditSlug = 'general';
    formBody.appendChild(generateForm(schema.schema_json || {}, {}, ''));
    overlay.appendChild(formBody);

    overlay.appendChild(buildActions(
      async () => {
        const collected = collectForm(formBody);
        const name = collected.name;
        const category = collected.category;
        const status = collected.status || 'concept';
        if (!name) { toast('Name is required.', 'error'); return; }
        if (!category) { toast('Category is required.', 'error'); return; }
        try {
          await api('POST', API.products, {
            name, category, status, data: collected,
          });
          overlay.remove();
          if (window.AGF && window.AGF.refreshProducts) {
            await window.AGF.refreshProducts();
          }
        } catch (err) {
          toast('Save failed: ' + err.message, 'error');
        }
      },
      () => overlay.remove()
    ));

    grid.parentNode.insertBefore(overlay, grid);
    overlay.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

/* --- function confirmDeleteProduct (editor.js lines 4068-4087) --- */
  function confirmDeleteProduct(slug) {
    confirmDialog(
      'Delete this product?',
      'Slug: ' + slug + '. This cannot be undone.',
      'Delete',
      async () => {
        try {
          await api('DELETE', API.products + '/' + slug);
          toast('Product deleted.', 'success');
          if (window.AGF && window.AGF.refreshProducts) {
            await window.AGF.refreshProducts();
          }
        } catch (err) {
          toast('Delete failed: ' + err.message, 'error');
        }
      }
    );
  }

  // ---------- confirmation dialog ----------------------------------------

