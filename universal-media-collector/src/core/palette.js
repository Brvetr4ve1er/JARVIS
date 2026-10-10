// Command palette — Ctrl/Cmd+K quick-switcher: realms, actions, queued
// jobs, saved files. One window keydown for its lifetime; overlay built lazily.
import { state, api } from './store.js';
import { ordered } from './registry.js';
import { switchRealm } from './shell.js';
import { bus } from './bus.js';
import { LX } from './lexicon.js';
import { el, esc } from '../ui/util.js';
import { icon } from '../ui/icons.js';
import { applyTheme, currentTheme } from './themes.js';

const CAP = 9;
const RANK = { realm: 0, action: 1, job: 2, file: 3 };
let inited = false, isOpen = false, paletteEl = null, inputEl = null, listEl = null, allItems = [], results = [], selIndex = 0;

function buildIndex() {
  const items = [];
  const push = (kind, label, hint, run, ico) => { const l = String(label ?? '').trim(); if (!l) return; items.push({ kind, label: l, hint: hint || '', run, ico, key: (l + ' ' + (hint || '')).toLowerCase() }); };
  for (const { manifest: m } of ordered()) if (m.enabled(state)) push('realm', LX(m.lexKey), m.id, () => switchRealm(m.id), `realm-${m.id}`);
  push('action', LX('pal_act_paste'), '', async () => { switchRealm('inbox'); const t = await api.clipboardText(); bus.emit('inbox:paste', t); }, 'verb-detect');
  push('action', LX('pal_act_pause_all'), '', () => api.queue.pauseAll(), 'verb-pause');
  push('action', LX('pal_act_resume_all'), '', () => api.queue.resumeAll(), 'verb-play');
  push('action', LX('pal_act_theme'), '', () => applyTheme(currentTheme() === 'nexus' ? 'daylight' : 'nexus'), 'realm-settings');
  for (const j of state.queue) push('job', j.name || j.title || j.sourceUrl, LX('st_' + j.status), () => { switchRealm('queue'); bus.emit('queue:focus', j.id); }, `kind-${j.kind || 'unknown'}`);
  for (const f of state.library.slice(0, 200)) push('file', f.finalName, f.host, () => { switchRealm('library'); bus.emit('library:focus', f.id); }, `kind-${f.kind || 'unknown'}`);
  return items;
}
function score(it, q) { if (!q) return 1; const i = it.key.indexOf(q); if (i === -1) return 0; return 1000 - i + (it.label.toLowerCase().startsWith(q) ? 100 : 0); }
function filter(q) {
  const needle = q.trim().toLowerCase();
  return allItems.map((it) => ({ it, s: score(it, needle) })).filter((x) => x.s > 0).sort((a, b) => b.s - a.s || RANK[a.it.kind] - RANK[b.it.kind]).slice(0, CAP).map((x) => x.it);
}
function build() {
  paletteEl = el('div', 'pal-wrap'); paletteEl.id = 'palette'; paletteEl.hidden = true;
  const panel = el('div', 'pal-panel');
  inputEl = el('input', 'pal-input'); inputEl.type = 'text'; inputEl.placeholder = LX('pal_placeholder'); inputEl.setAttribute('aria-label', 'Command palette');
  listEl = el('div', 'pal-list'); listEl.setAttribute('role', 'listbox');
  const foot = el('div', 'pal-foot', LX('pal_foot'));
  panel.appendChild(inputEl); panel.appendChild(listEl); panel.appendChild(foot); paletteEl.appendChild(panel);
  document.getElementById('overlays').appendChild(paletteEl);
  paletteEl.addEventListener('click', (e) => { if (e.target === paletteEl) close(); });
  inputEl.addEventListener('input', () => { results = filter(inputEl.value); selIndex = 0; renderList(); });
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); selIndex = Math.min(results.length - 1, selIndex + 1); renderList(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); selIndex = Math.max(0, selIndex - 1); renderList(); }
    else if (e.key === 'Enter') { e.preventDefault(); const it = results[selIndex]; if (it) activate(it); }
    else if (e.key === 'Escape') { e.preventDefault(); close(); }
  });
}
function renderList() {
  listEl.innerHTML = '';
  if (!results.length) { listEl.appendChild(el('div', 'pal-empty', LX('pal_empty'))); return; }
  results.forEach((it, i) => {
    const row = el('div', 'pal-row' + (i === selIndex ? ' sel' : '')); row.setAttribute('role', 'option');
    row.innerHTML = `<span class="pal-ico">${it.ico ? icon(it.ico, { size: 16 }) : ''}</span><span class="pal-label">${esc(it.label)}</span>${it.hint ? `<span class="pal-hint">${esc(it.hint)}</span>` : ''}<span class="pal-kind ${esc(it.kind)}">${esc(LX('pk_' + it.kind))}</span>`;
    row.onmouseenter = () => { selIndex = i; renderList(); };
    row.onclick = () => activate(it);
    listEl.appendChild(row);
  });
}
function activate(it) { close(); try { it.run(); } catch (err) { console.warn('[palette]', err); } }
export function open() { if (!paletteEl) build(); allItems = buildIndex(); inputEl.value = ''; results = filter(''); selIndex = 0; renderList(); paletteEl.hidden = false; requestAnimationFrame(() => { paletteEl.classList.add('open'); inputEl.focus(); }); isOpen = true; }
export function close() { if (!paletteEl || !isOpen) return; paletteEl.classList.remove('open'); isOpen = false; setTimeout(() => { if (!isOpen) paletteEl.hidden = true; }, 160); }
export function initPalette() {
  if (inited) return; inited = true;
  window.addEventListener('keydown', (e) => { if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) { e.preventDefault(); isOpen ? close() : open(); } });
  bus.on('language:changed', () => { if (paletteEl) { paletteEl.remove(); paletteEl = null; } });
}
