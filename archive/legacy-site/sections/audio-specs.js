/**
 * sections/audio-specs.js — renderAudioSpecs.
 * Verbatim extraction from server/templates/product-pdf.js.
 */
import { esc } from '../helpers.js';

function renderAudioSpecs(product, cfg /*, palette */) {
  const a = (product.data && product.data.audio) || {};
  const cols = cfg.columns === 1 ? 1 : 2;

  const rows = [];
  if (a.frequency_response) {
    const fr = a.frequency_response;
    rows.push(['Frequency response', `${fr.low_hz ?? '?'}–${fr.high_hz ?? '?'} Hz${fr.tolerance_db ? ' ±' + fr.tolerance_db + ' dB' : ''}`]);
  }
  if (a.sensitivity_db_spl) rows.push(['Sensitivity', a.sensitivity_db_spl + ' dB SPL']);
  if (a.impedance_ohms)     rows.push(['Impedance', a.impedance_ohms + ' Ω']);
  if (a.thd_percent)        rows.push(['THD', a.thd_percent + '%']);
  if (a.snr_db)             rows.push(['SNR', a.snr_db + ' dB']);
  if (a.max_spl_db)         rows.push(['Max SPL', a.max_spl_db + ' dB']);
  if (a.amplification) {
    const amp = a.amplification;
    const v = `Class ${amp.class || '—'}${amp.watts_per_channel ? ' · ' + amp.watts_per_channel + ' W/ch' : ''}${amp.channels ? ' · ' + amp.channels + ' ch' : ''}`;
    rows.push(['Amplification', v]);
  }
  if (a.dac) {
    const dac = a.dac;
    const v = `${dac.architecture || '—'}${dac.chipset ? ' · ' + dac.chipset : ''}${dac.bit_depth ? ' · ' + dac.bit_depth + '-bit' : ''}${dac.max_sample_rate_khz ? ' · ' + dac.max_sample_rate_khz + ' kHz' : ''}`;
    rows.push(['DAC', v]);
  }
  if (a.crossover && (a.crossover.type || a.crossover.frequency_hz)) {
    rows.push(['Crossover', `${a.crossover.type || ''}${a.crossover.frequency_hz ? ' · ' + a.crossover.frequency_hz + ' Hz' : ''}${a.crossover.slope_db_oct ? ' · ' + a.crossover.slope_db_oct + ' dB/oct' : ''}`]);
  }
  if (a.enclosure && a.enclosure.type) {
    rows.push(['Enclosure', `${a.enclosure.type}${a.enclosure.tuning_hz ? ' · ' + a.enclosure.tuning_hz + ' Hz' : ''}${a.enclosure.volume_liters ? ' · ' + a.enclosure.volume_liters + ' L' : ''}`]);
  }

  const dl = rows.map(([k, v]) => `
    <div class="agf-spec-row"><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>
  `).join('');

  const drivers = Array.isArray(a.drivers) ? a.drivers : [];
  const driversTable = drivers.length ? `
    <table class="agf-driver-table">
      <thead>
        <tr><th>Qty</th><th>Type</th><th>Size</th><th>Material</th></tr>
      </thead>
      <tbody>
        ${drivers.map((dr) => `
          <tr>
            <td>${esc(dr.quantity || 1)}×</td>
            <td>${esc(dr.type || '—')}</td>
            <td>${dr.size_mm ? esc(dr.size_mm) + ' mm' : '—'}</td>
            <td>${esc(dr.material || '—')}</td>
          </tr>`).join('')}
      </tbody>
    </table>` : '';

  if (!rows.length && !drivers.length) return '';

  return `
    <section class="agf-block agf-audio" data-cols="${cols}">
      <p class="agf-block-eyebrow">02 — Audio</p>
      <dl class="agf-spec-dl agf-cols-${cols}">${dl}</dl>
      ${driversTable}
    </section>`;
}

export { renderAudioSpecs };
