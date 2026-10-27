/* ========================================================================
 * site/editor/bg-settings.js
 * Purpose: Background settings panel + bg persist/remove (section & product)
 * Module tag (Phase 2): [agf:bg-settings]
 *
 * EXTRACTED VERBATIM from site/editor.js by A-editor.extract.py on 2026-06-27T03:23:12.075811+00:00.
 * Function bodies are byte-identical to the source. Do NOT hand-edit logic;
 * edit the source and re-run the extractor.
 *
 * ========================================================================
 * REQUIRED IMPORTS (wire in Phase 2 — see A-editor.md §3.1):
 *   from ./core.js   : el, $, toast, api, deepClone, API
 *   from ./confirm-dialog.js : confirmDialog
 *   from ./figures.js        : deleteUploadedAsset
 *   from ./section-form.js   : refreshAfterEdit, reconcileConventionFields
 *   Exports: openBgSettingsPanel, removeBgSettingsPanel,
 *            persistBackgroundSettings, removeBackgroundImage
 *
 * ========================================================================
 * ERROR-TRACKING HOOKS (Phase 2 — uncomment + apply):
 *   persistBackgroundSettings (editor.js ~2838): console.error on failure; WARN on stale
 *       read (GET-then-full-PUT race — chunk-6 #5, MEDIUM)
 *   removeBackgroundImage (editor.js ~2894): same race warning (chunk-6 #6); log
 *       deleteUploadedAsset failures (chunk-6 #8); fix duplicate var oldSrc (chunk-6 #1)
 *
 * Suggested module-local log helpers (uncomment in Phase 2):
 *   const TAG  = '[agf:bg-settings]';
 *   const log  = (...a) => console.log(TAG, ...a);
 *   const warn = (...a) => console.warn(TAG, ...a);
 *   const err  = (...a) => console.error(TAG, ...a);
 */

// === TAG SCAFFOLD (activated in Phase-2 polish pass) =========================
// NOTE: these are module-local consts valid under ES-module wiring (Strategy A).
// For Strategy-B concatenation, strip this block (see LOAD_ORDER.md).
  const TAG  = '[agf:bg-settings]';
  const log  = (...a) => console.log(TAG, ...a);
  const warn = (...a) => console.warn(TAG, ...a);
  const err  = (...a) => console.error(TAG, ...a);

/* --- function openBgSettingsPanel (editor.js lines 2351-2540) --- */
  function openBgSettingsPanel(hostEl) {
    removeBgSettingsPanel();

    var curSize = hostEl.getAttribute('data-bg-size') || 'cover';
    var curPosition = hostEl.getAttribute('data-bg-position') || 'center';
    var curOpacity = parseFloat(hostEl.getAttribute('data-bg-opacity'));
    if (isNaN(curOpacity)) curOpacity = 0.15;

    // Internal state for the panel
    var stSize = curSize;
    // Parse current position into X and Y state for the two-axis segment
    // groups. Legacy 1-word values (left/center/right) set Y to 'center'.
    var posParts = (curPosition || 'center').trim().split(/\s+/);
    var stPosX = posParts[0] || 'center';
    var stPosY = posParts.length >= 2 ? posParts[1] : 'center';
    var stOpacity = curOpacity;

    var panel = el('div', { class: 'bg-settings-panel' });

    // --- Size ---
    panel.appendChild(el('div', { class: 'bg-settings-field' }, [
      el('label', { text: 'Size' }),
    ]));
    var sizeGroup = el('div', { class: 'bg-segment-group' });
    var sizeOptions = [
      { value: 'auto', label: 'Original' },
      { value: 'cover', label: 'Full Section' },
      { value: 'contain', label: 'Fit' },
    ];
    sizeOptions.forEach(function (opt) {
      var isActive = stSize === opt.value;
      var btn = el('button', {
        type: 'button',
        class: 'bg-segment-btn' + (isActive ? ' is-active' : ''),
        text: opt.label,
        onClick: function () {
          stSize = opt.value;
          sizeGroup.querySelectorAll('.bg-segment-btn').forEach(function (b) { b.classList.remove('is-active'); });
          btn.classList.add('is-active');
        },
      });
      sizeGroup.appendChild(btn);
    });
    panel.appendChild(sizeGroup);

    // --- Horizontal Position ---
    panel.appendChild(el('div', { class: 'bg-settings-field' }, [
      el('label', { text: 'Horizontal' }),
    ]));
    var posGroup = el('div', { class: 'bg-segment-group' });
    var posXOptions = [
      { value: 'left', label: 'Left' },
      { value: 'center', label: 'Center' },
      { value: 'right', label: 'Right' },
    ];
    posXOptions.forEach(function (opt) {
      var isActive = stPosX === opt.value;
      var btn = el('button', {
        type: 'button',
        class: 'bg-segment-btn' + (isActive ? ' is-active' : ''),
        text: opt.label,
        onClick: function () {
          stPosX = opt.value;
          posGroup.querySelectorAll('.bg-segment-btn').forEach(function (b) { b.classList.remove('is-active'); });
          btn.classList.add('is-active');
        },
      });
      posGroup.appendChild(btn);
    });
    panel.appendChild(posGroup);

    // --- Vertical Position ---
    panel.appendChild(el('div', { class: 'bg-settings-field' }, [
      el('label', { text: 'Vertical' }),
    ]));
    var posVGroup = el('div', { class: 'bg-segment-group' });
    var posYOptions = [
      { value: 'top', label: 'Top' },
      { value: 'center', label: 'Middle' },
      { value: 'bottom', label: 'Bottom' },
    ];
    posYOptions.forEach(function (opt) {
      var isActive = stPosY === opt.value;
      var btn = el('button', {
        type: 'button',
        class: 'bg-segment-btn' + (isActive ? ' is-active' : ''),
        text: opt.label,
        onClick: function () {
          stPosY = opt.value;
          posVGroup.querySelectorAll('.bg-segment-btn').forEach(function (b) { b.classList.remove('is-active'); });
          btn.classList.add('is-active');
        },
      });
      posVGroup.appendChild(btn);
    });
    panel.appendChild(posVGroup);

    // --- Opacity ---
    panel.appendChild(el('div', { class: 'bg-settings-field' }, [
      el('label', { text: 'Opacity' }),
    ]));
    var opacityRow = el('div', { class: 'bg-opacity-row' });
    var opacitySlider = el('input', {
      type: 'range',
      min: '0',
      max: '1',
      step: '0.05',
      value: String(stOpacity),
    });
    var opacityVal = el('span', {
      class: 'bg-opacity-val',
      text: Math.round(stOpacity * 100) + '%',
    });
    opacitySlider.addEventListener('input', function () {
      stOpacity = parseFloat(opacitySlider.value);
      opacityVal.textContent = Math.round(stOpacity * 100) + '%';
    });
    opacityRow.appendChild(opacitySlider);
    opacityRow.appendChild(opacityVal);
    panel.appendChild(opacityRow);

    // --- Actions ---
    var actions = el('div', { class: 'bg-settings-actions' });
    actions.appendChild(el('button', {
      type: 'button',
      class: 'bg-reset',
      text: 'Reset',
      onClick: function () {
        stSize = 'cover';
        stPosX = 'center';
        stPosY = 'center';
        stOpacity = 0.15;
        persistBackgroundSettings(hostEl, null).then(function () {
          removeBgSettingsPanel();
        });
      },
    }));
    actions.appendChild(el('button', {
      type: 'button',
      class: 'bg-apply',
      text: 'Apply',
      onClick: function () {
        // Compose position: default-Y (center) stores a single word so
        // existing sections keep their 1-word data shape (backward compat);
        // a non-default Y stores a 2-word string.
        persistBackgroundSettings(hostEl, {
          size: stSize,
          position: stPosY === 'center' ? stPosX : (stPosX + ' ' + stPosY),
          opacity: stOpacity,
        }).then(function () {
          removeBgSettingsPanel();
        });
      },
    }));
    panel.appendChild(actions);

    // --- Remove Image (destructive) ---
    panel.appendChild(el('button', {
      type: 'button',
      class: 'bg-remove-image',
      text: '🗑 Remove Image',
      onClick: function () {
        confirmDialog(
          'Remove background image?',
          'The background image will be removed from this section and its file deleted.',
          'Remove',
          function () { return removeBackgroundImage(hostEl); }
        );
        removeBgSettingsPanel();
      },
    }));

    // Position near the host element
    var rect = hostEl.getBoundingClientRect();
    panel.style.position = 'fixed';
    panel.style.top = Math.max(8, rect.top - 8) + 'px';
    panel.style.left = Math.min(window.innerWidth - 288, rect.right + 12) + 'px';

    document.body.appendChild(panel);

    // Close on outside click
    setTimeout(function () {
      document.addEventListener('mousedown', function onDocClick(ev) {
        if (!panel.contains(ev.target) && !hostEl.contains(ev.target)) {
          removeBgSettingsPanel();
          document.removeEventListener('mousedown', onDocClick);
        }
      });
    }, 0);
  }

/* --- function removeBgSettingsPanel (editor.js lines 2542-2547) --- */
  function removeBgSettingsPanel() {
    var panel = document.querySelector('.bg-settings-panel');
    if (panel) panel.remove();
  }

  // ---------- Nudge position panel -----------------------------------------

/* --- function persistBackgroundSettings (editor.js lines 2838-2893) --- */
  async function persistBackgroundSettings(hostEl, settings) {
    var sectionEl = hostEl.closest('[data-section-id]')
      || (hostEl.hasAttribute && hostEl.hasAttribute('data-section-id') ? hostEl : null);
    var productCard = hostEl.closest('.product-card[data-product-slug]');

    try {
      if (productCard) {
        var slug = productCard.getAttribute('data-product-slug');
        var product = await api('GET', API.products + '/' + slug);
        var pData = product.data ? deepClone(product.data) : {};
        if (settings) {
          pData._background_settings = settings;
        } else {
          delete pData._background_settings;
        }
        await api('PUT', API.products + '/' + slug, {
          name: product.name,
          category: product.category,
          status: product.status,
          data: pData,
        });
        toast(settings ? 'Background settings saved.' : 'Background reset to defaults.', 'success');
        if (window.AGF && window.AGF.refreshProducts) {
          await window.AGF.refreshProducts();
        }
      } else if (sectionEl) {
        var sid = sectionEl.getAttribute('data-section-id');
        var schemaId = sectionEl.getAttribute('data-schema') || '';
        var section = await api('GET', API.sections + '/' + sid);
        var sData = section.data ? deepClone(section.data) : {};
        if (settings) {
          sData._background_settings = settings;
        } else {
          delete sData._background_settings;
        }
        await api('PUT', API.sections + '/' + sid, {
          data: sData,
          title: section.title,
        });
        toast(settings ? 'Background settings saved.' : 'Background reset to defaults.', 'success');
        await refreshAfterEdit(sid, schemaId);
      } else {
        toast('Could not find a section or product to save into.', 'error');
      }
    } catch (err) {
      console.error(TAG, 'persistBackgroundSettings failed', { error: err && err.message ? err.message : String(err) });
      // NOTE (chunk-6 #5): GET-then-full-PUT race window remains — a concurrent
      // edit can be clobbered. Fresh-GET is used above but the race is inherent
      // to full-data PUT; a targeted PATCH is the real fix (follow-up).
      toast('Background settings save failed: ' + err.message, 'error');
    }
  }

  /**
   * removeBackgroundImage(hostEl)
   * Completely removes the background image from a section or product.
   * Fresh-GETs the data, deletes _background_image and _background_settings,
   * PUTs the cleaned data, best-effort deletes the orphaned image file, and
   * triggers a refresh so the element loses its background visually.
   */

/* --- function removeBackgroundImage (editor.js lines 2894-2949) --- */
  async function removeBackgroundImage(hostEl) {
    var sectionEl = hostEl.closest('[data-section-id]')
      || (hostEl.hasAttribute && hostEl.hasAttribute('data-section-id') ? hostEl : null);
    var productCard = hostEl.closest('.product-card[data-product-slug]');

    try {
      if (productCard) {
        var slug = productCard.getAttribute('data-product-slug');
        var product = await api('GET', API.products + '/' + slug);
        var pData = product.data ? deepClone(product.data) : {};
        var oldSrc = pData._background_image || null;
        delete pData._background_image;
        delete pData._background_settings;
        await api('PUT', API.products + '/' + slug, {
          name: product.name,
          category: product.category,
          status: product.status,
          data: pData,
        });
        toast('Background image removed.', 'success');
        if (window.AGF && window.AGF.refreshProducts) {
          await window.AGF.refreshProducts();
        }
        await deleteUploadedAsset(oldSrc);
      } else if (sectionEl) {
        var sid = sectionEl.getAttribute('data-section-id');
        var schemaId = sectionEl.getAttribute('data-schema') || '';
        var section = await api('GET', API.sections + '/' + sid);
        var sData = section.data ? deepClone(section.data) : {};
        var oldSrc = sData._background_image || null;
        delete sData._background_image;
        delete sData._background_settings;
        await api('PUT', API.sections + '/' + sid, {
          data: sData,
          title: section.title,
        });
        toast('Background image removed.', 'success');
        await refreshAfterEdit(sid, schemaId);
        await deleteUploadedAsset(oldSrc);
      } else {
        toast('Could not find a section or product to remove background from.', 'error');
      }
    } catch (err) {
      console.error(TAG, 'removeBackgroundImage failed', { error: err && err.message ? err.message : String(err) });
      // NOTE (chunk-6 #6,#8): same GET-then-full-PUT race; deleteUploadedAsset
      // failures above fall through to here and are logged but not separately
      // recoverable. Wrap the delete in its own try/catch on cutover (follow-up).
      toast('Background image removal failed: ' + err.message, 'error');
    }
  }

