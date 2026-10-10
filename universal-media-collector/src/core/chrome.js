// Chrome — topstrip (brand + status plates + SYS menu), statusbar, global
// keys. App-lifetime: never unmounts, so its subscriptions stay.
import { bus } from './bus.js';
import { state, api, queueSummary, saveSettings } from './store.js';
import { LX, LANGUAGES, setLanguage, currentLanguage } from './lexicon.js';
import { THEMES, applyTheme, currentTheme } from './themes.js';
import { switchRealm } from './shell.js';
import { ordered } from './registry.js';
import { el, esc, fmtBytes, html, raw } from '../ui/util.js';
import { icon } from '../ui/icons.js';
import { closeDrawer, drawerOpen } from '../ui/drawer.js';
import { modalOpen, closeModal } from '../ui/modal.js';
import { toast } from '../ui/toast.js';

const $ = (id) => document.getElementById(id);

function renderTopstrip() {
  const top = $('topstrip');
  const name = state.settings.appName || 'Universal Media Collector';
  const parts = name.split(' ');
  const last = parts.length > 1 ? parts.pop() : '';
  top.innerHTML = html`
    <div class="brand">
      <div class="logo" aria-hidden="true">${raw(icon('brand-app', { size: 22 }))}</div>
      <div>
        <div class="title">${parts.join(' ')} ${last ? html`<span class="hq">${last}</span>` : ''}</div>
        <div class="subtitle" id="brand-sub">${LX('brand_sub')}</div>
      </div>
    </div>
    <div class="player">
      <div class="plate live" id="plate-queue"><small>${LX('plate_queue')}</small><b><span id="q-active">0</span> <span class="dim" id="q-active-lbl">${LX('plate_active')}</span></b><div class="xp-bar"><div class="xp-fill" id="q-fill"></div></div></div>
      <div class="plate" id="plate-saved"><small>${LX('plate_saved')}</small><b><span id="q-saved">0</span> <span class="dim">${LX('plate_today')}</span></b></div>
      <button class="plate dest" id="plate-dest" title="${LX('sys_open_dest_hint')}"><small>${LX('plate_dest')}</small><b id="dest-path">—</b></button>
      <div class="theme-wrap">
        <button id="theme-btn" class="theme-btn" title="Theme · language · tools">${LX('sys')}</button>
        <div id="theme-menu" class="theme-menu" role="menu">
          <div class="th-group">${LX('sys_theme')}</div>
          ${Object.entries(THEMES).map(([id, t]) => html`<button data-theme="${id}" class="theme-opt"><span class="th-name">${t.label}</span><span class="th-hint">${t.hint}</span></button>`)}
          <div class="th-group">${LX('sys_language')}</div>
          ${LANGUAGES.map((l) => html`<button data-lang="${l.id}" class="theme-opt"><span class="th-name">${l.label}</span></button>`)}
          <div class="th-group">${LX('sys_tools')}</div>
          <button id="open-dest" class="theme-opt"><span class="th-name">${LX('sys_open_dest')}</span><span class="th-hint">${LX('sys_open_dest_hint')}</span></button>
        </div>
      </div>
    </div>`.toString();
  wireSysMenu();
  paintSysActive();
  paintPlates();
}

function wireSysMenu() {
  const btn = $('theme-btn'), menu = $('theme-menu');
  btn.onclick = (e) => { e.stopPropagation(); menu.classList.toggle('open'); };
  document.addEventListener('click', (e) => { if (!menu.contains(e.target) && e.target !== btn) menu.classList.remove('open'); });
  menu.querySelectorAll('.theme-opt[data-theme]').forEach((o) => o.addEventListener('click', (e) => { e.stopPropagation(); applyTheme(o.dataset.theme); saveSettings({ theme: o.dataset.theme }); menu.classList.remove('open'); paintSysActive(); }));
  menu.querySelectorAll('.theme-opt[data-lang]').forEach((o) => o.addEventListener('click', (e) => { e.stopPropagation(); changeLanguage(o.dataset.lang); menu.classList.remove('open'); }));
  $('open-dest').onclick = () => { menu.classList.remove('open'); api.shell.openDestination(); };
  $('plate-dest').onclick = () => api.shell.openDestination();
}
export function changeLanguage(id) {
  setLanguage(id);
  saveSettings({ language: id });
  bus.emit('language:changed', { id });
  renderTopstrip(); paintStatusbar();
}
function paintSysActive() {
  const t = document.documentElement.getAttribute('data-theme');
  document.querySelectorAll('.theme-opt[data-theme]').forEach((o) => o.classList.toggle('active', o.dataset.theme === t));
  document.querySelectorAll('.theme-opt[data-lang]').forEach((o) => o.classList.toggle('active', o.dataset.lang === currentLanguage()));
}

function paintPlates() {
  const s = queueSummary();
  $('q-active').textContent = String(s.active);
  $('q-fill').style.width = (s.pct == null ? (s.active ? 30 : 0) : s.pct) + '%';
  $('q-saved').textContent = String(state.savedThisSession);
  const d = state.settings.destination || '';
  $('dest-path').textContent = d.length > 34 ? '…' + d.slice(-33) : d; $('dest-path').title = d;
  $('plate-queue').classList.toggle('live', s.active > 0);
}

function paintStatusbar() {
  const s = queueSummary();
  const ver = state.app.version + (state.app.mock ? ' · browser harness' : '');
  $('status').innerHTML = html`<b>v${ver}</b> · ${LX('status_queue', { active: s.active, queued: s.queued, done: s.done })}${s.failed ? html` · <span style="color:var(--red)">${s.failed} failed</span>` : ''} · ${LX('status_library', { n: state.library.length })} <span class="keys">${LX('status_keys')}</span>`.toString();
}

function wireKeys() {
  document.addEventListener('keydown', (e) => {
    const t = e.target;
    const editable = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable);
    if (e.key === 'Escape') { if (modalOpen()) { closeModal(); return; } if (drawerOpen()) { closeDrawer(); return; } }
    if (editable) return;
    if (e.key === '/' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); switchRealm('inbox'); bus.emit('inbox:focus'); return; }
    if (/^[1-9]$/.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const list = ordered().filter((r) => r.manifest.enabled(state));
      const r = list[Number(e.key) - 1];
      if (r) switchRealm(r.manifest.id);
    }
  });
}

export function initChrome() {
  renderTopstrip();
  paintStatusbar();
  wireKeys();
  bus.on('queue:changed', () => { paintPlates(); paintStatusbar(); });
  bus.on('job', paintPlates);
  bus.on('library:changed', paintStatusbar);
  bus.on('settings:changed', () => { paintPlates(); if ($('brand-sub')) renderTopstrip(); });
  bus.on('theme:changed', paintSysActive);
  bus.on('job:done', (j) => toast(LX('toast_saved', { name: j.name || '' }), { kind: 'ok', action: { label: LX('queue_show_folder'), fn: () => api.shell.showInFolder(j.id) } }));
}
