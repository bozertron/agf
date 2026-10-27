/* ========================================================================
 * site/editor/style-overrides.js
 * Purpose: Style-override key resolution, collection, persistence + element selector builder
 * Module tag (Phase 2): [agf:style-overrides]
 *
 * EXTRACTED VERBATIM from site/editor.js by A-editor.extract.py on 2026-06-27T03:23:12.076267+00:00.
 * Function bodies are byte-identical to the source. Do NOT hand-edit logic;
 * edit the source and re-run the extractor.
 *
 * ========================================================================
 * REQUIRED IMPORTS (wire in Phase 2 — see A-editor.md §3.1):
 *   from ./core.js   : toast, api, deepClone, API
 *   from ./section-form.js : refreshAfterEdit, reconcileConventionFields
 *   Exports: resolveEnhanceKey, collectStyleOverrides, persistStyleOverrides,
 *            buildElementSelector
 *
 * ========================================================================
 * ERROR-TRACKING HOOKS (Phase 2 — uncomment + apply):
 *   persistStyleOverrides catch (editor.js ~3557): console.error('[agf:style-overrides]
 *       persist failed', {hostType, err}) (chunk-8 #1)
 *   collectStyleOverrides (editor.js ~3521): warn if resolveEnhanceKey returns empty;
 *       extract STYLE_PROPERTY_ALLOWLIST constant (chunk-8 #7)
 *   buildElementSelector null guard (editor.js ~3623): warn + return '' (chunk-8)
 *
 * Suggested module-local log helpers (uncomment in Phase 2):
 *   const TAG  = '[agf:style-overrides]';
 *   const log  = (...a) => console.log(TAG, ...a);
 *   const warn = (...a) => console.warn(TAG, ...a);
 *   const err  = (...a) => console.error(TAG, ...a);
 */

// === TAG SCAFFOLD (activated in Phase-2 polish pass) =========================
// NOTE: these are module-local consts valid under ES-module wiring (Strategy A).
// For Strategy-B concatenation, strip this block (see LOAD_ORDER.md).
  const TAG  = '[agf:style-overrides]';
  const log  = (...a) => console.log(TAG, ...a);
  const warn = (...a) => console.warn(TAG, ...a);
  const err  = (...a) => console.error(TAG, ...a);

/* --- function resolveEnhanceKey (editor.js lines 3486-3520) --- */
  function resolveEnhanceKey(el, container) {
    // Fast path: attr already present (set by openEnhancePanel or restored
    // by applyStyleOverrides after a re-render).
    var existing = el.getAttribute('data-enh-field') || el.getAttribute('data-enh-selector');
    if (existing) return existing;
    // Re-derive from the closest [data-field] ancestor.
    var fieldEl = el.closest('[data-field]');
    if (fieldEl) {
      var fieldPath = fieldEl.getAttribute('data-field');
      var key;
      if (el === fieldEl) {
        // The element itself carries the data-field — key is the path.
        key = fieldPath;
      } else {
        // The element is a descendant of the data-field element.
        // Disambiguate by appending a relative selector within the card.
        var relSel = buildElementSelector(el, fieldEl);
        key = relSel ? fieldPath + ' > ' + relSel : fieldPath;
      }
      el.setAttribute('data-enh-field', key);
      return key;
    }
    // No data-field ancestor — legacy nth-of-type selector relative to container.
    var legacySel = buildElementSelector(el, container);
    if (legacySel) el.setAttribute('data-enh-selector', legacySel);
    return legacySel || '';
  }

  /**
   * collectStyleOverrides(container)
   * Walks the container for [data-enhanced] elements and builds a
   * _style_overrides map keyed by a stable data-field path (or legacy
   * CSS selector). Re-derives missing keys via resolveEnhanceKey so keys
   * never silently degrade to fragile selectors after a re-render.
   */

/* --- function collectStyleOverrides (editor.js lines 3521-3556) --- */
  function collectStyleOverrides(container) {
    const overrides = {};
    const enhanced = container.querySelectorAll('[data-enhanced]');
    enhanced.forEach((el) => {
      const styles = {};
      if (el.style.fontSize) styles['font-size'] = el.style.fontSize;
      if (el.style.fontWeight) styles['font-weight'] = el.style.fontWeight;
      if (el.style.textTransform && el.style.textTransform !== 'none') styles['text-transform'] = el.style.textTransform;
      if (el.style.letterSpacing) styles['letter-spacing'] = el.style.letterSpacing;
      if (el.style.lineHeight) styles['line-height'] = el.style.lineHeight;
      if (el.style.color) styles['color'] = el.style.color;
      if (el.style.textAlign) styles['text-align'] = el.style.textAlign;
      if (el.style.marginBottom) styles['margin-bottom'] = el.style.marginBottom;
      if (el.style.marginLeft) styles['margin-left'] = el.style.marginLeft;
      if (el.style.marginRight) styles['margin-right'] = el.style.marginRight;
      if (el.style.maxWidth) styles['max-width'] = el.style.maxWidth;
      if (el.style.width) styles['width'] = el.style.width;
      if (Object.keys(styles).length === 0) return;
      // Key by stable data-field path. resolveEnhanceKey re-derives the key
      // (and restores data-enh-field) when the attr is missing post-render.
      var key = resolveEnhanceKey(el, container);
      if (key) overrides[key] = styles;
    });
    return Object.keys(overrides).length > 0 ? overrides : undefined;
  }

  /**
   * persistStyleOverrides(hostContainer, newOverrides, removeKey)
   * Fetches the host section/product data, merges the new _style_overrides
   * (or removes a single key if removeKey is set), PUTs to the API, and
   * triggers a refresh so persisted styles re-apply cleanly.
   *
   * hostContainer = the section/product element clicked on.
   * newOverrides  = freshly collected overrides (from collectStyleOverrides).
   * removeKey     = if non-null, delete this key from existing overrides.
   */

/* --- function persistStyleOverrides (editor.js lines 3557-3622) --- */
  async function persistStyleOverrides(hostContainer, newOverrides, removeKey) {
    // Resolve host section or product
    var sectionEl = hostContainer.closest('[data-section-id]')
      || (hostContainer.hasAttribute && hostContainer.hasAttribute('data-section-id') ? hostContainer : null);
    var productCard = hostContainer.closest('.product-card[data-product-slug]');

    try {
      if (productCard) {
        // --- Product ---
        var slug = productCard.getAttribute('data-product-slug');
        var product = await api('GET', API.products + '/' + slug);
        var pData = product.data ? deepClone(product.data) : {};
        var existing = pData._style_overrides ? deepClone(pData._style_overrides) : {};
        if (removeKey) {
          delete existing[removeKey];
        } else {
          Object.assign(existing, newOverrides);
        }
        // Only keep _style_overrides if non-empty
        if (Object.keys(existing).length > 0) pData._style_overrides = existing;
        else delete pData._style_overrides;
        await api('PUT', API.products + '/' + slug, {
          name: product.name,
          category: product.category,
          status: product.status,
          data: pData,
        });
        toast(removeKey ? 'Style reset & saved.' : 'Style saved.', 'success');
        if (window.AGF && window.AGF.refreshProducts) {
          await window.AGF.refreshProducts();
        }
      } else if (sectionEl) {
        // --- Section ---
        var sid = sectionEl.getAttribute('data-section-id');
        var schemaId = sectionEl.getAttribute('data-schema') || '';
        // ALWAYS fresh-GET the section (never the stale state.sections
        // snapshot) so the PUT's sData doesn't clobber a concurrent edit.
        var section = await api('GET', API.sections + '/' + sid);
        var sData = section.data ? deepClone(section.data) : {};
        var existingSec = sData._style_overrides ? deepClone(sData._style_overrides) : {};
        if (removeKey) {
          delete existingSec[removeKey];
        } else {
          Object.assign(existingSec, newOverrides);
        }
        if (Object.keys(existingSec).length > 0) sData._style_overrides = existingSec;
        else delete sData._style_overrides;
        await api('PUT', API.sections + '/' + sid, {
          data: sData,
          title: section.title,
        });
        toast(removeKey ? 'Style reset & saved.' : 'Style saved.', 'success');
        await refreshAfterEdit(sid, schemaId);
      } else {
        toast('Could not find a section or product to save into.', 'error');
      }
    } catch (err) {
      console.error(TAG, 'persistStyleOverrides failed', { hostType: productCard ? 'product' : 'section', removeKey: removeKey || null, error: err && err.message ? err.message : String(err) });
      toast('Style save failed: ' + err.message, 'error');
    }
  }

  /**
   * buildElementSelector(el, root)
   * Builds a CSS selector path from root to el using tag names and
   * nth-of-type for disambiguation. Used to re-apply styles after re-render.
   */

/* --- function buildElementSelector (editor.js lines 3623-3651) --- */
  function buildElementSelector(el, root) {
    if (!el || el === root) return '';
    const parts = [];
    let cur = el;
    while (cur && cur !== root) {
      let selector = cur.tagName.toLowerCase();
      // Disambiguate with nth-of-type among same-tag siblings
      const parent = cur.parentElement;
      if (parent) {
        const siblings = Array.from(parent.children).filter(
          (s) => s.tagName === cur.tagName
        );
        if (siblings.length > 1) {
          const idx = siblings.indexOf(cur) + 1;
          selector += ':nth-of-type(' + idx + ')';
        }
      }
      // Add class if it's a distinguishing class
      if (cur.className && typeof cur.className === 'string') {
        const cls = cur.className.split(/\s+/).filter((c) => c && c !== 'is-in' && c !== 'is-editing' && c !== 'is-dragover' && c !== 'is-enhanced')[0];
        if (cls) selector += '.' + cls;
      }
      parts.unshift(selector);
      cur = cur.parentElement;
    }
    return parts.join(' > ');
  }

  // ---------- schema picker (Add Section via nav button) -------------------

