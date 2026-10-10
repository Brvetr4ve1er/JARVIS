// Shared detail drawer + scrim (live in #overlays so a realm switch can
// close them from the shell).
import { el } from './util.js';
import { icon } from './icons.js';
const $ = (id) => document.getElementById(id);
let onClose = null;
export function openDrawer(title, bodyNode, opts = {}) {
  const d = $('drawer'); d.innerHTML = '';
  const head = el('div', 'dw-head');
  head.appendChild(el('div', 'dw-title', title));
  const x = el.html('button', 'dw-close', icon('verb-remove', { size: 14 })); x.title = 'Close (Esc)'; x.onclick = closeDrawer;
  head.appendChild(x);
  const body = el('div', 'dw-body'); body.appendChild(bodyNode);
  d.appendChild(head); d.appendChild(body);
  d.classList.add('open'); $('scrim').classList.add('open');
  $('scrim').onclick = closeDrawer;
  onClose = opts.onClose || null;
  x.focus();
}
export function closeDrawer() {
  $('drawer').classList.remove('open'); $('scrim').classList.remove('open');
  if (onClose) { try { onClose(); } catch {} onClose = null; }
}
export const drawerOpen = () => $('drawer').classList.contains('open');
