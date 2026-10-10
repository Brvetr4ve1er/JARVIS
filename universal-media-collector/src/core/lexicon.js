// Lexicon mechanism — LX(key) resolves against the active language table with
// fallback to English (same contract as NEXUS v3's LX, used here for i18n).
// A table may declare `_dir: 'rtl'`; the shell flips the document direction.
import { LEXICONS } from '../lexicon/lexicons.js';

let LEX = { ...LEXICONS.en };
let current = 'en';

export function setLanguage(id) {
  current = LEXICONS[id] ? id : 'en';
  LEX = { ...LEXICONS.en, ...LEXICONS[current] };
  document.documentElement.setAttribute('lang', current);
  document.documentElement.setAttribute('dir', LEX._dir === 'rtl' ? 'rtl' : 'ltr');
}
export const currentLanguage = () => current;
export const LX = (k, vars) => {
  let s = LEX[k] !== undefined ? LEX[k] : LEXICONS.en[k] ?? k;
  if (vars) for (const [name, v] of Object.entries(vars)) s = s.split(`{${name}}`).join(String(v));
  return s;
};
export const LANGUAGES = Object.keys(LEXICONS).map((id) => ({ id, label: LEXICONS[id]._label || id }));
