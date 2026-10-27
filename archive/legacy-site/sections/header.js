/**
 * sections/header.js — renderHeader.
 * Verbatim extraction from server/templates/product-pdf.js.
 */
import { esc } from '../helpers.js';

function renderHeader(product, cfg, palette) {
  const d = product.data || {};
  const bg = cfg.background_color || palette.primary;
  const showLogo = cfg.show_logo !== false;
  const cat = d.category || product.category || '';
  return `
    <header class="agf-header" style="background:${esc(bg)};">
      <div class="agf-header-grid">
        <div class="agf-header-mark">
          ${showLogo ? `
            <div class="agf-mark">
              <span class="agf-mark-letters">AGF</span>
              <span class="agf-mark-rule"></span>
              <span class="agf-mark-tag">All Grounds Floating</span>
            </div>` : ''}
        </div>
        <div class="agf-header-meta">
          <p class="agf-eyebrow">Spec Sheet · ${esc(cat || 'Product')}</p>
          <p class="agf-eyebrow agf-eyebrow-mute">${esc(product.slug || '')}</p>
        </div>
      </div>
      <div class="agf-header-title">
        <h1 class="agf-display">${esc(d.name || product.name || 'Untitled')}</h1>
        ${d.tagline ? `<p class="agf-tagline">${esc(d.tagline)}</p>` : ''}
      </div>
      <div class="agf-header-rule" aria-hidden="true">
        <span></span><span></span><span></span>
      </div>
    </header>`;
}

export { renderHeader };
