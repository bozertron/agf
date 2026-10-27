/**
 * sections/form-factor.js — renderFormFactor.
 * Verbatim extraction from server/templates/product-pdf.js.
 */
import { esc } from '../helpers.js';

function renderFormFactor(product /*, cfg, palette */) {
  const f = (product.data && product.data.form_factor) || {};
  const rows = [];
  if (f.dimensions) {
    const dim = f.dimensions;
    rows.push(['Dimensions', `${dim.height_mm ?? '?'} × ${dim.width_mm ?? '?'} × ${dim.depth_mm ?? '?'} mm`]);
  }
  if (f.weight_g)     rows.push(['Weight', f.weight_g + ' g']);
  if (f.finish)       rows.push(['Finish', f.finish]);
  if (Array.isArray(f.materials) && f.materials.length) {
    rows.push(['Materials', f.materials.join(' · ')]);
  }
  if (Array.isArray(f.color_options) && f.color_options.length) {
    rows.push(['Colors', f.color_options.join(' · ')]);
  }

  const variants = Array.isArray(f.variants) ? f.variants : [];

  if (!rows.length && !variants.length) return '';

  const variantsHTML = variants.length ? `
    <div class="agf-variants">
      <p class="agf-eyebrow">Variants</p>
      <ul class="agf-variant-list">
        ${variants.map((v) => `
          <li>
            <span class="agf-variant-name">${esc(v.name || '')}</span>
            <span class="agf-variant-diff">${esc(v.differentiator || '')}</span>
            ${v.asp_usd ? `<span class="agf-variant-asp">$${esc(v.asp_usd)}</span>` : ''}
          </li>`).join('')}
      </ul>
    </div>` : '';

  return `
    <section class="agf-block agf-formfactor">
      <p class="agf-block-eyebrow">05 — Form Factor</p>
      <dl class="agf-spec-dl agf-cols-2">
        ${rows.map(([k, v]) => `<div class="agf-spec-row"><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}
      </dl>
      ${variantsHTML}
    </section>`;
}

export { renderFormFactor };
