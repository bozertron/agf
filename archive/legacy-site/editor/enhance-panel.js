/* ========================================================================
 * site/editor/enhance-panel.js
 * Purpose: Text Enhance panel (typography/color/paragraph/placement/width) + removeTextField
 * Module tag (Phase 2): [agf:enhance-panel]
 *
 * EXTRACTED VERBATIM from site/editor.js by A-editor.extract.py on 2026-06-27T03:23:12.076104+00:00.
 * Function bodies are byte-identical to the source. Do NOT hand-edit logic;
 * edit the source and re-run the extractor.
 *
 * ========================================================================
 * REQUIRED IMPORTS (wire in Phase 2 — see A-editor.md §3.1):
 *   from ./core.js   : el, $, toast, api, deepClone, API, escapeHTML
 *   from ./schema.js : getSchema
 *   from ./confirm-dialog.js : confirmDialog
 *   from ./section-form.js   : refreshAfterEdit
 *   from ./style-overrides.js : resolveEnhanceKey, collectStyleOverrides, persistStyleOverrides
 *   Exports: openEnhancePanel, removeEnhancePanel, removeTextField
 *
 * ========================================================================
 * ERROR-TRACKING HOOKS (Phase 2 — uncomment + apply):
 *   applyEnhance early-return (editor.js ~3350): console.warn on missing inputs (chunk-7 #4)
 *   applyEnhance (editor.js ~3350): cache input refs instead of 8x getElementById (chunk-7 #3)
 *   removeTextField confirmDialog cb (editor.js ~3399): guard async callback .catch(toast) (chunk-7 #7)
 *   Reset button regex strip (editor.js ~3260): use style.removeProperty (chunk-7 #5)
 *   Phase 2: decompose openEnhancePanel into builder fns (chunk-7 #1, HIGH tech-debt)
 *
 * Suggested module-local log helpers (uncomment in Phase 2):
 *   const TAG  = '[agf:enhance-panel]';
 *   const log  = (...a) => console.log(TAG, ...a);
 *   const warn = (...a) => console.warn(TAG, ...a);
 *   const err  = (...a) => console.error(TAG, ...a);
 */

// === TAG SCAFFOLD (activated in Phase-2 polish pass) =========================
// NOTE: these are module-local consts valid under ES-module wiring (Strategy A).
// For Strategy-B concatenation, strip this block (see LOAD_ORDER.md).
  const TAG  = '[agf:enhance-panel]';
  const log  = (...a) => console.log(TAG, ...a);
  const warn = (...a) => console.warn(TAG, ...a);
  const err  = (...a) => console.error(TAG, ...a);

/* --- state/constants: state: _enhanceCounter (editor.js lines 2942-2942) --- */
  let _enhanceCounter = 0; // unique ID counter for enhanced elements

/* --- function openEnhancePanel (editor.js lines 2950-3348) --- */
  function openEnhancePanel(target, container) {
    // Close any existing panel
    removeEnhancePanel();

    // Find the closest text-bearing element
    const textEl = target.closest('h1, h2, h3, h4, h5, h6, p, span, li, dt, dd, em, strong, a, .section-title, .section-deck, .eyebrow, .tenet-body-text, .tech-tagline, .ptag, .m-kind');
    if (!textEl) {
      toast('No text element found at this position.', 'error');
      return;
    }

    const computed = window.getComputedStyle(textEl);
    const currentSize = parseFloat(computed.fontSize) || 16;
    const currentWeight = parseInt(computed.fontWeight, 10) || 400;
    const currentTransform = computed.textTransform || 'none';
    const currentSpacing = parseFloat(computed.letterSpacing) || 0;
    const currentLineHeight = parseFloat(computed.lineHeight) || parseFloat(computed.fontSize) * 1.5;
    const currentColor = computed.color || '#000000';

    // Assign a unique enh-id if not already present
    if (!textEl.hasAttribute('data-enh-id')) {
      textEl.setAttribute('data-enh-id', 'enh-' + (++_enhanceCounter));
    }
    textEl.setAttribute('data-enhanced', '1');

    // Resolve a stable override key for this element via the shared helper.
    // Clear any stale key attrs first so a stale data-enh-selector doesn't
    // mask a now-available data-field ancestor.
    textEl.removeAttribute('data-enh-field');
    textEl.removeAttribute('data-enh-selector');
    resolveEnhanceKey(textEl, container);

    const panel = el('div', { class: 'enhance-panel' });

    // Size
    panel.appendChild(el('div', { class: 'enhance-field' }, [
      el('label', { text: 'Size (px)' }),
      el('input', {
        type: 'number',
        class: 'enh-input',
        id: 'enh-size',
        value: String(Math.round(currentSize)),
        min: '8',
        max: '120',
        step: '1',
        onInput: () => applyEnhance(textEl),
      }),
    ]));

    // Weight
    panel.appendChild(el('div', { class: 'enhance-field' }, [
      el('label', { text: 'Weight' }),
      el('input', {
        type: 'range',
        class: 'enhance-range',
        id: 'enh-weight',
        value: String(currentWeight),
        min: '100',
        max: '900',
        step: '100',
        onInput: () => applyEnhance(textEl),
      }),
      el('span', { class: 'enhance-range-val', id: 'enh-weight-val', text: String(currentWeight) }),
    ]));

    // Structure (text-transform)
    panel.appendChild(el('div', { class: 'enhance-field' }, [
      el('label', { text: 'Structure' }),
      el('select', {
        class: 'enh-select',
        id: 'enh-transform',
        onChange: () => applyEnhance(textEl),
      }, [
        el('option', { value: 'none', text: 'None', ...(currentTransform === 'none' && { selected: '' }) }),
        el('option', { value: 'uppercase', text: 'UPPERCASE', ...(currentTransform === 'uppercase' && { selected: '' }) }),
        el('option', { value: 'lowercase', text: 'lowercase', ...(currentTransform === 'lowercase' && { selected: '' }) }),
        el('option', { value: 'capitalize', text: 'Capitalize', ...(currentTransform === 'capitalize' && { selected: '' }) }),
      ]),
    ]));

    // Letter spacing
    panel.appendChild(el('div', { class: 'enhance-field' }, [
      el('label', { text: 'Letter spacing (em)' }),
      el('input', {
        type: 'number',
        class: 'enh-input',
        id: 'enh-spacing',
        value: String((currentSpacing / currentSize).toFixed(3)),
        min: '-0.1',
        max: '1',
        step: '0.01',
        onInput: () => applyEnhance(textEl),
      }),
    ]));

    // Line height
    panel.appendChild(el('div', { class: 'enhance-field' }, [
      el('label', { text: 'Line height' }),
      el('input', {
        type: 'number',
        class: 'enh-input',
        id: 'enh-lineheight',
        value: String((currentLineHeight / currentSize).toFixed(2)),
        min: '0.8',
        max: '3',
        step: '0.05',
        onInput: () => applyEnhance(textEl),
      }),
    ]));

    // Color
    // Convert rgb(r, g, b) to hex for native color input
    var colorHex = '#000000';
    if (currentColor.indexOf('rgb') === 0) {
      var parts = currentColor.match(/\d+/g);
      if (parts && parts.length >= 3) {
        colorHex = '#' + parts.slice(0, 3).map(function (v) { return ('0' + parseInt(v, 10).toString(16)).slice(-2); }).join('');
      }
    } else if (currentColor.indexOf('#') === 0) {
      colorHex = currentColor;
    }
    panel.appendChild(el('div', { class: 'enhance-field' }, [
      el('label', { text: 'Color' }),
      el('input', {
        type: 'color',
        class: 'enh-input enh-color',
        id: 'enh-color',
        value: colorHex,
        onInput: () => applyEnhance(textEl),
      }),
    ]));

    // --- Paragraph section ---
    var currentAlign = computed.textAlign || 'left';
    // Some browsers return 'start' or 'end'; normalise to left/right/center/none.
    if (currentAlign === 'start') currentAlign = 'left';
    else if (currentAlign === 'end') currentAlign = 'right';
    if (['left', 'center', 'right'].indexOf(currentAlign) === -1) currentAlign = 'left';
    var currentMarginBottom = parseFloat(computed.marginBottom) || 0;
    var currentMarginEm = (currentMarginBottom / currentSize).toFixed(2);

    panel.appendChild(el('div', { class: 'enhance-group-title', text: 'Paragraph' }));

    // Alignment segmented control: Default / Left / Center / Right
    var alignGroup = el('div', { class: 'enh-align-group' });
    var alignOptions = [
      { value: '', label: 'Default', icon: '⟷' },
      { value: 'left', label: 'Left', icon: '⟸' },
      { value: 'center', label: 'Center', icon: '↔' },
      { value: 'right', label: 'Right', icon: '⟹' },
    ];
    alignOptions.forEach(function (opt) {
      var isActive = (opt.value === '' && (currentAlign === 'left' || !textEl.style.textAlign))
                     || opt.value === currentAlign;
      // If textEl has no explicit inline text-align, "Default" is active.
      if (textEl.style.textAlign) {
        isActive = textEl.style.textAlign === opt.value;
      }
      var btn = el('button', {
        type: 'button',
        class: 'enh-align-btn' + (isActive ? ' is-active' : ''),
        title: opt.label,
        text: opt.icon,
        onClick: function () {
          // Clear all active states in this group
          alignGroup.querySelectorAll('.enh-align-btn').forEach(function (b) { b.classList.remove('is-active'); });
          btn.classList.add('is-active');
          // Set or clear text-align
          if (opt.value === '') {
            textEl.style.textAlign = '';
          } else {
            textEl.style.textAlign = opt.value;
          }
          applyEnhance(textEl);
        },
      });
      alignGroup.appendChild(btn);
    });
    panel.appendChild(alignGroup);

    // --- Placement: Left / Center / Right of the section column ---
    // Margin-based block placement (DISTINCT from text-align above which is
    // glyph justification). Moves the text BOX within its parent column.
    panel.appendChild(el('div', { class: 'enhance-group-title', text: 'Placement' }));
    var placeGroup = el('div', { class: 'enh-align-group' });
    var placeOptions = [
      { value: '', label: 'Default', icon: '⋯' },
      { value: 'left', label: 'Left', icon: '⇤' },
      { value: 'center', label: 'Center', icon: '↔' },
      { value: 'right', label: 'Right', icon: '⇥' },
    ];
    // Detect current placement from INLINE styles only (so default stylesheet
    // centering like .team-note-body { margin: 0 auto } doesn't falsely
    // pre-activate a button — only explicit overrides show as active).
    var stMarginLeft = textEl.style.marginLeft;
    var stMarginRight = textEl.style.marginRight;
    var stPlacement = '';
    if (stMarginLeft === '0px' && stMarginRight === 'auto') stPlacement = 'left';
    else if (stMarginLeft === 'auto' && stMarginRight === '0px') stPlacement = 'right';
    else if (stMarginLeft === 'auto' && stMarginRight === 'auto') stPlacement = 'center';
    placeOptions.forEach(function (opt) {
      var isActive = opt.value === stPlacement;
      var btn = el('button', {
        type: 'button',
        class: 'enh-align-btn' + (isActive ? ' is-active' : ''),
        title: opt.label,
        text: opt.icon,
        onClick: function () {
          placeGroup.querySelectorAll('.enh-align-btn').forEach(function (b) { b.classList.remove('is-active'); });
          btn.classList.add('is-active');
          if (opt.value === '') {
            textEl.style.marginLeft = '';
            textEl.style.marginRight = '';
          } else if (opt.value === 'left') {
            textEl.style.marginLeft = '0px';
            textEl.style.marginRight = 'auto';
          } else if (opt.value === 'center') {
            textEl.style.marginLeft = 'auto';
            textEl.style.marginRight = 'auto';
          } else if (opt.value === 'right') {
            textEl.style.marginLeft = 'auto';
            textEl.style.marginRight = '0px';
          }
          applyEnhance(textEl);
        },
      });
      placeGroup.appendChild(btn);
    });
    panel.appendChild(placeGroup);

    // --- Width: Auto / Margin-to-Margin (full-width override) ---
    // Overrides the element's max-width constraint so the block spans its
    // parent column edge-to-edge. Works on .section-deck, .lede,
    // .team-note-body, etc. (constraint lives directly on the element).
    panel.appendChild(el('div', { class: 'enhance-group-title', text: 'Width' }));
    var widthGroup = el('div', { class: 'enh-align-group' });
    var widthOptions = [
      { value: 'auto', label: 'Auto', icon: '▭' },
      { value: 'full', label: 'Margin-to-Margin', icon: '⬌' },
    ];
    // Detect current width mode from INLINE styles only.
    var stMaxWidth = textEl.style.maxWidth;
    var stWidthMode = (stMaxWidth === 'none') ? 'full' : 'auto';
    widthOptions.forEach(function (opt) {
      var isActive = opt.value === stWidthMode;
      var btn = el('button', {
        type: 'button',
        class: 'enh-align-btn is-wide' + (isActive ? ' is-active' : ''),
        title: opt.label,
        text: opt.label,
        onClick: function () {
          widthGroup.querySelectorAll('.enh-align-btn').forEach(function (b) { b.classList.remove('is-active'); });
          btn.classList.add('is-active');
          if (opt.value === 'auto') {
            textEl.style.maxWidth = '';
            textEl.style.width = '';
            textEl.style.marginLeft = '';
            textEl.style.marginRight = '';
          } else {
            textEl.style.maxWidth = 'none';
            // For elements inside .hero-stage, span the full stage/inner width
            var heroStage = textEl.closest('.hero-stage');
            if (heroStage) {
              var heroInner = heroStage.parentElement;
              var fullWidth = heroInner ? heroInner.offsetWidth : heroStage.offsetWidth;
              var elRect = textEl.getBoundingClientRect();
              var stageRect = (heroInner || heroStage).getBoundingClientRect();
              var offsetLeft = elRect.left - stageRect.left;
              textEl.style.width = fullWidth + 'px';
              textEl.style.marginLeft = (-offsetLeft) + 'px';
              textEl.style.marginRight = '0px';
            } else {
              textEl.style.width = '100%';
              textEl.style.marginLeft = '0px';
              textEl.style.marginRight = '0px';
            }
          }
          applyEnhance(textEl);
        },
      });
      widthGroup.appendChild(btn);
    });
    panel.appendChild(widthGroup);

    // Space after (margin-bottom in em)
    panel.appendChild(el('div', { class: 'enhance-field' }, [
      el('label', { text: 'Space after (em)' }),
      el('input', {
        type: 'number',
        class: 'enh-input',
        id: 'enh-margin-bottom',
        value: String(currentMarginEm),
        min: '0',
        max: '10',
        step: '0.1',
        onInput: () => applyEnhance(textEl),
      }),
    ]));

    // Hint: how to force a new paragraph
    panel.appendChild(el('p', {
      class: 'enh-hint',
      text: '↵ For a new paragraph, edit the text field directly and add a blank line.',
    }));

    // Actions
    const actions = el('div', { class: 'enhance-actions' });
    actions.appendChild(el('button', {
      type: 'button',
      class: 'enhance-btn enhance-reset',
      text: 'Reset',
      onClick: () => {
        // Clear live inline styles
        textEl.removeAttribute('data-enhanced');
        textEl.removeAttribute('data-enh-id');
        var resetKey = textEl.getAttribute('data-enh-field') || textEl.getAttribute('data-enh-selector');
        textEl.removeAttribute('data-enh-field');
        textEl.removeAttribute('data-enh-selector');
        textEl.style.cssText = textEl.style.cssText
          .replace(/font-size:[^;]+;?/g, '')
          .replace(/font-weight:[^;]+;?/g, '')
          .replace(/text-transform:[^;]+;?/g, '')
          .replace(/letter-spacing:[^;]+;?/g, '')
          .replace(/line-height:[^;]+;?/g, '')
          .replace(/color:[^;]+;?/g, '')
          .replace(/text-align:[^;]+;?/g, '')
          .replace(/margin-bottom:[^;]+;?/g, '')
          .replace(/margin-left:[^;]+;?/g, '')
          .replace(/margin-right:[^;]+;?/g, '')
          .replace(/max-width:[^;]+;?/g, '')
          .replace(/width:[^;]+;?/g, '');
        removeEnhancePanel();
        // Persist the removal so the override doesn't re-appear on next render.
        if (resetKey) {
          persistStyleOverrides(container, {}, resetKey);
        } else {
          toast('Style reset.', 'info');
        }
      },
    }));
    actions.appendChild(el('button', {
      type: 'button',
      class: 'enhance-btn enhance-apply',
      text: 'Apply',
      onClick: () => {
        removeEnhancePanel();
        // Gather all enhanced overrides from the host container (so other
        // elements' styles are preserved), then PUT to persist.
        var overrides = collectStyleOverrides(container);
        if (overrides) {
          persistStyleOverrides(container, overrides, null);
        } else {
          toast('No style changes to save.', 'info');
        }
      },
    }));
    panel.appendChild(actions);

    // --- Remove Text (destructive) ---
    // Only show if the text element is within a [data-field] that maps to a
    // section data key — otherwise we can't know which field to null out.
    var removeFieldEl = textEl.closest('[data-field]');
    if (removeFieldEl) {
      panel.appendChild(el('button', {
        type: 'button',
        class: 'enh-remove-text',
        text: '🗑 Remove Text',
        onClick: () => {
          confirmDialog(
            'Remove this text?',
            'The text content will be permanently deleted from this section.',
            'Remove',
            function () {
              removeEnhancePanel();
              return removeTextField(container, removeFieldEl.getAttribute('data-field'));
            }
          );
        },
      }));
    }

    // Position near the target element
    const rect = textEl.getBoundingClientRect();
    panel.style.position = 'fixed';
    panel.style.top = Math.max(8, rect.top - 10) + 'px';
    panel.style.left = Math.min(window.innerWidth - 710, rect.right + 12) + 'px';

    document.body.appendChild(panel);

    // Close on outside click
    setTimeout(() => {
      document.addEventListener('mousedown', function onDocClick(ev) {
        if (!panel.contains(ev.target) && ev.target !== textEl) {
          removeEnhancePanel();
          document.removeEventListener('mousedown', onDocClick);
        }
      });
    }, 0);
  }

/* --- function applyEnhance (editor.js lines 3350-3386) --- */
  function applyEnhance(textEl) {
    const sizeInput = document.getElementById('enh-size');
    const weightInput = document.getElementById('enh-weight');
    const transformSelect = document.getElementById('enh-transform');
    const spacingInput = document.getElementById('enh-spacing');
    const lineHeightInput = document.getElementById('enh-lineheight');
    const marginBottomInput = document.getElementById('enh-margin-bottom');
    const colorInput = document.getElementById('enh-color');
    const weightVal = document.getElementById('enh-weight-val');

    if (!sizeInput || !weightInput) {
      // Enhance panel inputs missing — applyEnhance fired before the panel
      // finished building, or after it was removed. Leave a breadcrumb.
      warn('applyEnhance: required inputs missing', { hasSize: !!sizeInput, hasWeight: !!weightInput });
      return;
    }

    const size = sizeInput.value;
    const weight = weightInput.value;
    const transform = transformSelect ? transformSelect.value : 'none';
    const spacing = spacingInput ? spacingInput.value : '0';
    const lineHeight = lineHeightInput ? lineHeightInput.value : '1.5';
    const marginBottom = marginBottomInput ? marginBottomInput.value : '0';
    const color = colorInput ? colorInput.value : '';

    textEl.style.fontSize = size + 'px';
    textEl.style.fontWeight = weight;
    textEl.style.textTransform = transform;
    textEl.style.letterSpacing = spacing + 'em';
    textEl.style.lineHeight = lineHeight;
    if (color) textEl.style.color = color;
    // Paragraph controls — margin-bottom (em). text-align is set directly by
    // the alignment button handler (so it can clear it for "Default"), but
    // we still apply margin-bottom here on every live update.
    if (marginBottom !== '' && parseFloat(marginBottom) !== 0) {
      textEl.style.marginBottom = marginBottom + 'em';
    } else {
      textEl.style.marginBottom = '';
    }

    if (weightVal) weightVal.textContent = weight;
  }

/* --- function removeEnhancePanel (editor.js lines 3388-3398) --- */
  function removeEnhancePanel() {
    const panel = document.querySelector('.enhance-panel');
    if (panel) panel.remove();
  }

  /**
   * removeTextField(container, fieldPath)
   * Removes a text field from the section data by setting it to null/empty.
   * Supports dotted paths (e.g. "strapline" or "headline"). Fresh-GETs the
   * section, nulls the field, PUTs, and refreshes.
   */

/* --- function removeTextField (editor.js lines 3399-3460) --- */
  async function removeTextField(container, fieldPath) {
    var sectionEl = container.closest('[data-section-id]')
      || (container.hasAttribute && container.hasAttribute('data-section-id') ? container : null);
    var productCard = container.closest('.product-card[data-product-slug]');

    if (!fieldPath) {
      toast('Cannot determine which text field to remove.', 'error');
      return;
    }

    try {
      if (productCard) {
        var slug = productCard.getAttribute('data-product-slug');
        var product = await api('GET', API.products + '/' + slug);
        var pData = product.data ? deepClone(product.data) : {};
        setNestedField(pData, fieldPath, null);
        await api('PUT', API.products + '/' + slug, {
          name: product.name,
          category: product.category,
          status: product.status,
          data: pData,
        });
        toast('Text removed.', 'success');
        if (window.AGF && window.AGF.refreshProducts) {
          await window.AGF.refreshProducts();
        }
      } else if (sectionEl) {
        var sid = sectionEl.getAttribute('data-section-id');
        var schemaId = sectionEl.getAttribute('data-schema') || '';
        var section = await api('GET', API.sections + '/' + sid);
        var sData = section.data ? deepClone(section.data) : {};
        setNestedField(sData, fieldPath, null);
        // Also remove any style overrides keyed to this field
        if (sData._style_overrides) {
          Object.keys(sData._style_overrides).forEach(function (key) {
            if (key === fieldPath || key.startsWith(fieldPath + ' > ')) {
              delete sData._style_overrides[key];
            }
          });
          if (Object.keys(sData._style_overrides).length === 0) {
            delete sData._style_overrides;
          }
        }
        await api('PUT', API.sections + '/' + sid, {
          data: sData,
          title: section.title,
        });
        toast('Text removed.', 'success');
        await refreshAfterEdit(sid, schemaId);
      } else {
        toast('Could not find a section or product to save into.', 'error');
      }
    } catch (err) {
      console.error(TAG, 'removeTextField failed', { fieldPath: fieldPath, error: err && err.message ? err.message : String(err) });
      // NOTE (chunk-7 #7): if invoked from a confirmDialog callback the async
      // rejection is handled here, but the CALLER must also .catch any promise
      // returned by removeTextField (call sites live in context-menu.js).
      toast('Text removal failed: ' + err.message, 'error');
    }
  }

  /**
   * setNestedField(obj, path, value)
   * Sets a (possibly dotted) field path on obj to the given value.
   * E.g. setNestedField(data, 'specs.weight', null) → data.specs.weight = null
   */

