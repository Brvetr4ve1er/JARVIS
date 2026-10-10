// Shell — renders the left sigil rail, owns realm switching (mount/unmount +
// an error boundary + rail active state), relabels on language change,
// recomputes badges on queue events. (NEXUS v3 shell, adapted.)
import { bus } from './bus.js';
import { state, api } from './store.js';
import { LX } from './lexicon.js';
import { ordered, byId } from './registry.js';
import { currentTheme } from './themes.js';
import { el, esc } from '../ui/util.js';
import { icon, hasIcon } from '../ui/icons.js';
import { closeDrawer } from '../ui/drawer.js';

let activeId = null;
export const activeRealm = () => activeId;

function ctx() { return { state, api, bus, LX, theme: currentTheme() }; }

export function switchRealm(id, force = false) {
  if (id === activeId && !force) return;
  const r = byId(id);
  if (!r || !r.manifest.enabled(state)) return;
  const stage = document.getElementById('stage');
  const prev = byId(activeId);
  if (prev) { try { prev.view.unmount(); } catch (err) { console.error('[shell] unmount', activeId, err); } }
  stage.innerHTML = '';
  closeDrawer();
  activeId = id;
  try { sessionStorage.setItem('umc-active-realm', id); } catch {}
  try { r.view.mount(stage, ctx()); }
  catch (err) {
    console.error('[shell] mount', id, err);
    stage.innerHTML = '';
    const card = el('div', 'realm-error');
    card.appendChild(el('h2', null, LX('error_h')));
    const d = el('details'); d.appendChild(el('summary', null, String(err && err.message || err))); d.appendChild(el('div', null, String(err && err.stack || ''))); card.appendChild(d);
    const acts = el('div', 'md-actions');
    const retry = el('button', 'btn primary', LX('error_retry')); retry.onclick = () => switchRealm(id, true);
    const home = el('button', 'btn', LX('error_home')); home.onclick = () => switchRealm('inbox');
    acts.appendChild(retry); acts.appendChild(home); card.appendChild(acts);
    stage.appendChild(card);
    bus.emit('realm:error', { id, err });
  }
  document.querySelectorAll('#rail-left .sigil').forEach((b) => {
    const on = b.dataset.realm === id;
    b.classList.toggle('active', on);
    if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
  });
  stage.scrollTop = 0;
  bus.emit('realm:switched', { id });
}

function renderRail() {
  const rail = document.getElementById('rail-left');
  rail.innerHTML = '';
  for (const { manifest: m } of ordered()) {
    if (!m.enabled(state)) continue;
    const glyphHtml = hasIcon(`realm-${m.id}`) ? icon(`realm-${m.id}`, { size: 21 }) : `<span class="sigil-fallback">${esc(m.sigil)}</span>`;
    const b = el.html('button', 'sigil', `<span class="glyph" aria-hidden="true">${glyphHtml}</span><span class="lbl">${esc(LX(m.lexKey))}</span><span class="badge"></span>`);
    b.dataset.realm = m.id; b.title = LX(m.lexKey);
    b.onclick = () => switchRealm(m.id);
    const on = m.id === activeId;
    b.classList.toggle('active', on);
    if (on) b.setAttribute('aria-current', 'page');
    rail.appendChild(b);
  }
  refreshBadges();
}

export function refreshBadges() {
  for (const { manifest: m } of ordered()) {
    const b = document.querySelector(`#rail-left .sigil[data-realm="${m.id}"] .badge`);
    if (!b) continue;
    const v = m.badge(state);
    b.textContent = v == null || v === 0 ? '' : String(v);
  }
}

export function startShell(defaultRealm) {
  renderRail();
  bus.on('language:changed', () => { renderRail(); if (activeId) switchRealm(activeId, true); });
  bus.on('theme:changed', () => { /* tokens swap live; realms keep their DOM */ });
  bus.on('queue:changed', refreshBadges);
  bus.on('library:changed', refreshBadges);
  switchRealm(defaultRealm);
}
