/* ========================================================================
 * site/editor/inserted-text.js
 * Purpose: Inserted-text CRUD + drag/resize/inline-edit interactions
 * Module tag (Phase 2): [agf:inserted-text]
 *
 * EXTRACTED VERBATIM from site/editor.js by A-editor.extract.py on 2026-06-27T03:23:12.075965+00:00.
 * Function bodies are byte-identical to the source. Do NOT hand-edit logic;
 * edit the source and re-run the extractor.
 *
 * ========================================================================
 * REQUIRED IMPORTS (wire in Phase 2 — see A-editor.md §3.1):
 *   from ./core.js   : el, $, toast, api, deepClone, API, escapeHTML
 *   from ./schema.js : getSchema
 *   from ./section-form.js : refreshAfterEdit, reconcileConventionFields
 *   Exports: insertText, saveInsertedText, bindInsertedTextDrag,
 *            bindInsertedTextResize, bindInsertedTextEdit
 *
 * ========================================================================
 * ERROR-TRACKING HOOKS (Phase 2 — uncomment + apply):
 *   insertText (editor.js ~1648): add missing `await` on saveInsertedText (chunk-4 #1, MEDIUM)
 *   _persist* catches (editor.js ~1762,~1847,~1952): console.error with textId context
 *   drag/resize move handlers (editor.js ~1733,~1821): abort if !_itDrag.el.isConnected
 *       (chunk-4 #4,#5 listener leak)
 *   _commitInsertedTextEdit regex strip (editor.js ~1937): switch to DOM-based cleanup
 *       (chunk-4 #3 fragile regex)
 *   Phase 2: extract persistTextProperty() shared helper (chunk-4 #6)
 *
 * Suggested module-local log helpers (uncomment in Phase 2):
 *   const TAG  = '[agf:inserted-text]';
 *   const log  = (...a) => console.log(TAG, ...a);
 *   const warn = (...a) => console.warn(TAG, ...a);
 *   const err  = (...a) => console.error(TAG, ...a);
 */

// === TAG SCAFFOLD (activated in Phase-2 polish pass) =========================
// NOTE: these are module-local consts valid under ES-module wiring (Strategy A).
// For Strategy-B concatenation, strip this block (see LOAD_ORDER.md).
  const TAG  = '[agf:inserted-text]';
  const log  = (...a) => console.log(TAG, ...a);
  const warn = (...a) => console.warn(TAG, ...a);
  const err  = (...a) => console.error(TAG, ...a);

  let _itDrag    = null;
  let _itResize  = null;
  let _itEditing = null;

/* --- function insertText (editor.js lines 1648-1669) --- */
  function insertText(sectionEl, evt) {
    var text = prompt('Enter text to insert:');
    if (!text || !text.trim()) return;
    var sid = sectionEl.getAttribute('data-section-id');
    var schemaId = sectionEl.getAttribute('data-schema');
    if (!sid) { toast('Missing section ID.', 'error'); return; }
    // Calculate percentage-based position relative to the section container
    var position = null;
    if (evt && sectionEl.getBoundingClientRect) {
      var rect = sectionEl.getBoundingClientRect();
      var pctX = Math.max(0, Math.min(100, ((evt.clientX - rect.left) / rect.width) * 100));
      var pctY = Math.max(0, Math.min(100, ((evt.clientY - rect.top) / rect.height) * 100));
      position = { top: Math.round(pctY * 10) / 10, left: Math.round(pctX * 10) / 10 };
    }
    saveInsertedText(sid, schemaId, { id: 'txt-' + Date.now(), content: text.trim(), position: position });
  }

  /**
   * saveInsertedText(sectionId, schemaId, textObj)
   * Fresh-GETs the section, appends/upserts the text entry in data._texts,
   * PUTs back, and refreshes.
   */

/* --- function saveInsertedText (editor.js lines 1670-1695) --- */
  async function saveInsertedText(sectionId, schemaId, textObj) {
    var section = await api('GET', API.sections + '/' + sectionId);
    var sData = section.data ? deepClone(section.data) : {};
    var texts = Array.isArray(sData._texts) ? sData._texts.slice() : [];
    var idx = texts.findIndex(function (t) { return t.id === textObj.id; });
    if (idx >= 0) {
      texts[idx] = textObj;
    } else {
      texts.push(textObj);
    }
    sData._texts = texts;
    sData = await reconcileConventionFields('section', sectionId, sData);
    await api('PUT', API.sections + '/' + sectionId, {
      data: sData,
      title: section.title,
    });
    toast(idx >= 0 ? 'Text updated.' : 'Text inserted.', 'success');
    await refreshAfterEdit(sectionId, schemaId);
  }

  // ---------- drag-to-reposition inserted text ---------------------------------
  /**
   * bindInsertedTextDrag()
   * Makes .inserted-text elements draggable via mousedown/mousemove/mouseup.
   * On drop, persists the new position (percentage-based) to the server.
   */

/* --- function bindInsertedTextDrag (editor.js lines 1696-1701) --- */
  function bindInsertedTextDrag() {
    var app = document.getElementById('app');
    if (!app) return;
    app.removeEventListener('mousedown', _handleInsertedTextDragStart);
    app.addEventListener('mousedown', _handleInsertedTextDragStart);
  }

/* --- function _handleInsertedTextDragStart (editor.js lines 1705-1731) --- */
  function _handleInsertedTextDragStart(e) {
    // Skip if click is on the resize handle
    if (e.target.closest('.it-resize-handle')) return;
    var target = e.target.closest('.inserted-text');
    if (!target) return;
    // Only drag with left button
    if (e.button !== 0) return;
    // Suppress drag while inline-editing
    if (target.dataset.itDragDisabled || target.getAttribute('contenteditable') === 'true') return;
    e.preventDefault();
    var section = target.closest('[data-section-id]');
    if (!section) return;
    var rect = section.getBoundingClientRect();
    _itDrag = {
      el: target,
      section: section,
      startX: e.clientX,
      startY: e.clientY,
      origTop: parseFloat(target.style.top) || 50,
      origLeft: parseFloat(target.style.left) || 50,
      sectionWidth: rect.width,
      sectionHeight: rect.height
    };
    document.addEventListener('mousemove', _handleInsertedTextDragMove);
    document.addEventListener('mouseup', _handleInsertedTextDragEnd);
    target.style.cursor = 'grabbing';
  }

/* --- function _handleInsertedTextDragMove (editor.js lines 1733-1743) --- */
  function _handleInsertedTextDragMove(e) {
    if (!_itDrag) return;
    var dx = e.clientX - _itDrag.startX;
    var dy = e.clientY - _itDrag.startY;
    var newTop = _itDrag.origTop + (dy / _itDrag.sectionHeight) * 100;
    var newLeft = _itDrag.origLeft + (dx / _itDrag.sectionWidth) * 100;
    newTop = Math.max(0, Math.min(100, newTop));
    newLeft = Math.max(0, Math.min(100, newLeft));
    _itDrag.el.style.top = newTop + '%';
    _itDrag.el.style.left = newLeft + '%';
  }

/* --- function _handleInsertedTextDragEnd (editor.js lines 1745-1760) --- */
  function _handleInsertedTextDragEnd(e) {
    if (!_itDrag) return;
    document.removeEventListener('mousemove', _handleInsertedTextDragMove);
    document.removeEventListener('mouseup', _handleInsertedTextDragEnd);
    _itDrag.el.style.cursor = 'grab';
    // Persist the new position
    var newTop = parseFloat(_itDrag.el.style.top) || 50;
    var newLeft = parseFloat(_itDrag.el.style.left) || 50;
    var textId = _itDrag.el.getAttribute('data-text-id');
    var sid = _itDrag.section.getAttribute('data-section-id');
    var schemaId = _itDrag.section.getAttribute('data-schema');
    _itDrag = null;
    if (textId && sid) {
      _persistTextPosition(sid, schemaId, textId, { top: Math.round(newTop * 10) / 10, left: Math.round(newLeft * 10) / 10 });
    }
  }

/* --- function _persistTextPosition (editor.js lines 1762-1789) --- */
  async function _persistTextPosition(sectionId, schemaId, textId, position) {
    try {
      var section = await api('GET', API.sections + '/' + sectionId);
      var sData = section.data ? deepClone(section.data) : {};
      var texts = Array.isArray(sData._texts) ? sData._texts.slice() : [];
      var idx = texts.findIndex(function (t) { return t.id === textId; });
      if (idx < 0) return;
      texts[idx] = Object.assign({}, texts[idx], { position: position });
      sData._texts = texts;
      sData = await reconcileConventionFields('section', sectionId, sData);
      await api('PUT', API.sections + '/' + sectionId, {
        data: sData,
        title: section.title,
      });
    } catch (err) {
      toast('Failed to save position.', 'error');
      return;
    }
    // Refresh in-memory state so subsequent saves use fresh _texts data.
    try { await refreshAfterEdit(sectionId, schemaId); } catch (e) { /* best-effort */ }
  }

  // ---------- corner-drag resize for inserted text width -------------------------
  /**
   * bindInsertedTextResize()
   * Makes the .it-resize-handle inside .inserted-text elements trigger a
   * horizontal-only resize. On mouseup, persists the new width to the server.
   */

/* --- function bindInsertedTextResize (editor.js lines 1790-1795) --- */
  function bindInsertedTextResize() {
    var app = document.getElementById('app');
    if (!app) return;
    app.removeEventListener('mousedown', _handleInsertedTextResizeStart);
    app.addEventListener('mousedown', _handleInsertedTextResizeStart);
  }

/* --- function _handleInsertedTextResizeStart (editor.js lines 1799-1819) --- */
  function _handleInsertedTextResizeStart(e) {
    var handle = e.target.closest('.it-resize-handle');
    if (!handle) return;
    var textEl = handle.closest('.inserted-text');
    if (!textEl) return;
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    var section = textEl.closest('[data-section-id]');
    if (!section) return;
    var currentWidth = textEl.offsetWidth;
    _itResize = {
      el: textEl,
      section: section,
      startX: e.clientX,
      origWidth: currentWidth
    };
    document.addEventListener('mousemove', _handleInsertedTextResizeMove);
    document.addEventListener('mouseup', _handleInsertedTextResizeEnd);
    textEl.style.cursor = 'ew-resize';
  }

/* --- function _handleInsertedTextResizeMove (editor.js lines 1821-1830) --- */
  function _handleInsertedTextResizeMove(e) {
    if (!_itResize) return;
    var dx = e.clientX - _itResize.startX;
    // Since transform: translate(-50%, -50%), the right edge is at center + width/2.
    // Moving right edge by dx means width changes by dx * 2 to account for centering,
    // but it's more intuitive to just do width + dx.
    var newWidth = Math.max(80, _itResize.origWidth + dx);
    _itResize.el.style.width = newWidth + 'px';
    _itResize.el.style.maxWidth = newWidth + 'px';
  }

/* --- function _handleInsertedTextResizeEnd (editor.js lines 1832-1845) --- */
  function _handleInsertedTextResizeEnd(e) {
    if (!_itResize) return;
    document.removeEventListener('mousemove', _handleInsertedTextResizeMove);
    document.removeEventListener('mouseup', _handleInsertedTextResizeEnd);
    _itResize.el.style.cursor = 'grab';
    var newWidth = Math.round(parseFloat(_itResize.el.style.width) || 300);
    var textId = _itResize.el.getAttribute('data-text-id');
    var sid = _itResize.section.getAttribute('data-section-id');
    var schemaId = _itResize.section.getAttribute('data-schema');
    _itResize = null;
    if (textId && sid) {
      _persistTextWidth(sid, schemaId, textId, newWidth);
    }
  }

/* --- function _persistTextWidth (editor.js lines 1847-1876) --- */
  async function _persistTextWidth(sectionId, schemaId, textId, width) {
    try {
      var section = await api('GET', API.sections + '/' + sectionId);
      var sData = section.data ? deepClone(section.data) : {};
      var texts = Array.isArray(sData._texts) ? sData._texts.slice() : [];
      var idx = texts.findIndex(function (t) { return t.id === textId; });
      if (idx < 0) return;
      texts[idx] = Object.assign({}, texts[idx], { width: width });
      sData._texts = texts;
      sData = await reconcileConventionFields('section', sectionId, sData);
      await api('PUT', API.sections + '/' + sectionId, {
        data: sData,
        title: section.title,
      });
    } catch (err) {
      toast('Failed to save width.', 'error');
      return;
    }
    // Refresh in-memory state so subsequent click-to-edit saves don't
    // overwrite the persisted width with stale data from the state cache.
    try { await refreshAfterEdit(sectionId, schemaId); } catch (e) { /* best-effort */ }
  }

  // ---------- double-click to edit inserted text inline -------------------------
  /**
   * bindInsertedTextEdit()
   * On double-click, makes an .inserted-text element contentEditable so the user
   * can change the text inline. On blur or Enter, persists the new content to the
   * server and exits edit mode. Dragging is suppressed while editing.
   */

/* --- function bindInsertedTextEdit (editor.js lines 1877-1882) --- */
  function bindInsertedTextEdit() {
    var app = document.getElementById('app');
    if (!app) return;
    app.removeEventListener('dblclick', _handleInsertedTextDblClick);
    app.addEventListener('dblclick', _handleInsertedTextDblClick);
  }

/* --- function _handleInsertedTextDblClick (editor.js lines 1886-1894) --- */
  function _handleInsertedTextDblClick(e) {
    if (e.target.closest('.it-resize-handle')) return;
    var target = e.target.closest('.inserted-text');
    if (!target) return;
    if (_itEditing === target) return; // already editing
    e.preventDefault();
    e.stopPropagation();
    _enterInsertedTextEditMode(target);
  }

/* --- function _enterInsertedTextEditMode (editor.js lines 1896-1911) --- */
  function _enterInsertedTextEditMode(el) {
    _itEditing = el;
    el.setAttribute('contenteditable', 'true');
    el.style.cursor = 'text';
    el.dataset.itDragDisabled = '1'; // flag to suppress drag
    el.focus();
    // Select all text for easy replacement
    var range = document.createRange();
    range.selectNodeContents(el);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    // Listen for blur and keydown to commit
    el.addEventListener('blur', _commitInsertedTextEdit);
    el.addEventListener('keydown', _handleInsertedTextEditKey);
  }

/* --- function _handleInsertedTextEditKey (editor.js lines 1913-1923) --- */
  function _handleInsertedTextEditKey(e) {
    // Enter creates line breaks (contenteditable default); Shift+Enter commits
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      e.target.blur(); // triggers _commitInsertedTextEdit via blur
    }
    if (e.key === 'Escape') {
      // Cancel: revert text (restore from server on next refresh) and exit
      e.target.blur();
    }
  }

/* --- function _commitInsertedTextEdit (editor.js lines 1925-1950) --- */
  function _commitInsertedTextEdit(e) {
    var el = e.target;
    el.removeEventListener('blur', _commitInsertedTextEdit);
    el.removeEventListener('keydown', _handleInsertedTextEditKey);
    el.setAttribute('contenteditable', 'false');
    el.style.cursor = 'grab';
    delete el.dataset.itDragDisabled;
    _itEditing = null;

    var newContent = (el.innerHTML || '').trim();
    // Strip the resize handle span that the renderer injects as a child —
    // it must never be persisted as part of the content string.
    newContent = newContent.replace(/<span[^>]*class="it-resize-handle"[^>]*><\/span>/gi, '').trim();
    // Strip empty wrappers that contenteditable may leave
    var stripped = newContent.replace(/<br\s*\/?>/gi, '').replace(/<[^>]+>/g, '').trim();
    if (!stripped) {
      toast('Text cannot be empty.', 'error');
      return;
    }
    var textId = el.getAttribute('data-text-id');
    var section = el.closest('[data-section-id]');
    if (!section || !textId) return;
    var sectionId = section.getAttribute('data-section-id');
    var schemaId = section.getAttribute('data-schema');
    _persistTextContent(sectionId, schemaId, textId, newContent);
  }

/* --- function _persistTextContent (editor.js lines 1952-1984) --- */
  async function _persistTextContent(sectionId, schemaId, textId, content) {
    try {
      var section = await api('GET', API.sections + '/' + sectionId);
      var sData = section.data ? deepClone(section.data) : {};
      var texts = Array.isArray(sData._texts) ? sData._texts.slice() : [];
      var idx = texts.findIndex(function (t) { return t.id === textId; });
      if (idx < 0) { toast('Text entry not found.', 'error'); return; }
      texts[idx] = Object.assign({}, texts[idx], { content: content });
      sData._texts = texts;
      sData = await reconcileConventionFields('section', sectionId, sData);
      await api('PUT', API.sections + '/' + sectionId, {
        data: sData,
        title: section.title,
      });
      toast('Text updated.', 'success');
    } catch (err) {
      toast('Failed to save text.', 'error');
      return;
    }
    // Refresh in-memory state so subsequent saves use fresh _texts data.
    try { await refreshAfterEdit(sectionId, schemaId); } catch (e) { /* best-effort */ }
  }

  /**
   * openFigurePanel(sectionEl, existingFigure)
   * Shared popover builder for BOTH insert (existingFigure === null) and
   * adjust (existingFigure pre-fills placement/size/caption). In adjust mode
   * the file picker is OPTIONAL — if a new file is chosen it replaces the
   * figure's src (and the old src is reclaimed). On Apply the panel calls
   * saveFigure(sectionId, schemaId, figureObj, oldSrc), which fresh-GETs,
   * upserts by id, reconciles convention fields, PUTs, and refreshes.
   * Mirrors openBgSettingsPanel positioning / close-on-outside-click.
   */

