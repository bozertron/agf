/**
 * sections/technologies.js — renderTechnologies.
 * Verbatim extraction from server/templates/product-pdf.js.
 */
import { esc } from '../helpers.js';

function renderTechnologies(product, cfg /*, palette */) {
  const techs = (product.data && product.data.agf_technologies) || [];
  if (!Array.isArray(techs) || !techs.length) return '';
  const format = cfg.format || 'badges';

  let body = '';
  if (format === 'list') {
    body = `<ul class="agf-tech-list">${techs.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>`;
  } else if (format === 'table') {
    body = `
      <table class="agf-tech-table">
        <thead><tr><th>Stack</th><th>Role</th></tr></thead>
        <tbody>
          ${techs.map((t) => `<tr><td>${esc(t)}</td><td>AGF foundational technology</td></tr>`).join('')}
        </tbody>
      </table>`;
  } else {
    // badges (default)
    body = `<div class="agf-tech-badges">
      ${techs.map((t) => `<span class="agf-tech-badge">${esc(t)}</span>`).join('')}
    </div>`;
  }

  return `
    <section class="agf-block agf-technologies">
      <p class="agf-block-eyebrow">04 — AGF Technologies</p>
      ${body}
    </section>`;
}

export { renderTechnologies };
