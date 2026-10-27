/**
 * toast.js
 * Toast notification helper.
 *
 * Auto-extracted from site/app.js by A-app.extract.py.
 * Module tag: [agf:toast]
 */

import { $ } from './utils.js';

/**
 * Show a toast notification.
 * @param {string} msg - Message text.
 * @param {'info'|'success'|'error'} [type='info'] - Toast style.
 * @returns {void}
 */
export function toast(msg, type = 'info') {
  const c = $('#toast-container');
  if (!c) return;
  const el = document.createElement('div');
  el.className = 'toast toast-' + type;
  el.textContent = msg;
  c.appendChild(el);
  setTimeout(() => { el.classList.add('toast-out'); }, 2400);
  setTimeout(() => { el.remove(); }, 2900);
}
