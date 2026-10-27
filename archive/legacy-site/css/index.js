/**
 * css/index.js — assembles CSS partials into buildCss() output.
 * Generated wiring. Partials are joined with '' so the result is
 * byte-identical to the original single template literal.
 *
 * ERROR TRACKING (polish pass): per-partial try/catch logs which component
 * failed via the TAG scaffold (`[product-pdf-css]`, greppable) and
 * substitutes a CSS comment marker (degraded vs. full crash).
 *
 * HOOK SITES: the .map() body below is the single Layer-2 error boundary
 * for all 10 CSS partials. See ../HOOKS.md for the full manifest.
 */

// TAG scaffold — single source of truth for log/marker prefixes in this
// module. Output bytes are unchanged vs. the inline-string version; this
// just makes the hook greppable (`grep -rn TAG .`).
const TAG = '[product-pdf-css]';

import baseCss from './base.css.js';
import headerCss from './header.css.js';
import heroCss from './hero.css.js';
import blockCss from './block.css.js';
import overviewCss from './overview.css.js';
import specsCss from './specs.css.js';
import connectivityCss from './connectivity.css.js';
import technologiesCss from './technologies.css.js';
import form_factorCss from './form-factor.css.js';
import footerCss from './footer.css.js';

const _PARTIAL_NAMES = [
  'base',
  'header',
  'hero',
  'block',
  'overview',
  'specs',
  'connectivity',
  'technologies',
  'form_factor',
  'footer',
];

export function buildCss(palette, fontFamily) {
  const fontStack = `'${fontFamily}', 'Helvetica Neue', Helvetica, Arial, sans-serif`;
  const partials = [
    baseCss,
    headerCss,
    heroCss,
    blockCss,
    overviewCss,
    specsCss,
    connectivityCss,
    technologiesCss,
    form_factorCss,
    footerCss,
  ];
  const css = partials.map((fn, i) => {
    try {
      return fn(palette, fontStack);
    } catch (err) {
      console.error(TAG + ' partial "' + (_PARTIAL_NAMES[i] || i) + '" failed:', err);
      const msg = (err && err.message) ? err.message : String(err);
      return '/* ' + TAG + ' partial ' + (_PARTIAL_NAMES[i] || i) + ' failed: ' + msg + ' */';
    }
  });
  return css.join('');
}

export default buildCss;
