// INBOX realm — URL entry + detect, the capability/source header, the
// candidate gallery (grid/list, kind filter, selection), per-candidate
// previews (main-side verified, never a remote <img>), and "add to queue".
// State outlives re-renders and realm switches (module lets), like v3 realms.
import { el, esc, html, raw, fmtBytes, fmtDuration, shortUrl } from '../../ui/util.js';
import { icon } from '../../ui/icons.js';
import { toast } from '../../ui/toast.js';
import { openDrawer } from '../../ui/drawer.js';
import { setLastResult, rememberLink, recentLinks } from '../../core/store.js';

let CTX = null, root = null;
let inputValue = '', scanning = false, result = null;
let layout = 'grid', kindFilter = 'all';
const selected = new Set();
const previews = new Map();     // candidate id -> { dataUrl } | { error } | 'loading'
let _offs = [];

const Q_LABEL = { direct: 'q_direct', 'page-largest-variant': 'q_page_largest', 'page-variant': 'q_page_variant', metadata: 'q_metadata', thumbnail: 'q_thumbnail', unknown: 'q_unknown' };
const KIND_ICON = { image: 'kind-image', video: 'kind-video', audio: 'kind-audio' };
const STATE_CLS = { supported: 'green', limited: 'blue', 'authorization-required': 'orange', unavailable: 'red', unsupported: 'red' };

function visible() {
  if (!result) return [];
  return result.candidates.filter((c) => kindFilter === 'all' || c.kind === kindFilter);
}

async function detect(url) {
  const { api, LX } = CTX;
  const u = String(url || '').trim();
  if (!u || scanning) return;
  inputValue = u; scanning = true; selected.clear(); previews.clear(); result = null;
  renderHead();
  const r = await api.resolve(u);
  scanning = false;
  if (!root) { result = r; setLastResult(r); return; }   // realm left mid-scan: keep the result for the next mount
  result = r && r.error && !r.candidates ? { ...r, candidates: [] } : r;
  if (result && !result.error) rememberLink(u);
  setLastResult(result);
  // a direct file is a one-click save: preselect it
  if (result && result.source === 'direct' && result.candidates.length === 1) selected.add(result.candidates[0].id);
  renderAll();
  autoPreview();
}

function autoPreview() {
  const s = CTX.state.settings;
  if (!s.autoPreviewImages || !result) return;
  const cap = s.previewMaxBytes || 0;
  for (const c of result.candidates.slice(0, 24)) {
    if (c.kind !== 'image' || c.probeError) continue;
    if (c.bytes != null && c.bytes > cap) continue;
    if (c.bytes == null && c.quality !== 'direct' && !c.probed) continue;
    loadPreview(c);
  }
}
async function loadPreview(c) {
  if (previews.has(c.id)) return;
  previews.set(c.id, 'loading'); paintCard(c);
  try { const p = await CTX.api.preview(c.finalUrl || c.sourceUrl); previews.set(c.id, p.error ? { error: p.error } : p); }
  catch (err) { previews.set(c.id, { error: { message: String(err && err.message || err) } }); }
  if (root) paintCard(c);
}

async function addToQueue(cands) {
  const { api, LX } = CTX;
  if (!cands.length) return;
  const out = await api.queue.add(cands);
  const refused = (out || []).filter((o) => o && o.refused);
  const n = (out || []).length - refused.length;
  if (n) toast(LX('toast_queued', { n }), { kind: 'ok' });
  for (const r of refused) toast(`${shortUrl(r.sourceUrl, 40)}: ${r.refused.message}`, { kind: 'err', ms: 6000 });
  for (const c of cands) selected.delete(c.id);
  if (!root) return;
  paintToolbar(); for (const c of cands) paintCard(c);
}

// ------------------------------------------------------------- rendering
function renderAll() { root.innerHTML = ''; renderHead(); renderResults(); }

function renderHead() {
  const { LX, state } = CTX;
  let head = root.querySelector('.ib-head');
  if (!head) { head = el('div', 'ib-head'); root.prepend(head); }
  head.innerHTML = html`
    <h2 class="sec">${LX('inbox_h')}</h2>
    <form class="ib-form" autocomplete="off">
      <input class="input big mono" id="ib-url" type="url" placeholder="${LX('inbox_placeholder')}" value="${inputValue}" spellcheck="false" ${scanning ? 'disabled' : ''} />
      <button class="btn primary" type="submit" id="ib-go" ${scanning ? 'disabled' : ''}>${raw(icon('verb-detect', { size: 14 }))}<span>${scanning ? LX('inbox_scanning') : LX('inbox_detect')}</span></button>
      ${scanning ? html`<button class="btn" type="button" id="ib-cancel">${LX('inbox_cancel')}</button>` : ''}
    </form>
    <div class="ib-note">${LX('inbox_note')}</div>
    ${scanning ? html`<div class="bar indeterminate ib-bar"><i></i></div>` : ''}
    ${!result && !scanning && recentLinks().length ? html`<div class="ib-recent"><span class="faint">${LX('inbox_history')}</span>${recentLinks().map((u) => html`<button class="btn sm quiet mono ib-recent-btn" data-url="${u}" title="${u}">${shortUrl(u, 48)}</button>`)}</div>` : ''}
  `.toString();
  const form = head.querySelector('form');
  form.onsubmit = (e) => { e.preventDefault(); detect(head.querySelector('#ib-url').value); };
  const inp = head.querySelector('#ib-url');
  inp.oninput = () => { inputValue = inp.value; };
  inp.onpaste = () => setTimeout(() => { if (/^https?:\/\//i.test(inp.value.trim()) && !result) detect(inp.value); }, 0);
  const cancel = head.querySelector('#ib-cancel'); if (cancel) cancel.onclick = () => CTX.api.cancelResolve();
  head.querySelectorAll('.ib-recent-btn').forEach((b) => { b.onclick = () => detect(b.dataset.url); });
}

function renderResults() {
  const { LX } = CTX;
  let sec = root.querySelector('.ib-results');
  if (!sec) { sec = el('div', 'ib-results'); root.appendChild(sec); }
  sec.innerHTML = '';
  if (scanning) return;
  if (!result) { sec.appendChild(el('div', 'empty-note', LX('inbox_empty'))); return; }
  sec.appendChild(buildSourceCard());
  if (result.error && !result.candidates.length) return;
  const h = el.html('h2', 'sec', html`${LX('inbox_results')} <span class="n" id="ib-count"></span>`.toString());
  sec.appendChild(h);
  sec.appendChild(buildToolbar());
  const list = el('div', layout === 'grid' ? 'grid ib-grid' : 'list ib-list'); list.id = 'ib-cards';
  sec.appendChild(list);
  paintToolbar();
  paintCards();
}

function buildSourceCard() {
  const { LX } = CTX;
  const r = result, cap = r.capability;
  const card = el('div', 'card ib-source');
  card.innerHTML = html`
    <div class="ib-src-top">
      ${cap ? html`<span class="tag ${STATE_CLS[cap.state] || ''}">${LX('st_' + cap.state)}</span><span class="pill">${cap.label}</span>` : ''}
      ${r.pageUrl ? html`<a class="mono ib-src-url" href="#" data-url="${r.pageUrl}" title="${r.pageUrl}">${shortUrl(r.pageUrl, 80)}</a>` : ''}
    </div>
    ${r.title ? html`<div class="ib-src-title">${r.title}</div>` : ''}
    ${r.source === 'webpage' && !r.error ? html`<div class="faint ib-src-sub">${LX('inbox_scanned_one')}</div>` : ''}
    ${r.error ? html`<div class="note err"><span class="n-code">${r.error.code}</span><div><b>${r.error.message}</b>${r.error.detail ? html` <span class="faint">(${r.error.detail})</span>` : ''}</div>${r.nextAction || r.error.next ? html`<div class="n-next">${LX('inbox_err_next')}: ${r.nextAction || r.error.next}</div>` : ''}</div>` : ''}
    ${r.warnings && r.warnings.length ? html`<div class="note warn"><span class="n-code">${LX('inbox_warnings')}</span>${r.warnings.map((w) => html`<div>${w.message}</div>`)}</div>` : ''}
  `.toString();
  const a = card.querySelector('.ib-src-url'); if (a) a.onclick = (e) => { e.preventDefault(); CTX.api.shell.openExternal(a.dataset.url); };
  return card;
}

function buildToolbar() {
  const { LX } = CTX;
  const tb = el('div', 'toolbar ib-toolbar');
  tb.innerHTML = html`
    <button class="btn sm" id="ib-selvis">${raw(icon('verb-check', { size: 13 }))}${LX('inbox_select_visible')}</button>
    <button class="btn sm quiet" id="ib-clear">${LX('inbox_clear_sel')}</button>
    <div class="seg" id="ib-kind">${['all', 'image', 'video', 'audio'].map((k) => html`<button data-k="${k}" class="${k === kindFilter ? 'active' : ''}">${LX('inbox_filter_' + k)}</button>`)}</div>
    <div class="seg" id="ib-view"><button data-v="grid" class="${layout === 'grid' ? 'active' : ''}">${LX('inbox_view_grid')}</button><button data-v="list" class="${layout === 'list' ? 'active' : ''}">${LX('inbox_view_list')}</button></div>
    <span class="count" id="ib-selcount"></span>
    <button class="btn primary" id="ib-add" disabled>${raw(icon('verb-download', { size: 14 }))}<span id="ib-add-lbl"></span></button>
  `.toString();
  tb.querySelector('#ib-selvis').onclick = () => { for (const c of visible()) if (!c.probeError) selected.add(c.id); paintToolbar(); paintCards(); };
  tb.querySelector('#ib-clear').onclick = () => { selected.clear(); paintToolbar(); paintCards(); };
  tb.querySelectorAll('#ib-kind button').forEach((b) => { b.onclick = () => { kindFilter = b.dataset.k; tb.querySelectorAll('#ib-kind button').forEach((x) => x.classList.toggle('active', x === b)); paintToolbar(); paintCards(); }; });
  tb.querySelectorAll('#ib-view button').forEach((b) => { b.onclick = () => { layout = b.dataset.v; tb.querySelectorAll('#ib-view button').forEach((x) => x.classList.toggle('active', x === b)); const l = root.querySelector('#ib-cards'); if (l) l.className = layout === 'grid' ? 'grid ib-grid' : 'list ib-list'; paintCards(); }; });
  tb.querySelector('#ib-add').onclick = () => addToQueue(result.candidates.filter((c) => selected.has(c.id)));
  return tb;
}

function paintToolbar() {
  const { LX } = CTX;
  const n = selected.size, vis = visible();
  const cnt = root.querySelector('#ib-count'); if (cnt) cnt.textContent = `${vis.length}${vis.length !== result.candidates.length ? ' / ' + result.candidates.length : ''}`;
  const sc = root.querySelector('#ib-selcount'); if (sc) sc.textContent = n ? LX('inbox_selected', { n }) : '';
  const add = root.querySelector('#ib-add'); if (add) { add.disabled = !n; }
  const lbl = root.querySelector('#ib-add-lbl'); if (lbl) lbl.textContent = n === 1 && result.source === 'direct' ? LX('inbox_add_one') : LX('inbox_add_selected', { n });
}

function paintCards() {
  const list = root.querySelector('#ib-cards'); if (!list) return;
  list.innerHTML = '';
  for (const c of visible()) list.appendChild(buildCard(c));
}
function paintCard(c) {
  const old = root && root.querySelector(`[data-cid="${c.id}"]`);
  if (old) old.replaceWith(buildCard(c));
}

function buildCard(c) {
  const { LX } = CTX;
  const card = el('div', `${layout === 'grid' ? 'card' : 'row'} ib-cand${selected.has(c.id) ? ' sel' : ''}${c.probeError ? ' dim' : ''}`);
  card.dataset.cid = c.id;
  const pv = previews.get(c.id);
  const dims = c.width && c.height ? `${c.width}×${c.height}` : c.width ? `${c.width}w` : '';
  const facts = [c.mime || c.extHint || LX('kind_' + (KIND_ICON[c.kind] ? c.kind : 'unknown')), dims, c.bytes != null ? fmtBytes(c.bytes) : (c.probed ? '' : LX('inbox_unprobed')), c.duration ? fmtDuration(c.duration) : ''].filter(Boolean);
  const title = (c.attribution && c.attribution.title) || c.filenameHint || shortUrl(c.sourceUrl, 40);
  card.innerHTML = html`
    <label class="ib-check"><input type="checkbox" ${selected.has(c.id) ? 'checked' : ''} ${c.probeError ? 'disabled' : ''} aria-label="select" /></label>
    <div class="ib-thumb">${pv && pv.dataUrl ? html`<img src="${pv.dataUrl}" alt="" />` : html`<div class="ib-thumb-ph">${raw(icon(KIND_ICON[c.kind] || 'kind-unknown', { size: 28 }))}${pv === 'loading' ? html`<span class="faint">${LX('inbox_preview_loading')}</span>` : c.kind === 'image' && !c.probeError ? html`<button class="btn sm ib-pv">${raw(icon('verb-eye', { size: 12 }))}${LX('inbox_preview')}</button>` : ''}</div>`}</div>
    <div class="ib-body">
      <div class="ib-title" title="${title}">${title}</div>
      <div class="ib-host mono">${c.host}</div>
      <div class="tags"><span class="tag ${c.kind === 'image' ? 'blue' : c.kind === 'video' ? 'orange' : c.kind === 'audio' ? 'green' : ''}">${LX('kind_' + (KIND_ICON[c.kind] ? c.kind : 'unknown'))}</span><span class="tag ${c.quality === 'direct' || c.quality === 'page-largest-variant' ? 'accent' : ''}">${LX(Q_LABEL[c.quality] || 'q_unknown')}</span></div>
      <div class="ib-facts mono">${facts.join(' · ')}</div>
      ${c.probeError ? html`<div class="note err ib-perr"><span class="n-code">${c.probeError.code}</span> ${c.probeError.message}</div>` : ''}
      <div class="btn-row ib-acts">
        <button class="btn sm primary ib-save" ${c.probeError ? 'disabled' : ''}>${raw(icon('verb-download', { size: 12 }))}${LX('inbox_add_one')}</button>
        <button class="btn sm quiet ib-info">${raw(icon('verb-open', { size: 12 }))}${LX('inbox_open_url')}</button>
      </div>
    </div>`.toString();
  const cb = card.querySelector('input[type=checkbox]');
  cb.onchange = () => { if (cb.checked) selected.add(c.id); else selected.delete(c.id); card.classList.toggle('sel', cb.checked); paintToolbar(); };
  card.onclick = (e) => { if (e.target.closest('button, input, label, a, img')) return; cb.checked = !cb.checked; cb.onchange(); };
  const pvb = card.querySelector('.ib-pv'); if (pvb) pvb.onclick = () => loadPreview(c);
  card.querySelector('.ib-save').onclick = () => addToQueue([c]);
  card.querySelector('.ib-info').onclick = () => openDetail(c);
  const img = card.querySelector('.ib-thumb img'); if (img) img.onclick = () => openDetail(c);
  return card;
}

function openDetail(c) {
  const { LX, api } = CTX;
  const body = el('div');
  const pv = previews.get(c.id);
  if (pv && pv.dataUrl) { const box = el('div', 'dw-preview'); const img = el('img'); img.src = pv.dataUrl; img.alt = ''; box.appendChild(img); body.appendChild(box); }
  const kv = el.html('div', 'kv', html`
    <span class="k">${LX('inbox_source')}</span><span class="v mono">${c.sourceUrl}</span>
    ${c.pageUrl ? html`<span class="k">${LX('lib_page')}</span><span class="v mono">${c.pageUrl}</span>` : ''}
    <span class="k">kind</span><span class="v">${LX('kind_' + (KIND_ICON[c.kind] ? c.kind : 'unknown'))} · ${c.mime || '—'}${c.mimeTrusted === 'bytes' ? ' (from bytes)' : ''}</span>
    <span class="k">quality</span><span class="v">${LX(Q_LABEL[c.quality] || 'q_unknown')}</span>
    <span class="k">size</span><span class="v">${c.bytes != null ? fmtBytes(c.bytes) + ` (${c.bytes.toLocaleString()} B)` : LX('inbox_probe_pending')}</span>
    <span class="k">dims</span><span class="v">${c.width && c.height ? `${c.width}×${c.height}${c.dimsFrom ? ' · ' + c.dimsFrom : ''}` : LX('inbox_dims_unknown')}</span>
    ${c.duration ? html`<span class="k">duration</span><span class="v">${fmtDuration(c.duration)}</span>` : ''}
    <span class="k">found via</span><span class="v mono">${(c.via || []).join(', ')}</span>
    ${c.attribution && c.attribution.pageTitle ? html`<span class="k">page title</span><span class="v">${c.attribution.pageTitle}</span>` : ''}
    <span class="k">access</span><span class="v">${c.accessLevel || 'public'}</span>
  `.toString());
  body.appendChild(kv);
  const acts = el('div', 'btn-row');
  const save = el.html('button', 'btn primary', `${icon('verb-download', { size: 14 })}<span>${esc(LX('inbox_add_one'))}</span>`); save.disabled = !!c.probeError; save.onclick = () => addToQueue([c]); acts.appendChild(save);
  const open = el.html('button', 'btn', `${icon('verb-open', { size: 14 })}<span>${esc(LX('inbox_open_url'))}</span>`); open.onclick = () => api.shell.openExternal(c.sourceUrl); acts.appendChild(open);
  if (c.pageUrl) { const op = el('button', 'btn quiet', LX('inbox_open_page')); op.onclick = () => api.shell.openExternal(c.pageUrl); acts.appendChild(op); }
  if (c.kind === 'image' && !(pv && pv.dataUrl) && !c.probeError) { const p = el('button', 'btn quiet', LX('inbox_preview')); p.onclick = async () => { await loadPreview(c); openDetail(c); }; acts.appendChild(p); }
  body.appendChild(acts);
  openDrawer((c.attribution && c.attribution.title) || c.filenameHint || shortUrl(c.sourceUrl), body);
}

export const view = {
  mount(stage, ctx) {
    CTX = ctx;
    root = el('div', 'inbox measure');
    stage.appendChild(root);
    renderAll();
    _offs.push(ctx.bus.on('inbox:focus', () => { const i = root.querySelector('#ib-url'); if (i) { i.focus(); i.select(); } }));
    _offs.push(ctx.bus.on('inbox:paste', (t) => { if (t && /^https?:\/\//i.test(String(t).trim())) detect(String(t).trim()); else { const i = root.querySelector('#ib-url'); if (i) i.focus(); } }));
    _offs.push(ctx.bus.on('language:changed', () => renderAll()));
    if (!result) requestAnimationFrame(() => { const i = root.querySelector('#ib-url'); if (i) i.focus(); });
  },
  unmount() { for (const off of _offs) off(); _offs = []; root = null; },
};
