import { el } from './util.js';
export function toast(message, { kind = '', ms = 4200, action } = {}) {
  const host = document.getElementById('toasts'); if (!host) return;
  const t = el('div', `toast ${kind}`.trim());
  t.appendChild(el('span', null, message));
  if (action) { const b = el('button', 't-act', action.label); b.onclick = () => { try { action.fn(); } finally { t.remove(); } }; t.appendChild(b); }
  host.appendChild(t);
  while (host.children.length > 4) host.firstChild.remove();
  setTimeout(() => t.remove(), ms);
}
