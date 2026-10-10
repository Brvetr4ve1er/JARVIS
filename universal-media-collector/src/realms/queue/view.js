// QUEUE realm — per-item status, progress, speed, pause/resume/cancel/retry/
// remove, conflict decisions (skip / rename / replace), open-file / reveal on
// success, and the bulk verbs. Rows reconcile by job id (no full rebuild per
// progress tick).
import { el, esc, html, raw, fmtBytes, fmtSpeed, shortUrl } from '../../ui/util.js';
import { icon } from '../../ui/icons.js';
import { confirm } from '../../ui/modal.js';
import { openDrawer } from '../../ui/drawer.js';

let CTX = null, root = null, list = null, _offs = [];
const ST_CLS = { done: 'green', failed: 'red', cancelled: '', paused: '', conflict: 'orange', running: 'accent', queued: '', skipped: '' };

function render() {
  const { LX, state } = CTX;
  root.innerHTML = '';
  const h = el.html('h2', 'sec', html`${LX('queue_h')} <span class="n">${state.queue.length}</span><span class="acts"><button class="btn sm" id="q-pause-all">${raw(icon('verb-pause', { size: 12 }))}${LX('queue_pause_all')}</button><button class="btn sm" id="q-resume-all">${raw(icon('verb-play', { size: 12 }))}${LX('queue_resume_all')}</button><button class="btn sm quiet" id="q-clear">${LX('queue_clear_done')}</button></span>`.toString());
  root.appendChild(h);
  h.querySelector('#q-pause-all').onclick = () => CTX.api.queue.pauseAll();
  h.querySelector('#q-resume-all').onclick = () => CTX.api.queue.resumeAll();
  h.querySelector('#q-clear').onclick = () => CTX.api.queue.clearFinished();
  list = el('div', 'list q-list'); root.appendChild(list);
  reconcile();
}

function reconcile() {
  const { LX, state } = CTX;
  const q = state.queue;
  if (!q.length) { list.innerHTML = ''; list.appendChild(el('div', 'empty-note', LX('queue_empty'))); return; }
  const empty = list.querySelector('.empty-note'); if (empty) empty.remove();
  const seen = new Set();
  q.forEach((j, i) => {
    seen.add(j.id);
    let row = list.querySelector(`[data-jid="${j.id}"]`);
    if (!row) { row = buildRow(j); list.appendChild(row); }
    else if (row.dataset.status !== j.status) { const fresh = buildRow(j); row.replaceWith(fresh); row = fresh; }
    else paintRow(row, j);
    if (list.children[i] !== row) list.insertBefore(row, list.children[i] || null);
  });
  for (const row of [...list.querySelectorAll('[data-jid]')]) if (!seen.has(row.dataset.jid)) row.remove();
}

function buildRow(j) {
  const { LX, api } = CTX;
  const row = el('div', `row q-row st-${j.status}`); row.dataset.jid = j.id; row.dataset.status = j.status;
  const title = j.name || j.title || shortUrl(j.sourceUrl, 50);
  row.innerHTML = html`
    <div class="q-ico">${raw(icon(`kind-${['image', 'video', 'audio'].includes(j.kind) ? j.kind : 'unknown'}`, { size: 20 }))}</div>
    <div class="q-main">
      <div class="q-top"><span class="q-title" title="${j.sourceUrl}">${title}</span><span class="tag ${ST_CLS[j.status] || ''}">${LX('st_' + j.status)}</span></div>
      <div class="q-sub mono"><span class="q-host">${j.host || ''}</span><span class="q-prog"></span></div>
      <div class="bar q-bar ${j.status === 'done' ? 'ok' : j.status === 'failed' ? 'err' : j.status === 'paused' ? 'paused' : ''}"><i></i></div>
      <div class="q-msg"></div>
    </div>
    <div class="q-acts btn-row"></div>`.toString();
  const acts = row.querySelector('.q-acts');
  const b = (ico, lbl, cls, fn) => { const x = el.html('button', `btn sm icon ${cls || ''}`.trim(), icon(ico, { size: 14 })); x.title = lbl; x.setAttribute('aria-label', lbl); x.onclick = (e) => { e.stopPropagation(); fn(); }; acts.appendChild(x); };
  if (j.status === 'running' || j.status === 'queued') { b('verb-pause', LX('queue_pause'), '', () => api.queue.pause(j.id)); b('verb-stop', LX('queue_cancel'), 'danger', () => api.queue.cancel(j.id)); }
  if (j.status === 'paused') { b('verb-play', LX('queue_resume'), 'primary', () => api.queue.resume(j.id)); b('verb-stop', LX('queue_cancel'), 'danger', () => api.queue.cancel(j.id)); }
  if (j.status === 'failed' || j.status === 'cancelled') b('verb-retry', LX('queue_retry'), 'primary', () => api.queue.retry(j.id));
  if (j.status === 'conflict') { const d = el('button', 'btn sm primary', LX('st_conflict')); d.onclick = () => askConflict(j); acts.appendChild(d); }
  if (j.status === 'done') { b('verb-open', LX('queue_open_file'), '', () => api.shell.openFile(j.id)); b('verb-folder', LX('queue_show_folder'), '', () => api.shell.showInFolder(j.id)); }
  if (['done', 'failed', 'cancelled', 'skipped', 'paused', 'conflict', 'queued'].includes(j.status)) b('verb-remove', LX('queue_remove'), 'quiet', () => api.queue.remove(j.id));
  row.onclick = () => openJob(j.id);
  paintRow(row, j);
  if (j.status === 'conflict' && !j._asked) { j._asked = true; askConflict(j); }
  return row;
}

function paintRow(row, j) {
  const { LX } = CTX;
  const pct = j.bytesTotal ? Math.min(100, Math.round((j.bytesDone / j.bytesTotal) * 100)) : (j.status === 'done' ? 100 : null);
  const bar = row.querySelector('.q-bar');
  bar.classList.toggle('indeterminate', j.status === 'running' && pct == null);
  if (pct != null) bar.querySelector('i').style.width = pct + '%';
  const prog = row.querySelector('.q-prog');
  const parts = [];
  if (j.status === 'running' || j.status === 'paused') parts.push(`${fmtBytes(j.bytesDone)}${j.bytesTotal ? ' / ' + fmtBytes(j.bytesTotal) : ''}${pct != null ? ' · ' + pct + '%' : ''}${j.status === 'running' && j.speedBps ? ' · ' + fmtSpeed(j.speedBps) : ''}`);
  else if (j.status === 'done') parts.push(fmtBytes(j.bytesDone));
  else if (j.bytesTotal) parts.push(fmtBytes(j.bytesTotal));
  if (j.attempts > 1) parts.push(LX('queue_attempt', { n: j.attempts }));
  prog.textContent = parts.length ? ' · ' + parts.join(' · ') : '';
  const msg = row.querySelector('.q-msg');
  msg.innerHTML = '';
  if (j.error && j.status !== 'done') {
    const retrying = j.error.retryingInMs ? ` · ${LX('queue_retrying', { s: Math.ceil(j.error.retryingInMs / 1000) })}` : '';
    msg.innerHTML = html`<span class="n-code">${j.error.code}</span> ${j.error.message}${j.error.detail ? html` <span class="faint">(${j.error.detail})</span>` : ''}${retrying}${j.status === 'failed' && j.error.next ? html`<div class="n-next faint">${j.error.next}</div>` : ''}`.toString();
    msg.className = 'q-msg ' + (j.status === 'failed' ? 'err' : 'warn');
  } else if (j.status === 'done' && j.result) {
    msg.innerHTML = html`<span class="mono faint">${j.finalPath}</span>${j.result.duplicateOf ? html`<div class="faint">${LX('queue_duplicate')}</div>` : ''}`.toString();
    msg.className = 'q-msg';
  } else if (j.status === 'skipped') { msg.textContent = j.result && j.result.existingPath ? j.result.existingPath : ''; msg.className = 'q-msg faint mono'; }
  else msg.className = 'q-msg';
}

async function askConflict(j) {
  const { LX, api } = CTX;
  const choice = await confirm({
    title: LX('queue_conflict_h'),
    body: LX('queue_conflict_body', { name: j.conflict ? j.conflict.proposedName : j.name || '' }),
    actions: [{ label: LX('queue_skip'), value: 'skip' }, { label: LX('queue_rename'), value: 'rename', cls: 'primary' }, { label: LX('queue_replace'), value: 'replace', cls: 'danger' }],
  });
  if (choice) api.queue.resolveConflict(j.id, choice);
}

function openJob(id) {
  const { LX, api, state } = CTX;
  const j = state.queue.find((x) => x.id === id); if (!j) return;
  const body = el('div');
  body.appendChild(el.html('div', 'kv', html`
    <span class="k">status</span><span class="v">${LX('st_' + j.status)}</span>
    <span class="k">${LX('inbox_source')}</span><span class="v mono">${j.sourceUrl}</span>
    ${j.pageUrl ? html`<span class="k">${LX('lib_page')}</span><span class="v mono">${j.pageUrl}</span>` : ''}
    <span class="k">destination</span><span class="v mono">${j.destination}</span>
    ${j.finalPath ? html`<span class="k">file</span><span class="v mono">${j.finalPath}</span>` : ''}
    <span class="k">bytes</span><span class="v mono">${(j.bytesDone || 0).toLocaleString()}${j.bytesTotal ? ' / ' + j.bytesTotal.toLocaleString() : ''}</span>
    ${j.result && j.result.sha256 ? html`<span class="k">${LX('queue_sha')}</span><span class="v mono">${j.result.sha256}</span>` : ''}
    <span class="k">attempts</span><span class="v">${j.attempts}</span>
    ${j.error ? html`<span class="k">error</span><span class="v"><span class="n-code">${j.error.code}</span> ${j.error.message}<br><span class="faint">${j.error.next || ''}</span></span>` : ''}
  `.toString()));
  if (j.status === 'done') { const acts = el('div', 'btn-row'); const o = el.html('button', 'btn primary', `${icon('verb-open', { size: 14 })}<span>${esc(LX('queue_open_file'))}</span>`); o.onclick = () => api.shell.openFile(j.id); const f = el.html('button', 'btn', `${icon('verb-folder', { size: 14 })}<span>${esc(LX('queue_show_folder'))}</span>`); f.onclick = () => api.shell.showInFolder(j.id); acts.appendChild(o); acts.appendChild(f); body.appendChild(acts); }
  openDrawer(j.name || j.title || shortUrl(j.sourceUrl), body);
}

export const view = {
  mount(stage, ctx) {
    CTX = ctx; root = el('div', 'queue measure'); stage.appendChild(root); render();
    _offs.push(ctx.bus.on('queue:changed', () => { const n = root.querySelector('h2.sec .n'); if (n) n.textContent = String(ctx.state.queue.length); reconcile(); }));
    _offs.push(ctx.bus.on('job', (j) => { const row = list && list.querySelector(`[data-jid="${j.id}"]`); const full = ctx.state.queue.find((x) => x.id === j.id); if (row && full) paintRow(row, full); }));
    _offs.push(ctx.bus.on('queue:focus', (id) => { const row = list && list.querySelector(`[data-jid="${id}"]`); if (row) { row.scrollIntoView({ block: 'center' }); row.classList.add('sel'); setTimeout(() => row.classList.remove('sel'), 1500); } }));
    _offs.push(ctx.bus.on('language:changed', render));
  },
  unmount() { for (const off of _offs) off(); _offs = []; root = null; list = null; },
};
