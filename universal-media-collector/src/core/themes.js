// Theme system — persist, swap live, no reload. Same mechanism as NEXUS v3
// (data-theme on <html>, one token contract remapped per theme).
import { bus } from './bus.js';

export const THEMES = {
  nexus:    { label: 'NEXUS',    hint: 'clean dark' },
  daylight: { label: 'DAYLIGHT', hint: 'clean light' },
};
const KEY = 'umc-theme';
const DEFAULT = 'nexus';

export function currentTheme() { try { return THEMES[localStorage.getItem(KEY)] ? localStorage.getItem(KEY) : DEFAULT; } catch { return DEFAULT; } }

export function applyTheme(id, { persist = true } = {}) {
  if (!THEMES[id]) id = DEFAULT;
  document.documentElement.setAttribute('data-theme', id);
  if (persist) { try { localStorage.setItem(KEY, id); } catch {} }
  bus.emit('theme:changed', { id });
}
