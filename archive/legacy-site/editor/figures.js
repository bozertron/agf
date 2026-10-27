/* ========================================================================
 * site/editor/figures.js
 * Purpose: Figure insert/panel/upload/save/remove/move + background-image insert
 * Module tag (Phase 2): [agf:figures]
 *
 * EXTRACTED VERBATIM from site/editor.js by A-editor.extract.py on 2026-06-27T03:23:12.075763+00:00.
 * Function bodies are byte-identical to the source. Do NOT hand-edit logic;
 * edit the source and re-run the extractor.
 *
 * ========================================================================
 * REQUIRED IMPORTS (wire in Phase 2 — see A-editor.md §3.1):
 *   from ./core.js   : el, $, toast, api, deepClone, shortId, API, escapeHTML
 *   from ./schema.js : getSchema
 *   from ./confirm-dialog.js : confirmDialog
 *   from ./section-form.js   : refreshAfterEdit, reconcileConventionFields
 *   Exports: insertFigure, openFigurePanel, removeFigInsertPanel, uploadFigureFile,
 *            saveFigure, removeFigure, moveFigure, insertBackgroundImage,
 *            applyBackgroundImage, deleteUploadedAsset
 *
 * ========================================================================
 * ERROR-TRACKING HOOKS (Phase 2 — uncomment + apply):
 *   applyInsert/applyAdjust orphan cleanup (editor.js ~2158,~2185): wrap
 *       deleteUploadedAsset in own try/catch + console.warn on failure (chunk-5 #4)
 *   removeFigInsertPanel (editor.js ~2215): explicit removeEventListener (chunk-5 #5)
 *   insertBackgroundImage file-input cancel (editor.js ~1538): cleanup on cancel (chunk-4 #2)
 *   every CRUD catch: console.error('[agf:figures] <op> failed', {sectionId, figureId, err})
 *   Phase 2: extract mutateFigure() shared helper (chunk-5 #6)
 *   Phase 2: decompose openFigurePanel into sub-builders (chunk-5 #1, chunk-4 #7)
 *
 * Suggested module-local log helpers (uncomment in Phase 2):
 *   const TAG  = '[agf:figures]';
 *   const log  = (...a) => console.log(TAG, ...a);
 *   const warn = (...a) => console.warn(TAG, ...a);
 *   const err  = (...a) => console.error(TAG, ...a);
 */

// === TAG SCAFFOLD (activated in Phase-2 polish pass) =========================
// NOTE: these are module-local consts valid under ES-module wiring (Strategy A).
// For Strategy-B concatenation, strip this block (see LOAD_ORDER.md).
  const TAG  = '[agf:figures]';
  const log  = (...a) => console.log(TAG, ...a);
  const warn = (...a) => console.warn(TAG, ...a);
  const err  = (...a) => console.error(TAG, ...a);

/* --- function insertFigure (editor.js lines 1636-1647) --- */
  function insertFigure(sectionEl) {
    openFigurePanel(sectionEl, null);
  }

  // ---------- insert text (context menu) -----------------------------------
  /**
   * insertText(sectionEl)
   * Prompts for text content, then persists it as an entry in section.data._texts.
   * Each entry has a stable id, content string, and optional style overrides.
   * The click-to-edit system picks it up via the data-field="_texts.N.content"
   * attribute emitted by the renderer.
   */

/* --- function openFigurePanel (editor.js lines 1985-2213) --- */
  function openFigurePanel(sectionEl, existingFigure) {
    removeFigInsertPanel();

    var isAdjust = !!existingFigure;
    var sid = sectionEl.getAttribute('data-section-id');
    var schemaId = sectionEl.getAttribute('data-schema') || 'general';

    // Internal state. Adjust mode pre-fills from the existing figure;
    // insert mode uses schema-renderer whitelist defaults (left/fit).
    var stPlacement = isAdjust ? (existingFigure.placement || 'left') : 'left';
    var stSize = isAdjust ? (existingFigure.size || 'fit') : 'fit';
    var stPosition = isAdjust ? (existingFigure.position || 'top') : 'top';
    var chosenFile = null;

    var panel = el('div', { class: 'fig-insert-panel' });

    // --- File picker ---
    // Insert: required (Insert disabled until a file is chosen).
    // Adjust: optional (a new file REPLACES the current src on Apply).
    panel.appendChild(el('div', { class: 'enhance-field' }, [
      el('label', { text: isAdjust ? 'Replace image (optional)' : 'Image' }),
    ]));
    var fileInput = el('input', { type: 'file', accept: 'image/*' });
    fileInput.style.display = 'none';
    var fileLabel = el('span', {
      class: 'fig-file-name',
      text: isAdjust ? (existingFigure.src || 'No change') : 'No file chosen',
    });
    var pickBtn = el('button', {
      type: 'button',
      class: 'fig-pick-btn',
      text: 'Choose…',
      onClick: function () { fileInput.click(); },
    });
    fileInput.addEventListener('change', function () {
      chosenFile = fileInput.files[0] || null;
      fileLabel.textContent = chosenFile ? chosenFile.name : (isAdjust ? (existingFigure.src || 'No change') : 'No file chosen');
      applyBtn.disabled = isAdjust ? false : !chosenFile;
    });
    var fileRow = el('div', { class: 'fig-file-row' });
    fileRow.appendChild(pickBtn);
    fileRow.appendChild(fileLabel);
    fileRow.appendChild(fileInput);
    panel.appendChild(fileRow);

    // --- Placement: Left / Center / Right (reuse enh-align-group/btn) ---
    panel.appendChild(el('div', { class: 'enhance-field' }, [
      el('label', { text: 'Placement' }),
    ]));
    var placeGroup = el('div', { class: 'enh-align-group' });
    [
      { value: 'left', label: 'Left' },
      { value: 'center', label: 'Center' },
      { value: 'right', label: 'Right' },
    ].forEach(function (opt) {
      var btn = el('button', {
        type: 'button',
        class: 'enh-align-btn' + (stPlacement === opt.value ? ' is-active' : ''),
        text: opt.label,
        onClick: function () {
          stPlacement = opt.value;
          placeGroup.querySelectorAll('.enh-align-btn').forEach(function (b) { b.classList.remove('is-active'); });
          btn.classList.add('is-active');
        },
      });
      placeGroup.appendChild(btn);
    });
    panel.appendChild(placeGroup);

    // --- Size: Original / Full Section / Fit ---
    panel.appendChild(el('div', { class: 'enhance-field' }, [
      el('label', { text: 'Size' }),
    ]));
    var sizeGroup = el('div', { class: 'enh-align-group' });
    [
      { value: 'original', label: 'Original' },
      { value: 'full', label: 'Full Section' },
      { value: 'fit', label: 'Fit' },
    ].forEach(function (opt) {
      var btn = el('button', {
        type: 'button',
        class: 'enh-align-btn' + (stSize === opt.value ? ' is-active' : ''),
        text: opt.label,
        onClick: function () {
          stSize = opt.value;
          sizeGroup.querySelectorAll('.enh-align-btn').forEach(function (b) { b.classList.remove('is-active'); });
          btn.classList.add('is-active');
        },
      });
      sizeGroup.appendChild(btn);
    });
    panel.appendChild(sizeGroup);

    // --- Position: Top / After-Heading / Bottom (option B wave 4) ---
    panel.appendChild(el('div', { class: 'enhance-field' }, [
      el('label', { text: 'Position' }),
    ]));
    var posGroup = el('div', { class: 'enh-align-group' });
    [
      { value: 'top', label: 'Top' },
      { value: 'after-head', label: 'After Heading' },
      { value: 'bottom', label: 'Bottom' },
    ].forEach(function (opt) {
      var btn = el('button', {
        type: 'button',
        class: 'enh-align-btn' + (stPosition === opt.value ? ' is-active' : ''),
        text: opt.label,
        onClick: function () {
          stPosition = opt.value;
          posGroup.querySelectorAll('.enh-align-btn').forEach(function (b) { b.classList.remove('is-active'); });
          btn.classList.add('is-active');
        },
      });
      posGroup.appendChild(btn);
    });
    panel.appendChild(posGroup);

    // --- Caption (optional) ---
    var captionInput = el('input', {
      type: 'text',
      class: 'enh-input fig-caption-input',
      placeholder: 'Caption (optional)',
      value: isAdjust ? (existingFigure.caption || '') : '',
    });
    panel.appendChild(el('div', { class: 'enhance-field' }, [
      el('label', { text: 'Caption' }),
      captionInput,
    ]));

    // --- Actions ---
    var actions = el('div', { class: 'fig-insert-actions' });
    actions.appendChild(el('button', {
      type: 'button',
      class: 'fig-cancel',
      text: 'Cancel',
      onClick: function () { removeFigInsertPanel(); },
    }));
    var applyBtn = el('button', {
      type: 'button',
      class: 'fig-apply',
      text: isAdjust ? 'Apply' : 'Insert',
      disabled: !isAdjust, // insert requires a file; adjust is always enabled
      onClick: function () {
        applyBtn.disabled = true;
        if (isAdjust) {
          applyAdjust();
        } else {
          applyInsert();
        }
      },
    });
    actions.appendChild(applyBtn);
    panel.appendChild(actions);

    // Position near the section element (mirrors openBgSettingsPanel).
    var rect = sectionEl.getBoundingClientRect();
    panel.style.position = 'fixed';
    panel.style.top = Math.max(8, rect.top - 8) + 'px';
    panel.style.left = Math.min(window.innerWidth - 288, rect.right + 12) + 'px';

    document.body.appendChild(panel);

    // Close on outside click (mirrors openBgSettingsPanel).
    setTimeout(function () {
      document.addEventListener('mousedown', function onDocClick(ev) {
        if (!panel.contains(ev.target) && !sectionEl.contains(ev.target)) {
          removeFigInsertPanel();
          document.removeEventListener('mousedown', onDocClick);
        }
      });
    }, 0);

    // --- INSERT path: file is required; upload then saveFigure (new id). ---
    async function applyInsert() {
      if (!chosenFile) { applyBtn.disabled = false; return; }
      var relativePath = await uploadFigureFile(sectionEl, chosenFile);
      if (!relativePath) { applyBtn.disabled = false; return; }
      var fig = {
        id: shortId(),
        src: relativePath,
        placement: stPlacement,
        size: stSize,
        position: stPosition,
        caption: captionInput.value || '',
      };
      try {
        await saveFigure(sid, schemaId, fig);
        removeFigInsertPanel();
      } catch (err) {
        // Orphan cleanup (Ticket #20 pattern): the upload landed but the
        // section PUT failed, so the file would be stranded. Best-effort.
        try { await deleteUploadedAsset(relativePath); }
        catch (cleanErr) { console.warn(TAG, 'orphan cleanup deleteUploadedAsset failed (insert)', { src: relativePath, error: cleanErr && cleanErr.message ? cleanErr.message : String(cleanErr) }); }
        console.error(TAG, 'applyInsert saveFigure failed', { sectionId: sid, error: err && err.message ? err.message : String(err) });
        toast('Figure save failed: ' + err.message, 'error');
        applyBtn.disabled = false;
      }
    }

    // --- ADJUST path: file is optional; upload-if-chosen then saveFigure
    //     (same id). If a new file was chosen, the OLD src is passed as
    //     oldSrc so saveFigure reclaims it after a successful PUT. ---
    async function applyAdjust() {
      var newSrc = existingFigure.src;
      var oldSrc = null;
      if (chosenFile) {
        var uploaded = await uploadFigureFile(sectionEl, chosenFile);
        if (!uploaded) { applyBtn.disabled = false; return; }
        oldSrc = existingFigure.src;
        newSrc = uploaded;
      }
      var fig = {
        id: existingFigure.id,
        src: newSrc,
        placement: stPlacement,
        size: stSize,
        position: stPosition,
        caption: captionInput.value || '',
      };
      try {
        await saveFigure(sid, schemaId, fig, oldSrc);
        removeFigInsertPanel();
      } catch (err) {
        // If we uploaded a replacement but the PUT failed, reclaim the
        // NEW file (the OLD src is still referenced by the live figure).
        if (chosenFile) {
          try { await deleteUploadedAsset(newSrc); }
          catch (cleanErr) { console.warn(TAG, 'orphan cleanup deleteUploadedAsset failed (adjust)', { src: newSrc, error: cleanErr && cleanErr.message ? cleanErr.message : String(cleanErr) }); }
        }
        console.error(TAG, 'applyAdjust saveFigure failed', { sectionId: sid, figureId: existingFigure && existingFigure.id, error: err && err.message ? err.message : String(err) });
        toast('Figure save failed: ' + err.message, 'error');
        applyBtn.disabled = false;
      }
    }
  }

/* --- function removeFigInsertPanel (editor.js lines 2215-2225) --- */
  function removeFigInsertPanel() {
    var panel = document.querySelector('.fig-insert-panel');
    if (panel) panel.remove();
  }

  /**
   * uploadFigureFile(sectionEl, file)
   * POSTs the file to /api/upload (spec 'figure') and returns the relative
   * path on success, or null on failure (after toasting). Shared by the
   * insert and adjust paths.
   */

/* --- function uploadFigureFile (editor.js lines 2226-2255) --- */
  async function uploadFigureFile(sectionEl, file) {
    var schemaId = sectionEl.getAttribute('data-schema') || 'general';
    var formData = new FormData();
    formData.append('category', 'sections');
    formData.append('slug', schemaId);
    formData.append('spec', 'figure');
    formData.append('file', file);
    try {
      var res = await fetch('/api/upload', { method: 'POST', body: formData });
      var data = await res.json();
      if (!data || !data.success) {
        toast((data && data.error) || 'Upload failed', 'error');
        return null;
      }
      return data.relativePath;
    } catch (err) {
      toast('Figure upload failed: ' + err.message, 'error');
      return null;
    }
  }

  /**
   * saveFigure(sectionId, schemaId, figureObj, oldSrc)
   * Shared persist helper for BOTH insert and adjust. Fresh-GETs the section,
   * UPSERTS the figure into data._figures BY STABLE ID (insert if new,
   * replace if the id already exists), reconciles convention fields, PUTs,
   * and refreshes. If oldSrc is provided and differs from the figure's new
   * src (i.e. the image was replaced during adjust), the orphaned OLD file
   * is reclaimed via deleteUploadedAsset after a successful PUT.
   */

/* --- function saveFigure (editor.js lines 2256-2286) --- */
  async function saveFigure(sectionId, schemaId, figureObj, oldSrc) {
    var section = await api('GET', API.sections + '/' + sectionId);
    var sData = section.data ? deepClone(section.data) : {};
    var figs = Array.isArray(sData._figures) ? sData._figures.slice() : [];
    var idx = figs.findIndex(function (f) { return f.id === figureObj.id; });
    if (idx >= 0) {
      figs[idx] = figureObj;
    } else {
      figs.push(figureObj);
    }
    sData._figures = figs;
    sData = await reconcileConventionFields('section', sectionId, sData);
    await api('PUT', API.sections + '/' + sectionId, {
      data: sData,
      title: section.title,
    });
    toast(idx >= 0 ? 'Figure updated.' : 'Figure inserted.', 'success');
    // Reclaim the OLD image file only after the PUT succeeded AND only if the
    // src actually changed (replace-on-adjust). Best-effort, never blocks.
    if (oldSrc && oldSrc !== figureObj.src) {
      await deleteUploadedAsset(oldSrc);
    }
    await refreshAfterEdit(sectionId, schemaId);
  }

  /**
   * removeFigure(sectionId, schemaId, figureId)
   * Fresh-GETs the section, SPLICES the figure out of data._figures BY STABLE
   * ID, PUTs, refreshes, then best-effort deletes the orphaned image file
   * (the src captured before the splice). Never blocks on a failed delete.
   */

/* --- function removeFigure (editor.js lines 2287-2317) --- */
  async function removeFigure(sectionId, schemaId, figureId) {
    var section = await api('GET', API.sections + '/' + sectionId);
    var sData = section.data ? deepClone(section.data) : {};
    var figs = Array.isArray(sData._figures) ? sData._figures.slice() : [];
    var idx = figs.findIndex(function (f) { return f.id === figureId; });
    if (idx < 0) {
      toast('Figure not found (it may have already been removed).', 'error');
      return;
    }
    var removedSrc = figs[idx].src;
    figs.splice(idx, 1);
    sData._figures = figs;
    sData = await reconcileConventionFields('section', sectionId, sData);
    await api('PUT', API.sections + '/' + sectionId, {
      data: sData,
      title: section.title,
    });
    toast('Figure removed.', 'success');
    await refreshAfterEdit(sectionId, schemaId);
    // Best-effort cleanup of the now-unreferenced image file.
    await deleteUploadedAsset(removedSrc);
  }

  /**
   * moveFigure(sectionId, schemaId, figureId, direction)
   * Reorders a figure within data._figures by swapping its array entry with
   * the previous (direction -1) or next (direction +1) entry. Fresh-GETs
   * the section, finds the figure BY STABLE ID, swaps, reconciles convention
   * fields, PUTs, and refreshes. Guards: no-op if the figure is at the edge
   * of the array or not found.
   */

/* --- function moveFigure (editor.js lines 2318-2350) --- */
  async function moveFigure(sectionId, schemaId, figureId, direction) {
    var section = await api('GET', API.sections + '/' + sectionId);
    var sData = section.data ? deepClone(section.data) : {};
    var figs = Array.isArray(sData._figures) ? sData._figures.slice() : [];
    var idx = figs.findIndex(function (f) { return f.id === figureId; });
    if (idx < 0) {
      toast('Figure not found (it may have already been removed).', 'error');
      return;
    }
    var swapWith = idx + direction;
    if (swapWith < 0 || swapWith >= figs.length) return;
    var tmp = figs[idx];
    figs[idx] = figs[swapWith];
    figs[swapWith] = tmp;
    sData._figures = figs;
    sData = await reconcileConventionFields('section', sectionId, sData);
    await api('PUT', API.sections + '/' + sectionId, {
      data: sData,
      title: section.title,
    });
    toast('Figure moved ' + (direction < 0 ? 'earlier.' : 'later.'), 'success');
    await refreshAfterEdit(sectionId, schemaId);
  }

  // ---------- background settings panel (size / position / opacity) ---------

  /**
   * openBgSettingsPanel(hostEl)
   * Opens a floating panel near the host element for adjusting background
   * image size, position, and opacity. Reads current values from the
   * element's data-bg-* attributes. Apply persists via persistBackgroundSettings;
   * Reset clears _background_settings (reverts to defaults).
   */

/* --- function insertBackgroundImage (editor.js lines 1532-1598) --- */
  function insertBackgroundImage(sectionEl, productSlug, productCard) {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);

    fileInput.addEventListener('change', async () => {
      const file = fileInput.files[0];
      fileInput.remove();
      if (!file) return;

      // Upload
      const formData = new FormData();
      const category = productSlug ? 'products' : 'sections';
      const slug = productSlug || (sectionEl && sectionEl.getAttribute('data-schema')) || 'general';
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

        if (productSlug && productCard) {
          // Store on product data
          const product = await api('GET', API.products + '/' + productSlug);
          const productData = product && product.data ? { ...product.data } : {};
          productData._background_image = imagePath;
          await api('PUT', API.products + '/' + productSlug, {
            name: product.name,
            category: product.category,
            status: product.status,
            data: productData,
          });
          // Apply immediately on the card element
          applyBackgroundImage(productCard, imagePath);
          toast('Background image set.', 'success');
        } else if (sectionEl) {
          // Store on section data
          const id = sectionEl.getAttribute('data-section-id');
          const section = await api('GET', API.sections + '/' + id);
          const sectionData = section && section.data ? { ...section.data } : {};
          sectionData._background_image = imagePath;
          await api('PUT', API.sections + '/' + id, {
            data: sectionData,
            title: section.title,
          });
          // Apply immediately on the section element
          applyBackgroundImage(sectionEl, imagePath);
          toast('Background image set.', 'success');
        }
      } catch (err) {
        toast('Image insert failed: ' + err.message, 'error');
      }
    });

    fileInput.click();
  }

  // Apply a background image to a DOM element with the overlay pattern

/* --- function applyBackgroundImage (editor.js lines 1599-1616) --- */
  function applyBackgroundImage(el, imagePath) {
    if (!el) return;
    el.setAttribute('data-bg-image', imagePath);
    el.style.backgroundImage = `url('${imagePath}')`;
    el.style.backgroundSize = 'cover';
    el.style.backgroundPosition = 'center';
  }

  // ---------- insert / adjust / remove figures (option B wave 2+3) --------
  /**
   * insertFigure(sectionEl)
   * Thin wrapper: opens the shared figure panel in INSERT mode (no existing
   * figure, file required). Kept as the context-menu entry point so the
   * section-menu call site is unchanged from Wave 2.
   */
  // --- Shared helpers used by the inline-figure + image-asset paths. ---
  // (These were originally inside the team-note canvas region; when that was
  //  removed they survived here because the figure/upload code still needs them.)

/* --- function deleteUploadedAsset (editor.js lines 1627-1634) --- */
  async function deleteUploadedAsset(relativePath) {
    if (!relativePath) return;
    try {
      await api('DELETE', '/api/upload?path=' + encodeURIComponent(relativePath));
    } catch (e) {
      console.warn('[agf] failed to clean up orphaned upload', relativePath, e);
    }
  }

