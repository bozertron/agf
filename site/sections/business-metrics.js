/**
 * sections/business-metrics.js — renderBusinessMetrics.
 * Verbatim extraction from server/templates/product-pdf.js.
 */
import { esc, fmtRange, fmtUSD } from '../helpers.js';

function renderBusinessMetrics(product, cfg /*, palette */) {
  // Audience gating: only render when the configured audience contains "investor".
  const audience = String(cfg.audience || '').toLowerCase();
  if (!audience.includes('investor')) return '';

  const b = (product.data && product.data.business) || {};
  const rows = [];
  if (b.cogs_usd)              rows.push(['CoGS', '$' + fmtRange(b.cogs_usd)]);
  if (b.asp_usd)               rows.push(['ASP', '$' + fmtRange(b.asp_usd)]);
  if (b.gross_margin_target)   rows.push(['Margin target', Math.round(b.gross_margin_target * 100) + '%']);
  if (b.ttm_months)            rows.push(['TTM', fmtRange(b.ttm_months) + ' mo']);
  if (b.tooling_cost_usd)      rows.push(['Tooling', fmtUSD(b.tooling_cost_usd)]);
  if (b.target_volume_monthly) rows.push(['Target volume', b.target_volume_monthly + ' pcs/mo']);
  if (Array.isArray(b.certifications) && b.certifications.length) {
    rows.push(['Certifications', b.certifications.join(' · ')]);
  }

  if (!rows.length) return '';

  return `
    <section class="agf-block agf-business agf-confidential-shade">
      <p class="agf-block-eyebrow agf-block-eyebrow-accent">06 — Business Metrics · Investor-only</p>
      <dl class="agf-spec-dl agf-cols-2 agf-business-dl">
        ${rows.map(([k, v]) => `<div class="agf-spec-row"><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}
      </dl>
    </section>`;
}

export { renderBusinessMetrics };
