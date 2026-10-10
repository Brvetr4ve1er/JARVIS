// LIBRARY realm — search, sort, kind filter, open/reveal, soft delete with
// undo, per-file notes/tags, source metadata drawer.
import { el, esc, html, raw, fmtBytes, fmtTime, shortUrl } from '../../ui/util.js';
import { icon } from '../../ui/icons.js';
import { toast } from '../../ui/toast.js';
import { openDrawer, closeDrawer } from '../../ui/drawer.js';
import { refreshLibrary } from '../../core/store.js';

let CTX = null, root = null, _offs = [];
let q = '', sort = 'savedAt', kind = 'all';

async function load() { const items = await CTX.api.library.list({ q, sort, dir: sort === 'finalName' || sort === 'host' ? 'asc' : 'desc', kind }); if (root) paintList(items); }

function render() {
  const { LX, state } = CTX;
  root.innerHTML = '';
  const stats = state.library.reduce((a, i) => { a.n++; a.b += i.bytes || 0; return a; }, { n: 0, b: 0 });
  root.appendChild(el.html('h2', 'sec', html`${LX('lib_h')} <span class="n">${LX('lib_count', { n: stats.n, bytes: fmtBytes(stats.b) })}</span>`.toString()));
  const tb = el.html('div', 'toolbar', html`
    <input class="input" id="lib-q" type="search" placeholder="${LX('lib_search')}" value="${q}" />
    <div class="seg" id="lib-kind">${['all', 'image', 'video', 'audio'].map((k) => html`<button data-k="${k}" class="${k === kind ? 'active' : ''}">${LX('inbox_filter_' + k)}</button>`)}</div>
    <div class="seg" id="lib-sort">${[['savedAt', 'lib_sort_date'], ['finalName', 'lib_sort_name'], ['bytes', 'lib_sort_size'], ['host', 'lib_sort_host']].map(([k, l]) => html`<button data-s="${k}" class="${k === sort ? 'active' : ''}">${LX(l)}</button>`)}</div>
  `.toString());
  root.appendChild(tb);
  const inp = tb.querySelector('#lib-q'); let t; inp.oninput = () => { q = inp.value; clearTimeout(t); t = setTimeout(load, 120); };
  tb.querySelectorAll('#lib-kind button').forEach((b) => { b.onclick = () => { kind = b.dataset.k; tb.querySelectorAll('#lib-kind button').forEach((x) => x.classList.toggle('active', x === b)); load(); }; });
  tb.querySelectorAll('#lib-sort button').forEach((b) => { b.onclick = () => { sort = b.dataset.s; tb.querySelectorAll('#lib-sort button').forEach((x) => x.classList.toggle('active', x === b)); load(); }; });
  const list = el('div', 'list lib-list'); list.id = 'lib-list'; root.appendChild(list);
  load();
}

function paintList(items) {
  const { LX } = CTX;
  const list = root.querySelector('#lib-list'); if (!list) return;
  list.innerHTML = '';
  if (!items.length) { list.appendChild(el('div', 'empty-note', LX('lib_empty'))); return; }
  for (const it of items) list.appendChild(buildRow(it));
}

function buildRow(it) {
  const { LX, api } = CTX;
  const row = el('div', 'row lib-row'); row.dataset.lid = it.id;
  const dims = it.width && it.height ? `${it.width}×${it.height}` : '';
  row.innerHTML = html`
    <div class="q-ico">${raw(icon(`kind-${['image', 'video', 'audio'].includes(it.kind) ? it.kind : 'unknown'}`, { size: 20 }))}</div>
    <div class="q-main">
      <div class="q-top"><span class="q-title" title="${it.localPath}">${it.finalName}</span>${it.tags.length ? html`<span class="tags">${it.tags.map((t) => html`<span class="tag">${t}</span>`)}</span>` : ''}</div>
      <div class="q-sub mono">${it.host} · ${fmtBytes(it.bytes)}${dims ? ' · ' + dims : ''} · ${fmtTime(Date.parse(it.savedAt))}${it.pageTitle ? html` · <span class="faint">${it.pageTitle}</span>` : ''}</div>
      ${it.note ? html`<div class="lib-note faint">${it.note}</div>` : ''}
    </div>
    <div class="q-acts btn-row"></div>`.toString();
  const acts = row.querySelector('.q-acts');
  const b = (ico, lbl, cls, fn) => { const x = el.html('button', `btn sm icon ${cls || ''}`.trim(), icon(ico, { size: 14 })); x.title = lbl; x.setAttribute('aria-label', lbl); x.onclick = (e) => { e.stopPropagation(); fn(); }; acts.appendChild(x); };
  b('verb-open', LX('lib_open'), '', async () => { const ok = await api.shell.openFile(it.id); if (!ok) toast(LX('lib_missing'), { kind: 'err' }); });
  b('verb-folder', LX('lib_folder'), '', async () => { const ok = await api.shell.showInFolder(it.id); if (!ok) toast(LX('lib_missing'), { kind: 'err' }); });
  b('verb-trash', LX('lib_delete'), 'quiet', () => removeItem(it));
  row.onclick = () => openItem(it);
  return row;
}

async function removeItem(it) {
  const { LX, api } = CTX;
  await api.library.remove(it.id);
  await refreshLibrary(); load();
  toast(LX('lib_deleted'), { action: { label: LX('lib_undo'), fn: async () => { await api.library.restore(it.id); await refreshLibrary(); load(); } }, ms: 8000 });
}

function openItem(it) {
  const { LX, api } = CTX;
  const body = el('div');
  body.appendChild(el.html('div', 'kv', html`
    <span class="k">file</span><span class="v mono">${it.localPath}</span>
    <span class="k">${LX('lib_saved_from')}</span><span class="v mono">${it.sourceUrl}</span>
    ${it.pageUrl ? html`<span class="k">${LX('lib_page')}</span><span class="v mono">${it.pageUrl}</span>` : ''}
    <span class="k">type</span><span class="v">${it.mime} · ${fmtBytes(it.bytes)} (${(it.bytes || 0).toLocaleString()} B)</span>
    ${it.width && it.height ? html`<span class="k">dims</span><span class="v">${it.width}×${it.height}</span>` : ''}
    <span class="k">${LX('queue_sha')}</span><span class="v mono">${it.sha256}</span>
    <span class="k">saved</span><span class="v">${fmtTime(Date.parse(it.savedAt))}</span>
    <span class="k">quality</span><span class="v">${it.quality}</span>
    <span class="k">original name</span><span class="v mono">${it.originalName || '—'}</span>
  `.toString()));
  const form = el.html('div', 'form', html`
    <div class="field"><label>${LX('lib_tags')}</label><input class="input" id="lib-tags" value="${it.tags.join(', ')}" /></div>
    <div class="field"><label>${LX('lib_note')}</label><textarea class="input" id="lib-note">${it.note}</textarea></div>
    <div class="btn-row"><button class="btn primary" id="lib-save">${LX('lib_save')}</button><button class="btn" id="lib-open">${raw(icon('verb-open', { size: 14 }))}${LX('lib_open')}</button><button class="btn" id="lib-folder">${raw(icon('verb-folder', { size: 14 }))}${LX('lib_folder')}</button></div>
  `.toString());
  form.querySelector('#lib-save').onclick = async () => {
    const tags = form.querySelector('#lib-tags').value.split(',').map((t) => t.trim()).filter(Boolean);
    await api.library.update(it.id, { tags, note: form.querySelector('#lib-note').value });
    await refreshLibrary(); load(); closeDrawer(); toast(LX('set_saved'), { kind: 'ok' });
  };
  form.querySelector('#lib-open').onclick = () => api.shell.openFile(it.id);
  form.querySelector('#lib-folder').onclick = () => api.shell.showInFolder(it.id);
  body.appendChild(form);
  openDrawer(it.finalName, body);
}

export const view = {
  mount(stage, ctx) {
    CTX = ctx; root = el('div', 'library measure'); stage.appendChild(root); render();
    _offs.push(ctx.bus.on('library:changed', () => { const n = root.querySelector('h2.sec .n'); if (n) { const st = ctx.state.library.reduce((a, i) => { a.n++; a.b += i.bytes || 0; return a; }, { n: 0, b: 0 }); n.textContent = ctx.LX('lib_count', { n: st.n, bytes: fmtBytes(st.b) }); } load(); }));
    _offs.push(ctx.bus.on('library:focus', (id) => { const it = ctx.state.library.find((x) => x.id === id); if (it) openItem(it); }));
    _offs.push(ctx.bus.on('language:changed', render));
  },
  unmount() { for (const off of _offs) off(); _offs = []; root = null; },
};
