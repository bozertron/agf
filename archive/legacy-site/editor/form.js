/* ========================================================================
 * site/editor/form.js
 * Purpose: Schema->DOM form generation and DOM->data serialization
 * Module tag (Phase 2): [agf:form]
 *
 * EXTRACTED VERBATIM from site/editor.js by A-editor.extract.py on 2026-06-27T03:23:12.075228+00:00.
 * Function bodies are byte-identical to the source. Do NOT hand-edit logic;
 * edit the source and re-run the extractor.
 *
 * ========================================================================
 * REQUIRED IMPORTS (wire in Phase 2 — see A-editor.md §3.1):
 *   from ./core.js   : el, humanize, escapeHTML, toast, deepClone
 *   from ./schema.js : resolveSchema, defaultFor, isMarkdown
 *   from ./state.js  : currentEditSlug, currentEditCategory (image upload routing)
 *   Exports: generateForm, renderField, renderArrayField, renumberArray,
 *            createImageUploadField, collectForm, prune, getValueAtPath,
 *            setPathDeep, buildActions
 *
 * ========================================================================
 * ERROR-TRACKING HOOKS (Phase 2 — uncomment + apply):
 *   generateForm per-field (editor.js ~186-204): wrap renderField in try/catch,
 *       append placeholder + console.error('[agf:form] field render failed', {path, err}) (chunk-1 #9)
 *   createImageUploadField.uploadFile (editor.js ~514): client MIME + size guard (chunk-1 #1)
 *   createImageUploadField.uploadFile (editor.js ~514): disable zone + spinner during upload (chunk-1 #2)
 *   renderField boolean checkbox (editor.js ~253): add name attribute for a11y (chunk-1 #7)
 *   collectForm node walker (editor.js ~558): try/catch + console.warn on malformed data-path (chunk-2)
 *
 * Suggested module-local log helpers (uncomment in Phase 2):
 *   const TAG  = '[agf:form]';
 *   const log  = (...a) => console.log(TAG, ...a);
 *   const warn = (...a) => console.warn(TAG, ...a);
 *   const err  = (...a) => console.error(TAG, ...a);
 */

// === TAG SCAFFOLD (activated in Phase-2 polish pass) =========================
// NOTE: these are module-local consts valid under ES-module wiring (Strategy A).
// For Strategy-B concatenation, strip this block (see LOAD_ORDER.md).
  const TAG  = '[agf:form]';
  const log  = (...a) => console.log(TAG, ...a);
  const warn = (...a) => console.warn(TAG, ...a);
  const err  = (...a) => console.error(TAG, ...a);

/* --- function generateForm (editor.js lines 186-204) --- */
  function generateForm(schema, data, path) {
    const frag = document.createDocumentFragment();
    const s = resolveSchema(schema);
    if (!s) return frag;

    if (s.type === 'object' || s.properties) {
      const props = s.properties || {};
      Object.keys(props).forEach((key) => {
        const childPath = path ? path + '.' + key : key;
        const childSchema = resolveSchema(props[key]);
        const childData = data && typeof data === 'object' ? data[key] : undefined;
        // Per-field error boundary (chunk-1 #9): a single malformed field must
        // not abort the whole form. Render a placeholder + leave a breadcrumb.
        try {
          frag.appendChild(renderField(key, childSchema, childData, childPath));
        } catch (rfErr) {
          console.error(TAG, 'field render failed', { path: childPath, error: rfErr && rfErr.message ? rfErr.message : String(rfErr) });
          const ph = el('div', { class: 'form-field form-field--error', text: '⚠ Could not render ' + childPath });
          ph.setAttribute('data-path', childPath);
          frag.appendChild(ph);
        }
      });
      return frag;
    }
    // Top-level non-object — wrap in single field
    frag.appendChild(renderField(path || 'value', s, data, path || 'value'));
    return frag;
  }

/* --- function renderField (editor.js lines 206-341) --- */
  function renderField(key, schema, value, path) {
    let s = resolveSchema(schema);

    // Normalize array-type schema definitions to a single concrete type so the
    // widget selection below works for unions like ["string","integer"].
    if (s && Array.isArray(s.type)) {
      let picked = s.type.find((t) => t === 'integer' || t === 'number') ||
                   s.type.find((t) => t === 'boolean') ||
                   s.type.find((t) => t !== 'null') ||
                   s.type[0];
      s = Object.assign({}, s, { type: picked });
    }

    const label = humanize(key);

    // ----- image upload (uri-format strings or fields named *image*) -----
    if (s.type === 'string' && !Array.isArray(s.enum) &&
        (s.format === 'uri' || /image/i.test(key))) {
      return createImageUploadField(key, path, typeof value === 'string' ? value : '', s);
    }

    // ----- nested object → collapsible group -----
    if (s.type === 'object' && s.properties) {
      const group = el('div', { class: 'form-group', 'data-path': path });
      const isOpen = path.split('.').length <= 1; // top-level groups open
      const head = el('div', {
        class: 'form-group-header',
        onClick: (e) => {
          const body = group.querySelector(':scope > .form-group-body');
          const arrow = head.querySelector('.fg-arrow');
          if (!body) return;
          const open = body.classList.toggle('is-open');
          if (arrow) arrow.textContent = open ? '−' : '+';
        },
      }, [
        el('span', { text: label }),
        el('span', { class: 'fg-arrow', text: isOpen ? '−' : '+' }),
      ]);
      group.appendChild(head);
      const body = el('div', {
        class: 'form-group-body' + (isOpen ? ' is-open' : ''),
        'data-path': path,
      });
      const childData = (value && typeof value === 'object') ? value : {};
      Object.keys(s.properties).forEach((k) => {
        const cp = path + '.' + k;
        body.appendChild(renderField(k, s.properties[k], childData[k], cp));
      });
      group.appendChild(body);
      return group;
    }

    // ----- array -----
    if (s.type === 'array') {
      return renderArrayField(key, s, value, path, label);
    }

    // ----- enum string -----
    if (s.type === 'string' && Array.isArray(s.enum)) {
      const wrap = el('div', { class: 'form-field' });
      wrap.appendChild(el('label', { text: label }));
      const sel = el('select', {
        'data-path': path,
        'data-type': 'string',
      });
      // allow blank
      if (!s.enum.includes('') && value === undefined) {
        sel.appendChild(el('option', { value: '', text: '— select —' }));
      }
      s.enum.forEach((opt) => {
        const o = el('option', { value: opt, text: opt });
        if (value === opt) o.selected = true;
        sel.appendChild(o);
      });
      wrap.appendChild(sel);
      if (s.description) wrap.appendChild(el('p', { class: 'field-hint', text: s.description }));
      return wrap;
    }

    // ----- boolean -----
    if (s.type === 'boolean') {
      const wrap = el('div', { class: 'form-field form-field-inline' });
      const id = 'f_' + path.replace(/[^a-z0-9_]/gi, '_');
      const input = el('input', {
        type: 'checkbox',
        id,
        'data-path': path,
        'data-type': 'boolean',
      });
      if (value === true) input.checked = true;
      wrap.appendChild(input);
      wrap.appendChild(el('label', { for: id, text: label }));
      return wrap;
    }

    // ----- number / integer -----
    if (s.type === 'number' || s.type === 'integer') {
      const wrap = el('div', { class: 'form-field' });
      wrap.appendChild(el('label', { text: label }));
      const input = el('input', {
        type: 'number',
        'data-path': path,
        'data-type': s.type,
        step: s.type === 'integer' ? '1' : 'any',
      });
      if (typeof value === 'number') input.value = String(value);
      wrap.appendChild(input);
      if (s.description) wrap.appendChild(el('p', { class: 'field-hint', text: s.description }));
      return wrap;
    }

    // ----- string (text / textarea / uri) -----
    const wrap = el('div', { class: 'form-field' });
    wrap.appendChild(el('label', { text: label }));
    const useTextarea = isMarkdown(s) ||
      (typeof value === 'string' && (value.length > 80 || /\n/.test(value)));
    let input;
    if (useTextarea) {
      input = el('textarea', {
        'data-path': path,
        'data-type': 'string',
        rows: '4',
      });
      if (typeof value === 'string') {
        // Set textContent (default value) so the textarea's value survives
        // DOM serialization/reset. Unlike <input>, where assigning .value
        // also sets the value *content attribute* (default value), a
        // <textarea> has no value content attribute — its default value is
        // its text content. Without this, the textarea's default value is
        // empty, and any browser-level reset (insertion steps, reflow,
        // innerHTML round-trip) wipes the raw value, causing collectForm to
        // read an empty string and silently drop the field from the PUT.
        input.textContent = value;
        input.value = value;
      }
    } else {
      input = el('input', {
        type: s.format === 'uri' ? 'url' : 'text',
        'data-path': path,
        'data-type': 'string',
      });
      if (value !== undefined && value !== null) input.value = String(value);
    }
    wrap.appendChild(input);
    if (s.description) wrap.appendChild(el('p', { class: 'field-hint', text: s.description }));
    return wrap;
  }

/* --- function renderArrayField (editor.js lines 343-427) --- */
  function renderArrayField(key, schema, value, path, label) {
    const s = resolveSchema(schema);
    const itemSchema = resolveSchema(s.items || { type: 'string' });
    const arr = Array.isArray(value) ? value.slice() : [];

    const wrap = el('div', { class: 'form-field form-array', 'data-path': path });
    wrap.appendChild(el('label', { text: label }));

    // Array of primitive strings → tag/comma input
    if (itemSchema.type === 'string' && !Array.isArray(itemSchema.enum)) {
      const input = el('input', {
        type: 'text',
        'data-path': path,
        'data-type': 'array-string',
        placeholder: 'Comma-separated values',
      });
      input.value = arr.join(', ');
      wrap.appendChild(input);
      wrap.appendChild(el('p', { class: 'field-hint', text: 'Separate items with commas.' }));
      return wrap;
    }

    // Array of enum strings → multi-select via checkboxes
    if (itemSchema.type === 'string' && Array.isArray(itemSchema.enum)) {
      const box = el('div', {
        class: 'form-checks',
        'data-path': path,
        'data-type': 'array-enum',
      });
      itemSchema.enum.forEach((opt) => {
        const id = 'f_' + path.replace(/[^a-z0-9_]/gi, '_') + '_' + opt.replace(/[^a-z0-9_]/gi, '_');
        const cb = el('input', {
          type: 'checkbox',
          id,
          value: opt,
          'data-array-enum': '1',
        });
        if (arr.includes(opt)) cb.checked = true;
        const row = el('label', { class: 'check-row', for: id }, [cb, ' ' + opt]);
        box.appendChild(row);
      });
      wrap.appendChild(box);
      return wrap;
    }

    // Array of objects → repeatable fieldsets
    const items = el('div', { class: 'array-items', 'data-array-items': path });

    function appendItem(itemValue, idx) {
      const itemPath = path + '.' + idx;
      const item = el('div', { class: 'array-item', 'data-array-index': String(idx) });
      const remove = el('button', {
        type: 'button',
        class: 'remove-item',
        title: 'Remove',
        text: '×',
        onClick: () => {
          item.remove();
          renumberArray(items, path);
        },
      });
      item.appendChild(remove);
      item.appendChild(generateForm(itemSchema, itemValue, itemPath));
      items.appendChild(item);
    }

    arr.forEach(appendItem);

    const addBtn = el('button', {
      type: 'button',
      class: 'add-array-item',
      text: '+ Add item',
      onClick: () => {
        const idx = items.querySelectorAll(':scope > .array-item').length;
        appendItem(defaultFor(itemSchema), idx);
      },
    });

    wrap.appendChild(items);
    wrap.appendChild(addBtn);
    return wrap;
  }

  // After removing an array item, rewrite all data-path attrs so indices are
  // contiguous (foo.0, foo.1, foo.2 …).

/* --- function renumberArray (editor.js lines 428-457) --- */
  function renumberArray(itemsEl, basePath) {
    const items = itemsEl.querySelectorAll(':scope > .array-item');
    items.forEach((item, newIdx) => {
      const oldIdx = item.getAttribute('data-array-index');
      if (oldIdx === String(newIdx)) return;
      item.setAttribute('data-array-index', String(newIdx));
      const oldPrefix = basePath + '.' + oldIdx;
      const newPrefix = basePath + '.' + newIdx;
      item.querySelectorAll('[data-path]').forEach((node) => {
        const p = node.getAttribute('data-path');
        if (p === oldPrefix || p.startsWith(oldPrefix + '.')) {
          node.setAttribute('data-path', newPrefix + p.slice(oldPrefix.length));
        }
      });
      item.querySelectorAll('[data-array-items]').forEach((node) => {
        const p = node.getAttribute('data-array-items');
        if (p === oldPrefix || p.startsWith(oldPrefix + '.')) {
          node.setAttribute('data-array-items', newPrefix + p.slice(oldPrefix.length));
        }
      });
    });
  }

  // ---------- image upload field ----------------------------------------
  /**
   * createImageUploadField(key, path, currentValue, schema)
   * Returns a .form-field containing a drag-and-drop upload zone bound to
   * POST /api/upload. The hidden input carries the resolved relative path
   * so the regular collectForm() walker still picks it up via data-path.
   */

/* --- function createImageUploadField (editor.js lines 458-557) --- */
  function createImageUploadField(key, path, currentValue, schema) {
    const wrap = el('div', { class: 'form-field' });
    wrap.appendChild(el('label', { text: humanize(key) }));

    const zone = el('div', { class: 'upload-zone', 'data-field': key });
    if (currentValue) {
      const img = el('img', {
        src: currentValue,
        class: 'upload-preview',
        alt: 'Current image',
      });
      zone.appendChild(img);
    }
    zone.appendChild(el('p', {
      html: 'Drag image here or <span class="upload-browse">click to browse</span>',
    }));

    const fileInput = el('input', {
      type: 'file',
      accept: 'image/*',
      style: 'display:none',
    });
    const hiddenInput = el('input', {
      type: 'hidden',
      name: key,
      'data-path': path,
      'data-type': 'string',
    });
    hiddenInput.value = currentValue || '';

    zone.appendChild(fileInput);
    zone.appendChild(hiddenInput);
    wrap.appendChild(zone);
    if (schema && schema.description) {
      wrap.appendChild(el('p', { class: 'field-hint', text: schema.description }));
    }

    zone.addEventListener('click', (e) => {
      // Don't re-trigger the picker if the click originated from the input.
      if (e.target === fileInput) return;
      fileInput.click();
    });
    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      zone.classList.add('is-dragover');
    });
    zone.addEventListener('dragleave', () => zone.classList.remove('is-dragover'));
    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.classList.remove('is-dragover');
      if (e.dataTransfer.files.length) uploadFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length) uploadFile(e.target.files[0]);
    });

    async function uploadFile(file) {
      const formData = new FormData();
      // NOTE: text fields must precede the file part so that multer's
      // diskStorage destination/filename callbacks see them in req.body.
      formData.append('category', currentEditCategory || 'products');
      formData.append('slug', currentEditSlug || 'general');
      formData.append('spec', key.replace(/_image$/, '').replace(/^image$/, 'hero'));
      formData.append('file', file);

      try {
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await res.json();
        if (data && data.success) {
          hiddenInput.value = data.relativePath;
          let preview = zone.querySelector('.upload-preview');
          if (preview) {
            preview.src = data.relativePath;
          } else {
            preview = el('img', {
              src: data.relativePath,
              class: 'upload-preview',
              alt: 'Uploaded',
            });
            zone.insertBefore(preview, zone.firstChild);
          }
          toast('Image uploaded', 'success');
        } else {
          toast((data && data.error) || 'Upload failed', 'error');
        }
      } catch (err) {
        toast('Upload failed: ' + err.message, 'error');
      }
    }

    return wrap;
  }

  // ---------- form data collection ---------------------------------------
  /**
   * collectForm(formRoot) → JSON value matching the schema structure.
   * Walks every [data-path] node, parses by data-type, and assigns into a
   * nested object/array by splitting the path on "." (numeric segments map
   * to array indices).
   */

/* --- function collectForm (editor.js lines 558-627) --- */
  function collectForm(formRoot, skipPrune) {
    const root = {};

    function setPath(obj, parts, value) {
      let cur = obj;
      for (let i = 0; i < parts.length - 1; i++) {
        const k = parts[i];
        const nextK = parts[i + 1];
        const wantArray = /^\d+$/.test(nextK);
        if (/^\d+$/.test(k)) {
          const idx = parseInt(k, 10);
          if (!Array.isArray(cur)) return; // shouldn't happen
          if (cur[idx] === undefined) cur[idx] = wantArray ? [] : {};
          cur = cur[idx];
        } else {
          if (cur[k] === undefined || cur[k] === null) cur[k] = wantArray ? [] : {};
          cur = cur[k];
        }
      }
      const last = parts[parts.length - 1];
      if (/^\d+$/.test(last)) cur[parseInt(last, 10)] = value;
      else cur[last] = value;
    }

    // First gather array-of-string and array-of-enum containers
    formRoot.querySelectorAll('[data-type="array-string"]').forEach((input) => {
      const p = input.getAttribute('data-path');
      const raw = input.value.trim();
      const arr = raw ? raw.split(',').map((s) => s.trim()).filter(Boolean) : [];
      setPath(root, p.split('.'), arr);
    });
    formRoot.querySelectorAll('[data-type="array-enum"]').forEach((box) => {
      const p = box.getAttribute('data-path');
      const arr = $$('input[type="checkbox"][data-array-enum="1"]', box)
        .filter((cb) => cb.checked).map((cb) => cb.value);
      setPath(root, p.split('.'), arr);
    });

    // Then primitive scalar fields
    formRoot.querySelectorAll('[data-path][data-type]').forEach((node) => {
      const t = node.getAttribute('data-type');
      if (t === 'array-string' || t === 'array-enum') return;
      const p = node.getAttribute('data-path');
      let v;
      if (t === 'boolean') v = node.checked === true;
      else if (t === 'number' || t === 'integer') {
        const raw = node.value.trim();
        if (raw === '') return; // omit empties
        const num = t === 'integer' ? parseInt(raw, 10) : parseFloat(raw);
        if (!Number.isFinite(num)) return;
        v = num;
      } else {
        const raw = node.value;
        // When skipPrune is active (per-item edit), PRESERVE explicit empty
        // strings so the user can intentionally clear a field. Without this,
        // clearing a field would silently keep the old value.
        if (raw == null) return;
        if (raw === '' && !skipPrune) return; // full-form: omit blanks as before
        v = raw;
      }
      setPath(root, p.split('.'), v);
    });

    // Drop empty objects/arrays so the API stays clean.
    // NOTE: pruning compacts sparse arrays (e.g. [,,,{x}] → [{x}]) which
    // DESTROYS array-index paths like tenets.3.anchor_phrase. Callers that
    // resolve a value by dot-path (performSave) must pass skipPrune=true so
    // the sparse structure is preserved for getValueAtPath.
    return skipPrune ? root : prune(root);
  }

/* --- function prune (editor.js lines 629-663) --- */
  function prune(value) {
    if (Array.isArray(value)) {
      // Sparse-safe: preserve interior holes so array-index paths (e.g.
      // tenets.3.anchor_phrase) are not compacted away.  We prune each
      // element but keep ALL slots (including undefined), then drop only the
      // trailing run of undefined so contiguous callers see identical output.
      // NOTE: forEach/map skip holes — must use a manual for-loop to visit them.
      const out = [];
      for (let i = 0; i < value.length; i++) {
        out.push(prune(value[i]));
      }
      while (out.length && out[out.length - 1] === undefined) out.pop();
      return out;
    }
    if (value && typeof value === 'object') {
      const out = {};
      Object.keys(value).forEach((k) => {
        const v = prune(value[k]);
        if (v === undefined) return;
        if (v && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0) return;
        out[k] = v;
      });
      return out;
    }
    return value;
  }

/* --- function getValueAtPath (editor.js lines 671-680) --- */
  function getValueAtPath(obj, parts) {
    let cur = obj;
    for (const p of parts) {
      if (cur == null) return undefined;
      cur = cur[p];
    }
    return cur;
  }

  // Deep-set a value at a dot-path in a target object (creates intermediates).

/* --- function setPathDeep (editor.js lines 681-695) --- */
  function setPathDeep(target, parts, value) {
    let cur = target;
    for (let i = 0; i < parts.length - 1; i++) {
      const k = parts[i];
      const nextK = parts[i + 1];
      const wantArray = /^\d+$/.test(nextK);
      if (cur[k] == null) cur[k] = wantArray ? [] : {};
      cur = cur[k];
    }
    const last = parts[parts.length - 1];
    cur[last] = value;
  }

  // Navigate a JSON schema along a dot-path, returning the sub-schema node
  // at the destination. Numeric segments traverse into `.items`.

/* --- function buildActions (editor.js lines 3955-3962) --- */
  function buildActions(onSave, onCancel) {
    return el('div', { class: 'form-actions' }, [
      el('button', { type: 'button', class: 'btn-save', text: 'Save', onClick: onSave }),
      el('button', { type: 'button', class: 'btn-cancel', text: 'Cancel', onClick: onCancel }),
    ]);
  }



