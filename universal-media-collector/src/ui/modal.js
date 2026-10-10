// Confirm dialog (#confirm) — promise-based, keyboard-closable, one at a time.
import { el } from './util.js';
const $ = (id) => document.getElementById(id);
let resolver = null;
export function confirm({ title, body, actions, html }) {
  const m = $('confirm');
  m.innerHTML = '';
  const card = el('div', 'md-card');
  card.appendChild(el('div', 'md-h', title));
  if (body) { const b = el('div', 'md-body'); if (html) b.appendChild(html); else b.textContent = body; card.appendChild(b); }
  const acts = el('div', 'md-actions');
  for (const a of actions) { const b = el('button', `btn ${a.cls || ''}`.trim(), a.label); b.onclick = () => done(a.value); acts.appendChild(b); }
  card.appendChild(acts);
  m.appendChild(card); m.classList.add('open');
  const first = acts.querySelector('.primary') || acts.querySelector('button'); if (first) first.focus();
  return new Promise((res) => { resolver = res; });
  function done(v) { m.classList.remove('open'); m.innerHTML = ''; const r = resolver; resolver = null; if (r) r(v); }
}
export function modalOpen() { return $('confirm').classList.contains('open'); }
export function closeModal() { if (resolver) { const m = $('confirm'); m.classList.remove('open'); m.innerHTML = ''; const r = resolver; resolver = null; r(null); } }
