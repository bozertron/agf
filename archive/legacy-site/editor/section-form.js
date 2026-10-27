/* ========================================================================
 * site/editor/section-form.js
 * Purpose: Add-section picker, section creation, display-order math, section edit overlay
 * Module tag (Phase 2): [agf:section-form]
 *
 * EXTRACTED VERBATIM from site/editor.js by A-editor.extract.py on 2026-06-27T03:23:12.075700+00:00.
 * Function bodies are byte-identical to the source. Do NOT hand-edit logic;
 * edit the source and re-run the extractor.
 *
 * ========================================================================
 * REQUIRED IMPORTS (wire in Phase 2 — see A-editor.md §3.1):
 *   from ./core.js   : el, $, $$, toast, api, escapeHTML, deepClone, API, cssAttrEscape
 *   from ./schema.js : getSchemaList, getSchema, resolveSchema, defaultFor
 *   from ./form.js   : generateForm, collectForm, buildActions
 *   from ./style-overrides.js : collectStyleOverrides, persistStyleOverrides
 *   Exports: openSchemaPicker, createSection, refreshAfterEdit, openSectionEdit,
 *            reconcileConventionFields
 *
 * ========================================================================
 * ERROR-TRACKING HOOKS (Phase 2 — uncomment + apply):
 *   createSection catch (editor.js ~3697): console.error('[agf:section-form]
 *       createSection failed', {schemaId, err}) (chunk-8)
 *   computeInsertOrder precision guard (editor.js ~3783): console.warn on gap collapse (chunk-8 #6)
 *   openSectionEdit save handlers (editor.js ~3890, ~3935): wrap collectForm in try/catch;
 *       warn if collected data has no keys (chunk-8 #3)
 *   openSchemaPicker click-outside (editor.js ~3690): store listener ref for cleanup (chunk-8 #5)
 *   Phase 2: extract preserveConventionFields() shared helper (chunk-8 #2, chunk-9 #1)
 *
 * Suggested module-local log helpers (uncomment in Phase 2):
 *   const TAG  = '[agf:section-form]';
 *   const log  = (...a) => console.log(TAG, ...a);
 *   const warn = (...a) => console.warn(TAG, ...a);
 *   const err  = (...a) => console.error(TAG, ...a);
 */

// === TAG SCAFFOLD (activated in Phase-2 polish pass) =========================
// NOTE: these are module-local consts valid under ES-module wiring (Strategy A).
// For Strategy-B concatenation, strip this block (see LOAD_ORDER.md).
  const TAG  = '[agf:section-form]';
  const log  = (...a) => console.log(TAG, ...a);
  const warn = (...a) => console.warn(TAG, ...a);
  const err  = (...a) => console.error(TAG, ...a);

/* --- function openSchemaPicker (editor.js lines 3652-3695) --- */
  async function openSchemaPicker(anchor) {
    $$('.schema-picker').forEach((n) => n.remove());

    let schemas;
    try {
      schemas = await getSchemaList();
    } catch (err) {
      toast('Could not load schemas: ' + err.message, 'error');
      return;
    }

    const picker = el('div', { class: 'schema-picker' });
    schemas
      .filter((sch) => sch.id !== 'product')
      .forEach((sch) => {
        const row = el('div', {
          class: 'schema-picker-item',
          onClick: async () => {
            picker.remove();
            await createSection(sch.id);
          },
        }, [
          el('span', { class: 'schema-picker-icon', text: sch.icon || '◆' }),
          el('div', { class: 'schema-picker-meta' }, [
            el('strong', { text: sch.name || sch.id }),
            sch.description ? el('p', { text: sch.description }) : null,
          ]),
        ]);
        picker.appendChild(row);
      });

    anchor.style.position = 'relative';
    anchor.appendChild(picker);

    // Click-outside to close
    setTimeout(() => {
      document.addEventListener('click', function onDocClick(e) {
        if (!picker.contains(e.target) && e.target !== anchor) {
          picker.remove();
          document.removeEventListener('click', onDocClick);
        }
      });
    }, 0);
  }

/* --- function createSection (editor.js lines 3697-3744) --- */
  async function createSection(schemaId) {
    try {
      const sch = await getSchema(schemaId);
      // Prefer structural defaults (empty strings/arrays/booleans) derived
      // from the schema itself, so the user always opens a clean form they
      // can fill in themselves. Fall back to sch.default_data (or {}) if
      // for some reason the schema_json isn't available.
      let defaultData = {};
      if (sch.schema_json && typeof sch.schema_json === 'object') {
        try {
          defaultData = defaultFor(sch.schema_json);
        } catch (_) {
          defaultData = sch.default_data && typeof sch.default_data === 'object'
            ? sch.default_data
            : {};
        }
      } else if (sch.default_data && typeof sch.default_data === 'object') {
        defaultData = sch.default_data;
      }
      const stateSecs = (window.AGF && window.AGF.state && window.AGF.state.sections) || [];
      const nextOrder = await computeInsertOrder(stateSecs);

      const created = await api('POST', API.sections, {
        schema_id: schemaId,
        title: sch.name || schemaId,
        data: defaultData,
        display_order: nextOrder,
        is_visible: true,
      });
      toast('Section added.', 'success');
      if (window.AGF && window.AGF.refreshAll) {
        await window.AGF.refreshAll();
      }
      // Scroll the freshly created section into view so it lands where the
      // user expected (directly below the last-clicked anchor).
      var newId = created && created.id != null ? String(created.id) : null;
      if (newId) {
        requestAnimationFrame(function () {
          var node = document.querySelector('[data-section-id="' + cssAttrEscape(newId) + '"]');
          if (node) node.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
      }
    } catch (err) {
      toast('Add failed: ' + err.message, 'error');
    }
  }

  // Escape a string for safe interpolation into a CSS attribute selector.

/* --- function computeInsertOrder (editor.js lines 3754-3783) --- */
  async function computeInsertOrder(stateSecs) {
    var sorted = stateSecs.slice().sort(function (a, b) {
      return (a.display_order || 0) - (b.display_order || 0);
    });
    function appendMax() {
      return sorted.reduce(function (m, s) {
        return Math.max(m, s.display_order || 0);
      }, 0) + 1;
    }
    if (!_lastAnchorSectionId) return appendMax();
    var anchorIdx = sorted.findIndex(function (s) {
      return String(s.id) === String(_lastAnchorSectionId);
    });
    if (anchorIdx === -1) return appendMax();
    var anchorOrder = sorted[anchorIdx].display_order || 0;
    // Anchor is the last section → just append after it.
    if (anchorIdx >= sorted.length - 1) return anchorOrder + 1;
    var nextOrder = sorted[anchorIdx + 1].display_order || 0;
    if (Math.abs(nextOrder - anchorOrder) < 0.0001) {
      // Precision guard: re-spread integer orders so there is room.
      await renumberSpread(sorted, anchorIdx);
      return anchorOrder + 1;
    }
    return (anchorOrder + nextOrder) / 2;
  }

  // Reassign contiguous integer display_order values to the anchor and all
  // sections below it, leaving a one-unit gap right after the anchor for the
  // incoming section. Sends parallel PATCH /api/sections/:id/order requests
  // and keeps window.AGF.state in sync.

/* --- function renumberSpread (editor.js lines 3784-3800) --- */
  async function renumberSpread(sorted, anchorIdx) {
    var base = Math.floor(sorted[anchorIdx].display_order || 0);
    var patches = [];
    for (var i = anchorIdx; i < sorted.length; i++) {
      var newOrd = base + (i - anchorIdx) + (i > anchorIdx ? 1 : 0);
      patches.push({ id: sorted[i].id, order: newOrd });
      sorted[i].display_order = newOrd;
    }
    await Promise.all(patches.map(function (p) {
      return api('PATCH', API.sections + '/' + encodeURIComponent(p.id) + '/order', {
        display_order: p.order,
      });
    }));
  }

  // Helper: refresh the correct container after editing a section.
  // Header/footer sections need renderHeaderFooter(); others use refreshSection.

/* --- function refreshAfterEdit (editor.js lines 3801-3813) --- */
  async function refreshAfterEdit(id, schemaId) {
    if (schemaId === 'header' || schemaId === 'footer') {
      if (window.AGF && window.AGF.refreshAll) {
        await window.AGF.refreshAll();
      }
    } else {
      if (window.AGF && window.AGF.refreshSection) {
        await window.AGF.refreshSection(id);
      }
    }
  }

  // ---------- inline section edit form -----------------------------------

/* --- function openSectionEdit (editor.js lines 3814-3953) --- */
  async function openSectionEdit(sec) {
    const id = sec.getAttribute('data-section-id');
    const schemaId = sec.getAttribute('data-schema');
    if (!id || !schemaId) {
      toast('Missing section metadata.', 'error');
      return;
    }
    // Already editing?
    if (sec.classList.contains('is-editing')) return;
    const existing = sec.querySelector(':scope > .edit-form-overlay');
    if (existing) { existing.remove(); sec.classList.remove('is-editing'); return; }

    let schema, section;
    try {
      [schema, section] = await Promise.all([
        getSchema(schemaId),
        api('GET', API.sections + '/' + id),
      ]);
    } catch (err) {
      toast('Load failed: ' + err.message, 'error');
      return;
    }

    sec.classList.add('is-editing');

    const overlay = el('div', { class: 'edit-form-overlay' });
    overlay.appendChild(el('h3', { text: 'Edit · ' + (schema.name || schemaId) }));

    const titleWrap = el('div', { class: 'form-field' }, [
      el('label', { text: 'Nav label (side-nav only — not shown on page)' }),
      el('input', {
        type: 'text',
        'data-meta': 'title',
        value: section.title || '',
      }),
      el('p', { class: 'field-hint', text: 'To edit the visible heading, click it directly on the page.' }),
    ]);
    overlay.appendChild(titleWrap);

    const formBody = el('div', { class: 'edit-form-body' });
    currentEditCategory = 'sections';
    currentEditSlug = (schemaId || section.schema_id || 'section').toString();
    formBody.appendChild(generateForm(schema.schema_json || {}, section.data || {}, ''));
    overlay.appendChild(formBody);

    // Appendix textarea + Cancel/Publish buttons
    const appendixWrap = el('div', { class: 'appendix-field' });
    appendixWrap.appendChild(el('label', { text: 'Appendix' }));
    const appendixTA = el('textarea', {
      placeholder: 'Add notes, thoughts, supporting detail for the appendix\u2026',
      text: section.data && section.data.appendix ? section.data.appendix : '',
    });
    appendixWrap.appendChild(appendixTA);
    const appendixActions = el('div', { class: 'appendix-actions' });
    appendixActions.appendChild(el('button', {
      type: 'button',
      class: 'btn-apx-cancel',
      text: 'Cancel',
      onClick: () => { appendixTA.value = ''; },
    }));
    appendixActions.appendChild(el('button', {
      type: 'button',
      class: 'btn-apx-publish',
      text: 'Publish to Appendix',
      onClick: async () => {
        let data;
        try { data = collectForm(formBody); }
        catch (cfErr) { console.error(TAG, 'collectForm failed (appendix publish)', { error: cfErr && cfErr.message ? cfErr.message : String(cfErr) }); toast('Could not read form: ' + cfErr.message, 'error'); return; }
        const titleInput = overlay.querySelector('input[data-meta="title"]');
        const title = titleInput ? titleInput.value.trim() : section.title;
        data.appendix = appendixTA.value.trim();
        // Merge style overrides (don't replace/drop persisted ones)
        const styleOverrides = collectStyleOverrides(sec);
        const mergedApxOverrides = Object.assign(
          {},
          (section.data && section.data._style_overrides) || {},
          styleOverrides || {}
        );
        if (Object.keys(mergedApxOverrides).length) data._style_overrides = mergedApxOverrides;
        if (section.data && section.data._background_image) data._background_image = section.data._background_image;
        if (section.data && section.data._background_settings) data._background_settings = section.data._background_settings;
        if (section.data && Array.isArray(section.data._figures) && section.data._figures.length) data._figures = section.data._figures;
        if (section.data && Array.isArray(section.data._texts) && section.data._texts.length) data._texts = section.data._texts;
        // Preserve image adjustment settings managed by the Adjust Image panel.
        if (section.data && section.data.image_settings) data.image_settings = section.data.image_settings;
        if (section.data && Array.isArray(section.data.squares)) {
          data.squares = data.squares || [];
          section.data.squares.forEach(function (sq, i) {
            if (sq && sq.image_settings && data.squares[i]) data.squares[i].image_settings = sq.image_settings;
          });
        }
        try {
          await reconcileConventionFields('section', id, data);
          await api('PUT', API.sections + '/' + id, { data, title });
          sec.classList.remove('is-editing');
          overlay.remove();
          toast('Appendix published.', 'success');
          await refreshAfterEdit(id, schemaId);
        } catch (err) {
          toast('Publish failed: ' + err.message, 'error');
        }
      },
    }));
    appendixWrap.appendChild(appendixActions);
    overlay.appendChild(appendixWrap);

    overlay.appendChild(buildActions(
      async () => {
        let data;
        try { data = collectForm(formBody); }
        catch (cfErr) { console.error(TAG, 'collectForm failed (section save)', { error: cfErr && cfErr.message ? cfErr.message : String(cfErr) }); toast('Could not read form: ' + cfErr.message, 'error'); return; }
        const titleInput = overlay.querySelector('input[data-meta="title"]');
        const title = titleInput ? titleInput.value.trim() : section.title;
        // Preserve existing appendix when saving section content
        data.appendix = section.data && section.data.appendix ? section.data.appendix : '';
        // Collect text-enhance style overrides and MERGE with existing
        // persisted overrides so a section-edit save never replaces or
        // drops overrides the user can't see on screen.
        const styleOverrides = collectStyleOverrides(sec);
        const mergedOverrides = Object.assign(
          {},
          (section.data && section.data._style_overrides) || {},
          styleOverrides || {}
        );
        data._style_overrides = Object.keys(mergedOverrides).length ? mergedOverrides : undefined;
        // Preserve _background_image if set
        if (section.data && section.data._background_image) data._background_image = section.data._background_image;
        if (section.data && section.data._background_settings) data._background_settings = section.data._background_settings;
        // Preserve _figures and _texts (convention fields NOT covered by
        // reconcileConventionFields in the race-free window between
        // form-open GET and save PUT).
        if (section.data && Array.isArray(section.data._figures) && section.data._figures.length) data._figures = section.data._figures;
        if (section.data && Array.isArray(section.data._texts) && section.data._texts.length) data._texts = section.data._texts;
        // Preserve image adjustment settings managed by the Adjust Image panel.
        if (section.data && section.data.image_settings) data.image_settings = section.data.image_settings;
        if (section.data && Array.isArray(section.data.squares)) {
          data.squares = data.squares || [];
          section.data.squares.forEach(function (sq, i) {
            if (sq && sq.image_settings && data.squares[i]) data.squares[i].image_settings = sq.image_settings;
          });
        }
        try {
          await reconcileConventionFields('section', id, data);
          await api('PUT', API.sections + '/' + id, { data, title });
          sec.classList.remove('is-editing');
          overlay.remove();
          await refreshAfterEdit(id, schemaId);
        } catch (err) {
          toast('Save failed: ' + err.message, 'error');
        }
      },
      () => {
        sec.classList.remove('is-editing');
        overlay.remove();
      }
    ));

    sec.appendChild(overlay);
    overlay.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

/* --- function reconcileConventionFields (editor.js lines 66-86) --- */
  async function reconcileConventionFields(hostType, hostIdOrSlug, merged) {
    var url = hostType === 'product'
      ? API.products + '/' + hostIdOrSlug
      : API.sections + '/' + hostIdOrSlug;
    var fresh;
    try {
      fresh = await api('GET', url);
    } catch (err) {
      throw new Error('Save aborted: could not verify persisted convention fields (' + err.message + ')');
    }
    if (fresh && fresh.data) {
      // Future-proof: backfill ANY `_`-prefixed convention field that exists
      // on the live record but is missing from `merged` (Ticket #24).
      Object.keys(fresh.data).forEach(function (k) {
        if (k.charAt(0) === '_' && fresh.data[k] && !merged[k]) {
          merged[k] = fresh.data[k];
        }
      });
    }
    return merged;
  }

