/* ========================================================================
 * site/editor/drag-drop.js
 * Purpose: Drag-and-drop background-image upload system
 * Module tag (Phase 2): [agf:drag-drop]
 *
 * EXTRACTED VERBATIM from site/editor.js by A-editor.extract.py on 2026-06-27T03:23:12.076331+00:00.
 * Function bodies are byte-identical to the source. Do NOT hand-edit logic;
 * edit the source and re-run the extractor.
 *
 * ========================================================================
 * REQUIRED IMPORTS (wire in Phase 2 — see A-editor.md §3.1):
 *   from ./core.js   : $, $$, toast, api, API
 *   from ./figures.js : applyBackgroundImage
 *   Exports: bindDragDrop
 *
 * ========================================================================
 * ERROR-TRACKING HOOKS (Phase 2 — uncomment + apply):
 *   _dragCounter (editor.js ~4134): fix shared-counter flicker -> per-element WeakMap
 *       (chunk-9 #3, MEDIUM); sanity-reset if negative
 *   onDrop catch (editor.js ~4158): console.error('[agf:drag-drop] drop failed', err)
 *   onDragOver (editor.js ~4136): rAF throttle (chunk-9 #4)
 *
 * Suggested module-local log helpers (uncomment in Phase 2):
 *   const TAG  = '[agf:drag-drop]';
 *   const log  = (...a) => console.log(TAG, ...a);
 *   const warn = (...a) => console.warn(TAG, ...a);
 *   const err  = (...a) => console.error(TAG, ...a);
 */

// === TAG SCAFFOLD (activated in Phase-2 polish pass) =========================
// NOTE: these are module-local consts valid under ES-module wiring (Strategy A).
// For Strategy-B concatenation, strip this block (see LOAD_ORDER.md).
  const TAG  = '[agf:drag-drop]';
  const log  = (...a) => console.log(TAG, ...a);
  const warn = (...a) => console.warn(TAG, ...a);
  const err  = (...a) => console.error(TAG, ...a);

/* --- state/constants: state: _dragCounter (editor.js lines 4134-4134) --- */
  let _dragCounter = 0; // track enter/leave nesting

/* --- function bindDragDrop (editor.js lines 4118-4132) --- */
  function bindDragDrop() {
    const targets = [
      document.getElementById('app'),
      document.querySelector('header.nav'),
      document.querySelector('footer.foot'),
    ].filter(Boolean);

    targets.forEach((target) => {
      // Remove previous listeners by replacing the element's event is idempotent
      // due to the drag-state guard.
      target.addEventListener('dragover', onDragOver);
      target.addEventListener('dragleave', onDragLeave);
      target.addEventListener('drop', onDrop);
    });
  }

/* --- function onDragOver (editor.js lines 4136-4147) --- */
  function onDragOver(e) {
    if (!e.dataTransfer || !e.dataTransfer.types.includes('Files')) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    // Highlight the closest section/card
    const section = e.target.closest('[data-section-id]');
    const card = e.target.closest('.product-card');
    const structural = e.target.closest('.nav-inner[data-section-id], .foot-inner[data-section-id]');
    const highlight = structural || section || card;
    if (highlight) highlight.classList.add('is-dragover');
    _dragCounter++;
  }

/* --- function onDragLeave (editor.js lines 4149-4156) --- */
  function onDragLeave(e) {
    _dragCounter--;
    if (_dragCounter <= 0) {
      _dragCounter = 0;
      // Remove all dragover highlights
      $$('.is-dragover').forEach((el) => el.classList.remove('is-dragover'));
    }
  }

/* --- function onDrop (editor.js lines 4158-4225) --- */
  async function onDrop(e) {
    e.preventDefault();
    // Sanity: _dragCounter should never be negative; if it is, the
    // enter/leave pairing desynced (shared-counter flicker, chunk-9 #3).
    // Log and clamp so a future WeakMap-per-element fix has a breadcrumb.
    if (_dragCounter < 0) warn('onDrop: _dragCounter negative before reset', { counter: _dragCounter });
    _dragCounter = 0;
    $$('.is-dragover').forEach((el) => el.classList.remove('is-dragover'));

    if (!e.dataTransfer || !e.dataTransfer.files.length) return;
    const file = e.dataTransfer.files[0];
    if (!file.type.startsWith('image/')) {
      toast('Only image files can be dropped.', 'error');
      return;
    }

    // Find the closest target: product card > section > structural container
    const card = e.target.closest('.product-card');
    const section = e.target.closest('[data-section-id]');
    const structural = e.target.closest('.nav-inner[data-section-id], .foot-inner[data-section-id]');
    const target = structural || section || card;
    if (!target) {
      toast('Drop target not found.', 'error');
      return;
    }

    const productSlug = card ? card.getAttribute('data-product-slug') : null;
    const sectionId = target.getAttribute('data-section-id');

    // Upload
    const formData = new FormData();
    const category = productSlug ? 'products' : 'sections';
    const slug = productSlug || (target.getAttribute('data-schema')) || 'general';
    formData.append('category', category);
    formData.append('slug', slug);
    formData.append('spec', 'background');
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!data || !data.success) {
        toast((data && data.error) || 'Upload failed', 'error');
        return;
      }
      const imagePath = data.relativePath;

      if (productSlug && card) {
        const product = await api('GET', API.products + '/' + productSlug);
        const productData = product && product.data ? { ...product.data } : {};
        productData._background_image = imagePath;
        await api('PUT', API.products + '/' + productSlug, {
          name: product.name, category: product.category, status: product.status, data: productData,
        });
        applyBackgroundImage(card, imagePath);
        toast('Background image set.', 'success');
      } else if (sectionId) {
        const section = await api('GET', API.sections + '/' + sectionId);
        const sectionData = section && section.data ? { ...section.data } : {};
        sectionData._background_image = imagePath;
        await api('PUT', API.sections + '/' + sectionId, {
          data: sectionData, title: section.title,
        });
        applyBackgroundImage(target, imagePath);
        toast('Background image set.', 'success');
      }
    } catch (err) {
      toast('Drop upload failed: ' + err.message, 'error');
    }
  }

  // ---------- boot --------------------------------------------------------

