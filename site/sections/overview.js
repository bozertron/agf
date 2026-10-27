/**
 * sections/overview.js — renderOverview.
 * Verbatim extraction from server/templates/product-pdf.js.
 */
import { esc, md } from '../helpers.js';

function renderOverview(product /*, cfg, palette */) {
  const d = product.data || {};
  const blurb = d.description || '';
  const ff = d.form_factor || {};
  const summaryBits = [];
  if (d.category) summaryBits.push(['Category', d.category]);
  if (product.status || d.status) summaryBits.push(['Status', d.status || product.status]);
  if (ff.finish) summaryBits.push(['Finish', ff.finish]);
  if (Array.isArray(ff.materials) && ff.materials.length) summaryBits.push(['Materials', ff.materials.join(' · ')]);

  const aside = summaryBits.length ? `
    <aside class="agf-overview-aside">
      <p class="agf-eyebrow">At a glance</p>
      <dl class="agf-mini-dl">
        ${summaryBits.map(([k, v]) => `
          <div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>
        `).join('')}
      </dl>
    </aside>` : '';

  return `
    <section class="agf-block agf-overview">
      <p class="agf-block-eyebrow">01 — Overview</p>
      <div class="agf-overview-grid">
        <div class="agf-overview-prose">
          ${blurb ? `<p>${md(blurb)}</p>` : `<p class="agf-mute">No description provided.</p>`}
        </div>
        ${aside}
      </div>
    </section>`;
}

export { renderOverview };
