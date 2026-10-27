/**
 * sections/hero-image.js — renderHeroImage.
 * Verbatim extraction from server/templates/product-pdf.js.
 */
import { esc } from "../helpers.js";

function renderHeroImage(product /*, cfg, palette */) {
  const d = product.data || {};
  if (!d.hero_image) return '';
  return `
    <figure class="agf-hero-figure">
      <img src="${esc(d.hero_image)}" alt="${esc(d.name || product.name || '')}" />
    </figure>`;
}

export { renderHeroImage };
