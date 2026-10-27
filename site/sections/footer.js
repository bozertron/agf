/**
 * sections/footer.js — renderFooter.
 * Verbatim extraction from server/templates/product-pdf.js.
 */
import { esc } from '../helpers.js';

function renderFooter(product, cfg, palette, pdfConfig) {
  const text = (pdfConfig && pdfConfig.footer_text) || 'AGF — All Grounds Floating';
  const showConf = cfg.confidentiality_notice === true;
  return `
    <footer class="agf-footer">
      ${showConf ? `
        <p class="agf-confidential">
          <span class="agf-confidential-dot"></span>
          Confidential — for the named recipient only. Unauthorized distribution prohibited.
        </p>` : ''}
      <div class="agf-footer-rule"></div>
      <div class="agf-footer-row">
        <span class="agf-footer-text">${esc(text)}</span>
        <span class="agf-footer-slug">${esc(product.slug || '')}</span>
      </div>
    </footer>`;
}

// Section dispatch table — keeps `renderPdfHtml` clean and ordered by config.

export { renderFooter };
