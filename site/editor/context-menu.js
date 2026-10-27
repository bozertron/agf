/* ========================================================================
 * site/editor/context-menu.js
 * Purpose: Right-click context menu (figure/product/structural/prelude/section)
 * Module tag (Phase 2): [agf:context-menu]
 *
 * EXTRACTED VERBATIM from site/editor.js by A-editor.extract.py on 2026-06-27T03:23:12.075518+00:00.
 * Function bodies are byte-identical to the source. Do NOT hand-edit logic;
 * edit the source and re-run the extractor.
 *
 * ========================================================================
 * REQUIRED IMPORTS (wire in Phase 2 — see A-editor.md §3.1):
 *   from ./core.js   : el, $, toast, API
 *   from ./figures.js        : openFigurePanel, insertFigure, removeFigure, moveFigure,
 *                               insertBackgroundImage
 *   from ./bg-settings.js    : openBgSettingsPanel
 *   from ./nudge-panel.js    : openNudgePanel
 *   from ./enhance-panel.js  : openEnhancePanel
 *   from ./inserted-text.js  : insertText
 *   from ./section-ops.js    : toggleVisibility, reorderSection, confirmDeleteSection
 *   from ./section-form.js   : openSectionEdit, openSchemaPicker
 *   from ./product-form.js   : openProductForm
 *   from ./confirm-dialog.js : confirmDialog
 *   Exports: bindContextMenu, removeContextMenu
 *   Phase 2: pass target explicitly instead of reading _contextTarget (chunk-3 #4)
 *
 * ========================================================================
 * ERROR-TRACKING HOOKS (Phase 2 — uncomment + apply):
 *   figure fresh-GET catch(e2) (editor.js ~1153): console.error('[agf:context-menu]
 *       figure fresh-GET failed', e2) BEFORE generic toast (chunk-3 #3)
 *   positionMenu (editor.js ~1313): also clamp left/top to >=8 (chunk-3 #2)
 *   Phase 2: decompose handleContextMenu into 5 builder fns (chunk-3 #1, HIGH tech-debt)
 *
 * Suggested module-local log helpers (uncomment in Phase 2):
 *   const TAG  = '[agf:context-menu]';
 *   const log  = (...a) => console.log(TAG, ...a);
 *   const warn = (...a) => console.warn(TAG, ...a);
 *   const err  = (...a) => console.error(TAG, ...a);
 */

// === TAG SCAFFOLD (activated in Phase-2 polish pass) =========================
// NOTE: these are module-local consts valid under ES-module wiring (Strategy A).
// For Strategy-B concatenation, strip this block (see LOAD_ORDER.md).
  const TAG  = '[agf:context-menu]';
  const log  = (...a) => console.log(TAG, ...a);
  const warn = (...a) => console.warn(TAG, ...a);
  const err  = (...a) => console.error(TAG, ...a);

/* --- state/constants: state: _contextTarget (editor.js lines 1093-1093) --- */
  let _contextTarget = null;

/* --- function removeContextMenu (editor.js lines 1078-1081) --- */
  function removeContextMenu() {
    const menu = document.querySelector('.section-context-menu');
    if (menu) menu.remove();
  }

/* --- function menuBtn (editor.js lines 1083-1092) --- */
  function menuBtn(text, onClick, extraClass) {
    return el('button', {
      type: 'button',
      class: extraClass || null,
      text,
      onClick: (e) => { e.stopPropagation(); onClick(); },
    });
  }

  // Tracks the element that was right-clicked, for use by Text Enhance

/* --- function handleContextMenu (editor.js lines 1095-1391) --- */
  function handleContextMenu(e) {
    // FIGURE right-click (option B wave 3): if the click landed on a rendered
    // <figure data-figure-id>, show a figure-specific Adjust/Remove menu
    // INSTEAD of the section menu. Resolve the host section from the figure's
    // nearest [data-section-id] ancestor for the persist calls.
    const figureEl = e.target.closest('figure[data-figure-id]');
    if (figureEl) {
      const figureHost = figureEl.closest('[data-section-id]');
      if (figureHost) {
        e.preventDefault();
        removeContextMenu();
        _contextTarget = e.target;
        _lastAnchorSectionId = figureHost.getAttribute('data-section-id');
        var figureId = figureEl.getAttribute('data-figure-id');
        var fSectionId = figureHost.getAttribute('data-section-id');
        var fSchemaId = figureHost.getAttribute('data-schema') || 'general';
        // Look up the live figure object from in-memory section state so the
        // Adjust popover can be pre-filled (placement/size/caption/src).
        // Also capture the full _figures array for the Move Earlier/Later
        // guards (count + index). In-memory state is sufficient for the UX
        // decision; the actual swap fresh-GETs for correctness.
        var existingFigure = null;
        var figArray = null;
        var figIndex = -1;
        if (window.AGF && window.AGF.state && window.AGF.state.sections) {
          var sec0 = window.AGF.state.sections.find(function (s) { return s.id === fSectionId; });
          var arr = sec0 && sec0.data && Array.isArray(sec0.data._figures) ? sec0.data._figures : null;
          if (arr) {
            figArray = arr;
            figIndex = arr.findIndex(function (f) { return f.id === figureId; });
            if (figIndex >= 0) existingFigure = arr[figIndex];
          }
        }
        const fmenu = el('div', { class: 'section-context-menu' });
        fmenu.appendChild(menuBtn('✏️ Adjust Figure', async function () {
          removeContextMenu();
          // If the live figure wasn't in in-memory state, fresh-GET the
          // section so the Adjust popover is pre-filled (never silently
          // degrade into insert mode).
          var fig = existingFigure;
          if (!fig) {
            try {
              var fresh = await api('GET', API.sections + '/' + fSectionId);
              var farr = fresh && fresh.data && Array.isArray(fresh.data._figures) ? fresh.data._figures : null;
              if (farr) fig = farr.find(function (f) { return f.id === figureId; }) || null;
            } catch (e2) { console.error(TAG, 'figure fresh-GET failed', { sectionId: fSectionId, figureId: figureId, error: e2 && e2.message ? e2.message : String(e2) }); /* fall through; toast below */ }
          }
          if (!fig) {
            toast('Could not load the figure for editing (try refreshing the page).', 'error');
            return;
          }
          openFigurePanel(figureHost, fig);
        }));
        // Move Earlier/Later (option B wave 4): visible only when the section
        // has 2+ figures. First figure can't move earlier, last can't move
        // later — those entries are omitted rather than greyed out.
        if (figArray && figArray.length >= 2) {
          if (figIndex > 0) {
            fmenu.appendChild(menuBtn('↑ Move Figure Earlier', function () {
              removeContextMenu();
              moveFigure(fSectionId, fSchemaId, figureId, -1);
            }));
          }
          if (figIndex >= 0 && figIndex < figArray.length - 1) {
            fmenu.appendChild(menuBtn('↓ Move Figure Later', function () {
              removeContextMenu();
              moveFigure(fSectionId, fSchemaId, figureId, 1);
            }));
          }
        }
        fmenu.appendChild(menuBtn('🗑 Remove Figure', function () {
          removeContextMenu();
          confirmDialog(
            'Remove this figure?',
            'The image will be detached from the section and its file deleted.',
            'Remove',
            function () { return removeFigure(fSectionId, fSchemaId, figureId); }
          );
        }, 'danger'));
        // Nudge: available when right-click target is inside a [data-field]
        var _nudgeFieldEl = e.target.closest('[data-field]');
        if (_nudgeFieldEl) {
          fmenu.appendChild(menuBtn('📐 Nudge position', function () {
            removeContextMenu();
            openNudgePanel(_nudgeFieldEl, figureHost);
          }));
        }
        positionMenu(fmenu, e);
        return;
      }
    }
    // Product card right-click: Edit + Insert Image + Text Enhance + Delete
    const card = e.target.closest('.product-card');
    if (card) {
      const slug = card.getAttribute('data-product-slug');
      if (slug) {
        e.preventDefault();
        removeContextMenu();
        _contextTarget = e.target;
        var cardAnchor = card.closest('[data-section-id]');
        if (cardAnchor) _lastAnchorSectionId = cardAnchor.getAttribute('data-section-id');
        const menu = el('div', { class: 'section-context-menu' });
        menu.appendChild(menuBtn('✏️ Edit', () => { removeContextMenu(); const ps = $('#products'); if (ps) openProductForm(slug, ps, card); }));
        menu.appendChild(menuBtn('🖼 Background Image…', () => { removeContextMenu(); insertBackgroundImage(null, slug, card); }));
        if (card.hasAttribute('data-bg-image')) {
          menu.appendChild(menuBtn('🎨 Adjust Background', () => { removeContextMenu(); openBgSettingsPanel(card); }));
        }
        menu.appendChild(menuBtn('✨ Text Enhance', () => { removeContextMenu(); openEnhancePanel(_contextTarget, card); }));
        // Nudge: available when right-click target is inside a [data-field]
        var _nudgeFieldProd = e.target.closest('[data-field]');
        if (_nudgeFieldProd) {
          menu.appendChild(menuBtn('📐 Nudge position', () => { removeContextMenu(); openNudgePanel(_nudgeFieldProd, card); }));
        }
        menu.appendChild(menuBtn('🗑 Delete', () => { removeContextMenu(); confirmDeleteProduct(slug); }, 'danger'));
        positionMenu(menu, e);
        return;
      }
    }
    // Header / Footer right-click: Edit + Insert Image + Text Enhance
    const structural = e.target.closest('.nav-inner[data-section-id], .foot-inner[data-section-id]');
    if (structural) {
      e.preventDefault();
      removeContextMenu();
      _contextTarget = e.target;
      _lastAnchorSectionId = structural.getAttribute('data-section-id');
      const menu = el('div', { class: 'section-context-menu' });
      menu.appendChild(menuBtn('✏️ Edit', () => { removeContextMenu(); openSectionEdit(structural); }));
      menu.appendChild(menuBtn('🖼 Background Image…', () => { removeContextMenu(); insertBackgroundImage(structural, null, null); }));
      if (structural.hasAttribute('data-bg-image')) {
        menu.appendChild(menuBtn('🎨 Adjust Background', () => { removeContextMenu(); openBgSettingsPanel(structural); }));
      }
      menu.appendChild(menuBtn('✨ Text Enhance', () => { removeContextMenu(); openEnhancePanel(_contextTarget, structural); }));
      // Nudge: available when right-click target is inside a [data-field]
      var _nudgeFieldStruct = e.target.closest('[data-field]');
      if (_nudgeFieldStruct) {
        menu.appendChild(menuBtn('📐 Nudge position', () => { removeContextMenu(); openNudgePanel(_nudgeFieldStruct, structural); }));
      }
      positionMenu(menu, e);
      return;
    }
    // Prelude square right-click: offer Remove Image / Change Image when the
    // square has a background-image, or Add Image if it doesn't.
    const preludeSquare = e.target.closest('.prelude-square');
    if (preludeSquare) {
      const preludeSec = preludeSquare.closest('[data-section-id]');
      if (preludeSec) {
        e.preventDefault();
        removeContextMenu();
        _contextTarget = e.target;
        _lastAnchorSectionId = preludeSec.getAttribute('data-section-id');
        const squareField = preludeSquare.getAttribute('data-field') || '';
        const squareIdx = parseInt(squareField.replace('squares.', ''), 10);
        const hasImage = preludeSquare.style.backgroundImage && preludeSquare.style.backgroundImage !== 'none' && preludeSquare.style.backgroundImage !== '';
        const pmenu = el('div', { class: 'section-context-menu' });

        // Upload / change image
        pmenu.appendChild(menuBtn(hasImage ? '🖼 Change Square Image…' : '🖼 Add Square Image…', function () {
          removeContextMenu();
          const fileInput = document.createElement('input');
          fileInput.type = 'file';
          fileInput.accept = 'image/*';
          fileInput.style.display = 'none';
          document.body.appendChild(fileInput);
          fileInput.addEventListener('change', async function () {
            const file = fileInput.files[0];
            if (!file) { fileInput.remove(); return; }
            const formData = new FormData();
            formData.append('file', file);
            formData.append('section_schema', 'prelude');
            try {
              const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
              const uploadData = await uploadRes.json();
              if (!uploadRes.ok) throw new Error(uploadData.error || 'Upload failed');
              const imgPath = uploadData.path || uploadData.url;
              // Update section data
              const sid = preludeSec.getAttribute('data-section-id');
              const schemaId = preludeSec.getAttribute('data-schema') || 'prelude';
              const section = await api('GET', API.sections + '/' + sid);
              const sData = section.data ? deepClone(section.data) : {};
              if (!Array.isArray(sData.squares)) sData.squares = [{}, {}, {}];
              while (sData.squares.length <= squareIdx) sData.squares.push({});
              sData.squares[squareIdx].image = imgPath;
              await api('PUT', API.sections + '/' + sid, { data: sData, title: section.title });
              toast('Square image updated.', 'success');
              await refreshAfterEdit(sid, schemaId);
            } catch (err) {
              toast('Square image upload failed: ' + err.message, 'error');
            }
            fileInput.remove();
          });
          fileInput.click();
        }));

        // Remove image (only when there IS an image)
        if (hasImage) {
          pmenu.appendChild(menuBtn('🗑 Remove Square Image', function () {
            removeContextMenu();
            confirmDialog(
              'Remove square image?',
              'The image will be removed from this prelude square.',
              'Remove',
              async function () {
                try {
                  const sid = preludeSec.getAttribute('data-section-id');
                  const schemaId = preludeSec.getAttribute('data-schema') || 'prelude';
                  const section = await api('GET', API.sections + '/' + sid);
                  const sData = section.data ? deepClone(section.data) : {};
                  if (Array.isArray(sData.squares) && sData.squares[squareIdx]) {
                    var oldSrc = sData.squares[squareIdx].image || null;
                    sData.squares[squareIdx].image = '';
                    await api('PUT', API.sections + '/' + sid, { data: sData, title: section.title });
                    toast('Square image removed.', 'success');
                    await refreshAfterEdit(sid, schemaId);
                    if (oldSrc) await deleteUploadedAsset(oldSrc);
                  }
                } catch (err) {
                  toast('Remove failed: ' + err.message, 'error');
                }
              }
            );
          }, 'danger'));
        }

        // Text Enhance on the square text
        pmenu.appendChild(menuBtn('✨ Text Enhance', function () {
          removeContextMenu();
          openEnhancePanel(_contextTarget, preludeSec);
        }));
        // Nudge: available when right-click target is inside a [data-field]
        var _nudgeFieldPrelude = e.target.closest('[data-field]');
        if (_nudgeFieldPrelude) {
          pmenu.appendChild(menuBtn('📐 Nudge position', function () {
            removeContextMenu();
            openNudgePanel(_nudgeFieldPrelude, preludeSec);
          }));
        }

        positionMenu(pmenu, e);
        return;
      }
    }
    // Section right-click: Edit, Insert Image, Text Enhance, Visibility, Reorder, Delete
    const sec = e.target.closest('[data-section-id]');
    if (!sec) return;
    e.preventDefault();
    removeContextMenu();
    _contextTarget = e.target;
    _lastAnchorSectionId = sec.getAttribute('data-section-id');

    const menu = el('div', { class: 'section-context-menu' });
    menu.appendChild(menuBtn('✏️ Edit', () => { removeContextMenu(); openSectionEdit(sec); }));
    menu.appendChild(menuBtn('🖼 Background Image…', () => { removeContextMenu(); insertBackgroundImage(sec, null, null); }));
    menu.appendChild(menuBtn('🖼 Inline Figure…', () => { removeContextMenu(); insertFigure(sec); }));
    menu.appendChild(menuBtn('📝 Insert Text', () => { removeContextMenu(); insertText(sec, e); }));
    if (sec.hasAttribute('data-bg-image')) {
      menu.appendChild(menuBtn('🎨 Adjust Background', () => { removeContextMenu(); openBgSettingsPanel(sec); }));
    }
    // Show Remove Figure option if section has inline figures — more
    // discoverable than requiring a right-click directly on the figure.
    var _secFigures = null;
    var _secId = sec.getAttribute('data-section-id');
    if (window.AGF && window.AGF.state && window.AGF.state.sections) {
      var _secState = window.AGF.state.sections.find(function (s) { return s.id === _secId; });
      if (_secState && _secState.data && Array.isArray(_secState.data._figures) && _secState.data._figures.length) {
        _secFigures = _secState.data._figures;
      }
    }
    if (_secFigures && _secFigures.length) {
      var _fSchemaId = sec.getAttribute('data-schema') || 'general';
      _secFigures.forEach(function (fig, idx) {
        var figLabel = fig.caption || fig.src.split('/').pop() || ('Figure ' + (idx + 1));
        menu.appendChild(menuBtn('🗑 Remove: ' + figLabel, function () {
          removeContextMenu();
          confirmDialog(
            'Remove this figure?',
            'The image "' + figLabel + '" will be detached and its file deleted.',
            'Remove',
            function () { return removeFigure(_secId, _fSchemaId, fig.id); }
          );
        }, 'danger'));
      });
    }
    menu.appendChild(menuBtn('✨ Text Enhance', () => { removeContextMenu(); openEnhancePanel(_contextTarget, sec); }));
    // Nudge: available when right-click target is inside a [data-field]
    var _nudgeFieldSec = e.target.closest('[data-field]');
    if (_nudgeFieldSec) {
      menu.appendChild(menuBtn('📐 Nudge position', () => { removeContextMenu(); openNudgePanel(_nudgeFieldSec, sec); }));
    }
    menu.appendChild(menuBtn('👁 Toggle Visibility', () => { removeContextMenu(); toggleVisibility(sec); }));
    // Move Up / Move Down — disabled at boundaries
    const _moveId = sec.getAttribute('data-section-id');
    const _moveSections = (window.AGF && window.AGF.state && window.AGF.state.sections) || [];
    const _moveSorted = _moveSections.slice().sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    const _moveIdx = _moveSorted.findIndex((x) => x.id === _moveId);
    const _isFirst = _moveIdx <= 0;
    const _isLast = _moveIdx >= _moveSorted.length - 1;
    const moveUpBtn = menuBtn('⬆ Move Up', () => { removeContextMenu(); reorderSection(sec, -1); });
    if (_isFirst) { moveUpBtn.disabled = true; moveUpBtn.style.opacity = '0.4'; moveUpBtn.style.pointerEvents = 'none'; }
    menu.appendChild(moveUpBtn);
    const moveDownBtn = menuBtn('⬇ Move Down', () => { removeContextMenu(); reorderSection(sec, 1); });
    if (_isLast) { moveDownBtn.disabled = true; moveDownBtn.style.opacity = '0.4'; moveDownBtn.style.pointerEvents = 'none'; }
    menu.appendChild(moveDownBtn);
    menu.appendChild(menuBtn('🗑 Delete', () => { removeContextMenu(); confirmDeleteSection(sec); }, 'danger'));
    positionMenu(menu, e);
  }

/* --- function positionMenu (editor.js lines 1393-1407) --- */
  function positionMenu(menu, e) {
    menu.style.left = e.clientX + 'px';
    menu.style.top = e.clientY + 'px';
    document.body.appendChild(menu);
    const rect = menu.getBoundingClientRect();
    if (rect.right > window.innerWidth) menu.style.left = (window.innerWidth - rect.width - 8) + 'px';
    if (rect.bottom > window.innerHeight) menu.style.top = (window.innerHeight - rect.height - 8) + 'px';
    // Close on any outside click
    setTimeout(() => {
      document.addEventListener('click', function onDocClick() {
        removeContextMenu();
        document.removeEventListener('click', onDocClick);
      });
    }, 0);
  }

/* --- function bindContextMenu (editor.js lines 1409-1427) --- */
  function bindContextMenu() {
    const app = $('#app');
    if (!app) return;
    app.removeEventListener('contextmenu', handleContextMenu);
    app.addEventListener('contextmenu', handleContextMenu);
    // Also bind on header and footer containers
    const nav = $('header.nav');
    if (nav) {
      nav.removeEventListener('contextmenu', handleContextMenu);
      nav.addEventListener('contextmenu', handleContextMenu);
    }
    const foot = $('footer.foot');
    if (foot) {
      foot.removeEventListener('contextmenu', handleContextMenu);
      foot.addEventListener('contextmenu', handleContextMenu);
    }
  }

