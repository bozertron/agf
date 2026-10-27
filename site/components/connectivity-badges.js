/* ==========================================================================
   AGF · components/connectivity-badges.js
   Card grid for wireless / wired / streaming / multi-room connectivity.
   Color cues come from _viz_config.badge_colors.
   window.ConnectivityBadges.render(container, productData)
   ========================================================================== */
(function () {
  'use strict';

  const escAttr = (v) => String(v == null ? '' : v).replace(/"/g, '&quot;').replace(/</g, '&lt;');
  const escTxt = (v) => String(v == null ? '' : v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  function makeBadge(borderColor, kind, title, sub) {
    const card = document.createElement('div');
    card.className = 'connectivity-badge';
    card.style.borderLeftColor = borderColor;
    card.innerHTML = `
      <span class="cb-kind">${escTxt(kind)}</span>
      <strong>${escTxt(title)}</strong>
      ${sub ? `<span class="codec-list">${escTxt(sub)}</span>` : ''}
    `;
    return card;
  }

  function render(container, productData) {
    if (!container || !productData) return;
    const config = productData._viz_config || {};
    if (config.show_connectivity_badges === false) return;
    const c = productData.connectivity;
    if (!c) return;

    const colors = Object.assign(
      { wireless: '#87CEEB', wired: '#FFD700', streaming: '#90EE90', feature: '#DDA0DD' },
      config.badge_colors || {}
    );

    const wrap = document.createElement('div');
    wrap.className = 'connectivity-wrap';

    const cap = document.createElement('div');
    cap.className = 'connectivity-caption';
    cap.innerHTML = `
      <span class="connectivity-caption-mark">CN · 04</span>
      <span class="connectivity-caption-title">Connectivity</span>
    `;
    wrap.appendChild(cap);

    const grid = document.createElement('div');
    grid.className = 'connectivity-badges';

    let count = 0;

    // Wireless
    if (Array.isArray(c.wireless)) {
      c.wireless.forEach((w) => {
        const title = `${w.protocol || 'Wireless'}${w.version ? ' ' + w.version : ''}`;
        const sub = [
          (w.codecs && w.codecs.length) ? w.codecs.join(' · ') : '',
          w.range_m ? `${w.range_m}m range` : '',
        ].filter(Boolean).join(' · ');
        grid.appendChild(makeBadge(colors.wireless, 'WIRELESS', title, sub));
        count++;
      });
    }

    // Wired
    if (Array.isArray(c.wired)) {
      c.wired.forEach((w) => {
        const title = w.connector || 'Wired';
        const sub = [w.format, w.max_resolution].filter(Boolean).join(' · ');
        grid.appendChild(makeBadge(colors.wired, 'WIRED', title, sub));
        count++;
      });
    }

    // Streaming protocols
    if (Array.isArray(c.streaming_protocols) && c.streaming_protocols.length) {
      grid.appendChild(makeBadge(colors.streaming, 'STREAMING', c.streaming_protocols[0],
        c.streaming_protocols.slice(1).join(' · ')));
      count++;
    }

    // Multi-room feature
    if (c.multi_room) {
      grid.appendChild(makeBadge(colors.feature, 'FEATURE', 'Multi-room',
        c.max_paired_devices ? `${c.max_paired_devices} paired devices` : 'Synced playback'));
      count++;
    } else if (c.max_paired_devices) {
      grid.appendChild(makeBadge(colors.feature, 'FEATURE', `${c.max_paired_devices} paired devices`,
        'Memory-resident'));
      count++;
    }

    if (count === 0) return;

    wrap.appendChild(grid);
    container.appendChild(wrap);
  }

  window.ConnectivityBadges = { render };
})();
