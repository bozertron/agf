/**
 * sections/connectivity.js — renderConnectivity.
 * Verbatim extraction from server/templates/product-pdf.js.
 */
import { esc } from '../helpers.js';

function renderConnectivity(product /*, cfg, palette */) {
  const c = (product.data && product.data.connectivity) || {};
  const wireless = Array.isArray(c.wireless) ? c.wireless : [];
  const wired    = Array.isArray(c.wired)    ? c.wired    : [];

  if (!wireless.length && !wired.length && c.multi_room === undefined && !c.streaming_protocols) return '';

  const wirelessHTML = wireless.length ? `
    <div class="agf-conn-col">
      <p class="agf-eyebrow">Wireless</p>
      <ul class="agf-conn-list">
        ${wireless.map((w) => `
          <li>
            <span class="agf-conn-proto">${esc(w.protocol || '—')}${w.version ? ' ' + esc(w.version) : ''}</span>
            ${w.codecs && w.codecs.length ? `<span class="agf-conn-meta">${esc(w.codecs.join(' · '))}</span>` : ''}
            ${w.range_m ? `<span class="agf-conn-meta">${esc(w.range_m)} m</span>` : ''}
          </li>`).join('')}
      </ul>
    </div>` : '';

  const wiredHTML = wired.length ? `
    <div class="agf-conn-col">
      <p class="agf-eyebrow">Wired</p>
      <ul class="agf-conn-list">
        ${wired.map((w) => `
          <li>
            <span class="agf-conn-proto">${esc(w.connector || '—')}</span>
            ${w.format ? `<span class="agf-conn-meta">${esc(w.format)}</span>` : ''}
            ${w.max_resolution ? `<span class="agf-conn-meta">${esc(w.max_resolution)}</span>` : ''}
          </li>`).join('')}
      </ul>
    </div>` : '';

  const extras = [];
  if (c.multi_room !== undefined) extras.push(['Multi-room', c.multi_room ? 'Yes' : 'No']);
  if (c.max_paired_devices)      extras.push(['Max paired devices', c.max_paired_devices]);
  if (Array.isArray(c.streaming_protocols) && c.streaming_protocols.length) {
    extras.push(['Streaming', c.streaming_protocols.join(' · ')]);
  }
  const extrasHTML = extras.length ? `
    <dl class="agf-spec-dl agf-cols-2 agf-conn-extras">
      ${extras.map(([k, v]) => `<div class="agf-spec-row"><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}
    </dl>` : '';

  return `
    <section class="agf-block agf-connectivity">
      <p class="agf-block-eyebrow">03 — Connectivity</p>
      <div class="agf-conn-grid">
        ${wirelessHTML}
        ${wiredHTML}
      </div>
      ${extrasHTML}
    </section>`;
}

export { renderConnectivity };
